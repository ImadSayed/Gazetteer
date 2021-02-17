
//const Spinner = require('spin.js');
//import { Spinner } from './spin.js';
//import { Spinner } from './spin'

$(document).ready(() => {
    /*
    const $target = $('#spinner');
    
    var opts = {
        lines: 13, // The number of lines to draw
        length: 38, // The length of each line
        width: 17, // The line thickness
        radius: 45, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        speed: 1, // Rounds per second
        rotate: 0, // The rotation offset
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#ffffff', // CSS color or array of colors
        fadeColor: 'transparent', // CSS color or array of colors
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        zIndex: 2000000000, // The z-index (defaults to 2e9)
        className: 'spinner', // The CSS class to assign to the spinner
        position: 'absolute', // Element positioning
    };
    

    const $spinner = new Spinner(opts);//(opts)
    $spinner.spin($target);
    */

    //let x = document.getElementById("coordinatesDiv");

    //global variables

    let p;
    let mymap;
    let $countryListInfo;
    let $currencyInfo;

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
        
        
        

        
        const $citiesArray = [];
        
        const $boundsArray = [];

        let $countryCode = await getCountryCode(c.latitude, c.longitude);

        let $countryBounds = await getCountryBounds($countryCode);

        let $currencyCode;

        if(mymap) {
            mymap.remove();
        }

        //OpenStreetMap_Mapnik
        const map1 = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        /*
        //OpenStreetMap_HOT
        const map2 = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        });

        //OpenTopoMap
        const map3 = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        */

        //Stadia_AlidadeSmoothDark
        const map4 = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });
        
        //NASAGIBS_ViirsEarthAtNight2012
        const map5 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
            attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
            bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
            minZoom: 1,
            maxZoom: 8,
            format: 'jpg',
            time: '',
            tilematrixset: 'GoogleMapsCompatible_Level'
        });

        /*
        //Wikimedia
        const map66 = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
            attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
            minZoom: 1,
            maxZoom: 19
        });

        */
        //OpenRailwayMap
        const map6 = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        /*
        //CyclOSM
        const map7 = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        */

        //Stamen_Watercolor
        const map8 = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 16,
            ext: 'jpg'
        });

        //Stamen_Terrain
        const map9 = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 18,
            ext: 'png'
        });

        //Esri_WorldImagery
        const map10 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        //.addTo(mymap);

        //mymap = L.map('mapid').setView([c.latitude, c.longitude], 2);

        

        ////////////////////////////////////////////////////////////////////////////


        //$countryCode = await getCountryCode(c.latitude, c.longitude);
        //console.log("Country name: "+$countryName);

        if(c.latitude === '27.09611' && c.longitude === '-13.41583') {
            $countryCode = 'EH';//W. Sahara
        } else if(c.countryName === 'Western Sahara') {
            $countryCode = 'EH'
        }

        //fill country info table
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
                $currencyCode = $list[$r]['currencyCode'];
                $capital = $list[$r]['capital'];
            }
        }

        let $continue = await getExchangeRates($currencyCode);
        let $newCurrencyCode = $('#CurrencyDropDown').val();
        displayConversionRate($newCurrencyCode);

        //$obj = await getCountryBounds($countryCode);
        //let boundLayer = L.layerGroup();
        const LeafIcon = L.Icon.extend({
            options: {
                shadowUrl: 'Images/my_icon_shadow.svg',
                iconSize: [24, 37.5],
                shadowSize: [18, 37.5],
                iconAnchor: [12, 37.5],
                shadowAnchor: [-4, 32],
                popupAnchor: [0, -30],
            }
        });
        
        const myBlueIcon = new LeafIcon({iconUrl: 'Images/my_blue_svg_icon.svg'}), 
        myBrownIcon = new LeafIcon({iconUrl: 'Images/my_brown_svg_icon.svg'}),
        myRedIcon = new LeafIcon({iconUrl: 'Images/my_red_svg_icon.svg'}),
        myYellowIcon = new LeafIcon({iconUrl: 'Images/my_yellow_svg_icon.svg'});

        
        let $cities = await getPlaces($countryBounds);

        if($cities!=null) {
            let popupContent; 
            for(let $i = 0; $i < $cities.length; $i++) {
                let $name = await getCountryName($cities[$i]['countrycode']);
                popupContent = ("<table>"+
                    "<tr><th>Name:</th><td>"+$cities[$i]['name']+"</td></tr>"+
                    //"<tr><th>Name:</th><td>"+$cities[$i]['toponymName']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$name+" ("+$cities[$i]['countrycode']+")</td></tr>"+
                    "<tr><th>Entity:</th><td>"+$cities[$i]['fcodeName']+"</td></tr>"+
                    "<tr><th>Population:</th><td>"+$cities[$i]['population']+"</td></tr>"+
                    "<tr><th>Geo ID:</th><td>"+$cities[$i]['geonameId']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$cities[$i]['lat']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$cities[$i]['lng']+"</td></tr>"+
                    "<tr><th>Wikipedia:</th><td><a href='https://"+$cities[$i]['wikipedia']+"' target='_blank'>"+$cities[$i]['wikipedia']+"</a></td></tr>"+
                    "</table>"
                    );
                
                if($capital === $cities[$i]['name']) {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myRedIcon
                    }).bindPopup(popupContent, {minWidth: 350});//.addTo(featureGroup);
                    $citiesArray.push($marker);
                } else if($countryCode !== $cities[$i]['countrycode']) {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myBrownIcon
                    }).bindPopup(popupContent, {minWidth: 350});//.addTo(featureGroup);
                    $citiesArray.push($marker);
                } else {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myBlueIcon
                    }).bindPopup(popupContent, {minWidth: 350});//.addTo(featureGroup);
                    $citiesArray.push($marker);
                }

                let $boundingbox = await getBoundingBox($cities[$i]['lat'], $cities[$i]['lng']);

                //console.log($i);
                //console.log($boundingbox['boundingbox'][0]+", "+$boundingbox['boundingbox'][2]+", "+$boundingbox['boundingbox'][1]+", "+$boundingbox['boundingbox'][3]);
                //let bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
                let $bounds = [[$boundingbox['boundingbox'][0], $boundingbox['boundingbox'][2]], [$boundingbox['boundingbox'][1], $boundingbox['boundingbox'][3]]];
                let $rect = L.rectangle($bounds, {color: "#ff7800", weight: 20});//.addTo(mymap);
                $boundsArray.push($rect);
            }
       }

       /*
       const $citties = await getAllCities($countryCode);
       const $cityArray = [];
       if($citties != null) {
            let citypopupContent; 
            console.log($citties);
            
            for(let $i = 0; $i < $citties['data'].length; $i++) {
                let $n = $citties['data'][$i]['country'];
                citypopupContent = ("<table>"+
                    "<tr><th>Name:</th><td>"+$citties['data'][$i]['name']+"</td></tr>"+
                    //"<tr><th>Name:</th><td>"+$places[$i]['toponymName']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$n+" ("+$citties['data'][$i]['countrycode']+")</td></tr>"+
                    //"<tr><th>Entity:</th><td>"+$places[$i]['fcodeName']+"</td></tr>"+
                    //"<tr><th>Population:</th><td>"+$places[$i]['population']+"</td></tr>"+
                    "<tr><th>Region:</th><td>"+$citties['data'][$i]['region']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$citties['data'][$i]['latitude']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$citties['data'][$i]['longitude']+"</td></tr>"+
                    //"<tr><th>Wikipedia:</th><td><a href='https://"+$places[$i]['wikipedia']+"' target='_blank'>"+$places[$i]['wikipedia']+"</a></td></tr>"+
                    "</table>"
                );
                //console.log($citties['data'][$i]['country']);

                let $cityMarker = L.marker([$citties['data'][$i]['latitude'], $citties['data'][$i]['longitude']], {
                    title: $citties['data'][$i]['name'],
                    riseOnHover: true,
                    icon: myYellowIcon
                }).bindPopup(citypopupContent, {minWidth: 350});
                $cityArray.push($cityMarker);
            }
            
        }
        */

        /*
        const $restCountries = await getRestCountries();
        const $restArray = [];
        if($restCountries != null) {
            console.log("rest length: "+$restCountries.length);
            console.log("rest results: "+$restCountries);

        }
        */

        //console.log("length: "+$cityArray.length);

        let $towns = await getOpenWeatherMapCities(c.latitude, c.longitude);
        const $townsArray = [];
        if($towns != null) {
            let citypopupContent; 
            for(let $i = 0; $i < $towns.length; $i++) {
                let $n = $towns[$i]['name'];
                citypopupContent = ("<table>"+
                    "<tr><th>Name:</th><td>"+$towns[$i]['name']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$towns[$i]['lat']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$towns[$i]['lon']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$towns[$i]['country']+"</td></tr>"+
                    "</table>"
                );
                //console.log($towns['data'][$i]['country']);

                let $townMarker = L.marker([$towns[$i]['lat'], $towns[$i]['lon']], {
                    title: $towns[$i]['name'],
                    riseOnHover: true,
                    icon: myYellowIcon
                }).bindPopup(citypopupContent, {minWidth: 350});
                $townsArray.push($townMarker);
            }
        }







        const $citiesLayer = L.layerGroup($citiesArray);
        const $boundsLayer = L.layerGroup($boundsArray);
        //const $cities = L.layerGroup($cityArray);
        const $townsLayer = L.layerGroup($townsArray);

        mymap = L.map('mapid', {
            center: [c.latitude, c.longitude],
            zoom: 2,
            layers: [map1, $citiesLayer]
        });

        let $geojson = await getGeoJSON($countryCode);

        let addedGeoJSON = L.geoJSON($geojson, {
            style : function(feature) {
                return {
                    color: 'green',
                    weight: 0.7
                }
            }
        });//.addTo(mymap);

        let featureGroup = L.featureGroup([addedGeoJSON]).addTo(mymap);

        mymap.fitBounds(featureGroup.getBounds());

       
        
       var baseMaps = {
            "Map_1": map1,
            "Map_4": map4,
            "Map_5": map5,
            "Map_6": map6,
            "Map_8": map8,
            "Map_9": map9,
            "map_10": map10
        };//"Grayscale": grayscale, "Streets": streets
        
        var overlayMaps = {
            "Cities": $citiesLayer,
            "Bounds": $boundsLayer,
            "Towns": $townsLayer
            //"Cities": $cities
        };

        L.control.layers(baseMaps, overlayMaps).addTo(mymap);

        
        $('.loaderDiv').css('display', 'none');
        
    }

    async function getOpenWeatherMapCities($lat, $lng) {
        try {
            console.log("latitude: "+$lat+", logitude: "+$lng);
            const $result = await $.ajax({
                url: 'PHP/getOpenWeatherMapCities.php',
                type: 'POST',
                data: {
                    lat: $lat,
                    lng: $lng
                }
            });
            //console.log($result.readyState);
            //console.log($result);
            
            //console.log("RESULT: ");
            //console.dir($result);
            if($result.status.name=='ok') {
                //console.log("results: "+$result['data']);
                return $result['data'];
            }
            
        }
        catch(err) {
            console.error(err);
        }
    }

    
    async function displayConversionRate($currencyCode) {
        try{
            $displayRate = $currencyInfo['rates'][$currencyCode];
            $('#mapInfoExRate').html($displayRate);
        }
        catch(err) {
            console.error(err);
        }

    }

    async function getIsoCode($countryCode) {
        for(let $u=0; $u < $countryListInfo.length; $u++) {
            if($countryCode === $countryListInfo[$u]['countryCode']) {
                return $countryListInfo[$u]['isoAlpha3'];
            } else {
                return null;
            }
        }
    }

    async function getExchangeRates($currencyCode) {
        try {
            const $rates = await $.ajax({
                url: 'PHP/getOpenExchangeRates.php',
                type: 'POST',
                data: {
                    currencyCode: $currencyCode
                }
            });
            if($rates.status.name=='ok') {
                $currencyInfo = $rates['data'];
                return true;
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getRestCountries() {
        try {
            const $rest = await $.ajax({
                url: "PHP/getRestCountries.php"
            });
            if($rest.status.name == 'ok') {
                return $rest['data'];
            }
        }
        catch(err) {
            console.error(err);
            //console.log(err);
        }
    }


    async function getAllCities($countryCode) {
        try {
            let $cities = await $.ajax({
                url: "PHP/getAllCities.php",
                type: 'POST',
                data: {
                    countryCode: $countryCode
                }
            });
            if($cities.status.name == 'ok') {
                return $cities['data'];
            }
        }
        
        catch(err) {
            console.error(err);
        }
    }



    async function getBoundingBox($lat, $lng) {
        try {
            let $boundingBox = await $.ajax({
                url: "/WorldMap/PHP/getBoundingBox.php",
                type: 'POST',
                data: {
                    la: $lat,
                    ln: $lng
                }
            });
            if($result.status.name == "ok") {


                //console.log("Result: "+$result['data']);
                //console.log("from Bounding Box");
                //return $result['data'];//['data'];
                return $boundingBox['data']; 
            }  
        }
        catch(err) {
            console.error(err);
        }
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
                url: "/WorldMap/PHP/getAllCountries.php"
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
                url: "/WorldMap/PHP/getCountryList.php"
            });
            if($result.status.name == "ok") {
                
                $countryListInfo = $result['data'];//saves country list in globally declared variable

                //below we populate the navDropDown list and the currencyDropDown list

                $arr = [];
                $codeArr = [];

                $currencyArray = [];

                for(let $o = 0; $o < $result['data'].length; $o++) {
                    $obj = {};
                    $obj['countryName'] = $result['data'][$o]['countryName'];
                    $obj['countryCode'] = $result['data'][$o]['countryCode'];
                    $arr.push($obj);

                    $currencyObj = {};
                    $currencyObj['countryName'] = $result['data'][$o]['countryName'];
                    $currencyObj['isoCode'] = $result['data'][$o]['isoAlpha3'];
                    $currencyObj['currencyCode'] = $result['data'][$o]['currencyCode'];
                    $currencyArray.push($currencyObj);

                    //$arr.push($result['data'][$o]['countryName']);
                    //$codeArr.push($result['data'][$o]['countryCode']);
                }
                $arr.sort((a,b) => {
                    return (a.countryName > b.countryName) ? 1 : -1;
                });
                $currencyArray.sort((a,b) => {
                    return (a.countryName > b.countryName) ? 1 : -1;
                });
                
                $arr.forEach(item => {
                    let $opt = document.createElement('option'); //create an option for the drop down list
                    $opt.value = item.countryCode;
                    let $text = document.createTextNode(item.countryName);
                    $opt.appendChild($text);
                    $('#navDropDown').append($opt);
                });

                $currencyArray.forEach(item => {
                    let $option = document.createElement('option');
                    $option.value = item.currencyCode;//isoCode
                    let $optionText = document.createTextNode(item.countryName+" ("+item.currencyCode+")");
                    $option.appendChild($optionText);
                    $('#CurrencyDropDown').append($option);
                });
            
            }
            $location = await get();//get current geo location
            $code = await getCountryCode($location.coords.latitude, $location.coords.longitude);//get countrycode from geo location
            $('#navDropDown option[value='+$code+']').attr('selected','selected');//set country as selected option on drop down list
            /*
            let $c = 'United States';
            if($code === 'US') {
                $c = 'United Kingdom';
            } 
            $("#CurrencyDropDown option:contains(" + $c +")").attr('selected','selected');
            */
            $currentCountry = await getCountryName($code);
            $("#CurrencyDropDown option:contains(" + $currentCountry +")").attr('selected','selected');
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getCountryList() {
        try {
            $result = await $.ajax({
                url: "PHP/getCountryList.php"
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
                url: "PHP/getCountryCode.php",
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
            url: "/WorldMap/PHP/getCountryList.php",
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
            //console.log("OBJ north: "+$obj.north);
            //console.log("OBJ south: "+$obj.south);
            //console.log("OBJ east: "+$obj.east);
            //console.log("OBJ west: "+$obj.west);
            $results = await $.ajax({
                url: "PHP/getPlaces.php",
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

        
            $('.loaderDiv').css('display', 'flex');

            // 5 lines below set #currencyDropDown list value
            let $c = 'United States';
            if($countryCode === 'US') {
                $c = 'United Kingdom';
            } 
            $("#CurrencyDropDown option:contains(" + $c +")").attr('selected','selected');

            //below we set new country
            $result = await $.ajax({
                url: "/WorldMap/PHP/getLatLong.php",
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
        $('.loaderDiv').css('display', 'flex');
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
    //displayConversionRate($('#CurrencyDropDown').val());
    $('#CurrencyDropDown').on("change", () => {
        displayConversionRate($('#CurrencyDropDown').val());
    });


});
