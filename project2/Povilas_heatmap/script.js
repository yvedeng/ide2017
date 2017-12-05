d3.select(window).on('load', init);

function init() {
    d3.tsv('Copenhagen.tsv', function(error, data) {
        if (error) throw error;

        function mapping(dataset){

            return data.map(function (i) {return parseFloat(eval(dataset))});
        }

        var JAN = mapping("i.JAN");
        var FEB = mapping("i.FEB");
        var MAR = mapping("i.MAR");
        var APR = mapping("i.APR");
        var MAY = mapping("i.MAY");
        var JUN = mapping("i.JUN");
        var JUL = mapping("i.JUL");
        var AUG = mapping("i.AUG");
        var SEP = mapping("i.SEP");
        var OCT = mapping("i.OCT");
        var NOV = mapping("i.NOV");
        var DEC = mapping("i.DEC");

        var year = [JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC];

        var width = window.screen.width * window.devicePixelRatio - 200;
            cellSize = (width/JAN.length);
            height = cellSize * (year.length + 9);
            min = d3.min(year, function(d){return d3.min(d);});
            max = d3.max(year, function(d){return d3.max(d);});

        var colorScale = d3.scale.linear()
            .domain([min, max])
            .range(["#0000ff", "#ff0000"]);

        var canvas = d3.select("body")
            .append("svg")
            .attr("height", height)
            .attr("width", width+(cellSize*2.5));

        function slicing(oldArray){
            newArray = []
            for (i=0; i < oldArray.length; i = i+5) {
                newArray.push(oldArray[i]);
            }
            return newArray
        }

        canvas.append("text")
            .attr("x", (width / 2))
            .attr("y", cellSize*1.25)
            .attr("text-anchor", "middle")
            .attr("font-size", 1.5*cellSize)
            .style("text-decoration", "underline")
            .text("Temperature heatmap in Copenhagen 1880-2017");

        var years = mapping("i.YEAR");
        var years = slicing(years);
        var yearLabels = canvas.selectAll(".yearLabel")
            .data(years)
            .enter()
            .append("text")
            .text(function (d) {return d;})
            .attr("font-size", cellSize)
            .attr("x", function (d, i) {return i * cellSize * 5;})
            .attr("y", 0)
            .style("text-anchor", "left")
            .attr("transform", "translate("+ cellSize*2 + ", " + ((2*cellSize+1) + cellSize * (year.length + 1)) + ")");

        var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        var monthLabels = canvas.selectAll(".timeLabel")
            .data(monthNames)
            .enter()
            .append("text")
            .text(function(d) {return d;})
            .attr("font-size", cellSize)
            .attr("x", 0)
            .attr("y", function(d,i) {return i * cellSize;})
            .style("text-anchor", "left")
            .attr("transform", "translate(0, " + ((2*cellSize+1) + cellSize) +")");

        var cells = canvas.selectAll("rect");
        for (i=0; i < year.length; i++) {
            cells.data(year[i])
            .enter()
            .append("g")
            .append("rect")
            .attr("transform", "translate("+ cellSize*2.5 +"," + (2*cellSize+1) + ")")
            .attr("class", "cell")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function (d, i) {return parseInt(i) * (cellSize);})
            .attr("y", cellSize * i)
            .attr("fill", function (d) {return colorScale(d);})
        }

        var legendList = [min, min+1*(max-min)/4, min+2*(max-min)/4, min+3*(max-min)/4, max];
        var legendcolors = canvas.selectAll(".heatmapLegend")
            .data(legendList)
            .enter()
            .append("g")
            .append("rect")
            .attr("transform", "translate(" + (width/3*2) + "," + (cellSize * (year.length + 5)) + ")")
            .attr("class", "cell")
            .attr("width", cellSize*3)
            .attr("height", cellSize*3)
            .attr("x", function (d, i) {return parseInt(i) * (cellSize*3);})
            .attr("y", cellSize)
            .attr("fill", function (d) {return colorScale(d);});
        var legendtext = canvas.selectAll(".heatmapLegendtext")
            .data(legendList)
            .enter()
            .append("text")
            .text(function (d) {return(Math.round(d * 100)/100).toFixed(2);})
            .attr("font-size", cellSize)
            .attr("x", function (d, i) {return i * (cellSize+0.5) * 3;})
            .attr("y", 0)
            .style("text-anchor", "left")
            .attr("transform", "translate(" + (width/3*2-cellSize*0.1) + "," + (cellSize * (year.length + 5.75)) + ")");

    });
}