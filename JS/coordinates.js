



$(document).ready(() => {

    //let x = document.getElementById("coordinatesDiv");
    let p;
    let mymap;

    function getCurrentLocation() {
        
        if (navigator.geolocation) {
           return new Promise((res, rej) => {
               navigator.geolocation.getCurrentPosition(res, rej);//showPosition
           });
        } else { 
            //x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }
    
    function showPosition(position) {
        //x.innerHTML = "Latitude: " + position.coords.latitude + 
        //"<br>Longitude: " + position.coords.longitude;
    }
    
    async function get() {
        p = await getCurrentLocation();
        //showPosition(p);
        //console.log("lat: " + p.coords.latitude);//.getCurrentPosition()
        //console.log("lng: " + p.coords.longitude);
        return p;
    }


    async function main(c) {
        //console.log("c: "+c);
        /////////////////////////////////////////////console.log("lat: "+c.coords.latitude+", lng: "+c.coords.longitude);
        
        if(mymap) {
            mymap.remove();
        }

        mymap = L.map('mapid').setView([c.latitude, c.longitude], 5);
            
            
        
        

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

        
        

        let $countryCode = await getCountryCode(c.latitude, c.longitude);
        //console.log("Country name: "+$countryName);
        
        if(c.latitude === '27.09611' && c.longitude === '-13.41583') {
            $countryCode = 'EH';//W. Sahara
        } else if(c.countryName === 'Western Sahara') {
            $countryCode = 'EH'
        }

        let $capital;
        let $list = await getCountryList();
        for(let $r = 0; $r < $list.length; $r++) {
            if($countryCode === $list[$r]['countryCode']) {
                $('#mapInfoCountry').html($list[$r]['countryName']+" ("+$list[$r]['countryCode']+")");
                $('#mapInfoContinent').html($list[$r]['continentName']);
                $('#mapInfoCapital').html($list[$r]['capital']);
                $('#mapInfoPopulation').html($list[$r]['population']);
                $('#mapInfoArea').html($list[$r]['areaInSqKm']);
                $('#mapInfoLanguage').html($list[$r]['languages']);
                $('#mapInfoCurrency').html($list[$r]['currencyCode']);
                $capital = $list[$r]['capital'];
            }
        }
        
        //console.log("$countryName: "+$countryName);
        let $coords = await getCountryBorder($countryCode);
        //console.log("$coords: "+$coords);
        /*
        var latlngs = [
            [40.743, -73.822],
            [39.760979, -84.192200],
            [54.464180, -110.182259]
        ]
        *
        
        for(let i = 0; i < $coords.length; i++) {
            console.log($coords[i]);
        }
        */

        //var polyline = L.polyline($coords, {color: 'red'}).addTo(mymap);
        //console.log("X");
        //console.log($coords[0]);
        //var layerGroup = L.layerGroup().addTo(mymap);
        //layerGroup.clearLayers();
        //for(let i = 0; i < $coords.length; i++) {
        //    marker = L.marker($coords[0]).addTo(layerGroup);
        //}

        //let $geojson = await countryOutline($countryName);
        
        //console.log("line 85: "+$countryName);
        let $geojson = await getGeoJSON($countryCode);

        

        
        //console.log("line 87: "+$countryName);
        let addedGeoJSON = L.geoJSON($geojson, {
            style : function(feature) {
                return {
                    color: 'green',
                    weight: 0.7
                }
            }/*,
            pointToLayer: function(geoJsonPoint, layer) {
                return L.marker(latlng, {
                    icon: 
                });
                
            }*/
        }).addTo(mymap);

        let featureGroup = L.featureGroup([addedGeoJSON]).addTo(mymap);

        mymap.fitBounds(featureGroup.getBounds()
        /*, {
            maxZoom
        }*/
        );//L.popup({maxWidth:500}).setContent("I am a standalone popup.")

        let $obj = await getCountryBounds($countryCode);
        let $places = await getPlaces($obj);
        //let $countryInfo = await getAllGeonameCountries();
        /*
        console.log("places: "+$places[0]['toponymName']);
        console.log("places: "+$places[0]['fcodeName']);
        console.log("places: "+$places[0]['wikipedia']);
        console.log("places: "+$places[0]['countrycode']);
        console.log("places: "+$places[0]['geonameId']);
        console.log("places: "+$places[0]['lng']);
        console.log("places: "+$places[0]['lat']);
        */
        let myBlueIcon = L.icon({
            iconUrl: 'Images/my_blue_svg_icon.svg',
            iconSize: [24, 37.5],
            iconAnchor: [12, 37.5],
            popupAnchor: [0, -30],
            shadowUrl: 'Images/my_icon_shadow.svg',
            shadowSize: [18, 37.5],
            shadowAnchor: [-4, 32]
        });
        let myBrownIcon = L.icon({
            iconUrl: 'Images/my_brown_svg_icon.svg',
            iconSize: [24, 37.5],
            iconAnchor: [12, 37.5],
            popupAnchor: [0, -30],
            shadowUrl: 'Images/my_icon_shadow.svg',
            shadowSize: [18, 37.5],
            shadowAnchor: [-4, 32]
        });
        let myRedIcon = L.icon({
            iconUrl: 'Images/my_red_svg_icon.svg',
            iconSize: [24, 37.5],
            iconAnchor: [12, 37.5],
            popupAnchor: [0, -30],
            shadowUrl: 'Images/my_icon_shadow.svg',
            shadowSize: [18, 37.5],
            shadowAnchor: [-4, 32]
        });
        /*
        ,
            shadowUrl: 'my-icon-shadow.png',
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        */

        if($places!=null) {
        let popupContent; 
            for(let $i = 0; $i < $places.length; $i++) {
                let $name = await getCountryName($places[$i]['countrycode']);
                popupContent = ("<table>"+
                    "<tr><th>Name:</th><td>"+$places[$i]['name']+"</td></tr>"+
                    //"<tr><th>Name:</th><td>"+$places[$i]['toponymName']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$name+" ("+$places[$i]['countrycode']+")</td></tr>"+
                    "<tr><th>Entity:</th><td>"+$places[$i]['fcodeName']+"</td></tr>"+
                    "<tr><th>Population:</th><td>"+$places[$i]['population']+"</td></tr>"+
                    "<tr><th>Geo ID:</th><td>"+$places[$i]['geonameId']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$places[$i]['lat']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$places[$i]['lng']+"</td></tr>"+
                    "<tr><th>Wikipedia:</th><td><a href='https://"+$places[$i]['wikipedia']+"' target='_blank'>"+$places[$i]['wikipedia']+"</a></td></tr>"+
                    "</table>"
                    );
                
                if($capital === $places[$i]['name']) {
                    let $marker = L.marker($places[$i], {
                        title: $places[$i]['name'],
                        riseOnHover: true,
                        icon: myRedIcon
                    }).bindPopup(popupContent, {minWidth: 350}).addTo(featureGroup);
                } else if($countryCode !== $places[$i]['countrycode']) {
                    let $marker = L.marker($places[$i], {
                        title: $places[$i]['name'],
                        riseOnHover: true,
                        icon: myBrownIcon
                    }).bindPopup(popupContent, {minWidth: 350}).addTo(featureGroup);
                } else {
                    let $marker = L.marker($places[$i], {
                        title: $places[$i]['name'],
                        riseOnHover: true,
                        icon: myBlueIcon
                    }).bindPopup(popupContent, {minWidth: 350}).addTo(featureGroup);
                }
                
            }
       }
        
        


        //$n, $s, $e, $w = 
        /*
        $bounds = getCountryBounds($countryName);
        console.log($bounds);
        mymap.fitBounds([
            [$bounds[0], $bounds[3]],
            [$bounds[1], $bounds[2]]
        ]);
        */
        
        
    }

    async function getCountryName($countryCode) {
        try {
            let $countryList = await getCountryList();
            let $name = "country name not found";
            for(let k = 0; k < $countryList.length; k++) {
                if($countryCode === $countryList[k]['countryCode']) {
                    $name = $countryList[k]['countryName'];
                }
            }
            return $name;
        }
        catch(err) {
            console.error(err);
        }
    }

    async function countryOutline($countryName) {
        let $geojson = await getGeoJSON($countryName);
        return $geojson;
    }

    async function getAllCountries() {
        try {
            $result = await $.ajax({
                url: "/map/PHP/getAllCountries.php"
            });
            if($result.status.name == "ok") {
                let arr = [];
                //let codeArray = [];
                for(let $o = 0; $o < $result['data'].length; $o++) {

                    let $obj = {
                        countryName: $result['data'][$o]['name'],
                        countryCode: $result['data'][$o]['iso_a2']
                    };
                    arr[$result['data'][$o]['name']] = ($obj);
                }
                arr.sort();
                //codeArray.sort();
                //for(let $t=0; $t < arr.length; $t++) {
                arr.forEach((key, value)=> {
                    let $opt = document.createElement('option'); //create an option for the drop down list
                    
                    $opt.value = value.countryCode; //assign option value
                    let $text = document.createTextNode(key);
                    

                    $opt.appendChild($text);
                    $('#navDropDown').append($opt);
                    console.log("opt: "+$opt);
                })
                  
                

                /**
                 * let $opt = document.createElement('option'); //create an option for the drop down list
                    //$a.value = result['data'][i]['countryCode']; //assign option value
                    let $text = document.createTextNode($result['data'][$o]);
                    $opt.appendChild($text);
                    $('#navDropDown').append($opt);
                 */
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    /**
     * arrSummat = {};
        arrSummat["987"] = "Boat";
        console.log(JSON.stringify(arrSummat))
     */

    async function getAllGeonameCountries() {
        try {
            $result = await $.ajax({
                url: "/map/PHP/getCountryList.php"
            });
            if($result.status.name == "ok") {
                
                $arr = [];
                $codeArr = [];
                for(let $o = 0; $o < $result['data'].length; $o++) {
                    $obj = {};
                    $obj['countryName'] = $result['data'][$o]['countryName'];
                    $obj['countryCode'] = $result['data'][$o]['countryCode'];
                    $arr.push($obj);

                    //$arr.push($result['data'][$o]['countryName']);
                    //$codeArr.push($result['data'][$o]['countryCode']);
                }
                $arr.sort((a,b) => {
                    return (a.countryName > b.countryName) ? 1 : -1;
                });
                //$arr.sort();
                //$codeArr.sort();
                $arr.forEach(item => {
                    let $opt = document.createElement('option'); //create an option for the drop down list
                    $opt.value = item.countryCode;
                    let $text = document.createTextNode(item.countryName);
                    $opt.appendChild($text);
                    $('#navDropDown').append($opt);
                });

                /*
                for(let $t=0; $t < $arr.length; $t++) {
                    let $opt = document.createElement('option'); //create an option for the drop down list
                    $opt.value = $codeArr[$t];
                    let $text = document.createTextNode($arr[$t]);
                    $opt.appendChild($text);
                    $('#navDropDown').append($opt);
                }
                */
            
            }
            $location = await get();//get current geo location
            $code = await getCountryCode($location.coords.latitude, $location.coords.longitude);//get countrycode from geo location
            $('#navDropDown option[value='+$code+']').attr('selected','selected');//set country as selected option on drop down list
        }
        catch(err) {
            console.error(err);
        }
    }
    
    async function getCountryList() {
        try {
            $result = await $.ajax({
                url: "/map/PHP/getCountryList.php"
            });
            if($result.status.name == "ok") {
                return $result['data'];
            }
        }   
        catch(err) {
            console.error(err);
        }
    }

    async function getCountryCode($lat, $lng) {
        try {
            //console.log("Lat: "+$lat);
            //console.log("Lng: "+$lng);
            $result = await $.ajax({
                url: "/map/PHP/getCountryCode.php",
                type: 'POST',
                data: {
                    lat: $lat,
                    lng: $lng
                }
                
            });
            if($result.status.name == "ok") {
                return $result['data']['countryCode'];
                //return $result['data']['countryName'];
            }
        }
        catch(err) {
            console.log("getCountryName Error: "+err.message);
        }
    
    }

    async function getCountryBorder($name) {
        try {
            //console.log("name: "+$name);
            $result = await $.ajax({
                url: "PHP/getCountryBorder.php",
                type: 'POST',
                data: {
                    name: "'"+$name+"'"
                }
                
            });
            if($result.status.name == "ok") {
                /*
                if($result['data'][0] == null || $result['data'][0] == undefined) {
                    console.log("nothing returned");
                } else {
                    console.log($result['data']);
                }
                */
                //console.log("results: "+$result['data'].length);
                //const a = [];

                //console.log( $result['data']);
                const b = [];
                for(let i = 0; i < $result['data'].length; i++) {
                    //a.push($result['data'][i].lat);
                    //a.push($result['data'][i].lng);
                    b.push(new Array($result['data'][i].lng, $result['data'][i].lat));
                }
                /*
                for(let n = 0; n < b.length; n++) {
                    console.log(b[n]);
                }
                */
                return b;
               //return $result['data'];
            }
        }
        catch(err) {
            console.log("Error: "+err.message);
        }
    }

    async function getCountryBounds($countryCode) {
        let $north, $south, $east, $west;
        try {
            $data = await $.ajax({
            url: "/map/PHP/getCountryList.php",
            type: 'POST'
            })

            //$countryCode = $('#dd_country').val();
            for(let i = 0; i < $data['data'].length; i++) {
                if($countryCode === $data['data'][i]['countryCode']) {
                    $north = $data['data'][i]['north'];
                    $south = $data['data'][i]['south'];
                    $east = $data['data'][i]['east'];
                    $west = $data['data'][i]['west'];
                }
            }
            //console.log("N: "+$north);
            //console.log("S: "+$south);
            //console.log("E: "+$east);
            //console.log("W: "+$west);
            $obj = {north: $north, south: $south, east: $east, west: $west};
            //console.log($arr);
            return $obj;
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getPlaces($obj) {
        try {
            console.log("OBJ north: "+$obj.north);
            console.log("OBJ south: "+$obj.south);
            console.log("OBJ east: "+$obj.east);
            console.log("OBJ west: "+$obj.west);
            $results = await $.ajax({
                url: "/map/php/getPlaces.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    north: $obj.north,
                    south: $obj.south,
                    east: $obj.east,
                    west: $obj.west
                }
            });
            if($results.status.name == "ok") {
                return $results['data'];
            }
        }
        catch(err) {
            console.error(err);
            console.log("status code: "+$results.status.code);
        }
    }
    
    async function getGeoJSON($name) {
        try {
            //console.log("name: "+$name);
            $result = await $.ajax({
                url: "PHP/getGeoJSON.php",
                type: 'POST',
                data: {
                    name: "'"+$name+"'"
                }
                
            });
            if($result.status.name == "ok") {
                return $result['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }



    async function setNewCountry($countryCode, $countryName) {
        
        /*
        let $list = await getCountryBorder($newName);

        let $latlng = {
            latitude: $list[0][0],
            longitude: $list[0][1]
        };
        */

       try {
            console.log("COUNTRY NAME: "+$countryName);
            console.log("COUNTRY CODE: "+$countryCode);
            $result = await $.ajax({
                url: "/map/PHP/getLatLong.php",
                type: 'POST',
                data: {
                    country: "'"+$countryName+"'",//encodeURIComponent($newName)//"'"+$newName+"'"
                    countryCode: "'"+$countryCode+"'"
                }
                
            });
            if($result.status.name == "ok") {
                
                $lat = $result['data'][0]['lat'];
                $lng = $result['data'][0]['lng'];
                //console.log("LAT: "+$lat+", LNG: "+$lng);
                $latlng = {
                    latitude: $lat,
                    longitude: $lng,
                    countryName: $countryName
                }
                main($latlng);
            }
        }
        catch(err) {
            console.error(err);
        }


        /*
        mymap.remove();
        mymap = L.map('mapid').setView([$latlng.latitude, $latlng.longitude], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

        getAllCountries();
        
        let $countryName = await getCountryName(c.latitude, c.longitude);
        
        let $coords = await getCountryBorder($countryName);
        
        var layerGroup = L.layerGroup().addTo(mymap);
        layerGroup.clearLayers();

        let $geojson = await getGeoJSON($countryName);
        L.geoJSON($geojson).addTo(mymap);
        */
    }

    async function begin() {
        let c = await get();
        main(c.coords);
    }
    
    //getAllCountries();
    getAllGeonameCountries();
    begin();
    //getCountryBorder('United Kingdom');

    
    //$('#navDropDown').val = 
    //console.log("addEventListener");
    $('#navDropDown').on("change", () => {
        setNewCountry($('#navDropDown').val(), $('#navDropDown option:selected').text());
        //console.log($('#navDropDown').val());
    });
    //console.log($('#navDropDown').val());
});
