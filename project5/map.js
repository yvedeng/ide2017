d3.select(window).on('load',init);

function init() {
    var svg  = d3.selectAll('svg');
    var margin = {top:50, right:50 , bottom : 200, left: 50 };
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    var g = svg.append("g")
                .attr("transform",
                      "translate(" + margin.top + "," + margin.left + ")");

    console.log("width", width);
    console.log("height", height);

    var projection  = d3.geoKavrayskiy7()
        .scale(width/2)
        .translate([width/2, height/2]);

    var path = d3.geoPath()
        .projection(projection);

    d3.json("sfpd_districts.geojson", function(error, data){
        if (error) throw error;
        g.append("g")
            .attr("class", "districts")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill","#ccc")
            .style("stroke","#aaa");
    })

}