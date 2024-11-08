function buildLineGraph(opts){

  console.log("Building line graph in "+opts.svgID+" with data: "+opts.data)

  var svg = d3.select('#'+opts.svgID),
      margin = {top: 25, right: 10, bottom: 50, left: 50}
      var width  = opts.w - margin.left - margin.right;
      var height = opts.h - margin.top - margin.bottom;
      var canvas = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%b %Y"));

  var yAxis = d3.axisLeft(y)
      .ticks(10);

  var line = d3.line()
      .x(function(d) { return x(d[opts.date]  * 1000); })
      .y(function(d) { return y(d[opts.values[0]]); })
      .curve(d3.curveMonotoneX)

  var line2 = d3.line()
      .x(function(d) { return x(d[opts.date]* 1000); })
      .y(function(d) { return y(d[opts.values[1]]); })
      .curve(d3.curveMonotoneX)

  var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

  var formatDate = d3.timeFormat("%b %Y");

  d3.json(opts.data, function(error, data) {

      data.forEach(function(d) {
        d.date  = new Date(d[opts.date] * 1000);
      });

    x.domain( d3.extent(data.map(function(d) { return d.date; }))),
    y.domain([0, d3.max(data, function(d) { return +d[opts.values[0]]; })]);

    canvas.append("g")
      .attr("class", "axis x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    canvas.append("g")
        .attr("class", "y axis")
        .call(yAxis.ticks(5).tickSize(5))

    canvas.append("path")
        .datum(data) 
        .attr("class", (opts.lineClass || "line"))
        .attr("d", line);

    canvas.selectAll(".dot")
        .data(data)
          .enter().append("circle") // Uses the enter().append() method
          .attr("class", (opts.lineClass || "line")) // Assign a class for styling
          .attr("cx", function(d) { return x(d.date) })
          .attr("cy", function(d) { return y(d[opts.values[0]]) })
          .attr("r", 3)
          .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", 1);    
            div .html(formatDate(d.date) + "<br>" + numberWithCommas(d[opts.values[0]]))  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
          .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });  

  });
}