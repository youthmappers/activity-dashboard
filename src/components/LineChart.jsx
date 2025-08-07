import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './LineChart.css'

function LineChart({ data, title, dataKey, color }) {
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
        .tickFormat(d3.timeFormat("'%y"))
        .tickPadding(10)
      )
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#666")
    
    g.append("g")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickPadding(10)
        .tickFormat(d => d === 0 ? "0" : d.toLocaleString())
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
      .attr("class", "chart-tooltip")
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

export default LineChart
