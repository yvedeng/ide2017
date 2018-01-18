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
        .data(neighbour_list).enter()
        .append('li')
        .append('label')
        .attr('for',function(d,i){ return 'a'+i; })
        .text(function(d) { return d; })
        .append('input')
        .attr('type', 'checkbox')
        .attr("id", function(d,i) { return 'a'+i; })
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
        .attr('min', Math.max.apply(Math, stayNights))

    function handleClick(){
        
    }

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
}

function uncheckAll(){
    d3.selectAll('input').attr('checked',null);
}

function handleReset() {
    uncheckAll();
    document.getElementById('roomtype').value="";
    document.getElementById('price_min').value="";
    document.getElementById('price_max').value="";
    document.getElementById('stay_nights').value="";
}