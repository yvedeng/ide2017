d3.csv(
    'source/hands_pca.csv',
    function(d){
        console.log('d', d);

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 550 - margin.left - margin.right,
            height = 550 - margin.top - margin.bottom;

    }
);

// var xScale = d3.scaleLinear()
//     .range([0, width]);
//
// var yScale = d3.scaleLinear()
//     .range([height, 0]);
//
// var svg = d3.select("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


