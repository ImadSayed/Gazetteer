$(document).ready(() => {

    //global variables
    let $progress = 0;
    let p;
    let mymap;
    let $countryListInfo;
    let $currencyInfo;
    let $c;
    let $mapControl = null;
    let $globalFeatureGroup;
    let $polygonLayer;
    let $myGlobalPolylineLayer;
    let $globalMarkerArray = [];
    let $openCageRate = 0;
    let $openCageReset = 0;
    let $globalCountryBounds;
    let $citiesArray = [];
    let $boundsArray = [];
    let $townsArray = [];
    let $capital;
    let $countryCode;

    //global layers
    let $globalTownsLayerGroup = L.layerGroup();
    let $globalCitiesLayerGroup = L.layerGroup();
    let $globalBoundsLayerGroup = L.layerGroup();

    //leaflet icon
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

    //progressbar
    const elem = document.getElementById("myBar");   
    function addProgress(progress) {
        if ($progress >= 100) {
            //clearInterval(id);
            //do nothing
        } else {
            $progress += progress; 
            elem.style.width = $progress + '%';
        }
    }


    function getCurrentLocation() {
        
        if (navigator.geolocation) {
           return new Promise((res, rej) => {
               navigator.geolocation.getCurrentPosition(res, rej);//showPosition
           });
        } else { 
            //x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    /*
    function showPosition(position) {
        //x.innerHTML = "Latitude: " + position.coords.latitude + 
        //"<br>Longitude: " + position.coords.longitude;
    }
    */
    
    async function get() {
        p = await getCurrentLocation();//get current location
        return p;
    }


    async function main(c) {

        //let $t = await getHereToken();
        //console.log("token");
        //console.dir($t);

        $c = c; //assign to global variable

        addProgress(3);                                                                                     //addProgress(3);
        
        //const $citiesArray = [];
        
        //const $boundsArray = [];

        //let $townsArray = [];

        $countryCode = await getCountryCode(c.latitude, c.longitude);
        let $countryName = c.countryName;

        //get current country bounds N,E,S,W
        let $countryBounds = await getCountryBounds($countryCode);

        $globalCountryBounds = $countryBounds;
        
        if(c.latitude === '27.09611' && c.longitude === '-13.41583') {
            $countryCode = 'EH';//W. Sahara
        } else if(c.countryName === 'Western Sahara') {
            $countryCode = 'EH'
        }

        let $currencyCode;

        if(mymap) {
            mymap.remove();
        }

        /**--------------------------------------------------------------------------------OSM TILES PROVIDERS------------------------------------------------------------ */
        //OpenStreetMap_Mapnik
        const map1 = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

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

        //OpenRailwayMap
        const map6 = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
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
        /**----------------------------------------------------------------------------------------------------------------------------------------------------- */

        addProgress(3);                                                                                     //addProgress(3);

        /**---------------------------------------------------------------------------------DETAILS ON COUNTRY----------------------------------------------------------- */
        //fill country info table
        let $countryData;
        let $capital, $continent, $population, $areaInSqKm, $languages;
        let $list = await getCountryList();
        for(let $r = 0; $r < $list.length; $r++) {
            if($countryCode === $list[$r]['countryCode']) {

                $('#currency').html($list[$r]['currencyCode']); //nav bar right - display currency code

                $currencyCode = $list[$r]['currencyCode'];  //used to fetch exchange rate
                $capital = $list[$r]['capital'];            //used for capital marker icon
                
                //for EasyButton Popup
                $countryData = (
                    "<table>"+
                    "<tr><th>Country Name:</th><td>"+$list[$r]['countryName']+"</td></tr>"+
                    "<tr><th>Country Code:</th><td>"+$list[$r]['countryCode']+"</td></tr>"+
                    "<tr><th>Capital:</th><td>"+$list[$r]['capital']+"</td></tr>"+
                    "<tr><th>Population</th><td>"+$list[$r]['population']+"</td></tr>"+
                    "<tr><th>Area In Sq Km:</th><td>"+$list[$r]['areaInSqKm']+"</td></tr>"+
                    "<tr><th>Currency Code:</th><td>"+$list[$r]['currencyCode']+"</td></tr>"+
                    "<tr><th>Continent:</th><td>"+$list[$r]['continentName']+"</td></tr>"+
                    //"<tr><th>Languages:</th><td>"+$list[$r]['languages']+"</td></tr>"+
                    "</table>"
                )
            }
        }

        /**-------------------------------------------------------------------------------------------------------------------------------------------------------------- */

        addProgress(5);                                                                                     //addProgress(5);

        /**-----------------------------------------------EXCHANGE RATES------------------------------------------------------------------- */

        //Open Exchange Rates free account only supplies conversion rates against the US dollar. Whilst we created the means to show a dropdown list of all countries
        // to select a country and have it show the exchange rate for the base currency of the country the map is display, we cannot change the exchange rate base. 

        //allowance 1000 api requests per month (months starts 16th month)

        //let $continue = await getExchangeRates($currencyCode);  //get exchange rate data and store in global variable
        //displayConversionRate($currencyCode);   //display exchangeRate

        addProgress(3);                                                                                     //addProgress(3);

        //let $newCurrencyCode = $('#CurrencyDropDown').val();
        //displayConversionRate($newCurrencyCode);
        /**--------------------------------------------------------------------------------------------------------------------------------- */


        /**----------------------------------------CUSTOM ICON------------------------------------------------- */
        
        /*
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
         */
        //const myBlueIcon = new LeafIcon({iconUrl: 'Images/my_blue_svg_icon.svg'}), 
        //myBrownIcon = new LeafIcon({iconUrl: 'Images/my_brown_svg_icon.svg'}),
        //myRedIcon = new LeafIcon({iconUrl: 'Images/my_red_svg_icon.svg'}),
        myPurpleIcon = new LeafIcon({iconUrl: 'Images/my_purple_svg_icon.svg'}),
        //myOrangeIcon = new LeafIcon({iconUrl: 'Images/my_orange_svg_icon.svg'}),
        myDarkGreenIcon = new LeafIcon({iconUrl: 'Images/my_dark_green_svg_icon.svg'}),
        myPurpleIcon2 = new LeafIcon({iconUrl: 'Images/my_purple2_svg_icon.svg'});
        /**----------------------------------------------------------------------------------------------------- */

        addProgress(3);                                                                                     //addProgress(3);

        
        /**-----------------------------------------------------FETCH CITIES------------------------------------------------------------------- */
        //using country Bounds
        /*
        let $cities = await getPlaces($countryBounds);
        let $counter = 0;

        while($cities == null && $counter < 5) {
            $counter++;
            addProgress(1);                                                                                 //addProgress(1)
            $cities = await getPlaces($countryBounds);
        }

        addProgress(3);                                                                                     //addProgress(3);

        /**-----------------------------------------------------MARKER PLACEMENTS------------------------------------------------------------------- 
        
        if($cities!=null) {
            let popupContent; 
            for(let $i = 0; $i < $cities.length; $i++) {

                
                let $cityWeatherResponse = await getCityWeatherDetails($cities[$i]['lat'],$cities[$i]['lng']);
                let $cityID = $cityWeatherResponse.list[0].id;

                let $wik = decodeURI($cities[$i]['wikipedia']);
                let $name = await getCountryName($cities[$i]['countrycode']);
                popupContent = ("<table class='tablePopup'>"+
                    "<tr><th>Name:</th><td>"+$cities[$i]['name']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$name+" ("+$cities[$i]['countrycode']+")</td></tr>"+
                    "<tr><th>Entity:</th><td>"+$cities[$i]['fcodeName']+"</td></tr>"+
                    "<tr><th>Population:</th><td>"+$cities[$i]['population']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$cities[$i]['lat']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$cities[$i]['lng']+"</td></tr>"+
                    "<tr><th>Wikipedia:</th><td><a href='https://"+$wik+"' target='_blank'>View Info</a></td></tr>"+//"+$cities[$i]['wikipedia']+"
                    "<tr><td colspan='2' class='btnTD'>"+
                        "<div class='my_btn_element' id='we"+$cityID+"' ><i id='ie"+$cityID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  Check Local Weather</div>"+
                        "<div class='boundaryDiv noBoundary' id='ub"+$cities[$i]['lng']+"_"+$cities[$i]['lat']+"'> View Boundary</div>"+//<i class='fas fa-border-style fa-lg'></i>
                    "</td></tr>"+
                    "</table>"
                );


                addProgress(1);                                                                                     //addProgress(1);


                /* ----------------vvvvvvvv------------------------TOWNS---------------vvvvvvvv--------------------- 
                //keep
                
                let $towns = await getOpenWeatherMapCities($cities[$i]['lat'], $cities[$i]['lng']);
                //$townsArray = [];
                if($towns != null) {
                    let townpopupContent; 
                    for(let $i = 0; $i < $towns.length; $i++) {

                        let $townWeatherResponse = await getCityWeatherDetails($towns[$i]['lat'],$towns[$i]['lon']);

                        let $townID = $townWeatherResponse.list[0].id;


                        let $n = $towns[$i]['name'];
                        townpopupContent = ("<table class='tablePopup'>"+
                            "<tr><th>Name:</th><td>"+$towns[$i]['name']+"</td></tr>"+
                            "<tr><th>Latitude:</th><td>"+$towns[$i]['lat']+"</td></tr>"+
                            "<tr><th>Longitude:</th><td>"+$towns[$i]['lon']+"</td></tr>"+
                            "<tr><th>Country:</th><td>"+$towns[$i]['country']+"</td></tr>"+
                            "<tr><td colspan='2' class='btnTD'>"+
                                "<div class='my_btn_element' id='we"+$townID+"' ><i id='ie"+$townID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  Check Local Weather</div>"+
                                "<div class='boundaryDiv noBoundary' id='tb"+$towns[$i]['lon']+"_"+$towns[$i]['lat']+"' >View Boundary</div>"+
                            "</td></tr>"+
                            "</table>"
                        );
                        let $townMarker = L.marker([$towns[$i]['lat'], $towns[$i]['lon']], {
                            title: $towns[$i]['name'],
                            riseOnHover: true,
                            icon: myOrangeIcon
                        }).bindPopup(townpopupContent, {maxWidth: "auto"});
                        $townsArray.push($townMarker);



                        addProgress(0.5);                                                                                     //addProgress(0.5);
                    }
                }
                /* ----------------^^^^^^^^^^------------------------TOWNS---------------^^^^^^^^^^--------------------- 
                
                if($capital === $cities[$i]['name']) {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myRedIcon
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);//popupContent, {minWidth: 'auto'}
                    $citiesArray.push($marker);
                } else if($countryCode !== $cities[$i]['countrycode']) {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myBrownIcon
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                    $citiesArray.push($marker);
                } else {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myBlueIcon
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                    $citiesArray.push($marker);
                }
                /* ----------------^^^^^^^^^^------------------------CITIES---------------^^^^^^^^^^--------------------- 

                //let $boundingbox = await getBoundingBox($cities[$i]['lat'], $cities[$i]['lng']);
                //let $bounds = [[$boundingbox['boundingbox'][0], $boundingbox['boundingbox'][2]], [$boundingbox['boundingbox'][1], $boundingbox['boundingbox'][3]]];
                //let $rect = L.rectangle($bounds, {color: "deeppink", weight: 20});
                //$boundsArray.push($rect);
                let latlng = [$cities[$i]['lat'], $cities[$i]['lng']];
                let $circle = L.circleMarker(latlng, {radius: 20, color: 'deeppink'})
                $boundsArray.push($circle);

                addProgress(1);                                                                                     //addProgress(1);

            }
       }

       /**---------------------------------------------------------------------------------------------------------------------------------------------------- */

       /**-----------------------------------------------------------------GET TOWNS for current location----------------------------------------------------- */
        //keep
        fetchCitiesAndTowns();
        fetchLocalTowns();
        /*
        let $myTowns = await getOpenWeatherMapCities(c.latitude, c.longitude);
        //$townsArray = [];
        if($myTowns != null) {
            let citypopupContent; 
            for(let $i = 0; $i < $myTowns.length; $i++) {

                let $myTownWeatherResponse = await getCityWeatherDetails($myTowns[$i]['lat'],$myTowns[$i]['lon']);
                let $myTownID = $myTownWeatherResponse.list[0].id;

                let $n = $myTowns[$i]['name'];
                citypopupContent = ("<table class='tablePopup'>"+
                    "<tr><th>Name:</th><td>"+$myTowns[$i]['name']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$myTowns[$i]['lat']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$myTowns[$i]['lon']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$myTowns[$i]['country']+"</td></tr>"+
                    "<tr><td colspan='2' class='btnTD'>"+
                                "<div class='my_btn_element' id='we"+$myTownID+"' ><i id='ye"+$myTownID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  Check Local Weather</div>"+
                                "<div class='boundaryDiv noBoundary' id='tb"+$myTowns[$i]['lon']+"_"+$myTowns[$i]['lat']+"'>View Boundary</div>"+
                            "</td></tr>"+
                    "</table>"
                );
                //console.log($towns['data'][$i]['country']);

                let $townMarker = L.marker([$myTowns[$i]['lat'], $myTowns[$i]['lon']], {
                    title: $myTowns[$i]['name'],
                    riseOnHover: true,
                    icon: myOrangeIcon
                }).bindPopup(citypopupContent, {maxWidth: "auto"});
                $townsArray.push($townMarker);
            }
        }
        */

        addProgress(2);                                                                                     //addProgress(2);
        
        /**--------------------------------------------------------------------------------------------------------------------------------------------- */

        //keep
        //let $places = await getOpenCage(c.latitude, c.longitude);

        /**-----------------------------------------------------------UNIVERSAL STATES----------------------------------------------------------------- */

        //$universalCountries = await getUniversalCountries();

        $countryName = await getCountryName($countryCode);
        
        $universalStates = await getUniversalStates($countryName);
        
        //$placeData1 = await getOpenCage('Little Bollington', 'gb');
        //console.dir($placeData1);
        
        const $markerCluster = L.markerClusterGroup();

        $universalDataArray = []; 

        /**--------------------------------------------------------------CLUSTERING & STATES----------------------------------------------------------------------- */
        /*
        for(let $e=0; $e < $universalStates.length; $e++) {
            
            const $stateName = $universalStates[$e].state_name;
            
            $placeData = await getOpenCage($stateName, $countryCode);

                if($placeData.features.length > 0) {
                    let $feature = $placeData.features[0];

                    let $cityWeatherResults = await getCityWeatherDetails($feature.geometry.coordinates[1],$feature.geometry.coordinates[0]);
                    let $cityId = $cityWeatherResults.list[0].id;
                    
                    let $featurePopup = ("<table class='tablePopup'>"+
                    "<tr><th>Address:</th><td>"+$feature.properties.formatted+"</td></tr>"+
                    "<tr><th>Type:</th><td>"+$feature.properties.components._type+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$feature.properties.components.country+")</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$feature.geometry.coordinates[0]+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$feature.geometry.coordinates[1]+"</td></tr>"+
                    "<tr><td colspan='2' class='btnTD'>"+
                        "<div class='my_btn_element' id='ue"+$cityId+"' ><i id='eu"+$cityId+"' class='fas fa-cloud-sun-rain fa-lg'></i>Check Local Weather</div>"+
                        "<div class='boundaryDiv noBoundary' id='vb"+$feature.geometry.coordinates[0]+"_"+$feature.geometry.coordinates[1]+"'>View Boundary</div>"+
                    "</td></tr>"+
                    "</table>"
                    );

                    function onEachFeature(feature, layer) {
                        if (feature.properties) {
                            layer.bindPopup($featurePopup, {maxWidth: "auto"});
                        }
                    }

                    $markerCluster.addLayer(L.geoJSON($placeData.features[0], {
                        onEachFeature: onEachFeature
                    }));//[1],$placeData.features[0].geometry.coordinates[0]//.bindPopup($featurePopup, {minWidth: 350})
                    //.bindPopup($featurePopup, {minWidth: 350})
                    //.setZIndexOffset(50)
                    
                    let $markerGeoJSON = L.geoJSON($placeData.features[0], {
                        onEachFeature: onEachFeature,
                        pointToLayer: function (geoJsonPoint, latlng) {
                            return L.marker(latlng, {icon: myPurpleIcon});
                        }
                    });

                    $universalDataArray.push($markerGeoJSON);
                    //$universalDataArray.push(L.marker($placeData.features[0].geometry.coordinates));//[1],$placeData.features[0].geometry.coordinates[0]//.bindPopup($featurePopup, {minWidth: 350})
                } else {
                    continue;
                }

            addProgress(0.2);                                                                                     //addProgress(0.2);
               
        }//end for

        console.log("OpenCage Rate: "+$openCageRate);
        //console.log("OpenCage Reset: "+$openCageReset);

        /**--------------------------------------------------------------------Single Feature------------------------------------ */
        /*
        let $feature = $placeData1.features[0];

        let $cityWeatherResults = await getCityWeatherDetails($feature.geometry.coordinates[1],$feature.geometry.coordinates[0]);
        let $cityId = $cityWeatherResults.list[0].id;
        
        let $featurePopup = ("<table class='tablePopup'>"+
            "<tr><th>Address:</th><td>"+$feature.properties.formatted+"</td></tr>"+
            "<tr><th>Type:</th><td>"+$feature.properties.components._type+"</td></tr>"+
            "<tr><th>Country:</th><td>"+$feature.properties.components.country+")</td></tr>"+
            "<tr><th>Latitude:</th><td>"+$feature.geometry.coordinates[0]+"</td></tr>"+
            "<tr><th>Longitude:</th><td>"+$feature.geometry.coordinates[1]+"</td></tr>"+
            "<tr><td colspan='2' class='btnTD'>"+
                //"<button type='submit' name='weatherBtn' value="+$cityId+" class='my_btn_element'>Check Local Weather</button>"+
                "<div class='my_btn_element' id='we"+$cityId+"' ><i id='oe"+$cityId+"' class='fas fa-cloud-sun-rain fa-lg'></i>Check Local Weather</div>"+
                "<div class='boundaryDiv noBoundary' id='vb"+$feature.geometry.coordinates[0]+"_"+$feature.geometry.coordinates[1]+"'>View Boundary</div>"+
            "</td></tr>"+
            "</table>"
        );

        function onEachFeature(feature, layer) {
            if (feature.properties) {
                layer.bindPopup($featurePopup, {maxWidth: "auto"});
            }
        }

        let $placeGeoJSON = L.geoJSON($placeData1.features[0], {
            //riseOnHover: true,
            //icon: myPurpleIcon,
            onEachFeature: onEachFeature,
            pointToLayer: function (geoJsonPoint, latlng) {
                return L.marker(latlng, {icon: myPurpleIcon});
            }
        });
        $universalDataArray.push($placeGeoJSON);
        /*

        addProgress(5);                                                                                     //addProgress(5);


        /**------------------------------------------------------------------------------------------------------------------------------------------------ */

        const $universalLayer = L.layerGroup($universalDataArray);



        /**------------------------------------------------------------CREATE MAP AND MAP CONTROL----------------------------------------------------- */
        /**------------------------------------------------------------LAYER GROUPS & FEATURE GROUPS----------------------------------------------------- */
        //const $citiesLayer = L.layerGroup($citiesArray);
        //const $boundsLayer = L.layerGroup($boundsArray);
        //const $cities = L.layerGroup($cityArray);
        //const $townsLayer = L.layerGroup($townsArray);

        mymap = L.map('mapid', {
            center: [c.latitude, c.longitude],
            zoom: 2,
            layers: [map1, $globalCitiesLayerGroup]
        });

        $mapControl = mymap;

        let $geojson = await getGeoJSON($countryCode);

        addProgress(3);                                                                                     //addProgress(3);
        
        let addedGeoJSON = L.geoJSON($geojson, {
            style : function(feature) {
                return {
                    color: 'green',
                    weight: 0.7
                }
            }
        });


        let featureGroup = L.featureGroup([addedGeoJSON]).addTo(mymap);
        
        $globalFeatureGroup = featureGroup;

        mymap.fitBounds(featureGroup.getBounds());

        addProgress(3);                                                                                     //addProgress(3);

       var baseMaps = {
            "<div class='roadMaps mapStyle'>Road Map</div>": map1,
            "<div class='named mapStyle'>Named Places</div>": map4,
            "<div class='nightTime mapStyle'>Night Time</div>": map5,
            "<div class='railWay mapStyle'>Railway Network</div>": map6,
            "<div class='drawnBorders mapStyle'>Drawn Borders</div>": map9,
            "<div class='satellite mapStyle'>Satellite Image</div>": map10
        };
        
        var overlayMaps = {
            "<div class='citiesDiv mapStyle'>Cities</div>": $globalCitiesLayerGroup,
            "<div class='circleMarker mapStyle'>Circle Marker</div>": $globalBoundsLayerGroup,
            "<div class='owmLocations mapStyle'>OWM Locations</div>": $globalTownsLayerGroup,
            "<div class='countiesDiv mapStyle'>Counties</div>": $universalLayer,
            "<div class='clusterMarkerDiv mapStyle'>Cluster Marker</div>": $markerCluster
        };

        L.control.layers(baseMaps, overlayMaps).addTo(mymap);


        addProgress(2);                                                                                     //addProgress(2);


        /**--------------------------------------------------EASY BUTTON For Country Info----------------------------------------------------- */

        const $countryDataPopup = L.popup().setContent($countryData);

        L.easyButton({
            states: [{
                stateName: 'Display_Country_Data',
                icon: '<i class="far fa-clipboard fa-lg"></i>',
                title: 'Display Country Data',
                onClick: function(control) {
                    $countryDataPopup.setLatLng(mymap.getCenter()).openOn(mymap);
                    control.state('Hide_Country_Data');
                }
            }, {
                stateName: 'Hide_Country_Data', 
                icon: '<i class="fas fa-clipboard fa-lg"></i>',
                title: 'Hide Country Data',
                onClick: function(control) {
                    $countryDataPopup.removeFrom(mymap);
                    control.state('Display_Country_Data');
                }
            }]
        }).addTo(mymap);

        addProgress(2);                                                                                     //addProgress(2);

        /**-------------------------------------------------EASY BUTTON For Creating Own Markers------------------------------------------------------------------------------- */

        $myGlobalPolylineLayer = L.layerGroup().addTo(mymap);

        const $instructData = ("<div class='easyPopup'>Click on the map to set <br>departure and arrival.<br>Then re-click the same button <br>to draw the route.</div>");
        const $instructPopup = L.popup().setContent($instructData);

        const $viewRouteData = ("<div class='easyPopup'>Select arrival markers <br>(green icons) <br>to view route directions</div>");
        const $viewRoutePopup = L.popup().setContent($viewRouteData);

        L.easyButton({
            states: [{
                stateName: 'Draw',
                icon: '<i class="far fa-hand-point-up fa-lg"></i>',
                title: 'Select Origin/Destination',
                onClick: function(control) {
                    
                    $progress = 0;
                    addProgress(0);
                    $globalMarkerArray = [];
                    $myGlobalPolylineLayer.clearLayers();
                    $instructPopup.setLatLng(mymap.getCenter()).openOn(mymap);
                    setTimeout(function() {
                        mymap.addEventListener('click',createMarkers);
                    }, 300);

                    control.state('GetRoute');
                    
                }
            }, {
                stateName: 'GetRoute',
                icon: '<i class="fas fa-route fa-lg"></i>',
                title: 'Calculate Route',
                onClick: async function(control) {

                    $viewRoutePopup.setLatLng(mymap.getCenter()).openOn(mymap);

                    control.state('Stop');
                    let $ok = true;
                    let $atLeast1 = false;
                    let $first = false;
                    
                    
                    $('.loaderDiv').css('display', 'flex');
                    if($globalMarkerArray.length <= 1) {
                        //do nothing
                        mymap.removeEventListener('click', createMarkers);
                        $globalMarkerArray = [];
                        $myGlobalPolylineLayer.clearLayers();
                        control.state('Draw');
                    } else {

                    
                        let $origin = {
                            lat: $globalMarkerArray[0][0],
                            lng: $globalMarkerArray[0][1]
                        }
                        let $destination = {
                            lat: $globalMarkerArray[1][0],
                            lng: $globalMarkerArray[1][1]
                        }

                        mymap.removeEventListener('click', createMarkers);

                        let $tmpLayer = L.layerGroup();
                        let $polylineLayer = L.layerGroup();
                        let $startingpopupContent = ("<p>Starting Point</p>");
                        let $redMarker = L.marker([$origin.lat, $origin.lng], {icon: myPurpleIcon2, riseOnHover: true}).bindPopup($startingpopupContent).addTo($tmpLayer);


                        for(let $hj = 0; $hj < $globalMarkerArray.length-1; $hj++) {
                            let $origin = {
                                lat: $globalMarkerArray[$hj][0],
                                lng: $globalMarkerArray[$hj][1]
                            }
                            let $destination = {
                                lat: $globalMarkerArray[$hj+1][0],
                                lng: $globalMarkerArray[$hj+1][1]
                            }

                            
                            let $routeData = await getRoute($origin, $destination);

                            addProgress(10);                                                            //addProgress(10)

                            if($routeData.data == undefined ) {
                                if(!$atLeast1) {
                                    $ok = false;
                                }
                                if($hj === 0) {
                                    $tmpLayer.removeLayer($redMarker);
                                }
                                continue;
                            } else {
                                $atLeast1 = true;
                                $ok = true;
                                let $polylineData = $routeData.polyline.polyline;

                                let $routeDirections = [];
                                let $departureTime = $routeData.data.routes[0].sections[0].departure.time;
                                let $arrivalTime = $routeData.data.routes[0].sections[0].arrival.time;
                                $routeDirections.push($departureTime);
                                $routeDirections.push($arrivalTime);

                                let $routeInstuctions = $routeData.data.routes[0].sections[0].actions;
                                
                                for(let $jk=0; $jk < $routeInstuctions.length; $jk++) {
                                    let $str = $routeInstuctions[$jk].instruction;
                                    
                                    if($str.includes("\'")) {
                                        $str = $str.replaceAll("'","-");
                                    }
                                    $routeDirections.push($str);
                                    
                                }

                                let $polyline = L.polyline($polylineData, {color: 'blue', opacity: 0.4});
                                $polyline.on('mouseover', function(e) {
                                    var layer = e.target;
                                
                                    layer.setStyle({
                                        color: 'red',
                                        opacity: 1
                                    });
                                }).on('mouseout', function(e) {
                                    var layer = e.target;
                                
                                    layer.setStyle({
                                        color: 'blue',
                                        opacity: 0.4,
                                    });
                                });
                                $polyline.addTo($polylineLayer);
                                
                                let $tmpLat = $routeData.data.routes[0].sections[0].arrival.place.location.lat;
                                let $tmpLng = $routeData.data.routes[0].sections[0].arrival.place.location.lng;
                                let $currentdestinationpopupContent = (
                                    "<ul class='popupUL'>"+
                                        "<li class='popupLI'>Destination "+($hj+1)+"</li>"+
                                        "<li class='popupLI'>Latitude: "+$tmpLat+"</li>"+
                                        "<li class='popupLI'>Longitude: "+$tmpLng+"</li>"+
                                        "<li><div id='li"+$hj+1+"' class='routeDirections' data-value='"+$routeDirections+"'>Route Directions</div></li>"+//<i class='fas fa-list-ul'></i>
                                    "</ul>"
                                );
                                L.marker([$destination.lat, $destination.lng], {icon: myDarkGreenIcon}).bindPopup($currentdestinationpopupContent).addTo($tmpLayer);

                            }

                            
                        }

                        if($progress < 80) {
                            $progress = 90;
                            addProgress(10);                                                                        //addProgress(10)
                        }

                        /*
                        function onEachMarker(feature, layer) {
                            if (feature.properties) {
                                layer.bindPopup($featurePopup, {maxWidth: "auto"});
                            }
                        }
                        */

                        $myGlobalPolylineLayer.clearLayers();
                        if($ok) {
                            $myGlobalPolylineLayer.addLayer($tmpLayer);
                            $myGlobalPolylineLayer.addLayer($polylineLayer);
                        } else {
                            mymap.removeEventListener('click', createMarkers);
                            $globalMarkerArray = [];
                            $myGlobalPolylineLayer.clearLayers();
                            control.state('Draw');
                        }
                    }

                    $('.loaderDiv').css('display', 'none');
                }
            }, {
                stateName: 'Stop',
                icon: '<i class="far fa-hand-paper fa-lg"></i>',
                title: 'Remove Route Info',
                onClick: function(control) {

                    //console.log("stop state btn just got clicked");
                    control.state('Draw');
                    $globalMarkerArray = [];
                    $myGlobalPolylineLayer.clearLayers();
                    
                }
            }]
        }).addTo(mymap);

        addProgress(2);                                                                                     //addProgress(2);

        

        

        /**------------------------------------------------LOADER------------------------------------- */
        if($progress < 100) {
            $progress = 99;
            addProgress(1);                                                                                     //addProgress(1);
        }
        setTimeout(function() {
            $('.loaderDiv').css('display', 'none');
        }, 1500);
        
        
    }

    /**------------------------------------------------END MAIN FUNC --------------------------------------------------------------------------------------------------- */



    
    /**---------------------------------------------------------------------API FUNCTIONS-------------------------------------------------------------------------- */
    
    async function getHereToken() {
        try {
            let $result;
            await $.ajax({
                url: 'PHP/getHereToken.php',
                type: 'POST',
                success: function(res) {
                    $result = res;
                },
                error: function(err) {
                    console.log("getHereToken Error");
                    console.dir(err);
                }
            });
            //console.log("token: ");
            //console.dir($result);
            return $result;
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getRoute($origin, $destination) {
        try {

            $access_token = await getHereToken();
            if($access_token === null) {
                return null;
            }
            let $result;
            await $.ajax({
                url: 'PHP/getRoute',
                type: 'POST',
                data: {
                    originLat: $origin.lat,
                    originLng: $origin.lng,
                    destinationLat: $destination.lat,
                    destinationLng: $destination.lng,
                    access_token: $access_token
                },
                success: function (res) {
                    let $data = {
                        polyline: res['polyline'],
                        data: res['data']
                    };
                    $result = $data;
                },
                error: function (err) {
                    $result = false;
                }
            });
            return $result;
        }
        catch(err) {
            console.error(err);
        }
    }

    function createMarkers(e) {
        //console.log(e.latlng);
        //let popLocation = e.latlng;
        let marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo($myGlobalPolylineLayer);//.addTo(myMarkersLayer);
        let coordinates = [marker.getLatLng().lat, marker.getLatLng().lng];
        $globalMarkerArray.push(coordinates);
        drawPolyline();
    }

    function drawPolyline() {
        let polyline = L.polyline($globalMarkerArray, {color: 'red'});//.addTo($myGlobalPolylineLayer);
        $myGlobalPolylineLayer.addLayer(polyline);
    }


    function getPolygonArray($here) {
        const $herePolylineArray = [];
        const $herePolygonArray = [];
        let $coordArr;
        let $latLngs = [];
        for(let $ty=0; $ty < $here.length; $ty++) {
            let $contents1 = $here[$ty];
            if(Array.isArray($contents1)) {
                $latLngs2 = [];
                for(let $yu = 0; $yu < $contents1.length; $yu++) {
                    let $contents2 = $contents1[$yu];
                    
                    if(Array.isArray($contents2)) {
                        let $latLngs3 = [];
                        for(let $ui=0; $ui < $contents2.length; $ui++) {
                            let $contents3 = $contents2[$ui];
                            //string
                            $coordArr = $contents3.split(' ');
                            let $tempArr = [parseFloat($coordArr[1]), parseFloat($coordArr[0])];
                            $latLngs3.push($tempArr);
                        }
                        $polygon = L.polygon($latLngs3, {color: 'blue'});
                        $polyline = L.polyline($latLngs3, {color: 'red'});
                        $herePolylineArray.push($polyline);
                        $herePolygonArray.push($polygon);
                    } else {
                        $coordArr = $contents2.split(' ');
                        let $tempArr = [parseFloat($coordArr[1]), parseFloat($coordArr[0])];
                        $latLngs2.push($tempArr);
                    }
                }
                if($latLngs2.length > 0) {
                    $polygon = L.polygon($latLngs2, {color: 'blue'});
                    $polyline = L.polyline($latLngs2, {color: 'red'});
                    $herePolylineArray.push($polyline);
                    $herePolygonArray.push($polygon);
                }
            } else {
                $coordArr = $contents1.split(' ');
                let $tempArr = [parseFloat($coordArr[1]), parseFloat($coordArr[0])];
                $latLngs.push($tempArr);
            }
        }
        if(!Array.isArray($here[0])) {
            $polygon = L.polygon($latLngs, {color: 'blue'});
            $polyline = L.polyline($latLngs, {color: 'red'});
            $herePolylineArray.push($polyline);
            $herePolygonArray.push($polygon);
        }

        return $herePolygonArray; 
    }

    
    /*
    async function getHereMultipolygon($lat, $lng) {
        try {
            let $results = await $.ajax({
                url: 'PHP/getHereMultipolygon.php',
                type: 'POST',
                data: {
                    lat: $lat,
                    lng: $lng
                }
            });
            if($results.status.name=='ok') {
                console.log("getHereMultipolygon Results");
                console.dir($results['data']);
            }
            
        }
        catch(err) {
            console.error(err);
        }
    }
    */

    async function getHereShapes($lat, $lng) {
        try {
            
            let $access_token = await getHereToken();
            let $results = await $.ajax({
                url: 'PHP/getHere',
                type: 'POST',
                data: {
                    lat: $lat,
                    lng: $lng,
                    access_token: $access_token
                }
            });
            if($results.status.name == 'ok') {

                let $str;
                if($results['data']['Response']['View'][0]['Result'][0]['Location']['Shape'] || 
                    ($results['data']['Response']['View'][0]['Result'].length > 1 && $results['data']['Response']['View'][0]['Result'][1]['Location']['Shape'])) {

                
                    if($results['data']['Response']['View'][0]['Result'].length > 1) {
                        $str = $results['data']['Response']['View'][0]['Result'][1]['Location']['Shape']['Value'].substring(12).trim();
                    } else {
                        
                        $str = $results['data']['Response']['View'][0]['Result'][0]['Location']['Shape']['Value'].substring(12).trim();
                    }
                    let lenMinus1 = $str.length-1;
                    let $str1 = $str.substring(1,lenMinus1);
                    let $finalArray1 = [];
                    let $finalArray2 = [];
                    let $finalArray3 = [];
                    if($str1.includes(')), ((')) {  
                        let $firstArray = $str1.split(')), ');
                        for(let $z=0; $z < $firstArray.length-1; $z++) {
                            $firstArray[$z] = $firstArray[$z]+'))';
                        }
                        for(let $q=0; $q < $firstArray.length; $q++) {
                            let $str2 = $firstArray[$q];
                            let $str2LenMin1 = $str2.length-1;
                            $str2 = $str2.substring(1,$str2LenMin1);

                            if($str2.includes('), (')) {
                                let $secondArray = $str2.split('), ');
                                for(let $w=0; $w < $secondArray.length-1; $w++) {
                                    $secondArray[$w] = $secondArray[$w]+')';
                                }
                                for(let $b=0; $b < $secondArray.length; $b++) {
                                    let $str3 = $secondArray[$b];
                                    let $str3LenMinus1 = $str3.length-1;
                                    $str3 = $str3.substring(1,$str3LenMinus1);
                                    $thirdArray = $str3.split(',');
                                    for(let $vb = 0; $vb < $thirdArray.length; $vb++) {
                                        $thirdArray[$vb] = $thirdArray[$vb].trim();
                                    }
                                    $finalArray2.push($thirdArray);
                                }
                                

                            } else {
                                let $str2Len = $str2.length-1;
                                $str2 = $str2.substring(1, $str2Len);
                                let $secondArray = $str2.split(',');
                                for(let $qw=0; $qw < $secondArray.length; $qw++) {
                                    $secondArray[$qw] = $secondArray[$qw].trim();
                                }
                                $finalArray2.push($secondArray);
                            }
                            
                        }
                        $finalArray1.push($finalArray2);


                    } else {

                        let $str1Len = $str1.length-1;
                        $str1 = $str1.substring(1,$str1Len);
                        if($str1.includes('),')) {
                            let $firstArray = $str1.split('),');
                            for(let $we=0; $we < $firstArray.length-1; $we++) {
                                $firstArray[$we] = $firstArray[$we]+")";
                                $firstArray[$we] = $firstArray[$we].trim();
                            }
                            for(let $er=0; $er < $firstArray.length; $er++) {
                                let $str2 = $firstArray[$er];
                                let $str2Len = $str2.length-1;
                                $str2 = $str2.substring(1,$str2Len); 
                                $finalArray3.push($str2);
                            }
                            $finalArray1.push($finalArray3);

                        } else {
                            $str1Len = $str1.length-1;
                            $str1 = $str1.substring(1,$str1Len);
                            let $firstArray = $str1.split(',');
                            for(let $rt = 0; $rt < $firstArray.length; $rt++) {
                                $firstArray[$rt] = $firstArray[$rt].trim();
                            } 
                            $finalArray1.push($firstArray);
                        }

                    }
                    let $obj = {
                        result: 'shape',
                        finalArray: $finalArray1
                    }
                    return $obj;

                } else if($results['data']['Response']['View'][0]['Result'][0]['Location']['MapView']){
                    
                    let $obj = {
                        result: 'noShape',
                        bounds: $results['data']['Response']['View'][0]['Result'][0]['Location']['MapView'] 
                    }
                    return $obj;
                    
                }

            }
        }
        catch(err) {
            console.error(err);
        }
    }

    async function fetchCitiesAndTowns() {
        let $cities = await getPlaces($globalCountryBounds);
        let $counter = 0;

        const myBlueIcon = new LeafIcon({iconUrl: 'Images/my_blue_svg_icon.svg'}), 
        myBrownIcon = new LeafIcon({iconUrl: 'Images/my_brown_svg_icon.svg'}),
        myRedIcon = new LeafIcon({iconUrl: 'Images/my_red_svg_icon.svg'}),
        myOrangeIcon = new LeafIcon({iconUrl: 'Images/my_orange_svg_icon.svg'});

        while($cities == null && $counter < 5) {
            $counter++;
            $cities = await getPlaces($globalCountryBounds);
        }


        /**-----------------------------------------------------MARKER PLACEMENTS------------------------------------------------------------------- */
        $boundsArray = [];
        $citiesArray = [];
        $townsArray = [];


        if($cities!=null) {
            let popupContent; 
            
            for(let $i = 0; $i < $cities.length; $i++) {

                
                let $cityWeatherResponse = await getCityWeatherDetails($cities[$i]['lat'],$cities[$i]['lng']);
                let $cityID = $cityWeatherResponse.list[0].id;

                let $wik = decodeURI($cities[$i]['wikipedia']);
                let $name = await getCountryName($cities[$i]['countrycode']);
                popupContent = ("<table class='tablePopup'>"+
                    "<tr><th>Name:</th><td>"+$cities[$i]['name']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$name+" ("+$cities[$i]['countrycode']+")</td></tr>"+
                    "<tr><th>Entity:</th><td>"+$cities[$i]['fcodeName']+"</td></tr>"+
                    "<tr><th>Population:</th><td>"+$cities[$i]['population']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$cities[$i]['lat']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$cities[$i]['lng']+"</td></tr>"+
                    "<tr><th>Wikipedia:</th><td><a href='https://"+$wik+"' target='_blank'>View Info</a></td></tr>"+//"+$cities[$i]['wikipedia']+"
                    "<tr><td colspan='2' class='btnTD'>"+
                        "<div class='my_btn_element' id='we"+$cityID+"' ><i id='ie"+$cityID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  Check Local Weather</div>"+
                        "<div class='boundaryDiv noBoundary' id='ub"+$cities[$i]['lng']+"_"+$cities[$i]['lat']+"'> View Boundary</div>"+//<i class='fas fa-border-style fa-lg'></i>
                    "</td></tr>"+
                    "</table>"
                );


                /* ----------------vvvvvvvv------------------------TOWNS---------------vvvvvvvv--------------------- */
                //keep
                
                let $towns = await getOpenWeatherMapCities($cities[$i]['lat'], $cities[$i]['lng']);
                if($towns != null) {
                    let townpopupContent; 
                    for(let $i = 0; $i < $towns.length; $i++) {

                        let $townWeatherResponse = await getCityWeatherDetails($towns[$i]['lat'],$towns[$i]['lon']);

                        let $townID = $townWeatherResponse.list[0].id;


                        let $n = $towns[$i]['name'];
                        townpopupContent = ("<table class='tablePopup'>"+
                            "<tr><th>Name:</th><td>"+$towns[$i]['name']+"</td></tr>"+
                            "<tr><th>Latitude:</th><td>"+$towns[$i]['lat']+"</td></tr>"+
                            "<tr><th>Longitude:</th><td>"+$towns[$i]['lon']+"</td></tr>"+
                            "<tr><th>Country:</th><td>"+$towns[$i]['country']+"</td></tr>"+
                            "<tr><td colspan='2' class='btnTD'>"+
                                "<div class='my_btn_element' id='we"+$townID+"' ><i id='ie"+$townID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  Check Local Weather</div>"+
                                "<div class='boundaryDiv noBoundary' id='tb"+$towns[$i]['lon']+"_"+$towns[$i]['lat']+"' >View Boundary</div>"+
                            "</td></tr>"+
                            "</table>"
                        );
                        let $townMarker = L.marker([$towns[$i]['lat'], $towns[$i]['lon']], {
                            title: $towns[$i]['name'],
                            riseOnHover: true,
                            icon: myOrangeIcon
                        }).bindPopup(townpopupContent, {maxWidth: "auto"});
                        $townsArray.push($townMarker);

                    }
                }
                /* ----------------^^^^^^^^^^------------------------TOWNS---------------^^^^^^^^^^--------------------- */
                
                if($capital === $cities[$i]['name']) {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myRedIcon
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);//popupContent, {minWidth: 'auto'}
                    $citiesArray.push($marker);
                } else if($countryCode !== $cities[$i]['countrycode']) {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myBrownIcon
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                    $citiesArray.push($marker);
                } else {
                    let $marker = L.marker($cities[$i], {
                        title: $cities[$i]['name'],
                        riseOnHover: true,
                        icon: myBlueIcon
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                    $citiesArray.push($marker);
                }
                /* ----------------^^^^^^^^^^------------------------CITIES---------------^^^^^^^^^^--------------------- */

                //let $boundingbox = await getBoundingBox($cities[$i]['lat'], $cities[$i]['lng']);
                //let $bounds = [[$boundingbox['boundingbox'][0], $boundingbox['boundingbox'][2]], [$boundingbox['boundingbox'][1], $boundingbox['boundingbox'][3]]];
                //let $rect = L.rectangle($bounds, {color: "deeppink", weight: 20});
                //$boundsArray.push($rect);
                let latlng = [$cities[$i]['lat'], $cities[$i]['lng']];
                let $circle = L.circleMarker(latlng, {radius: 20, color: 'deeppink'})
                $boundsArray.push($circle);

            }
       }
       $globalCitiesLayer = new L.layerGroup($citiesArray);
       $globalCitiesLayerGroup.addLayer($globalCitiesLayer);
       
       $globalTownsLayer = new L.layerGroup($townsArray);
       $globalTownsLayerGroup.addLayer($globalTownsLayer);

       $globalBoundsLayer = new L.layerGroup($boundsArray);
       $globalBoundsLayerGroup.addLayer($globalBoundsLayer);
       
    }

    async function fetchLocalTowns() {

        let myOrangeIcon = new LeafIcon({iconUrl: 'Images/my_orange_svg_icon.svg'});
        
        let $myTowns = await getOpenWeatherMapCities($c.latitude, $c.longitude);
        $townsArray = [];
        if($myTowns != null) {
            let citypopupContent; 
            for(let $i = 0; $i < $myTowns.length; $i++) {

                let $myTownWeatherResponse = await getCityWeatherDetails($myTowns[$i]['lat'],$myTowns[$i]['lon']);
                let $myTownID = $myTownWeatherResponse.list[0].id;

                let $n = $myTowns[$i]['name'];
                citypopupContent = ("<table class='tablePopup'>"+
                    "<tr><th>Name:</th><td>"+$myTowns[$i]['name']+"</td></tr>"+
                    "<tr><th>Latitude:</th><td>"+$myTowns[$i]['lat']+"</td></tr>"+
                    "<tr><th>Longitude:</th><td>"+$myTowns[$i]['lon']+"</td></tr>"+
                    "<tr><th>Country:</th><td>"+$myTowns[$i]['country']+"</td></tr>"+
                    "<tr><td colspan='2' class='btnTD'>"+
                                "<div class='my_btn_element' id='we"+$myTownID+"' ><i id='ye"+$myTownID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  Check Local Weather</div>"+
                                "<div class='boundaryDiv noBoundary' id='tb"+$myTowns[$i]['lon']+"_"+$myTowns[$i]['lat']+"'>View Boundary</div>"+
                            "</td></tr>"+
                    "</table>"
                );
                //console.log($towns['data'][$i]['country']);

                let $townMarker = L.marker([$myTowns[$i]['lat'], $myTowns[$i]['lon']], {
                    title: $myTowns[$i]['name'],
                    riseOnHover: true,
                    icon: myOrangeIcon
                }).bindPopup(citypopupContent, {maxWidth: "auto"});
                $townsArray.push($townMarker);
            }
        }


        $globalTownsLayer = new L.layerGroup($townsArray);
        $globalTownsLayerGroup.addLayer($globalTownsLayer);
        //$townsArray.addTo($globalTownsLayer);
    }

    async function getCityWeatherDetails($lat, $lng) {
        try {
            let $result = await $.ajax({
                url: 'PHP/getCityWeatherDetails.php',
                type: 'POST',
                data: {
                    lat: $lat,
                    lng: $lng
                }
            });
            if($result.status.name=='ok') {
                return $result['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    /*
    async function getUniversalCountries() {
        try {
            let $result = await $.ajax({
                url: 'PHP/getUniversal.php',
                type: 'POST',
                data: {
                    toGet: 'countries'
                }
            });
            if($result.status.name=='ok') {
                return $result['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }
    */

    async function getUniversalStates($countryName) {
        try {
            let $result = await $.ajax({
                url: 'PHP/getUniversal.php',
                type: 'POST',
                data: {
                    toGet: 'states',
                    countryName: $countryName
                }
            });
            if($result.status.name=='ok') {
                return $result['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getUniversalCities($stateName) { //although we havent used this, we could, but it returns too much data
        try {
            let $result = await $.ajax({
                url: 'PHP/getUniversal.php',
                type: 'POST',
                data: {
                    toGet: 'cities',
                    stateName: $stateName
                }
            });
            if($result.status.name=='ok') {
                return $result['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }



    /*
    async function getGeonamesPostcodes($n, $s, $e, $w) { //we've not used this
        try {
            const $res = await $.ajax({
                url: 'PHP/getGeonamesPostcodes.php',
                type: 'POST',
                data: {
                    north: $n,
                    south: $s,
                    east: $e,
                    west: $w
                }
            });
            if($res.status.name=='ok') {
                //console.log("Geonames Postcodes");
                //console.dir($res['data']);
                return $res['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }
    */

    async function getOpenCage($placeName, $countryCode) {
        try {
            const $result = await $.ajax({
                url: 'PHP/getOpenCage.php',
                type: 'POST',
                data: {
                    placeName: $placeName,
                    countryCode: $countryCode 
                }
            });
            if($result.status.name=='ok') {
                $openCageRate = $result['data'].rate.remaining;
                $openCageReset = $result['data'].rate.reset;
                return $result['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getOpenWeatherMapCities($lat, $lng) {//this is not used since it doesnt return many cities
        try {
            const $result = await $.ajax({
                url: 'PHP/getOpenWeatherMapCities.php',
                type: 'POST',
                data: {
                    lat: $lat,
                    lng: $lng
                }
            });
            if($result.status.name=='ok') {
                return $result['data'];
            }
            
        }
        catch(err) {
            console.error(err);
        }
    }

    
    async function displayConversionRate($currencyCode) {
        try{
            if($currencyInfo!==null) {
                $displayRate = $currencyInfo['rates'][$currencyCode];
                $('#exRate').html($displayRate);
            }
        }
        catch(err) {
            console.error(err);
        }

    }

    /*
    async function getIsoCode($countryCode) {
        for(let $u=0; $u < $countryListInfo.length; $u++) {
            if($countryCode === $countryListInfo[$u]['countryCode']) {
                return $countryListInfo[$u]['isoAlpha3'];
            } else {
                return null;
            }
        }
    }
    */

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
            //console.error(err);
            $currencyInfo = null;
        }
    }

    /*
    async function getRestCountries() {
        try {
            //this only returns countries, no city info so will not be using
            const $rest = await $.ajax({
                url: "PHP/getRestCountries.php"
            });
            if($rest.status.name == 'ok') {
                return $rest['data'];
            }
        }
        catch(err) {
            console.error(err);
        }
    }

    /*
    async function getAllCities($countryCode) {
        try {
            //Free service only returns 10 results so will not be using this.
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
    */


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

    /*
    async function countryOutline($countryName) {
        let $geojson = await getGeoJSON($countryName);
        return $geojson;
    }

    /*
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
                /*
            }
        }
        catch(err) {
            console.error(err);
        }
    }
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
                //$codeArr = [];

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
            }
        }
        catch(err) {
            console.log("getCountryName Error: "+err.message);
        }
    
    }
    /*
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
                const b = [];
                for(let i = 0; i < $result['data'].length; i++) {
                    b.push(new Array($result['data'][i].lng, $result['data'][i].lat));
                }
                return b;
            }
        }
        catch(err) {
            console.log("Error: "+err.message);
        }
    }
    */

    async function getCountryBounds($countryCode) {
        let $north, $south, $east, $west;
        try {
            $data = await $.ajax({
            url: "/WorldMap/PHP/getCountryList.php",
            type: 'POST'
            })
            for(let i = 0; i < $data['data'].length; i++) {
                if($countryCode === $data['data'][i]['countryCode']) {
                    $north = $data['data'][i]['north'];
                    $south = $data['data'][i]['south'];
                    $east = $data['data'][i]['east'];
                    $west = $data['data'][i]['west'];
                }
            }
            $obj = {north: $north, south: $south, east: $east, west: $west};
            return $obj;
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getPlaces($obj) {
        try {

            //console.dir($obj);
            let $results; 
            await $.ajax({
                url: "PHP/getPlaces.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    north: $obj.north,
                    south: $obj.south,
                    east: $obj.east,
                    west: $obj.west
                },
                success: function(res) {
                    $results = res['data'];
                },
                error: function (err) {
                    //getPlaces($obj);
                    $results = null;
                }
            });
            return $results;
            if($results.status.name == "ok") {
                return $results['data'];
            }
        }
        catch(err) {
            //do nothing since we have tried to get places 5 times and no results have been returned.
            //console.error(err);

        }
    }
    
    async function getGeoJSON($name) {
        try {
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
                    country: "'"+$countryName+"'",
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
    }

    async function begin() {
        $('.loaderDiv').css('display', 'flex');
        let c = await get();
        main(c.coords);
    }
    
    //getAllCountries();
    getAllGeonameCountries();
    begin();




    
    $('#navDropDown').on("change", () => {
        $progress = 0;
        addProgress(0);
        setNewCountry($('#navDropDown').val(), $('#navDropDown option:selected').text());
    });
    
    /*
    $('#CurrencyDropDown').on("change", () => {
        displayConversionRate($('#CurrencyDropDown').val());
    });
    */

    $('#closeIconDiv').on('click', () => {
        hideWidgets();
    });

    //view place polygon
    $(document).on('click', '.boundaryDiv', async function(event) {
        let $id = event.target.id;
        console.log("boundaryDiv id: "+$id);
        let $element = document.getElementById($id);
        
        let $str = $id.substring(2);
        let $arr = $str.split('_');
        let $lat = $arr[0];
        let $lng = $arr[1];

        let $shapeData = await getHereShapes($lat, $lng);

        if($shapeData.result === 'noShape') {
            if($element.classList.contains('noBoundary')) {

                let $bounds = [[$shapeData.bounds.BottomRight.Latitude,$shapeData.bounds.BottomRight.Longitude],[$shapeData.bounds.TopLeft.Latitude,$shapeData.bounds.TopLeft.Longitude]]

                $mapControl.flyToBounds($bounds);
                $element.classList.remove('noBoundary');
                $element.innerHTML = 'Zoom Out';
            } else {
                $mapControl.flyToBounds($globalFeatureGroup.getBounds());
                $element.classList.add('noBoundary');
                $element.innerHTML = 'View Boundary';
            }

        } else {
        
            if($element.classList.contains('noBoundary')) {
                if($polygonLayer) {
                    $mapControl.removeLayer($polygonLayer);
                }
                let $newLayer = L.layerGroup();
                let $pga = getPolygonArray($shapeData.finalArray);

                let $index = 0; //index of biggest polygon in pga
                let $indexLength = 0; //biggest polygon in polygon array pga

                for(let $as=0; $as < $pga.length; $as++) {
                    
                    if($pga[$as]._latlngs[0].length > $indexLength) {
                        
                        $index = $as;
                        $indexLength = $pga[$as]._latlngs[0].length;
                    }
                    $pga[$as].addTo($newLayer);
                }

                $polygonLayer = $newLayer;
                $mapControl.flyToBounds($pga[$index].getBounds());
                
                setTimeout(() => {
                    $polygonLayer.addTo($mapControl);
                }, 2000);
                
                $element.classList.remove('noBoundary');
                $element.innerHTML = 'Hide Boundary';
                
            } else {
                $mapControl.removeLayer($polygonLayer);
                $mapControl.flyToBounds($globalFeatureGroup.getBounds());
                //$mapControl.fitBounds($globalFeatureGroup.getBounds());
                $element.classList.add('noBoundary');
                $element.innerHTML = 'View Boundary';
            }
        
        }

    });

    //view weather widget
   $(document).on('click', '.my_btn_element', async function(event) {
        //alert(event.target.id);
        $string = event.target.id;
        $id = $string.substring(2);
            
        if(!document.getElementById($id)) {
                hideWidgets();                  //hides all existing id divs
                weather($id);    //create id div
                toggleWeather($id);    //show id div
        } else {
                //if id div already exists
                if(document.getElementById($id).classList.contains("showDisplay")) { //and if already displayed
                    toggleWeather($id);    //hide id div
                } else {
                    //toggleToHideDisplay(event.target.value);
                    hideWidgets();
                    toggleWeather($id);    //show this id div
            }
        }
   });


    function weather($id) {
        const div = document.createElement('div');
        div.id = $id;
        div.className = 'hideDisplay owmWidget';
        
        document.getElementById('openweathermapwidget11').appendChild(div);

        window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = [];
        window.myWidgetParam.push({id: 12,cityid: $id,appid: '7e76719165837bd7b020d8c33a8f0621',units: 'metric',containerid: $id  });  
        (function() {
            var script = document.createElement('script');
            script.async = true;
            script.charset = "utf-8";
            script.src = "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(script, s);  
        })();
    }

    function toggleWeather($id) {
        if(document.getElementById($id).classList.contains("hideDisplay")) {
            document.getElementById($id).classList.remove('hideDisplay');
            document.getElementById($id).classList.add('showDisplay');
            setTimeout(showCloseIcon, 1500);
        } else {
            document.getElementById($id).classList.remove('showDisplay');
            document.getElementById($id).classList.add('hideDisplay');
            hideCloseIcon();
        }
    }

    function toggleToHideDisplay($id) {
        if(document.getElementById($id).classList.contains("showDisplay")) {
            document.getElementById($id).classList.remove('showDisplay');
            document.getElementById($id).classList.add('hideDisplay');
            hideCloseIcon();
        }
    }

    function hideWidgets() {
        let divs = document.querySelectorAll('.owmWidget');
        for(let i = 0; i < divs.length; i++) {
            toggleToHideDisplay(divs[i].id);
        }
    }

    function showCloseIcon() {
        document.getElementById('closeIconDiv').classList.remove('hideDisplay');
        document.getElementById('closeIconDiv').classList.add('showDisplay');   //show close icon
    }

    function hideCloseIcon() {
        document.getElementById('closeIconDiv').classList.remove('showDisplay');
        document.getElementById('closeIconDiv').classList.add('hideDisplay');   //hide close icon
    }


    

});
