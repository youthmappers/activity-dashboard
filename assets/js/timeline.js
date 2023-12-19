var $container = document.getElementById('timeline'),
    width  = $container.offsetWidth
	height = 50

var xDomainSet = false

var options = {year: 'numeric', month: 'short', day: 'numeric' };

var svg = d3.select('#timeline').append("svg")
    .attr("width", '100%')
    .attr("height", height)
    .attr('viewBox','0 0 '+width+' '+height)
    .attr('preserveAspectRatio','xMinYMin')
    .append("g")

var parseDate = d3.timeParse("%Y-%m-%d")

    margin = {top: 10, right: 0, bottom: 0, left: 15}
    width  = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(x)
var xAxis2 = d3.axisTop(x)

var brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("brush end", brushed);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.day); })
    .y0(height)
    .y1(function(d) { return y(d.value); });

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/daily_activity.csv", function(error, data) {
	data.forEach(function(d){
	  d.day = parseDate(d.day);
	  d.value = +d.chapters_rolling_avg;
	})

  if (error) throw error;

  x.domain(d3.extent(data, function(d) { return d.day; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  xDomainSet = true;

  context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

//   context.append("g")
//       .attr("class", "axis axis--x")
//       .attr("transform", "translate(0," + height + ")")
//       .call(xAxis);

  context.append("g")
      .attr("class", "axis axis--x axis--top")
      .attr('stroke-width',0)
      .attr("transform", "translate(0," + margin.top + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
});

function brushed(start=false) {

  if (!start){
	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
	var s = d3.event.selection || x.range();
  }else{
  	s = x.range()
  }


  


  var start = Math.round(+x.invert(s[0])/1000)
  var end   = Math.round(+x.invert(s[1])/1000)

  document.getElementById('datestring').innerHTML = x.invert(s[0]).toLocaleDateString("en-US", options) + " - " + x.invert(s[1]).toLocaleDateString("en-US", options)

  console.log("Setting filters: " + start + " | "+  end)

  setTemporalFilters(
  	 [['>=','timestamp',start],
  	 ['<','timestamp',end]]
  	)
  setFilters()
}