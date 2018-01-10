function makeplot(crime_filter, district_filter, year_filter, day_filter) {
  d3.select('#map_container').selectAll("*").remove();
  console.log(crime_filter);
  var margin = {top: 10, left: 10, bottom: 10, right: 10},
      width = parseInt(d3.select('#map_container').style('width')),
      //width = 650,
      width = width - margin.left - margin.right,
      mapRatio = 1,
      height = width * mapRatio,
      scaleMultiplier = 300

  var mapsvg = d3.select('#map_container').append('svg')
      .attr('height', height)
      .attr('id','map')

  var colorMap = d3.map(),
      keymap = []

  var quantize = d3.scale.quantize()
      .range(d3.range(9).map(function(i) { return 'q' + i + '-9' }))

  var tiler = d3.geo.tile()
      .size([width, height])

  var projection = d3.geo.mercator()
      .center([-122.433701, 37.767683])
      .scale(width*300)
      .translate([width / 2, height / 2])

  var path = d3.geo.path()
      .projection(projection)

  mapsvg
		.call(renderTiles, 'highroad')

  function renderTiles(svg, type) {
    svg.append('g')
        .attr('class', type)
      .selectAll('g')
        .data(tiler
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0])))
      .enter().append('g')
        .each(function(d) {
          var g = d3.select(this)
          d3.json('data/osm/' + ['a', 'b', 'c'][(d[0] * 31 + d[1]) % 3] + '-highroad-'+ d[2] + '-' + d[0] + '-' + d[1] + '.json', function(error, json) {
            g.selectAll('path')
                .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key }))
              .enter().append('path')
                .attr('class', function(d) { return d.properties.kind })
                .attr('d', path)
          })
        })
  }
  
  var xScale = d3.scale.linear()
	.domain([-122.533701, -122.33701])
	.range([0, width]);

  var yScale = d3.scale.linear()
	.domain([37.842683, 37.692683])
	.range([0, height]);
	
  function handleFillColor(input_str) {
	var dotcolor = "";
	if (crime_filter != "All") {return 'red'}
	if (input_str == "BURGLARY") {dotcolor = "#903f2d"};
	if (input_str == "OTHER OFFENSES") {dotcolor = "#f4fb7e"};
	if (input_str == "LARCENY/THEFT") {dotcolor = "#234c3b"};
	if (input_str == "VEHICLE THEFT") {dotcolor = "#8db1ee"};
	if (input_str == "ASSAULT") {dotcolor = "#de00ff"};
	if (input_str == "WARRANTS") {dotcolor = "#2518cb"};
	if (input_str == "NON-CRIMINAL") {dotcolor = "#746537"}; 
	if (input_str == "VANDALISM") {dotcolor = "#392924"};
	if (input_str == "SUSPICIOUS OCC") {dotcolor = "#9a0a49"}; 
	if (input_str == "DRUG/NARCOTIC") {dotcolor = "#daa02a"};
	if (input_str == "MISSING PERSON") {dotcolor = "#d99e86"};
	if (input_str == "FRAUD") {dotcolor = "#73b918"};
	if (input_str == "DRUNKENNESS") {dotcolor = "#8cd6ae"};
	if (input_str == "TRESPASS") {dotcolor = "#9216eb"};
	if (input_str == "PROSTITUTION") {dotcolor = "#01aa5b"};
	if (input_str == "ARSON") {dotcolor = "#ac9957"};
	if (input_str == "RUNAWAY") {dotcolor = "#14f1ce"};
	if (input_str == "RECOVERED VEHICLE") {dotcolor = "#5bfe01"};
	if (input_str == "ROBBERY") {dotcolor = "#3e276b"};
	if (input_str == "FORGERY/COUNTERFEITING") {dotcolor = "#307b2c"};
	if (input_str == "SUICIDE") {dotcolor = "#c053e1"};
	if (input_str == "DISORDERLY CONDUCT") {dotcolor = "#e551dd"};
	if (input_str == "SECONDARY CODES") {dotcolor = "#6ccc7a"};
	if (input_str == "EXTORTION") {dotcolor = "#b2b092"};
	if (input_str == "STOLEN PROPERTY") {dotcolor = "#fa7fc8"};
	if (input_str == "WEAPON LAWS") {dotcolor = "#2faab0"};
	if (input_str == "SEX OFFENSES FORCIBLE") {dotcolor = "#00f1d0"};
	if (input_str == "SEX OFFENSES NON FORCIBLE") {dotcolor = "#e1eb7c"};
	if (input_str == "DRIVING UNDER THE INFLUENCE") {dotcolor = "#b0ecac"};
	if (input_str == "KIDNAPPING") {dotcolor = "#952e1f"};
	if (input_str == "EMBEZZLEMENT") {dotcolor = "#ddf8e3"};
	if (input_str == "LIQUOR LAWS") {dotcolor = "#edc0c2"};
	return dotcolor;
  }
  
  if (crime_filter == "All") {
  var color_legend = [{input_str: "BURGLARY", dotcolor: "#903f2d"},
						{input_str: "OTHER OFFENSES", dotcolor: "#f4fb7e"},
						{input_str: "LARCENY/THEFT", dotcolor: "#234c3b"},
						{input_str: "VEHICLE THEFT", dotcolor: "#8db1ee"},
						{input_str: "ASSAULT", dotcolor: "#de00ff"},
						{input_str: "WARRANTS", dotcolor: "#2518cb"},
						{input_str: "NON-CRIMINAL", dotcolor: "#746537"}, 
						{input_str: "VANDALISM", dotcolor: "#392924"},
						{input_str: "SUSPICIOUS OCC", dotcolor: "#9a0a49"}, 
						{input_str: "DRUG/NARCOTIC", dotcolor: "#daa02a"},
						{input_str: "MISSING PERSON", dotcolor: "#d99e86"},
						{input_str: "FRAUD", dotcolor: "#73b918"},
						{input_str: "DRUNKENNESS", dotcolor: "#8cd6ae"},
						{input_str: "TRESPASS", dotcolor: "#9216eb"},
						{input_str: "PROSTITUTION", dotcolor: "#01aa5b"},
						{input_str: "ARSON", dotcolor: "#ac9957"},
						{input_str: "RUNAWAY", dotcolor: "#ec6d8d"},
						{input_str: "RECOVERED VEHICLE", dotcolor: "#5bfe01"},
						{input_str: "ROBBERY", dotcolor: "#3e276b"},
						{input_str: "FORGERY/COUNTERFEITING", dotcolor: "#307b2c"},
						{input_str: "SUICIDE", dotcolor: "#c053e1"},
						{input_str: "DISORDERLY CONDUCT", dotcolor: "#e551dd"},
						{input_str: "SECONDARY CODES", dotcolor: "#6ccc7a"},
						{input_str: "EXTORTION", dotcolor: "#b2b092"},
						{input_str: "STOLEN PROPERTY", dotcolor: "#fa7fc8"},
						{input_str: "WEAPON LAWS", dotcolor: "#2faab0"},
						{input_str: "SEX OFFENSES FORCIBLE", dotcolor: "#00f1d0"},
						{input_str: "SEX OFFENSES NON FORCIBLE", dotcolor: "#e1eb7c"},
						{input_str: "DRIVING UNDER THE INFLUENCE", dotcolor: "#b0ecac"},
						{input_str: "KIDNAPPING", dotcolor: "#952e1f"},
						{input_str: "EMBEZZLEMENT", dotcolor: "#ddf8e3"},
						{input_str: "LIQUOR LAWS", dotcolor: "#edc0c2"}]
  }

  var radius = 1.5;
  
  d3.json("data/sf_crime.geojson", function(error, dataset){
    if (error) throw error;

	var bump = [1,2];
	
	var dot_data = [];
	var crime_count = 0;
	dataset.features.forEach(function (d) {
		if ((d.properties.Category == crime_filter || crime_filter == "All") && (d.properties.DayOfWeek == day_filter || day_filter == "All") && (d.properties.PdDistrict == district_filter || district_filter == "All") 
			&& (d.properties.Dates.split("-", 1) == year_filter || year_filter == "All")) {
			dot_data.push({x: xScale(d.properties.X), y: yScale(d.properties.Y), date: d.properties.Dates, category: d.properties.Category, description: d.properties.Descript, address: d.properties.Address});
			crime_count = crime_count + 1;
		} else {return;}
	})
	
	var dots = mapsvg.selectAll(".dots")
		.data(dot_data)
		.enter()
		.append('circle')
		.attr('class', "dot")
		.attr('cx', function (d) {return d.x;})
		.attr('cy', function (d) {return d.y;})
		.attr('r', radius)
		.attr('fill', function (d) {return handleFillColor(d.category);})
		.on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
	if (crime_filter == "All") {
	var legend = mapsvg.selectAll(".legend")
		.data(color_legend)
		.enter()
		.append('circle')
		.attr('class', "dot")
		.attr('cx', width-150)
		.attr('cy', function (d, i) {return (50)+(10*i);})
		.attr('r', radius*3)
		.attr('fill', function (d) {return (d.dotcolor);})
	var legend_text = mapsvg.selectAll(".legend_text")
		.data(color_legend)
		.enter()
		.append('text')
		.attr('font-size', "10px")
		.attr('x', width-140)
		.attr('y', function (d, i) {return (54)+(10*i);})
		.text(function (d) {return d.input_str;})
	}
	
	var crime_count_text = mapsvg.selectAll(".crime_count_text")
		.data(bump)
		.enter()
		.append('text')
		.attr('font-size', "18px")
		.attr('x', 250)
		.attr('y', 55)
		.text("Total number of crimes shown: " + crime_count)
  })
  
  // Create Event Handlers for mouse
  function handleMouseOver(d, i) {  // Add interactivity
    // Use D3 to select element, change color and size
	//console.log(d);
    d3.select(this)
		.attr('fill', 'blue')
		.attr('r', radius * 3);
	g = mapsvg.append('g')
		g.append('text')
		.attr('font-size', "16px")
		.attr('id', "text_bracket1")
        .attr('x', (width/2)-200)
		.attr('y', 90)
		.attr('dy', "0em")
		.text("Date: " + d.date)
		
		g.append('text')
		.attr('font-size', "16px")
		.attr('id', "text_bracket2")
        .attr('x', (width/2)-200)
		.attr('y', 90)
		.attr('dy', "1em")
		.text("Address: " + d.address)
		
		g.append('text')
		.attr('font-size', "16px")
		.attr('id', "text_bracket3")
        .attr('x', (width/2)-200)
		.attr('y', 90)
		.attr('dy', "2em")
		.text("Category: " + d.category)
		
		g.append('text')
		.attr('font-size', "16px")
		.attr('id', "text_bracket4")
        .attr('x', (width/2)-200)
		.attr('y', 90)
		.attr('dy', "3em")
		.text("Description: " + d.description);
  }

  function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this)
        .attr('fill', handleFillColor(d.category))
        .attr('r', radius);
    //document.getElementById("t" + d.feature1 + '-' + d.feature2 + '-' + i).remove()
	document.getElementById("text_bracket1").remove();
	document.getElementById("text_bracket2").remove();
	document.getElementById("text_bracket3").remove();
	document.getElementById("text_bracket4").remove();
  }

  function resize() {
    // adjust things when the window size changes
    width = parseInt(d3.select('#map_container').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width*scaleMultiplier);

    // resize the map container
    mapsvg
        .style('width', width + 'px')
        .style('height', height + 'px');

    // resize the map
    mapsvg.select('.highroad').attr('d', path);
    mapsvg.selectAll('.minor_road').attr('d', path);
    mapsvg.selectAll('.major_road').attr('d', path);
    mapsvg.selectAll('.highway').attr('d', path);
  }
  
}
var crime_filter = "All", 
	district_filter = "All",
	year_filter = "All",
	day_filter = "All";
makeplot(crime_filter, district_filter, year_filter, day_filter);

  //UPDATING VLAUES
  
function getSelectValue() {
    var selectedValue = document.getElementById("list_crimes").value;
    var selectedValue2 = document.getElementById("list_district").value;
	var selectedValue3 = document.getElementById("list_year").value;
    var selectedValue4 = document.getElementById("list_day").value;
    makeplot(selectedValue, selectedValue2, selectedValue3, selectedValue4);
}