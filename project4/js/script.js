d3.select(window).on('load', init);

function init() {

    var svg = d3.select('#pca').append("svg")
        .attr('id', 'svg1');
    var margin = {top: 50, right: 50, bottom: 50, left: 80};
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    var radius = 3;
    var padding = 30;

    var g = svg.append('g');

    function convertNumbers(row) {
        var r = {};
        for (var k in row) {
            r[k] = +row[k];
            if (isNaN(r[k])) {
                r[k] = row[k];
            }
        }
        return r;
    }

    d3.csv(
        'source/hands_pca.csv', convertNumbers,
        function (error, csvdata) {
            if (error) throw error;

            var xScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([padding, width - padding]);

            var yScale = d3.scaleLinear()
                .domain([1, -1])
                .range([padding, height - padding]);

            //Create X axis
            d3.select("g")
                .append("g")
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + height / 2 + ')')
                .call(d3.axisBottom(xScale));

            g.append("text")
                .attr("x", width - padding)
                .attr("y", height / 2 + padding)
                // .attr('transform', "translate(" + (width-padding) + "," + (height/2) + ")")
                .text("Component 1");

            //Create Y axis
            d3.select("g")
                .append("g")
                .attr('class', 'axis')
                .attr('transform', 'translate(' + width / 2 + ',' + 0 + ')')
                .call(d3.axisRight(yScale));

            g.append("text")
                .attr('transform', 'rotate(-90)')
                .attr("x", -padding - margin.top - 40)
                .attr("y", (width - padding) / 2)
                .text("Component 2");

            // Create circles
            g.selectAll('circle')
                .data(csvdata)
                .enter()
                .append('circle')
                .attr('class', function (d, i) {
                    return "pcac"+(i+1);
                })
                .attr('cx', function (d) {
                    return xScale(d.feature1) + "px";
                })
                .attr('cy', function (d) {
                    return yScale(d.feature2) + "px";
                })
                .attr('r', radius)
                .attr('fill', 'red')
                .on('mouseover', handleMouseOver)
                .on('mouseout', handleMouseOut)
                .on('click', handleClick);

            //highlight circle when mouse over the discussion for this outlier
            d3.select('#outlier38')
                .on("mouseover",
                    function(d, i) {
                        d3.select(".pcac38")
                            .attr("fill", "blue")})
                .on("mouseout",
                    function(d, i) {
                        d3.select(".pcac38")
                            .attr("fill", "red")});

            d3.select('#outlier40')
                .on("mouseover",
                    function(d, i) {
                        d3.select(".pcac40")
                        .attr("fill", "blue")})
                .on("mouseout",
                    function(d, i) {
                         d3.select(".pcac40")
                        .attr("fill", "red")});

            // Create Event Handlers for mouse
            function handleMouseOver(d, i) {  // Add interactivity
                // Use D3 to select element, change color and size
                d3.select(this)
                    .attr('fill', 'pink')
                    .attr('r', radius * 2);

                g.append('text')
                    .attr('id', "t" + d.feature1 + '-' + d.feature2 + '-' + i)
                    .attr('x', function () {
                        return xScale(d.feature1) - 30;
                    })
                    .attr('y', function () {
                        return yScale(d.feature2) - 15;
                    })
                    .text("Node: " + (i + 1) + "  " + "Position (" + round(d.feature1, 2) + "," + round(d.feature2, 2) + ")");
            }

            function handleMouseOut(d, i) {
                // Use D3 to select element, change color back to normal
                d3.select(this)
                    .attr('fill', 'red')
                    .attr('r', radius);
                document.getElementById("t" + d.feature1 + '-' + d.feature2 + '-' + i).remove()
            }

            var outline = d3.select('#hand')
                .append('svg')
                .attr('id', 'svg2');

            var g2 = outline.append('g')
                .attr('transform', "translate(" + 0 + "," + 30 + ")");

            function handleClick(d, i) {

                g2.selectAll("*").remove();

                d3.csv('source/hands.csv', convertNumbers,
                    function (error, data){
                        if (error) throw error;
                        var point = data[i];

                        var xData = Object.values(point).slice(0, 56);
                        var yData = Object.values(point).slice(56, 112);

                        point = makeMatrix(xData, yData);

                        // Create scales
                        var x = d3.scaleLinear()
                            .domain(d3.extent(point,
                                function(d){
                                    return d[0];
                                }))
                            .range([0,width]);

                        //d3.extent(array, callback) returns the minimum and maximum of the array
                        //callback = array.map(callback)
                        var y = d3.scaleLinear()
                            .domain(d3.extent(point,
                                function(d){
                                    return d[1];
                                }))
                            .range([0,height]);

                        // Create line generator
                        var line = d3.line()
                            .x(function(d){return x(d[0])})
                            .y(function(d){return y(d[1])})
                            .curve(d3.curveCatmullRom);


                        // Create actual path element
                        g2.append('path')
                            .attr('d', line(point))
                            .attr('class','handp'+ i)
                            .attr("stroke", "blue")
                            .attr("stroke-width", 1)
                            .attr("fill", 'none');


                        // For reference, add points as well
                        g2.selectAll('circle')
                            .data(point)
                            .enter()
                            .append('circle')
                            .attr('class','handc'+ (i+1))
                            .attr('cx',function(d){return x(d[0])})
                            .attr('cy', function(d){return y(d[1])})
                            .attr('r', '2px')
                            .attr('fill', 'steelblue')
                    });
                };

            function round(value, decimals) {
                return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
            }

            function makeMatrix(x, y){
                var newData = [];
                for (var i=0; i<x.length; i++){
                    newData = newData.concat([[x[i], y[i]]]);
                }
                return newData;
            }
        }

    );
}

