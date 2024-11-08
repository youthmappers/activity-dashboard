function buildBarChart(opts){

  console.log("Building bar chart in "+opts.svgID+" with data: "+opts.data)

  var svg = d3.select('#'+opts.svgID),
      margin = {top: 25, right: 10, bottom: 50, left: 25}
      var width  = opts.w - margin.left - margin.right;
      var height = opts.h - margin.top - margin.bottom;
      var canvas = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(d3.timeFormat("%b %Y"));

  var yAxis = d3.axisLeft()
      .scale(y)
      .ticks(10);

  var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

  var formatDate = d3.timeFormat("%b %Y");


  d3.json(opts.data, function(error, data) {

      data.forEach(function(d) {
          d.date  = new Date(d[opts.date] * 1000 );
          d.value = +d[opts.value];
      });

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    canvas.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis.ticks(10).tickSize(0))
      .selectAll("text")
        .attr("transform", "rotate(-50)")
        .attr('text-anchor', 'end')

    canvas.append("g")
        .attr("class", "y axis")
        .call(yAxis.ticks(5).tickSize(5))

    canvas.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .style("fill", opts.barColor)
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", 1);    
            div .html(formatDate(d.date) + "<br>" + numberWithCommas(d.value))
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