import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import './Timeline.css'

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
  
  // Load real data from CSV
  useEffect(() => {
    if (!dataRef.current) {
      d3.csv('/data/daily_activity.csv').then(data => {
        // Parse and process the data
        const processedData = data.map(d => ({
          date: new Date(parseDate(d.day)), // Assumes date column exists
          value: +d.chapters_rolling_avg
        })).filter(d => !isNaN(d.date.getTime())) // Remove invalid dates
        
        // Sort by date
        processedData.sort((a, b) => a.date - b.date)
        
        dataRef.current = processedData
        
        // Trigger timeline creation after data loads
        createTimeline()
      }).catch(error => {
        console.error('Error loading daily activity data:', error)
        // Fallback to sample data if CSV fails to load
        const now = new Date()
        const oneYearAgo = new Date(now)
        oneYearAgo.setFullYear(now.getFullYear() - 1)
        
        dataRef.current = Array.from({ length: 365 }, (_, i) => {
          const date = new Date(oneYearAgo)
          date.setDate(date.getDate() + i)
          return {
            date,
            value: Math.random() * 100
          }
        })
        
        createTimeline()
      })
    }
  }, [])

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
    
    // Setup dimensions - much tighter margins
    const margin = { top: 2, right: 0, bottom: 15, left: 0 }
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
    
    // Add X axis with minimal spacing
    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3.axisBottom(x)
          .ticks(chartWidth < 300 ? 3 : 5)
          .tickSizeOuter(0)
          .tickSizeInner(2) // Smaller tick lines
      )
      .call(g => g.selectAll(".domain").attr("stroke", "#999").attr("stroke-opacity", 0.5))
      .call(g => g.selectAll(".tick line").attr("stroke", "#999").attr("stroke-opacity", 0.5))
      .call(g => g.selectAll("text")
        .style("font-size", "8px") // Smaller font
        .style("fill", "#fff")
        .attr("dy", "0.6em")) // Tighter positioning
    
    // Add area chart
    svg.append("path")
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

    // Create brush
    const brush = d3.brushX()
      .extent([[0, 0], [chartWidth, chartHeight]])
      .on("end", (event) => {
        if (!event.selection) return
        const [x0, x1] = event.selection.map(x.invert)
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
          // Clear the brush
          brushGroup.call(brush.move, null)
          
          // Set time range to full extent
          const fullRange = d3.extent(data, d => d.date)
          setTimeRange(fullRange)
          
          if (mapRef.current && mapRef.current.getMap) {
            const map = mapRef.current.getMap()
            console.log('Time range reset to full range:', fullRange)
          }
        } else {
          // No brush exists - create new brush centered on click
          const defaultWidth = Math.min(chartWidth * 0.1, 100)
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