import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import * as d3 from 'd3'
import './Numbers.css'

function Numbers() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/data/monthly_activity_all_time.json')
        const data = await response.json()
        
        // Parse dates and calculate statistics
        const now = new Date()
        const oneYearAgo = new Date(now)
        oneYearAgo.setFullYear(now.getFullYear() - 1)
        
        let totalNewBuildings = 0
        let totalEditedBuildings = 0
        let totalNewRoads = 0
        let totalEditedRoads = 0
        let totalNewAmenities = 0
        let totalEditedAmenities = 0
        
        let yearNewBuildings = 0
        let yearEditedBuildings = 0
        let yearNewRoads = 0
        let yearEditedRoads = 0
        let yearNewAmenities = 0
        let yearEditedAmenities = 0
        
        // Store data for charts
        const chartData = []
        
        data.forEach(row => {
          // Parse the date from Unix timestamp (in seconds)
          const date = new Date(row.month * 1000)
          
          if (!date || isNaN(date.getTime())) return
          
          // Parse the values using the actual field names from your JSON
          const newBuildings = +row.new_buildings || 0
          const editedBuildings = +row.edited_buildings || 0
          const newRoads = +row.new_highways || 0
          const editedRoads = +row.edited_highways || 0
          const newAmenities = +row.new_amenities || 0
          const editedAmenities = +row.edited_amenities || 0
          const chapters = +row.chapters || 0
          const users = +row.users || 0
          
          // Store for charts
          chartData.push({
            date,
            chapters,
            users,
            totalBuildings: newBuildings + editedBuildings,
            totalHighways: newRoads + editedRoads,
            totalAmenities: newAmenities + editedAmenities,
            totalActivity: newBuildings + editedBuildings + newRoads + editedRoads + newAmenities + editedAmenities
          })
          
          // Add to totals
          totalNewBuildings += newBuildings
          totalEditedBuildings += editedBuildings
          totalNewRoads += newRoads
          totalEditedRoads += editedRoads
          totalNewAmenities += newAmenities
          totalEditedAmenities += editedAmenities
          
          // Add to last year totals if within the last year
          if (date >= oneYearAgo) {
            yearNewBuildings += newBuildings
            yearEditedBuildings += editedBuildings
            yearNewRoads += newRoads
            yearEditedRoads += editedRoads
            yearNewAmenities += newAmenities
            yearEditedAmenities += editedAmenities
          }
        })
        
        // Sort chart data by date
        chartData.sort((a, b) => a.date - b.date)
        
        setStats({
          total: {
            newBuildings: totalNewBuildings,
            editedBuildings: totalEditedBuildings,
            newRoads: totalNewRoads,
            editedRoads: totalEditedRoads,
            newAmenities: totalNewAmenities,
            editedAmenities: totalEditedAmenities
          },
          lastYear: {
            newBuildings: yearNewBuildings,
            editedBuildings: yearEditedBuildings,
            newRoads: yearNewRoads,
            editedRoads: yearEditedRoads,
            newAmenities: yearNewAmenities,
            editedAmenities: yearEditedAmenities
          },
          chartData
        })
        
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load activity data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const StatCard = ({ title, totalValue, yearValue, icon, color, compact = false }) => {
    const [animatedTotal, setAnimatedTotal] = useState(0)
    const [animatedYear, setAnimatedYear] = useState(0)
    
    useEffect(() => {
      if (!totalValue || !yearValue) return
      
      // Simple timeout-based animation instead of D3
      let totalStep = 0
      let yearStep = 0
      const totalSteps = 60
      const yearSteps = 60
      
      const totalIncrement = totalValue / totalSteps
      const yearIncrement = yearValue / yearSteps
      
      const totalTimer = setInterval(() => {
        totalStep++
        if (totalStep <= totalSteps) {
          setAnimatedTotal(Math.round(totalIncrement * totalStep))
        } else {
          setAnimatedTotal(totalValue)
          clearInterval(totalTimer)
        }
      }, 30)
      
      // Start year animation with slight delay
      const yearTimer = setTimeout(() => {
        const yearInterval = setInterval(() => {
          yearStep++
          if (yearStep <= yearSteps) {
            setAnimatedYear(Math.round(yearIncrement * yearStep))
          } else {
            setAnimatedYear(yearValue)
            clearInterval(yearInterval)
          }
        }, 25)
        
        return () => clearInterval(yearInterval)
      }, 300)
      
      return () => {
        clearInterval(totalTimer)
        clearTimeout(yearTimer)
      }
    }, [totalValue, yearValue])
    
    return (
      <Card className={`stat-card h-100 ${compact ? 'compact' : ''}`}>
        <Card.Body className="d-flex flex-column">
          <div className="d-flex align-items-center mb-3">
            <div className={`stat-icon ${color} ${compact ? 'small' : ''}`}>
              {icon}
            </div>
            <div className="ms-3">
              <Card.Title className={`mb-0 ${compact ? 'h6' : 'h5'}`}>{title}</Card.Title>
            </div>
          </div>
          
          <div className="stat-values">
            <div className="total-stat">
              <div className="stat-label">All Time</div>
              <div className={`stat-number ${compact ? 'compact' : ''}`}>{formatNumber(animatedTotal)}</div>
            </div>
            
            <div className="year-stat">
              <div className="stat-label">Last 12 Months</div>
              <div className={`stat-number text-primary ${compact ? 'compact' : ''}`}>{formatNumber(animatedYear)}</div>
            </div>
          </div>
          
          <div className="stat-percentage mt-auto">
            <small className="text-muted">
              {totalValue > 0 ? `${((yearValue / totalValue) * 100).toFixed(1)}% in last year` : 'No data'}
            </small>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const LineChart = ({ data, title, dataKey, color }) => {
    const svgRef = useRef(null)
    
    useEffect(() => {
      if (!data || data.length === 0) return
      
      const svg = d3.select(svgRef.current)
      svg.selectAll("*").remove()
      
      const margin = { top: 30, right: 30, bottom: 50, left: 60 }
      const width = 450 - margin.left - margin.right
      const height = 250 - margin.top - margin.bottom
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
      
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width])
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[dataKey]) * 1.1])
        .nice()
        .range([height, 0])
      
      // Add gradient definition
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", `gradient-${dataKey}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", height)
        .attr("x2", 0).attr("y2", 0)
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.1)
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.8)
      
      // Add grid lines
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
          .tickSize(-height)
          .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#f0f0f0")
        .style("stroke-width", 1)
      
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#f0f0f0")
        .style("stroke-width", 1)
      
      // Add area under the line
      const area = d3.area()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d[dataKey]))
        .curve(d3.curveCardinal)
      
      g.append("path")
        .datum(data)
        .attr("fill", `url(#gradient-${dataKey})`)
        .attr("d", area)
      
      // Add the line
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[dataKey]))
        .curve(d3.curveCardinal)
      
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("d", line)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      
      // Add axes with styling
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
          .tickFormat(d3.timeFormat("'%y")) // Changed to abbreviated year format like '16, '24
          .tickPadding(10)
        )
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#666")
      
      g.append("g")
        .call(d3.axisLeft(y)
          .ticks(5) // Reduce number of ticks to avoid crowding
          .tickPadding(10)
          .tickFormat(d => d === 0 ? "0" : d.toLocaleString()) // Use proper number formatting instead of d3.format
        )
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#666")
      
      // Style axis lines
      g.selectAll(".domain")
        .style("stroke", "#e0e0e0")
        .style("stroke-width", 2)
      
      // Add interactive dots
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
      
      g.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d[dataKey]))
        .attr("r", 0)
        .attr("fill", color)
        .style("stroke", "white")
        .style("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 6)
          
          tooltip.transition()
            .duration(200)
            .style("opacity", .9)
          
          tooltip.html(`
            <strong>${d3.timeFormat("%B %Y")(d.date)}</strong><br/>
            ${title.split(' ')[1]}: <strong>${d[dataKey].toLocaleString()}</strong>
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 0)
          
          tooltip.transition()
            .duration(500)
            .style("opacity", 0)
        })
        
      // Animate line drawing
      const totalLength = g.select("path:nth-child(4)").node().getTotalLength()
      
      g.select("path:nth-child(4)")
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        
    }, [data, dataKey, color, title])
    
    return (
      <div>
        <h5 className="text-center mb-4 fw-bold" style={{ color: color }}>{title}</h5>
        <svg ref={svgRef} width="450" height="250" style={{ overflow: 'visible' }}></svg>
      </div>
    )
  }

  if (loading) {
    return (
      <Container className="mt-5 pt-3">
        <Row>
          <Col>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading statistics...</p>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-5 pt-3">
        <Row>
          <Col>
            <div className="alert alert-danger">
              <h4>Error</h4>
              <p>{error}</p>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container className="mt-5 pt-3">
      <Row className="mb-4">
        <Col>
          <h1 className="display-4">YouthMappers by the Numbers</h1>
          <p className="lead">Key statistics about YouthMappers contributions to OpenStreetMap</p>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col md={6} lg={4}>
          <StatCard
            title="New Buildings"
            totalValue={stats?.total.newBuildings || 0}
            yearValue={stats?.lastYear.newBuildings || 0}
            icon="🏢"
            color="building-color"
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="New Highways"
            totalValue={stats?.total.newRoads || 0}
            yearValue={stats?.lastYear.newRoads || 0}
            icon="🛣️"
            color="road-color"
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="New Amenities"
            totalValue={stats?.total.newAmenities || 0}
            yearValue={stats?.lastYear.newAmenities || 0}
            icon="🏪"
            color="amenity-color"
          />
        </Col>
      </Row>
      
      <Row className="g-4 mt-3">
        <Col md={6} lg={4}>
          <StatCard
            title="Edited Buildings"
            totalValue={stats?.total.editedBuildings || 0}
            yearValue={stats?.lastYear.editedBuildings || 0}
            icon="🔧"
            color="edit-color"
            compact={true}
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="Edited Highways"
            totalValue={stats?.total.editedRoads || 0}
            yearValue={stats?.lastYear.editedRoads || 0}
            icon="⚡"
            color="edit-color"
            compact={true}
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="Edited Amenities"
            totalValue={stats?.total.editedAmenities || 0}
            yearValue={stats?.lastYear.editedAmenities || 0}
            icon="🔨"
            color="edit-color"
            compact={true}
          />
        </Col>
      </Row>
      
      <Row className="g-4 mt-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Active Chapters Over Time"
                  dataKey="chapters"
                  color="#667eea"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Active Mappers Over Time"
                  dataKey="users"
                  color="#4facfe"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4 mt-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Buildings Added Over Time"
                  dataKey="totalBuildings"
                  color="#667eea"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Highways Added Over Time"
                  dataKey="totalHighways"
                  color="#4facfe"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4 mt-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Amenities Added Over Time"
                  dataKey="totalAmenities"
                  color="#88d8a3"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Total Monthly Activity"
                  dataKey="totalActivity"
                  color="#f5576c"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>About These Statistics</Card.Title>
              <Card.Text>
                These numbers represent the collective contributions of YouthMappers chapters worldwide to OpenStreetMap. 
                Data includes building mapping, road creation and editing, and other geographic features added by our community.
                Statistics are updated based on daily activity tracking across all participating chapters.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Numbers