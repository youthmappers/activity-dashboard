import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import './Timeline.css'
import { useTheme } from '../contexts/ThemeContext'
import { DATA_FILES } from '../config'

function Timeline({ timeRange, setTimeRange, mapRef, selectedChapters }) {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const brushRef = useRef(null)
  const dataRef = useRef(null)
  const dimensionsRef = useRef({ width: 0, height: 0 })
  const resizeTimeoutRef = useRef(null)
  const xScaleRef = useRef(null)
  const brushGroupRef = useRef(null)

  const parseDate = d3.timeParse('%Y-%m-%d')
  const { darkMode } = useTheme()

  // Load real data from CSV
  useEffect(() => {
    if (!dataRef.current) {
      // Load weekly chapter activity data instead of daily activity
      d3.csv('/weekly_chapter_activity.csv').then(data => {
        console.log('Loading weekly chapter activity data from: /weekly_chapter_activity.csv')
        
        // Store raw data for filtering
        window.rawWeeklyData = data
        
        // Process data with initial selected chapters
        processAndCreateTimeline(data, selectedChapters)
      }).catch(error => {
        console.error('Error loading weekly chapter activity data:', error)
        console.log('Attempted to load from: /weekly_chapter_activity.csv')
        // Fallback to sample data if CSV fails to load
        const now = new Date()
        const oneYearAgo = new Date(now)
        oneYearAgo.setFullYear(now.getFullYear() - 1)
        
        dataRef.current = Array.from({ length: 52 }, (_, i) => { // 52 weeks instead of 365 days
          const date = new Date(oneYearAgo)
          date.setDate(date.getDate() + (i * 7)) // Weekly intervals
          return {
            date,
            value: Math.random() * 100
          }
        })
        
        createTimeline()
      })
    }
  }, []) // Only run once on mount

  // Re-process data when selected chapters change
  useEffect(() => {
    if (window.rawWeeklyData) {
      processAndCreateTimeline(window.rawWeeklyData, selectedChapters)
    }
  }, [selectedChapters]) // Run when chapters change

  // Combined function to process data and create timeline
  const processAndCreateTimeline = (data, chapters) => {
    // Filter data by selected chapters if any are selected
    let filteredData = data
    if (chapters && chapters.length > 0) {
      const chapterIds = new Set(chapters.map(c => c.toString()))
      filteredData = data.filter(d => chapterIds.has(d.chapter_id.toString()))
    }
    
    // Group by week and sum across selected chapters
    const weeklyAggregates = d3.rollup(
      filteredData,
      (weekData) => ({
        all_feats: d3.sum(weekData, d => +d.all_feats || 0),
        buildings: d3.sum(weekData, d => +d.buildings || 0),
        highways: d3.sum(weekData, d => +d.highways || 0),
        amenities: d3.sum(weekData, d => +d.amenities || 0),
        other: d3.sum(weekData, d => +d.other || 0),
        mappers: d3.sum(weekData, d => +d.mappers || 0),
        chapters: new Set(weekData.map(d => d.chapter_id)).size // Count unique chapters
      }),
      d => d.week // Group by week
    )
    
    // Convert to array and process the data
    const processedData = Array.from(weeklyAggregates, ([week, stats]) => ({
      date: new Date(week),
      all_feats: stats.all_feats,
      buildings: stats.buildings,
      highways: stats.highways,
      amenities: stats.amenities,
      other: stats.other,
      mappers: stats.mappers,
      chapters: stats.chapters
    })).filter(d => !isNaN(d.date.getTime())) // Remove invalid dates
    
    // Sort by date
    processedData.sort((a, b) => a.date - b.date)
    
    // Calculate 4-week rolling average of total edits
    const rollingAverageData = processedData.map((d, i) => {
      // Get the window of 4 weeks (current week + 3 previous weeks)
      const windowStart = Math.max(0, i - 3)
      const window = processedData.slice(windowStart, i + 1)
      
      // Calculate average of all_feats over the window
      const avgFeats = window.reduce((sum, w) => sum + w.all_feats, 0) / window.length
      
      return {
        ...d,
        value: avgFeats // Use 4-week rolling average as the timeline metric
      }
    })
    
    dataRef.current = rollingAverageData
    const chapterText = chapters && chapters.length > 0 ? ` for ${chapters.length} selected chapters` : ''
    console.log(`Timeline: Processed ${rollingAverageData.length} weekly data points with 4-week rolling average${chapterText}`)
    
    // Force timeline re-creation
    if (contentRef.current) {
      d3.select(contentRef.current).selectAll("svg").remove()
    }
    
    // Create/update the timeline
    createTimeline()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!brushGroupRef.current || !xScaleRef.current || !dataRef.current) return
      
      const currentSelection = d3.brushSelection(brushGroupRef.current.node())
      if (!currentSelection) return // Only work if brush exists
      
      const x = xScaleRef.current
      const data = dataRef.current
      const fullDomain = d3.extent(data, d => d.date)
      const brushWidth = currentSelection[1] - currentSelection[0]
      
      // Calculate step size (1% of total range or 1 day, whichever is larger)
      const totalRange = x(fullDomain[1]) - x(fullDomain[0])
      const stepSize = Math.max(totalRange * 0.01, x(new Date(fullDomain[0].getTime() + 24 * 60 * 60 * 1000)) - x(fullDomain[0]))
      
      let newLeft = currentSelection[0]
      let newRight = currentSelection[1]
      
      switch(event.key) {
        case 'ArrowRight':
          event.preventDefault()
          newLeft = Math.min(currentSelection[0] + stepSize, totalRange - brushWidth)
          newRight = newLeft + brushWidth
          break
          
        case 'ArrowLeft':
          event.preventDefault()
          newLeft = Math.max(currentSelection[0] - stepSize, 0)
          newRight = newLeft + brushWidth
          break
          
        case 'ArrowUp':
          event.preventDefault()
          // Extend brush forward in time (expand end)
          const extendAmount = brushWidth * 0.1
          newLeft = currentSelection[0]
          newRight = Math.min(currentSelection[1] + extendAmount, totalRange)
          break
          
        case 'ArrowDown':
          event.preventDefault()
          // Contract brush from the end (shrink from future)
          const contractAmount = brushWidth * 0.1
          const minWidth = stepSize * 2 // Minimum brush width
          if (brushWidth - contractAmount > minWidth) {
            newLeft = currentSelection[0]
            newRight = currentSelection[1] - contractAmount
          }
          break

        case 'Escape':
          event.preventDefault()
          // Clear brush and reset to full range
          brushGroupRef.current.call(brushRef.current.move, null)
          const fullRange = d3.extent(data, d => d.date)
          setTimeRange(fullRange)
          if (mapRef.current && mapRef.current.getMap) {
            const map = mapRef.current.getMap()
            console.log('Time range reset to full range via keyboard:', fullRange)
          }
          return
          
        default:
          return
      }
      
      // Apply the new brush position
      brushGroupRef.current.call(brushRef.current.move, [newLeft, newRight])
    }
    
    // Add event listener to the container for better focus management
    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      // Make container focusable
      container.setAttribute('tabindex', '0')
    }
    
    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [setTimeRange, mapRef])

  // Create or update timeline visualization
  const createTimeline = useCallback(() => {
    if (!containerRef.current || !contentRef.current || !dataRef.current) return
    
    // Get dimensions
    const boundingRect = containerRef.current.getBoundingClientRect()
    const width = boundingRect.width
    const height = boundingRect.height // No need to subtract header height anymore
    
    // Check if dimensions have changed
    if (
      Math.abs(dimensionsRef.current.width - width) < 5 && 
      Math.abs(dimensionsRef.current.height - height) < 5 &&
      d3.select(contentRef.current).select('svg').size() > 0
    ) {
      return
    }
    
    // Update stored dimensions
    dimensionsRef.current = { width, height }
    
    // Clear any existing SVG content
    d3.select(contentRef.current).selectAll("svg").remove()
    
    const data = dataRef.current
    
    // Only proceed if we have valid data
    if (!data || data.length === 0) return
    
    // Setup dimensions - back to minimal margins
    const margin = { top: 2, right: 0, bottom: 15, left: 15 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    
    if (chartWidth <= 0 || chartHeight <= 0) return
    
    // Create SVG
    const svg = d3.select(contentRef.current)
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
    
    // X scale
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, chartWidth])
    
    // Store x scale for keyboard navigation
    xScaleRef.current = x
    
    // Y scale - use actual data range
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 100])
      .range([chartHeight, 0])
    
    // Add X axis with labels inside the chart area
    const xAxis = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight - 15})`) // Move labels inside chart area
      .call(
        d3.axisBottom(x)
          .ticks(d3.timeYear.every(1)) // Show ticks every year
          .tickFormat(d3.timeFormat("%Y")) // Format as full year (e.g., "2020")
          .tickSizeOuter(0)
          .tickSizeInner(0) // No tick lines
      )
    
    // Style the x-axis - hide domain line and style text
    xAxis.selectAll(".domain").remove() // Remove the axis line completely
    xAxis.selectAll(".tick line").remove() // Remove tick lines
    xAxis.selectAll("text")
      .style("font-size", "9px") // Small font for years
      .style("fill", darkMode ? "#e2e8f0" : "#495057")
      .style("opacity", 0.7)
      .attr("dy", "0.3em")

    // Add area chart with animation
    const areaPath = svg.append("path")
      .datum(data)
      .attr("fill", "rgba(102, 163, 255, 0.2)")
      .attr("stroke", "#66a3ff")
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        .x(d => x(d.date))
        .y0(chartHeight)
        .y1(d => y(d.value))
      )
      .style("pointer-events", "none") // Allow clicks to pass through

    // Animate the area chart loading
    const totalLength = areaPath.node().getTotalLength()
    
    areaPath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadOut)
      .attr("stroke-dashoffset", 0)
      .on("end", () => {
        // After line animation completes, fade in the fill
        areaPath
          .transition()
          .duration(800)
          .attr("fill-opacity", 1)
      })

    // Start with transparent fill
    areaPath.attr("fill-opacity", 0)

    // Create brush
    const brush = d3.brushX()
      .extent([[0, 0], [chartWidth, chartHeight]])
      .on("end", (event) => {
        if (!event.selection) {
          // Only reset to full range if brush was explicitly cleared
          const fullRange = d3.extent(data, d => d.date)
          setTimeRange(fullRange)
          return
        }
        
        const [x0, x1] = event.selection.map(x.invert)
        
        // Always set the time range based on brush selection, regardless of size
        setTimeRange([x0, x1])
        
        if (mapRef.current && mapRef.current.getMap) {
          const map = mapRef.current.getMap()
          console.log('Time range updated:', [x0, x1])
        }
      })
    
    // Add our custom clickable area FIRST (before brush)
    const clickArea = svg.append("rect")
      .attr("class", "timeline-background")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("click", (event) => {
        const [clickX] = d3.pointer(event)
        const currentSelection = d3.brushSelection(brushGroup.node())
        
        // Check if click is inside existing brush selection
        if (currentSelection && clickX >= currentSelection[0] && clickX <= currentSelection[1]) {
          return
        }
        
        // Click is outside brush - remove brush and set to full range
        if (currentSelection) {
          // Clear the brush explicitly
          brushGroup.call(brush.move, null)
          // The brush end event will handle setting the full range
        } else {
          // No brush exists - create new brush centered on click
          const defaultWidth = Math.min(chartWidth * 0.05, 50) // Made smaller default brush
          let newLeft = clickX - defaultWidth / 2
          let newRight = clickX + defaultWidth / 2
          
          // Keep within bounds
          if (newLeft < 0) {
            newLeft = 0
            newRight = defaultWidth
          }
          if (newRight > chartWidth) {
            newRight = chartWidth
            newLeft = chartWidth - defaultWidth
          }
          
          brushGroup.call(brush.move, [newLeft, newRight])
        }
      })
      .on("mousedown", (event) => {
        const [startX] = d3.pointer(event)
        const currentSelection = d3.brushSelection(brushGroup.node())
        
        // Only allow drag creation if no brush exists or click is outside brush
        if (currentSelection && startX >= currentSelection[0] && startX <= currentSelection[1]) {
          return
        }
        
        event.preventDefault()
        let isDragging = false
        
        const onMouseMove = (moveEvent) => {
          const [currentX] = d3.pointer(moveEvent, svg.node())
          
          if (!isDragging && Math.abs(currentX - startX) > 5) {
            isDragging = true
          }
          
          if (isDragging) {
            const left = Math.min(startX, currentX)
            const right = Math.max(startX, currentX)
            
            const constrainedLeft = Math.max(0, left)
            const constrainedRight = Math.min(chartWidth, right)
            
            if (constrainedRight - constrainedLeft > 10) {
              brushGroup.call(brush.move, [constrainedLeft, constrainedRight])
            }
          }
        }
        
        const onMouseUp = () => {
          svg.on("mousemove", null)
          svg.on("mouseup", null)
          d3.select("body").style("user-select", null)
        }
        
        svg.on("mousemove", onMouseMove)
        svg.on("mouseup", onMouseUp)
        d3.select("body").style("user-select", "none")
      })

    // Add brush group AFTER clickable area
    const brushGroup = svg.append("g")
      .attr("class", "brush")
      .call(brush)
    
    // Store brush group for keyboard navigation
    brushGroupRef.current = brushGroup
    
    // Remove the default brush overlay to prevent conflicts
    brushGroup.select('.overlay').remove()

    // Save brush reference
    brushRef.current = brush
  }, [setTimeRange, mapRef])

  // Initial setup and window resize handling
  useEffect(() => {
    // Only create timeline if data is loaded
    if (dataRef.current) {
      createTimeline()
    }
    
    // Add resize event listener with debounce
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = setTimeout(() => {
        createTimeline()
      }, 200)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [createTimeline])

  return (
    <div 
      className="timeline-container" 
      ref={containerRef}
      onFocus={() => containerRef.current?.focus()}
      title="Use arrow keys to navigate: ← → to move, ↑ ↓ to resize, Esc to reset"
    >
      <div className="timeline-content" ref={contentRef}></div>
    </div>
  )
}

export default Timeline