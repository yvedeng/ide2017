d3.select(window).on('load', init);

function init(){
    var options_list  = ["Room Type", "Price Range"];

    var select = d3.select('body')
        .append('select')
        .attr('class','select')
        .call(RoomType)
        .on('change',onchange);

    var options = select
        .selectAll('option')
        .data(options_list).enter()
        .append('option')
        .text(function (d) { return d; });


    function  onchange() {

        selectValue = d3.select('select').property('value');

        if (selectValue == "Room Type") {
            g.selectAll("*").remove();
            RoomType();
        }
        else {
            g.selectAll("*").remove();
            PriceRange();
        }

    }


    var margin = {top: 20, right: 20, bottom: 30, left: 40};

    var width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#barplots").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function RoomType() {

    d3.csv("data/listings_room.csv", function(d,i,columns) {

        for (i = 1, t = 0; i < columns.length; ++i)
            t += d[columns[i]] = +d[columns[i]];
            d.total = t;
        return d;
        }, function(error, csvdata) {


        if (error) throw error;

        for (var i = 0; i < csvdata.length; i++) {
            switch (csvdata[i].neighbourhood) {
                case "Frederiksberg":
                    continue;
                case "Brnshj Husum":
                    csvdata[i].neighbourhood = "Brønshøj-Husum";
                    continue;
                case "Sterbro":
                    csvdata[i].neighbourhood = "Østerbro";
                    continue;
                case "Amager st":
                    csvdata[i].neighbourhood = "Amager Øst";
                    continue;
                case "Norrebro":
                    csvdata[i].neighbourhood = "Nørrebro";
                    continue;
                case "Vanlse":
                    csvdata[i].neighbourhood = "Vanløse";
                    continue;
                default:
                    continue;
            }
        }

        var keys = csvdata.columns.slice(1);


        csvdata.sort(function (a, b) {
            return b.total - a.total;
        });

        var padding = 180;

        var x = d3.scaleBand()
            .rangeRound([height, 0])
            .paddingInner(0.5)
            .align(0.1)
            .domain(csvdata.map(function (d) {
                return d.neighbourhood;
            }));

        var y = d3.scaleLinear()
            .rangeRound([padding, width])
            .domain([0, d3.max(csvdata, function (d) {
                return d.total;
            })]).nice();

        var color = d3.scaleOrdinal()
            .range(['#b5cf6b', '#fdae6b ', '#bcbddc'])
            .domain(keys);


        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(y));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(x).ticks(null, "s"))
            .attr("transform", "translate(" + padding + ",0)")
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Neighbourhood");

        var bars = g.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(csvdata))
            .enter().append("g")
            .attr("fill", function (d) {
                return color(d.key);
            })
            .selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .transition()
            .duration(1000)
            .attr("y", function (d) {
                return x(d.data.neighbourhood);
            })
            .attr("x", function (d) {
                return y(d[0]);
            })
            //.attr("x", 0)
            .attr("width", function (d) {
                return y(d[1]) - y(d[0]);
            })
            .attr("height", x.bandwidth());


        g.selectAll("rect")
            .on("mouseover", function (d) {
                var delta = d[1] - d[0];
                var xPos = parseFloat(d3.select(this).attr("x"));
                var yPos = parseFloat(d3.select(this).attr("y"));
                var height = parseFloat(d3.select(this).attr("height"));

                d3.select(this)
                    .attr("fill", "darkblue");

                g.append("text")
                    .attr("x", xPos)
                    .attr("y", yPos - height / 4)
                    .style("font-size", "15px")
                    .style("text-anchor", "middle")
                    .attr("class", "tooltip")
                    .text(delta);

            })
            .on("mouseout", function () {
                g.select(".tooltip").remove();
                d3.select(this)
                    .attr("fill", function () {
                        return "" + color[this.id] + "";
                    });

            });


        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 15)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });


        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color)
           // .attr("id",)
            .on("click",onclick);

        function onclick() {

            if (keys[i] == "Shared Room") plotSingle();

        }

        function plotSingle() {

            d3.csv("data/listings_room.csv", function(error, data) {
                if (error) throw error;

                data.forEach(function(d) {
                    d.SharedRoom = d['Shared Room'];
                })


                // Scale the range of the data in the domains
                x.domain(data.map(function(d) { return d.neighbourhood; }));
                y.domain([0, d3.max(data, function(d) { return d.SharedRoom })]);

                // append the rectangles for the bar chart
                svg.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.neighbourhood); })
                    .attr("width", x.bandwidth())
                    .attr("y", function(d) { return y(d.SharedRoom ); })
                    .attr("height", function(d) { return height - y(d.SharedRoom); });

                // add the x Axis
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(y));

                // add the y Axis
                svg.append("g")
                    .call(d3.axisLeft(x));

            });



        }

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) {
                return d;
            });


    });
}

    function PriceRange() {

        d3.csv("data/listings_price.csv", function(d,i,columns) {

            for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        }, function(error, csvdata) {


            if (error) throw error;


            for (var i = 0; i < csvdata.length; i++) {
                switch (csvdata[i].neighbourhood) {
                    case "Frederiksberg":
                        continue;
                    case "Brnshj Husum":
                        csvdata[i].neighbourhood = "Brønshøj-Husum";
                        continue;
                    case "Sterbro":
                        csvdata[i].neighbourhood = "Østerbro";
                        continue;
                    case "Amager st":
                        csvdata[i].neighbourhood = "Amager Øst";
                        continue;
                    case "Norrebro":
                        csvdata[i].neighbourhood = "Nørrebro";
                        continue;
                    case "Vanlse":
                        csvdata[i].neighbourhood = "Vanløse";
                        continue;
                    default:
                        continue;
                }
            }

            var keys = csvdata.columns.slice(1);

            csvdata.sort(function(a, b) { return b.total - a.total; });

            var padding=180;

            var x = d3.scaleBand()
                .rangeRound([height,0])
                .paddingInner(0.5)
                .align(0.1)
                .domain(csvdata.map(function(d) { return d.neighbourhood; }));

            var y = d3.scaleLinear()
                .rangeRound([padding,width])
                .domain([0, d3.max(csvdata, function(d) { return d.total; })]).nice();

            var color = d3.scaleOrdinal()
                .range(['#bcbddc','#fdae6b ','#b5cf6b','#ff9896','#aec7e8'])
                .domain(keys);


            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(y));

            g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(x).ticks(null, "s"))
                .attr("transform", "translate("+padding+",0)")
                .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text("Neighbourhood");

            var bars = g.append("g")
                .selectAll("g")
                .data(d3.stack().keys(keys)(csvdata))
                .enter().append("g")
                .attr("fill", function(d) { return color(d.key); })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter().append("rect")
                .transition()
                .duration(1000)
                .attr("y", function(d) { return x(d.data.neighbourhood); })
                .attr("x", function(d) { return y(d[0]); })
                //.attr("x",0 )
                .attr("width", function(d) { return y(d[1]) - y(d[0]); })
                .attr("height", x.bandwidth());

            g.selectAll("rect")
                .on("mouseover", function(d){

                    var delta = d[1] - d[0];
                    var xPos = parseFloat(d3.select(this).attr("x"));
                    var yPos = parseFloat(d3.select(this).attr("y"));
                    var height = parseFloat(d3.select(this).attr("height"));


                    d3.select(this)
                        .attr("fill","steelblue");

                    svg.append("text")
                        .attr("x",xPos+60)
                        .attr("y",yPos +height/1.5)
                        .style("font-size","15px")
                        .style("text-anchor", "middle")
                        .attr("class","tooltip")
                        .text(delta);

                })
                .on("mouseout",function(){
                    svg.select(".tooltip").remove();
                    d3.select(this)
                        .attr("fill", function() {
                            return "" + color[this.id] + "";
                        });

                });


            var legend = g.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 15)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(keys.slice().reverse())
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });


            legend.append("rect")
                .attr("x", width - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", color);


            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(function(d) { return d; });

        });
    }
}