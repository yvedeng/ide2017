
d3.csv("data/listings.csv", function(error, data) {
    if (error) throw error;

    // Remove the rooms that is not available in a year
    var availability = data.filter(function (value) {
        return (value['availability_365']>0);
    });

    var temp_list = availability.map(function (value) {
        return value['neighbourhood'];
    });

    // Formal the names
    for (var i=0; i<temp_list.length; i++){
        switch(temp_list[i]) {
            case "Frederiksberg":
                continue;
            case "Brnshj-Husum":
                availability[i]['neighbourhood'] = "Brønshøj-Husum";
                continue;
            case "sterbro":
                availability[i]['neighbourhood'] = "Østerbro";
                continue;
            case "Amager st":
                availability[i]['neighbourhood'] = "Amager Øst";
                continue;
            case "Nrrebro":
                availability[i]['neighbourhood'] = "Nørrebro";
                continue;
            case "Vanlse":
                availability[i]['neighbourhood'] = "Vanløse";
                continue;
            default:
                continue;
        }
    }

    var neighbour_list = from_arr_to_set(availability.map(function (value) {
        return value['neighbourhood'];
    }));

    d3.select('#neigh_list')
        .selectAll('input')
        .data(neighbour_list)
        .enter()
        .append('li')
        .append('label')
        // .attr('for',function(d,i){ return 'a'+i; })
        .text(function(d) { return d; })
        .append('input')
        .attr('class', 'myCheckboxs')
        .attr('type', 'checkbox')
        // .attr("id", function(d,i) { return 'a'+i; })
        .attr('value', function(d){
            return d;
        });

    var roomtype_list = from_arr_to_set(data.map(function (value) {
        return value['room_type'];
    }));

    d3.select('#rooms')
        .selectAll('option')
        .data(roomtype_list)
        .enter()
        .append('option')
        .attr('value', function(d){
            return d;
        })
        .text(function (d) {
            return d;
        });

    var stayNights = availability.map(function (value) {
        return parseInt(value['minimum_nights']);
    });

    d3.select('#stay_nights')
        .attr('type', "number")
        .attr('max', Math.min.apply(Math, stayNights))
        .attr('min', Math.max.apply(Math, stayNights));

});

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

function checkAll(){
    d3.selectAll('input').attr('checked',true);
    d3.selectAll('input').property('checked', true);
}

function uncheckAll(){
    d3.selectAll('input').attr('checked',null);
    d3.selectAll('input').property('checked', false);
}

function handleReset() {
    uncheckAll();
    document.getElementById('roomtype').value="";
    document.getElementById('price_min').value="";
    document.getElementById('price_max').value="";
    document.getElementById('stay_nights').value="";
}

function handleClick(){
    var min, max, stay, room, selected_neigh=[];
    min = parseInt(document.getElementById('price_min').value);
    max = parseInt(document.getElementById('price_max').value);
    stay = document.getElementById('stay_nights').value;
    room = document.getElementById('roomtype').value;
    var input = document.getElementsByClassName('myCheckboxs');

    // Open csv
    d3.csv("data/listings.csv", function(error, data) {
        if (error) throw error;

        // Remove the rooms that is not available in a year
        var availability = data.filter(function (value) {
            return (value['availability_365']>0);
        });

        var temp_list = availability.map(function (value) {
            return value['neighbourhood'];
        });

        // Formal the names
        for (var i=0; i<temp_list.length; i++){
            switch(temp_list[i]) {
                case "Frederiksberg":
                    continue;
                case "Brnshj-Husum":
                    availability[i]['neighbourhood'] = "Brønshøj-Husum";
                    continue;
                case "sterbro":
                    availability[i]['neighbourhood'] = "Østerbro";
                    continue;
                case "Amager st":
                    availability[i]['neighbourhood'] = "Amager Øst";
                    continue;
                case "Nrrebro":
                    availability[i]['neighbourhood'] = "Nørrebro";
                    continue;
                case "Vanlse":
                    availability[i]['neighbourhood'] = "Vanløse";
                    continue;
                default:
                    continue;
            }
        }

        var neighbour_list = from_arr_to_set(availability.map(function (value) {
            return value['neighbourhood'];
        }));

        var roomtype_list = from_arr_to_set(data.map(function (value) {
            return value['room_type'];
        }));

        var stayNights = availability.map(function (value) {
            return parseInt(value['minimum_nights']);
        });

        // Check all the inputs
        for (var i=0; i<input.length; i++){
            if(input[i].checked){
                selected_neigh.push(input[i].value);
            }
        }

        if (selected_neigh.length == 0){
            alert("Please choose your prefered neighbourhood.");
        }

        if (!roomtype_list.includes(room)){
            alert("No room matches your preference!(room type illegal)");
        }

        if (stay>Math.max.apply(Math, stayNights) || stay<Math.min.apply(Math, stayNights)){
            alert("No room matches your preference! (stay nights)");
        }

        var filteredData;
        if (min==-1 || max==-1){
            filteredData = handleFilter(availability, selected_neigh, room, stay, min, max);
            if (filteredData.length==0){
                alert('No room matches your preference!');
            }else{
                triggerTable(filteredData);
            }
        }else{
            if (min>=max){
                alert("Price range is illegal!");
                console.log("min", min);
                console.log("max",max);
            } else{
                filteredData = handleFilter(availability, selected_neigh, room, stay, min, max);
                if (filteredData.length==0){
                    alert('No room matches your preference!');
                }else{
                    triggerTable(filteredData);
                }
                console.log('selected rooms', filteredData);

            }//end else
        }//end else


    });

}

