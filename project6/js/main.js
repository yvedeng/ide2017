d3.select(window).on('load', init);

function init(){

    // Load the station data. When the data comes back, create an overlay.
    d3.csv("data/listings.csv", function(error, data) {
        if (error) throw error;

        // Preprocessed the data
        var neigh = data.map(function (value) {
            return value['neighbourhood'];
        });

        // Formal the names
        for (var i=0; i<neigh.length; i++){
            switch(neigh[i]) {
                case "Frederiksberg":
                    continue;
                case "Brnshj-Husum":
                    data[i]['neighbourhood'] = "Brønshøj-Husum";
                    continue;
                case "sterbro":
                    data[i]['neighbourhood'] = "Østerbro";
                    continue;
                case "Amager st":
                    data[i]['neighbourhood'] = "Amager Øst";
                    continue;
                case "Nrrebro":
                    data[i]['neighbourhood'] = "Nørrebro";
                    continue;
                case "Vanlse":
                    data[i]['neighbourhood'] = "Vanløse";
                    continue;
                default:
                    continue;
            }
        }

        var disMap = new google.maps.Map(document.getElementById('districtsMap'),{
            zoom: 12,
            center:{lat:55.6731, lng:12.5683}
        });

        disMap.data.loadGeoJson('data/districts.json');
        var sn = "";

        disMap.data.setStyle(style);

        disMap.data.addListener('mouseover', function(event){
            disMap.data.overrideStyle(event.feature, {fillColor:'#ff0000'})
        });

        disMap.data.addListener('mouseout', function(event){
            disMap.data.revertStyle();
        });

        function style(feature) {
            if (sn == feature.f['navn']){
                return {
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    strokeWeight:1,
                    dashArray: '3',
                    fillOpacity: 0.3,
                    fillColor:'#ff0000',
                }
            }else{
                return{
                    weight: 2,
                    opacity: 1,
                    strokeWeight:1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.3,
                    fillColor: 'white'
                }
            }
        };

        // get a new neighbour lists
        var neigh = data.map(function (value) {
            return value['neighbourhood'];
        });

        var neigh_list = from_arr_to_set(neigh);

        d3.select('#myNeighInput')
            .on("keyup", filterList);

        d3.select('#myNeighList')
            .selectAll('li')
            .data(neigh_list)
            .enter()
            .append('li')
            .append('a')
            .attr('href', '#googleMap')
            .text(function (d) {
                return d
            })
            .on('mouseover', ListMouseOver)
            .on('mouseout', ListMouseOut)
            .on('click', handleClick);

        function ListMouseOver(d){
            sn = d;
            disMap.data.setStyle(style);
        }

        function ListMouseOut(d){
            sn = "" ;
            disMap.data.setStyle(style);
        }

        var legend_exists = false;

        // Once any element of the list has been clicked, google map pops out;
        function handleClick(d) {
			document.getElementById("googleMap").style.height = "700px";
            var new_data = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i]['neighbourhood'] == d) {
                    new_data.push(data[i]);
                } else {
                    continue;
                }
            }

            latitude_center = get_center(new_data, 'latitude');
            longitude_center = get_center(new_data, 'longitude');


            // Create the Google Map…
            var gooMap = new google.maps.Map(d3.select("#googleMap").node(), {
                zoom: 14,
                center: new google.maps.LatLng(latitude_center, longitude_center),
                mapTypeId: google.maps.MapTypeId.TERRAIN
            });

            gooMap.data.loadGeoJson('data/districts.json');
            gooMap.data.setStyle(function(feature){
                return {
                    weight: 2,
                    opacity: 1,
                    strokeWeight:1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.3,
                    fillColor: 'white'
                }
            });

            var locations = [];
            var label = ["E", "P", "S"];

            for (var i=0; i < new_data.length; i++){
                locations.push({lat:parseFloat(new_data[i]['latitude']) , lng:parseFloat(new_data[i]['longitude'])});
            }

            var markers = locations.map(function(location, i){
                var marker = new google.maps.Marker({
                    position:location,
                    label:handleLabel(i),
                    title: "click to show details"
                });

                marker.addListener('click', function() {
                    new google.maps.InfoWindow({
                        content:infoString(i)
                    }).open(gooMap, marker);
                });
                return marker;
            });

            // Create Clusters
            var markerCluster = new MarkerClusterer(gooMap, markers,
                {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

            function infoString(i) {
                return "id: " + new_data[i]['id'] + '<br/>' +
                    "name: " + new_data[i]["name"] + '<br/>' +
                    "host_name: " + new_data[i]["host_name"] + "<br/>" +
                    "room_type: " + new_data[i]["room_type"] + "<br/>" +
                    "price: " + new_data[i]["price"] + "<br/>" +
                    "minimum nights: " + new_data[i]["minimum_nights"] + "<br/>";
            }

            function handleLabel(i){
                if (new_data[i]['room_type'] == 'Private room'){
                    return "P";
                } if (new_data[i]['room_type'] == 'Entire home/apt'){
                    return "E";
                } else{
                    return "S";
                }
            }

            // Create legends for google map
            var roomtype_list = from_arr_to_set(data.map(function (value) {
                return value['room_type'];
            }));

            if (legend_exists == false) {
                var legend = d3.select("#google")
                    .append("svg")
                    .attr('style', 'background:black')
                    .attr("margin-top", '20px')
                    .selectAll("g")
                    .data(roomtype_list)
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                        return "translate(" + i * 200 + ",0)";
                    });
                legend.append("text")
                    .attr("x", 20)
                    .attr("y", 9.5)
                    .attr("dy", "0.32em")
                    .style("fill", 'white')
                    .text(function (d) {
                        return d[0] + ": " + d;
                    });
                legend_exists = true;
            };

            // legend.append("circle")
            //     .attr("r", 4.5)
            //     .attr("cx", '10px')
            //     .attr("cy", '10px')
            //     .attr("stroke", "white")
            //     .attr("stroke-width", "1.5px")
            //     .attr("fill", function (d) {
            //         switch (d){
            //             case 'Private room':
            //                 return "brown";
            //             case 'Entire home/apt':
            //                 return "green";
            //             default:
            //                 return "yellow";
            //         }
            //     });

            // The old way generates markers
            // // Add the container when the overlay is added to the map.
            // overlay.onAdd = function () {
            //     var layer = d3.select(this.getPanes().overlayLayer).append("div")
            //         .attr("class", "stations");
            //
            //     // Draw each marker as a separate SVG element.
            //     // We could use a single SVG, but what size would it have?
            //     overlay.draw = function () {
            //         var projection = this.getProjection(),
            //             padding = 10;
            //
            //         var marker = layer.selectAll("svg")
            //             .data(d3.entries(new_data))
            //             .each(transform) // update existing markers
            //             .enter().append("svg")
            //             .each(transform)
            //             .attr("class", "marker");
            //
            //         // Add a circle.
            //         marker.append("circle")
            //             .attr("class", handleName)
            //             .data(new_data)
            //             .attr("r", 4.5)
            //             .attr("cx", padding)
            //             .attr("cy", padding)
            //             .attr("fill", handleColor)
            //             .attr("stroke", "black")
            //             .attr("stroke-width", "1.5px")
            //             .on('mouseover', handleMouseOver);

                    //
                    // function transform(d) {
                    //     point = new google.maps.LatLng(d.value.latitude, d.value.longitude);
                    //     point = projection.fromLatLngToDivPixel(point);
                    //     return d3.select(this)
                    //         .style("left", (point.x-padding) + "px")
                    //         .style("top", (point.y-padding) + "px");
                    // }
                // };

            // };
            // Bind our overlay to the map…
            // overlay.setMap(gooMap);

        }; // Click function ends
    }); // csv function ends
} // init function ends

// Create Event Handlers for mouse
// function handleMouseOver(d) {  // Add interactivity
//     // Use D3 to select element, change color and size
//     d3.select(this)
//         .attr('fill', 'pink')
//         .attr('r', 6);
//
//     g.append('text')
//         .attr('id', d['id'])
//         .attr('x', function () {
//             return d['latitude'];
//         })
//         .attr('y', function () {
//             return d['longitude'];
//         })
//         .text("room type: " + d['roomtype']);
// }
//
// function handleMouseOut(d, i) {
//     // Use D3 to select element, change color back to normal
//     d3.select(this)
//         .attr('r', 6);
//     document.getElementById(d.value.id).remove()
// }

// Create a filter list
function filterList() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myNeighInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myNeighList");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";

        }
    }
}
// help function
function from_arr_to_set(myArray){
    var a_set = [];
    for (var i = 0; i < myArray.length; i++){
        if(a_set.indexOf(myArray[i])>-1){
            continue;
        }else{
            a_set.push(myArray[i]);
        }
    }
    return a_set
}

function get_center(data, description){
    var count = 0.0;
    for (var i=0; i<data.length; i++){
        count += parseFloat(data[i][description]);
    }
    return count/data.length;
}

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