function getSelectValue()
{
    var selectedValue = document.getElementById("list").value;
    var selectedValue2 = document.getElementById("list2").value;
    updateValues(selectedValue, selectedValue2);
}

// ** Update data section (Called from the onclick)
function updateValues(feature1, feature2)
{
    d3.select('#pca').select("svg")
        .remove();
    d3.select('#pca').select('g')
        .remove();

    var svg = d3.select('#pca').append('svg')
        .attr('id', 'svg1');
    var margin = {top: 50, right: 50, bottom: 50, left: 80};
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    var radius = 3;
    var padding = 30;

    var g = svg.append('g');

    function convertNumbers(row) {
        var r = {};
        for (var k in row) {
            r[k] = +row[k];
            if (isNaN(r[k])) {
                r[k] = row[k];
            }
        }
        return r;
    }

    d3.csv(
        'source/hands_pca.csv', convertNumbers,
        function (error, csvdata) {
            if (error) throw error;
            var xScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([padding, width - padding]);

            var yScale = d3.scaleLinear()
                .domain([1, -1])
                .range([padding, height - padding]);

            //Create X axis
            d3.select("g")
                .append("g")
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + height / 2 + ')')
                .call(d3.axisBottom(xScale));

            g.append("text")
                .attr("x", width - padding)
                .attr("y", height / 2 + padding)
                // .attr('transform', "translate(" + (width-padding) + "," + (height/2) + ")")
                .text("Component 1");

            //Create Y axis
            d3.select("g")
                .append("g")
                .attr('class', 'axis')
                .attr('transform', 'translate(' + width / 2 + ',' + 0 + ')')
                .call(d3.axisRight(yScale));

            g.append("text")
                .attr('transform', 'rotate(-90)')
                .attr("x", -padding - margin.top - 40)
                .attr("y", (width - padding) / 2)
                .text("Component 2");

            // Create circles
            g.selectAll('circle')
                .attr("class", "dots")
                .data(csvdata)
                .enter()
                .append('circle')
                .attr('class', function (d, i) {
                    return "pcac"+(i+1);
                })
                .attr('cx', function (d) {
                    return xScale(parseFloat(eval(feature1))) + "px";
                })
                .attr('cy', function (d) {
                    return yScale(parseFloat(eval(feature2))) + "px";
                })
                .attr('r', radius)
                .attr('fill', 'red')
                .on('mouseover', handleMouseOver)
                .on('mouseout', handleMouseOut)
                .on('click', handleClick);

            // Create Event Handlers for mouse
            function handleMouseOver(d, i) {  // Add interactivity
                // Use D3 to select element, change color and size
                d3.select(this)
                    .attr('fill', 'pink')
                    .attr('r', radius * 2);

                g.append('text')
                    .attr('id', "t" + d.feature1 + '-' + d.feature2 + '-' + i)
                    .attr('x', function () {
                        return xScale(d.feature1) - 30;
                    })
                    .attr('y', function () {
                        return yScale(d.feature2) - 15;
                    })
                    .text("Node: " + (i + 1) + "  " + "Position (" + round(d.feature1, 2) + "," + round(d.feature2, 2) + ")");
            }

            function handleMouseOut(d, i) {
                // Use D3 to select element, change color back to normal
                d3.select(this)
                    .attr('fill', 'red')
                    .attr('r', radius);
                document.getElementById("t" + d.feature1 + '-' + d.feature2 + '-' + i).remove()
            }

            //var outline = d3.select('#hand')
            //    .attr('id', 'svg2')
            //    .remove();

            var outline = d3.select('#hand')
                .select('svg')
                .remove();

            var outline = d3.select('#hand')
                .append('svg')
                .attr('id', 'svg2');

            var g2 = outline.append('g')
                .attr('transform', "translate(" + 0 + "," + 30 + ")");

            function handleClick(d, i) {

                g2.selectAll("*").remove();

                d3.csv('source/hands.csv', convertNumbers,
                    function (error, data){
                        if (error) throw error;
                        var point = data[i];

                        var xData = Object.values(point).slice(0, 56);
                        var yData = Object.values(point).slice(56, 112);

                        point = makeMatrix(xData, yData);

                        // Create scales
                        var x = d3.scaleLinear()
                            .domain(d3.extent(point,
                                function(d){
                                    return d[0];
                                }))
                            .range([0,width]);

                        //d3.extent(array, callback) returns the minimum and maximum of the array
                        //callback = array.map(callback)
                        var y = d3.scaleLinear()
                            .domain(d3.extent(point,
                                function(d){
                                    return d[1];
                                }))
                            .range([0,height]);

                        // Create line generator
                        var line = d3.line()
                            .x(function(d){return x(d[0])})
                            .y(function(d){return y(d[1])})
                            .curve(d3.curveCatmullRom);


                        // Create actual path element
                        g2.append('path')
                            .attr('d', line(point))
                            .attr('class','handp'+ i)
                            .attr("stroke", "blue")
                            .attr("stroke-width", 1)
                            .attr("fill", 'none');


                        // For reference, add points as well
                        g2.selectAll('circle')
                            .data(point)
                            .enter()
                            .append('circle')
                            .attr('class','handc'+ (i+1))
                            .attr('cx',function(d){return x(d[0])})
                            .attr('cy', function(d){return y(d[1])})
                            .attr('r', '2px')
                            .attr('fill', 'steelblue')
                    });
            };

            function round(value, decimals) {
                return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
            }

            function makeMatrix(x, y){
                var newData = [];
                for (var i=0; i<x.length; i++){
                    newData = newData.concat([[x[i], y[i]]]);
                }
                return newData;
            }
        }

    );
}