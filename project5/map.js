d3.select(window).on('load',init);

console.log("test1");

function init() {
    var svg  = d3.selectAll('svg');
    var margin = {top:50, right:50 , bottom : 200, left: 50 };
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    var g = svg.append("g")
                .attr("transform",
                      "translate(" + 50 +"," + 50 + ")");

    //choose projection
    //var projection  = d3.geoMercator()
                        //.scale(300000)
                        //.rotate([122.419416, -37.774929])
                        //.translate([width/6, height/6]);
    var projection = d3.geoKavrayskiy7()
        .scale(width*250)
        .rotate([122.419416, -37.774929])
        .translate([width / 2, height / 2]);

    //define path generator

    var path = d3.geoPath()
                .projection(projection);

        d3.json("sfpd_districts.geojson", function(city){

            console.log("boundary");
            console.log(city.features);
            //console.log(topojson.feature(city, city.objects.countries).features);


            g.append("g")
                .selectAll("path")
                .data(city.features)
                .enter()
                .append("path")
                .attr("d",path)
                .style("fill","steelblue")
                .style("stroke","black");

            console.log("over");

        });

}