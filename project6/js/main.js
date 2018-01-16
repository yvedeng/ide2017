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

        // Build the district Map
        var map = L.map('districtsMap').setView([55.6761, 12.5683], 12);
        var sn;
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(map);

        function style(feature) {
            if (sn == feature.properties['navn']){
                return {
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.3,
                    fillColor:'#ff0000'
                }
            }else{
                return{
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.3,
                    fillColor: 'white'
                }
            }
        }

        var geojson = L.geoJson(districts, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

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
            .attr('href', '#map')
            .text(function (d) {
                return d
            })
            .on('mouseover', ListMouseOver)
            .on('mouseout', ListMouseOut)
            .on('click', handleClick);
        console.log('neigh list: ', neigh_list);

        function ListMouseOver(d){
            sn = d;
            geojson.setStyle(style);
        }

        function ListMouseOut(d){
            sn = "" ;
            geojson.setStyle(style);
        }

        function handleClick(d) {
            console.log(d);
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

            function onMapClick(d){
                console.log(d);
                alert("id" + d['id'] + '<br/>' +
                    "name" + d["name"] + '<br/>' +
                    "host_name" + d["host_name"] + "<br/>" +
                    "room_type" + d["room_type"] + "<br/>" +
                    "price" + d["price"] + "<br/>" +
                    "minimum nights" + d["minimum_nights"] + "<br/>")
            }

            // Create the Google Map…
            var map = new google.maps.Map(d3.select("#map").node(), {
                zoom: 14,
                center: new google.maps.LatLng(latitude_center, longitude_center),
                mapTypeId: google.maps.MapTypeId.TERRAIN
            });

            var overlay = new google.maps.OverlayView();

            // Add the container when the overlay is added to the map.
            overlay.onAdd = function () {
                var layer = d3.select(this.getPanes().overlayLayer).append("div")
                    .attr("class", "stations");

                // Draw each marker as a separate SVG element.
                // We could use a single SVG, but what size would it have?
                overlay.draw = function () {
                    var projection = this.getProjection(),
                        padding = 10;

                    var marker = layer.selectAll("svg")
                        .data(d3.entries(new_data))
                        .each(transform) // update existing markers
                        .enter().append("svg")
                        .each(transform)
                        .attr("class", "marker");

                    console.log(marker);
                    // Add a circle.
                    marker.append("circle")
                        .data(new_data)
                        .attr("r", 4.5)
                        .attr("cx", padding)
                        .attr("cy", padding)
                        .attr("fill", handleColor)
                        .attr("stroke", "black")
                        .attr("stroke-width", "1.5px")
                        .on("mouseover", handleMouseOver);

                    // marker.append("text")
                    //     .attr("x", padding + 7)
                    //     .attr("y", padding)
                    //     .attr("dy", ".31em")
                    //     .text(function (d) {
                    //         return d.key;
                    //     });

                    function handleColor(d){
                        if (d['room_type'] == 'Private room'){
                            return "brown"
                        } if (d['room_type'] == 'Entire home/apt'){
                            return "green"
                        } else{
                            return "yellow"
                        }
                    }

                    function transform(d) {
                        point = new google.maps.LatLng(d.value.latitude, d.value.longitude);
                        point = projection.fromLatLngToDivPixel(point);
                        return d3.select(this)
                            .style("left", (point.x) + "px")
                            .style("top", (point.y) + "px");
                    }
                };

            };
            // Bind our overlay to the map…
            overlay.setMap(map);
        }
    });
}

// Create Event Handlers for mouse
function handleMouseOver(d) {  // Add interactivity
    // Use D3 to select element, change color and size
    d3.select(this)
        .attr('fill', 'pink')
        .attr('r', 6);

    g.append('text')
        .attr('id', d['id'])
        .attr('x', function () {
            return d['latitude'];
        })
        .attr('y', function () {
            return d['longitude'];
        })
        .text("room type: " + d['roomtype']);
}

function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this)
        .attr('r', 6);
    document.getElementById(d.value.id).remove()
}

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

