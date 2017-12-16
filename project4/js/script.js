d3.select(window).on('load', init);

function init() {

    var svg = d3.select('svg')
        .attr("transform", "translate(0" + "," + 150 + ")");
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

            console.log('data', csvdata);

            var xScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([padding, width-padding]);

            var yScale = d3.scaleLinear()
                .domain([1, -1])
                .range([padding,height-padding]);

            //Create X axis
            d3.select("g")
                .append("g")
                .attr('class', 'axis')
                .attr('transform', 'translate('+ 0 + ',' + height/2 + ')')
                .call(d3.axisBottom(xScale));

            g.append("text")
                .attr("x", width-padding)
                .attr("y", height/2 + padding)
                // .attr('transform', "translate(" + (width-padding) + "," + (height/2) + ")")
                .text("Component 1");

            //Create Y axis
            d3.select("g")
                .append("g")
                .attr('class', 'axis')
                .attr('transform', 'translate('+ width/2 + ',' + 0 + ')')
                .call(d3.axisRight(yScale));

            g.append("text")
                .attr('transform', 'rotate(-90)')
                .attr("x", -padding-margin.top-10)
                .attr("y", (width-padding)/2)
                // .attr('transform', "translate(" + (width-padding) + "," + (height/2) + ")")
                .text("Component 2");


            // Create circles
            g.selectAll('circle')
                .data(csvdata)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    console.log('x: ', xScale(d.feature1));
                    return xScale(d.feature1) + "px";
                })
                .attr('cy', function (d) {
                    console.log('y: ', yScale( d.feature2));
                    return yScale(d.feature2) + "px";
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
                    .attr('x', function(){return xScale(d.feature1) - 30;})
                    .attr('y', function(){return yScale(d.feature2) - 15;})
                    .text("Node: " + (i+1) + "  " + "Position (" + round(d.feature1,2)+","+ round(d.feature2,2)+")");
            }

            function handleMouseOut(d, i) {
                // Use D3 to select element, change color back to normal
                d3.select(this)
                    .attr('fill', 'red')
                    .attr('r', radius);
                document.getElementById("t" + d.feature1 + '-' + d.feature2 + '-' + i).remove()
            }

            function handleClick(d, i){
                svg.append('g')
                    .transform()
            }

            function round(value, decimals) {
                return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
            }

        }

    );
}