function handleFilter(data, selected_neigh, room, stay, min, max){
    d3.select('.div_report').remove();
    var report = d3.select('#report')
        .append('div')
        .attr('class', 'div_report')
        .text((data.length)+ " rooms in total");
    var A = filterNeighbour(data, selected_neigh);
    report.append('div')
        .text((A.length)+' rooms left after filtered neighbourhood');
    console.log("neigh passed", A);
    var B = A.filter(function(value){
        return value['room_type'] == room;
    });
    report.append('div')
        .text((B.length)+' rooms left after filtered room type');
    console.log("room type passed", B);
    if (min==-1 || max==-1){
        C = B;
    } else{
        var C = filterPrice(B, min, max);
        console.log("price passed", C);
        report.append('div')
            .text((C.length)+' rooms left after filtered price');
    }
    var D = C.filter(function (value) {
        return parseInt(value['minimum_nights'])>=stay;
    });
    report.append('div')
        .text((D.length)+' rooms left after filtered stay nights');
    report.append('div')
        .text('The end.');
    console.log('min night paseed', D);
    return D;
}

//Help function
function filterNeighbour(data, list){
    return data.filter(function(value){
        return list.includes(value['neighbourhood']);
    });
}


function filterPrice(data, min, max){
    return data.filter(function(value){
        return parseFloat(value['price']) >= min && parseFloat(value['price']) <= max;
    })
}

function get_center(data, description){
    var count = 0.0;
    for (var i=0; i<data.length; i++){
        count += parseFloat(data[i][description]);
    }
    return count/data.length;
}

function triggerTable(filteredData){
    //    Clear a table
    d3.select(".myTable")
        .remove();
    //    Create a table
    var sortAscending = true;
    var table= d3.select("#roomTable")
        .append('table')
        .attr('class', 'myTable');
    var titles = d3.keys(filteredData[0]);


    console.log('titles', titles);
    var headers = table.append('thead')
        .selectAll('th')
        .data(titles)
        .enter()
        .append('th')
        .text(function(d){
            return d;
        })
        .on('click', function (d){
            headers.attr('class', 'header');
            if (sortAscending){
                rows.sort(function(a,b){
                    return b[d] < a[d];
                });
                sortAscending = false;
                this.className = 'aes';
            } else{
                rows.sort(function(a,b){
                    return b[d] > a[d];
                });
                sortAscending = true;
                this.className = 'des';
            }
        });

    var rows = table.append('tbody')
        .selectAll('tr')
        .data(filteredData)
        .enter()
        .append('tr');

    rows.selectAll('td')
        .data(function(d){
            return titles.map(function(k){
                return {'value':d[k], 'name':k};
            })
        }).enter()
        .append('td')
        .attr('data-th', function(d){
            return d.name;
        })
        .text(function(d){
            return d.value;
        })
}