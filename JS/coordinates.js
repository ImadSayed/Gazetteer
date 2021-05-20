$(document).ready(() => {

    //global variables
    let $progress = 0;
    let p;
    let mymap;
    //let $countryListInfo;//getCountryList return
    let $currencyInfo;
    let $currencyCode;
    let $currencySymbol;
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
    let $population;
    let $currency;
    let $borders = [];
    let $languages = [];
    let $restCountryName;

    let $countryCode;//used
    let $countryName;//used

    //country list
    let $globalCountryList = [];//getCountryList return, assigned in getAllGeonameCountries
    let $globalCitiesList = [];


    //global layers
    let $globalTownsLayerGroup = L.layerGroup();
    let $globalCitiesLayerGroup = L.layerGroup();
    let $globalBoundsLayerGroup = L.layerGroup();
    let $globalClusterLayerGroup = L.layerGroup();
    let $globalUniversalLayerGroup = L.layerGroup();
    let $globalBattutaLayerGroup = L.layerGroup();
    let $globalOpenTripLayerGroup = L.layerGroup();

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
    
    async function get() {
        p = await getCurrentLocation();//get current location
        return p;
    }


    async function main(c) {

        $globalCitiesLayerGroup.clearLayers();
        $globalTownsLayerGroup.clearLayers();
        $globalBoundsLayerGroup.clearLayers();
        $globalClusterLayerGroup.clearLayers();
        $globalUniversalLayerGroup.clearLayers();
        $globalOpenTripLayerGroup.clearLayers();

        $c = c; //assign to global variable

        addProgress(10);                                                                                     //addProgress(10);
        

        $countryCode = await getCountryCode(c.latitude, c.longitude);

        //console.log("lat: "+c.latitude+", lon:"+c.longitude);

        //fill country info table
        //let $countryData;
        //let $continent, $population, $areaInSqKm, $languages;

        /*
        let $list = await getCountryList();
        for(let $r = 0; $r < $list.length; $r++) {
            if($countryCode === $list[$r]['code']) {

                $('#currency').html($list[$r]['code']); //nav bar right - display currency code

                //$currencyCode = $list[$r]['currencyCode'];  //used to fetch exchange rate
                //$capital = $list[$r]['capital'];            //used for capital marker icon
                
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
                    "</table>"
                )
            }
        }
        */


        
        if(c.latitude === '27.09611' && c.longitude === '-13.41583') {
            $countryCode = 'EH';//W. Sahara
        } else if(c.countryName === 'Western Sahara') {
            $countryCode = 'EH'
        }


        $countryName = await getCountryName($countryCode); //assigned to global variable

        //get current country bounds N,E,S,W
        let $countryBounds = await getCountryBounds($countryCode);              //do we need this still                     ?????????????

        $globalCountryBounds = $countryBounds;

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

        addProgress(10);                                                                                     //addProgress(10);

        let $continue1 =await getRestCountry($countryCode);//use await to allow $capital to be assigned before calling getBattutaData

        //currencySymbol stored in global variable invoked by getRestCountry above

        /**-----------------------------------------------EXCHANGE RATES------------------------------------------------------------------- */

        //Open Exchange Rates free account only supplies conversion rates against the US dollar. Whilst we created the means to show a dropdown list of all countries
        // to select a country and have it show the exchange rate for the base currency of the country the map is display, we cannot change the exchange rate base. 

        //allowance 1000 api requests per month (months starts 16th month)

        let $continue2 = await getExchangeRates($currencyCode);  //get exchange rate data and store in global variable called currencyInfo
        displayConversionRate($currencyCode);   //display exchangeRate

        addProgress(10);                                                                                     //addProgress(10);

        //let $newCurrencyCode = $('#CurrencyDropDown').val();      //would use if we were able to change exchange rate base
        //displayConversionRate($newCurrencyCode);
        /**--------------------------------------------------------------------------------------------------------------------------------- */


        /**----------------------------------------CUSTOM ICON FOR ROUTES ------------------------------------------------- */
        
        myDarkGreenIcon = new LeafIcon({iconUrl: 'Images/my_dark_green_svg_icon.svg'}),
        myPurpleIcon2 = new LeafIcon({iconUrl: 'Images/my_purple2_svg_icon.svg'});


       /**-----------------------------------------------------------------GET CITIES & TOWNS for current location----------------------------------------------------- */
        
        //fetchCitiesAndTowns();
        //fetchLocalTowns();
        
        

        getBattutaData($countryCode); // defo keep

        
        //let $battutaRegions = getBattuta($countryCode);
        //console.log("battuta");
        //console.dir($battutaRegions);

        ///////*****----------------------------------------------------------------------------------//getHereLandmark(-2.16667008, 53.41667175);

        getCovidResults($countryCode);// defo keep
        //getCovidData();// not used
        ///////*****----------------------------------------------------------------------------------//getWindyWebcams($countryCode);
        getNews($countryCode);// defo keep
        /////*****----------------------------------------------------------------------------------//getOpenWeatherHistory($countryCode);
        getPublicHolidays($countryCode);// defo keep

        getLandmarks($countryCode); // defo keep

        //getClimateData($countryCode); not using




        addProgress(10);                                                                                     //addProgress(10);
        
        /**-----------------------------------------------------------UNIVERSAL STATES----------------------------------------------------------------- */
        //fetchUniversalStates();
        //fetchTestData();

        /**-----------------------------------------------------------adding MAP----------------------------------------------------------------- */
        mymap = L.map('mapid', {
            center: [c.latitude, c.longitude],
            zoom: 2,
            layers: [map1, $globalClusterLayerGroup]
        });

        $mapControl = mymap;

        let $geojson = await getGeoJSON($countryCode);

        addProgress(10);                                                                                     //addProgress(10);
        
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

        addProgress(10);                                                                                     //addProgress(10);

        
       var baseMaps = {
            "<div class='roadMaps mapStyle'>Road Map</div>": map1,
            "<div class='named mapStyle'>Named Places</div>": map4,
            "<div class='nightTime mapStyle'>Night Time</div>": map5,
            "<div class='railWay mapStyle'>Railway Network</div>": map6,
            "<div class='drawnBorders mapStyle'>Drawn Borders</div>": map9,
            "<div class='satellite mapStyle'>Satellite Image</div>": map10
        };
        
        var overlayMaps = {
            //"<div class='citiesDiv mapStyle'>Cities</div><div id='cities_lds' class='lds display_lds'><div class='lds-spinner'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>": $globalCitiesLayerGroup,
            //"<div class='circleMarker mapStyle'>Circle Marker</div><div id='circle_lds' class='lds display_lds'><div class='lds-spinner'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>": $globalBoundsLayerGroup,
            //"<div class='owmLocations mapStyle'>OWM Locations</div><div id='owm_lds' class='lds display_lds'><div class='lds-spinner'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>": $globalTownsLayerGroup,
            //"<div class='countiesDiv mapStyle'>States</div><div id='counties_lds' class='lds display_lds'><div class='lds-spinner'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>": $globalUniversalLayerGroup,
            "<div class='Places mapStyle'>Default</div><div id='cluster_lds' class='lds display_lds'><div class='lds-spinner'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>": $globalClusterLayerGroup,
            "<div class='clusterMarkerDiv mapStyle'>All Markers</div><div id='battuta_lds' class='lds display_lds'><div class='lds-spinner'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>": $globalBattutaLayerGroup,
        };

        
        L.control.layers(baseMaps, overlayMaps).addTo(mymap);


        addProgress(10);                                                                                     //addProgress(10);


        /**--------------------------------------------------EASY BUTTON For Country Info----------------------------------------------------- */

        //const $countryDataPopup = L.popup().setContent($countryData);

        let countryBtn = L.easyButton( 'fas fa-info fa-2x', function() {
            //id: 'toggle-check-and-x',
            $('#countryData').modal('toggle');
        });
        
        countryBtn.button.style.width = '50px';
        countryBtn.button.style.height = '50px';
        countryBtn.button.style.border.width = '0px';
        countryBtn.button.style.borderRadius = '25px';
        countryBtn.button.style.backgroundColor = 'blue'; // repeated line (note below)
        countryBtn.button.style.color = 'white';
        countryBtn.button.style.paddingTop = '10px';
        countryBtn.button.style.border = '3px solid midnightblue';
        countryBtn.addTo(mymap);

        let covidBtn = L.easyButton( 'fas fa-virus fa-2x', function() {
            $('#covidCountryData').modal('toggle');
        });
        covidBtn.button.style.width = '50px';
        covidBtn.button.style.height = '50px';
        covidBtn.button.style.border.width = '0px';
        covidBtn.button.style.borderRadius = '25px';
        covidBtn.button.style.backgroundColor = 'yellow'; // repeated line (note below)
        covidBtn.button.style.color = 'red';
        covidBtn.button.style.paddingTop = '10px';
        covidBtn.button.style.border = '3px solid red';
        covidBtn.addTo(mymap);

        let newsBtn = L.easyButton( 'far fa-newspaper fa-2x', function() {
            $('#newsData').modal('toggle');
        });
        newsBtn.button.style.width = '50px';
        newsBtn.button.style.height = '50px';
        newsBtn.button.style.border.width = '0px';
        newsBtn.button.style.borderRadius = '25px';
        newsBtn.button.style.backgroundColor = 'green'; // repeated line (note below)
        newsBtn.button.style.color = 'white';
        newsBtn.button.style.paddingTop = '10px';
        newsBtn.button.style.border = '3px solid darkgreen';
        newsBtn.addTo(mymap);

        let holidayBtn = L.easyButton( 'far fa-calendar-times fa-2x', function() {
            $('#publicHolidayData').modal('toggle');
        });
        holidayBtn.button.style.width = '50px';
        holidayBtn.button.style.height = '50px';
        holidayBtn.button.style.borderRadius = '25px';
        holidayBtn.button.style.backgroundColor = 'white'; // repeated line (note below)
        holidayBtn.button.style.color = 'purple';
        //holidayBtn.button.style.paddingTop = '10px';
        holidayBtn.button.style.padding = '10px 0';
        holidayBtn.button.style.border = '3px solid purple';
        holidayBtn.addTo(mymap);


        addProgress(10);                                                                                     //addProgress(10);

        /**-------------------------------------------------EASY BUTTON For Creating Own Markers------------------------------------------------------------------------------- */

        $myGlobalPolylineLayer = L.layerGroup().addTo(mymap);

        const $instructData = ("<div class='easyPopup'>Click on the map to set <br>departure and arrival.<br>Then re-click the same button <br>to draw the route.</div>");
        const $instructPopup = L.popup().setContent($instructData);

        const $viewRouteData = ("<div class='easyPopup'>Select arrival markers <br>(green icons) <br>to view route directions</div>");
        const $viewRoutePopup = L.popup().setContent($viewRouteData);

        /*//Easy Button for finding Route
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

                            
                            addProgress(20);                                                            //addProgress(20)

                            let $routeData = await getRoute($origin, $destination);

                            addProgress(20);                                                            //addProgress(20)

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
        */

        addProgress(10);                                                                                     //addProgress(10);

        

        

        /**------------------------------------------------LOADER------------------------------------- */
        if($progress < 100) {
            $progress = 99;
            addProgress(1);                                                                                     //addProgress(1);
        }
        setTimeout(function() {
            $('.loaderDiv').css('display', 'none');
        }, 500);
        
        
    }

    /**------------------------------------------------END MAIN FUNC --------------------------------------------------------------------------------------------------- */



    
    /**---------------------------------------------------------------------API FUNCTIONS-------------------------------------------------------------------------- */
    async function getStormGlassData($lat, $lng) {
        let results = null;
        await $.ajax({
            url: 'PHP/getStormGlassData.php',
            type: 'POST',
            data: {
                lat: $lat,
                lng: $lng
            },
            success: function(res) {
                if(res.status.name=='ok') {
                    results = res['data'];
                }
            },
            error: function(err) {
                console.error(err);
            }
        });
        if(results) {
            //console.log("Storm Glass Data");
            //console.dir(results);

            let total = 0;
            let count = 0;
            let avg = 0;
            if(results.hours) {
                if(results.hours[0].precipitation.sg) {
                    for(let i=0; i<results.hours.length; i++) {
                        total += results.hours[i].precipitation.sg;
                        count++;
                    }
                    avg = total / count;
                }
                avg = avg*1000;//convert from kg to grams
                let rounded = Math.round((avg + Number.EPSILON) * 100) / 100
                $('#weatherDataRain').html(rounded+" grams/m²");
            }
            
        }
        
    }

    async function getClimateData($countryCode) {
        let iso3 = getIso_a3($countryCode);
        let $results = null;
        await $.ajax({
            url: 'PHP/getClimateData.php',
            type: 'POST',
            data: {
                ISO3: iso3
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            },
            error(err) {
                console.error(err);
            }
        });
        if($results) {
            console.log("Climate Data:");
            console.dir($results);
        }
    }

    async function getOpenTripData($xid) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getOpenTripData.php',
            type: 'POST',
            data: {
                xid: $xid
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            },
            error(err) {
                console.error(err);
            }
        });
        if($results) {
            //console.log("Open Trip Data");
            //console.dir($results);

            //create Image
            if($results['preview']) {
                if($results['preview']['source']) {
                    let image = document.createElement('img');
                    image.classList.add('openTripDataImage');
                    image.src = $results['preview']['source'];
                    image.alt = 'Image of landmark'
                    let div = document.getElementById('openTripDataImageDiv');
                    if(div.firstChild) {
                        div.removeChild(div.firstChild);
                    }
                    div.appendChild(image);
                }
            } else {
                let div = document.getElementById('openTripDataImageDiv');
                if(div.firstChild) {
                    div.removeChild(div.firstChild);
                }
            }  
            //create Title
            if($results['name']) {
                document.getElementById('openTripLandmarkName').innerHTML = $results['name'];
            }
            //create address table data
            if($results['address']) {
                let r = ''

                let address = document.getElementById('openTripDataAddress');

                if($results['address']['locality']) {
                    r += $results['address']['locality']+', ';
                }
                if($results['address']['city_district']) {
                    r += $results['address']['city_district']+', ';
                }
                if($results['address']['county']) {
                    r += $results['address']['county']+', ';
                }
                if($results['address']['region']) {
                    r += $results['address']['region']+', ';
                }
                if($results['address']['state_district']) {
                    r += $results['address']['state_district']+', ';
                }
                if($results['address']['country']) {
                    r += $results['address']['country']+'. ';
                }
                address.innerHTML = r;
            }
            //create Wiki table data
            if($results['wikipedia']) {
                document.getElementById('openTripDataWiki').removeChild(document.getElementById('openTripDataWiki').firstChild);
                document.getElementById('openTripDataWikiEx').innerHTML = $results['wikipedia_extracts']['html'];
                //document.getElementById('openTripDataWiki').innerHTML =  $results['wikipedia'];
                
                document.getElementById('openTripDataWiki').appendChild(document.createTextNode('  Read More...'));
                document.getElementById('openTripDataWiki').setAttribute('href', $results['wikipedia']);
                document.getElementById('openTripDataWiki').setAttribute('alt', 'Image of Landmark');
            } else if($results['wikidata']){
                if(document.getElementById('openTripDataWiki').firstChild) {
                    document.getElementById('openTripDataWiki').removeChild(document.getElementById('openTripDataWiki').firstChild);
                }
                document.getElementById('openTripDataWiki').appendChild(document.createTextNode('Wikidata: '+$results['wikidata']));
            } else {
                if(document.getElementById('openTripDataWiki').firstChild) {
                    document.getElementById('openTripDataWiki').removeChild(document.getElementById('openTripDataWiki').firstChild);
                }
                document.getElementById('openTripDataWiki').appendChild(document.createTextNode(''));
            }
            
            //create lat / long table data
            if($results['point']) {
                document.getElementById('openTripDataLatitude').innerHTML = $results['point']['lat'];
                document.getElementById('openTripDataLongitude').innerHTML = $results['point']['lon'];
            }
            //create openTripDataAnchor
            if($results['otm']) {
                document.getElementById('openTripDataAnchor').innerHTML = $results['otm'];
                document.getElementById('openTripDataAnchor').setAttribute('href', $results['otm']);
                document.getElementById('openTripDataAnchor').setAttribute('target', '_blank');

            }





        }
    }
    
   $(document).on('click', '.openTripDataBtn', async function(event) {
        //alert(event.target.id);
        $id = event.target.id;
        $xid = $id.substring(2);
        //let $tripData =
        await getOpenTripData($xid);

        $('#openTripData').modal('toggle');
        
    });

    async function getOpenWeatherData($lat, $lng, $name) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getOpenWeatherData.php',
            type: 'POST',
            data: {
                lat: $lat,
                lng: $lng
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            },
            error(err) {
                console.error(err);
            }
        });
        if($results) {
            //console.log("Open Weather Data");
            //console.dir($results);

            if($name) {
                $('#weatherDataName').html($name+" Weather Forecast");
            }
            if($results.current.dt) {
                let miliseconds = $results.current.dt * 1000;
                let newDate = new Date(miliseconds);
                let humanDateFormat = newDate.toLocaleString();
                let day = newDate.getDay();
                let date = newDate.getDate();
                let month = newDate.getMonth();
                let yr = newDate.getFullYear();
                let weekday = null;
                switch(day) {
                    case 0: weekday = 'Sunday';
                    break;
                    case 1: weekday = 'Monday';
                    break;
                    case 2: weekday = 'Tuesday';
                    break;
                    case 3: weekday = 'Wednesday';
                    break;
                    case 4: weekday = 'Thursday';
                    break;
                    case 5: weekday = 'Friday';
                    break;
                    case 6: weekday = 'Saturday';
                    break;
                }

                $('#weatherDataCurrent').html(weekday+", "+date+" / "+month+" / "+yr);
            }
            if($results.current.weather[0].description) {
                let str = '';
                let word = null;
                let arr = $results.current.weather[0].description.split(' ');
                for(let i=0; i<arr.length; i++) {
                    
                    word = arr[i];
                    word = word.toLowerCase();
                    letter = word[0];
                    letter = letter.toUpperCase();
                    str += letter+word.slice(1)+' '
                }
                $('#weatherDataDescription').html(str);
            }
            if($results.current.clouds) {
                $('#weatherDataCloudCoverage').html($results.current.clouds+'%');
            }
            if($results.current.temp) {
                let tf = $results.current.temp;
                //let tc = (tf - 32) * 5/9;
                //$('#weatherDataTemp').html(tf+'&deg; F / '+tc+'&deg; C');
                $('#weatherDataTemp').html(tf+' &deg;C');
            }
            if($results.current.feels_like) {
                let ff = $results.current.feels_like;
                //let fc = (ff - 32) * 5/9;
                //$('#weatherDataFeelsLike').html(ff+'&deg; F / '+fc+'&deg; C');
                $('#weatherDataFeelsLike').html(ff+' &deg;C');
            }
            if($results.current.pressure) {
                $('#weatherDataPressure').html($results.current.pressure+" hPa");
            }
            if($results.current.humidity) {
                $('#weatherDataHumidity').html($results.current.humidity+" %");
            }
            if($results.current.wind_speed) {
                $('#weatherDataWindSpeed').html($results.current.wind_speed+" metre/sec");
            }
            if($results.current.wind_deg) {
                let num = $results.current.wind_deg;
                let direction = null;
                
                if(67 > num && num >= 23){ 
                    direction = 'North East';
                }else if(113 > num && num >= 67) {
                    direction = 'East';
                }else if(158 > num && num >= 113) {
                    direction = 'South East';
                }else if(203 > num && num >= 158) {
                    direction = 'South';
                }else if(248 > num && num >= 203) {
                    direction = 'South West';
                }else if(293 > num && num >= 248) {
                    direction = 'West';
                }else if(338 > num && num >= 293) {
                    direction = 'North West';
                }else {
                    direction = 'North';
                }
                $('#weatherDataWindDirection').html(direction);
            }
            if($results.current.uvi || $results.current.uvi == 0) {
                $('#weatherDataUVI').html($results.current.uvi);
            }
            if($results.current.visibility) {
                $('#weatherDataVisibility').html($results.current.visibility + ' metres');
            }
            if($results.current.sunrise) {
                let mili = $results.current.sunrise * 1000;
                let date = new Date(mili);
                let hours = date.getHours();
                let minutes = date.getMinutes();
                let str = ' AM';
                if(hours > 12) {
                    hours = hours - 12 ;
                    str = ' PM';
                }
                if(minutes < 10) {
                    minutes = '0'+minutes;
                }

                $('#weatherDataSunrise').html(hours+':'+minutes+str);
            }
            if($results.current.sunset) {
                let mil = $results.current.sunset * 1000;
                let dat = new Date(mil);
                let hrs = dat.getHours();
                let mins = dat.getMinutes();
                let st = ' AM';
                if(hrs > 12) {
                    hrs = hrs - 12 ;
                    st = ' PM';
                }
                if(mins < 10) {
                    mins = '0'+mins;
                }

                $('#weatherDataSunset').html(hrs+':'+mins+st);
            }

            let hourlyDiv = document.getElementById('weatherDataHourlyDiv');
            let DailyDiv = document.getElementById('weatherDataDailyDiv');

            if($results['hourly'].length > 0) {
                //for(let i=0; i<$results['hourly'].length; i++) {

                //}
                $results['hourly'].forEach(data => {
                    //let dt = data.dt;
                    let miliseconds = data.dt * 1000;
                    let new_date = new Date(miliseconds);
                    let humanDateFormat = new_date.toLocaleString();
                    
                    let hrs = new_date.getHours();
                    let ampm;
                    if(hrs <= 12) {
                        ampm = ' AM';
                    } else {
                        hrs = hrs - 12;
                        ampm = ' PM';
                    }

                    let temp = data.temp;
                    let div = document.createElement('div');
                    div.classList.add('flex_col');
                    div.classList.add('hourlyDiv');
                    let pdate = document.createElement('p');
                    let ptemp = document.createElement('p');
                    pdate.appendChild(document.createTextNode(hrs+ampm));
                    ptemp.appendChild(document.createTextNode(temp+' \u2103'));
                    div.appendChild(ptemp);
                    div.appendChild(pdate);
                    hourlyDiv.appendChild(div);
                });
            }
            if($results['daily'].length > 0) {
                $results['daily'].forEach(data => {
                    //let date = data.dt;
                    let miliseconds = data.dt * 1000;
                    let new_date = new Date(miliseconds);
                    let humanDateFormat = new_date.toLocaleString();
                    let day = new_date.getDay();
                    switch(day) {
                        case 0: day = 'Sunday';
                        break;
                        case 1: day = 'Monday';
                        break;
                        case 2: day = 'Tuesday';
                        break;
                        case 3: day = 'Wednesday';
                        break;
                        case 4: day = 'Thursday';
                        break;
                        case 5: day = 'Friday';
                        break;
                        case 6: day = 'Saturday';
                        break;

                    }
                    //let month = new_date.getMonth();
                    //let year = new_date.getFullYear();

                    let temp2 = data.temp.max;
                    let div2 = document.createElement('div');
                    div2.classList.add('flex_col');
                    div2.classList.add('dailyDiv');
                    let pdate2 = document.createElement('p');
                    pdate2.classList.add('tac');
                    let ptemp2 = document.createElement('p');
                    ptemp2.classList.add('tac');
                    pdate2.appendChild(document.createTextNode(day));
                    ptemp2.appendChild(document.createTextNode(temp2+' \u2103'));
                    div2.appendChild(ptemp2);
                    div2.appendChild(pdate2);
                    DailyDiv.appendChild(div2);
                });
            }

            $('#weatherData').modal('toggle');
        }
    }

    $(document).on('click', '.weatherDataBtn', async function(event) {
        //alert(event.target.id);
        $id = event.target.id;
        $latlng = $id.substring(2);

        $hyphen = $latlng.indexOf('-');
        $_cityNameIndex = $latlng.indexOf('_cityName:');

        $lat = $latlng.substring(0, $hyphen);
        $lng = $latlng.substring($hyphen+1, $_cityNameIndex);
        $_cityNameIndex = $_cityNameIndex + 10;
        $_cityName = $latlng.substring($_cityNameIndex);

        //let $weatherData = await 
        getOpenWeatherData($lat, $lng, $_cityName);
        getStormGlassData($lat, $lng);
        
   });


    async function getLandmarks($countryCode) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getLandmarks.php',
            type: 'POST',
            data: {
                countryCode: $countryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            },
            error(err) {
                console.error(err);
            }
        });
        /*
        if($results) {
            let xArray = [];
            for(let i=0; i<$results.features.length; i++) {
                //xArray.push($results.features[i]['properties']['xid']);
                $results.features[i]['properties']['newID'] = i;
                let $xid = $results.features[i]['properties']['xid'];
                await $.ajax({
                    url: 'PHP/getLandmarkImages.php',
                    type: 'POST',
                    data: {
                        xid: $xid
                    },
                    success: function(res) {
                        if(res.status.name == 'ok') {
                            $results.features[i]['xidResults'] = res;
                        }
                    },
                    error(err) {
                        console.error(err);
                    }
                });
            }

        }
        */

        //console.log("Landmarks");
        //console.dir($results);
        populateWithLandmarks($results.features);
    }

    async function populateWithLandmarks($arr) {
        //$globalClusterLayerGroup
        //$globalBattutaLayerGroup

        let orangeMarker = L.ExtraMarkers.icon({
            icon: 'fa-circle',
            markerColor: 'orange',
            shape: 'circle',
            prefix: 'far'
        });
        let violetMarker = L.ExtraMarkers.icon({
            icon: 'fa-cross',
            markerColor: 'violet',
            shape: 'star',
            prefix: 'fas'
        });
        let yellowMarker = L.ExtraMarkers.icon({
            icon: 'fa-chess-rook',
            markerColor: 'yellow',
            shape: 'penta',
            prefix: 'fas'
        });
        let darkOrangeMarker = L.ExtraMarkers.icon({
            icon: 'fa-landmark',
            markerColor: 'orange-dark',
            shape: 'square',
            prefix: 'fas'
        });
        let greenMarker = L.ExtraMarkers.icon({
            icon: 'fa-industry',
            markerColor: 'green',
            shape: 'square',
            prefix: 'fas'
        });
        let cyanMarker = L.ExtraMarkers.icon({
            icon: 'fa-broadcast-tower',
            markerColor: 'cyan',
            shape: 'square',
            prefix: 'fas'
        });
        let whiteMarker = L.ExtraMarkers.icon({
            icon: 'fa-bed',
            markerColor: 'white',
            shape: 'square',
            prefix: 'fas'
        });
        let lightGreenMarker = L.ExtraMarkers.icon({
            icon: 'fa-street-view',
            markerColor: 'green-light',
            shape: 'circle',
            prefix: 'fas'
        });
        let popupContent = null;
        let $markerCluster = L.markerClusterGroup();
        let $latlng;
        let $landmarkArray = [];

        if($arr.length > 0) {
            
            for(let vbn = 0; vbn < $arr.length; vbn++) {
                
                let $easyMarker;
                
                popupContent = ("<table class='tablePopup landmarkPopup'>"+
                    "<tr><td><p class='landmarkName'>"+$arr[vbn]['properties']['name']+"</p></td></tr>"+//<th>Name:</th>
                    //"<tr><th>ID:</th><td>"+$arr[vbn]['id']+"</td></tr>"+
                    //"<tr><th>Latitude:</th><td>"+$arr[vbn]['geometry']['coordinates'][0]+"</td></tr>"+
                    //"<tr><th>Longitude:</th><td>"+$arr[vbn]['geometry']['coordinates'][1]+"</td></tr>"+
                    "<tr><td class='openTripDataTD'><div class='openTripDataBtn btn btn-primary' id='tr"+$arr[vbn]['properties']['xid']+"' >Details</div></td></tr>"+
                    //<i id='ie"+$cityID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  
                        //"<tr><td colspan='2' class='btnTD'>"+
                        //"<div class='my_btn_element' id='we"+$cityID+"' ><i id='ie"+$cityID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  Check Local Weather</div>"+
                        //"<div class='boundaryDiv noBoundary' id='ub"+$result[$zx]['longitude']+"_"+$result[$zx]['latitude']+"'> View Boundary</div>"+//<i class='fas fa-border-style fa-lg'></i>
                    //"</td></tr>"+
                    "</table>"
                );

                //possible image at https://opentripmap.com/en/card/W360503687 N26755092
                //https://commons.wikimedia.org/wiki/File:Dumfries.jpg

                //pubs,foods,  
                //industrial_facilities,railway_stations,

                $latlng = [$arr[vbn]['geometry']['coordinates'][1], $arr[vbn]['geometry']['coordinates'][0]];

                if($arr[vbn]['properties']['kinds'].includes('churches') || $arr[vbn]['properties']['kinds'].includes('religion')) {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: violetMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                } else if($arr[vbn]['properties']['kinds'].includes('fortifications')) {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: yellowMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                } else if($arr[vbn]['properties']['kinds'].includes('guest_house')) {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: whiteMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                } else if($arr[vbn]['properties']['kinds'].includes('view_points')) {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: lightGreenMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                } else if($arr[vbn]['properties']['kinds'].includes('lighthouse') || $arr[vbn]['properties']['kinds'].includes('towers')) {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: cyanMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                } else if($arr[vbn]['properties']['kinds'].includes('historic') || $arr[vbn]['properties']['kinds'].includes('monuments')) {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: darkOrangeMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                } else if($arr[vbn]['properties']['kinds'].includes('industry') || $arr[vbn]['properties']['kinds'].includes('industrial')) {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: greenMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                } else {
                    $easyMarker = L.marker($latlng, {
                        title: $arr[vbn]['properties']['name'],
                        riseOnHover: true,
                        icon: orangeMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                }


                $markerCluster.addLayer($easyMarker);
                $landmarkArray.push($easyMarker);

            }
            let $landmarkLayer = L.layerGroup($landmarkArray);
            $globalBattutaLayerGroup.addLayer($landmarkLayer);
            document.getElementById('battuta_lds').classList.remove('display_lds');
            document.getElementById('battuta_lds').classList.add('hide_lds');

            $globalClusterLayerGroup.addLayer($markerCluster);
            document.getElementById('cluster_lds').classList.remove('display_lds');
            document.getElementById('cluster_lds').classList.add('hide_lds');
        }
    }

   





    async function getPublicHolidays($countryCode) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getPublicHolidays.php',
            type: 'POST',
            data: {
                countryCode: $countryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            },
            error(err) {
                console.error(err);
            }
        });
        //console.log("Public Holidays");
        //console.dir($results);
        emptyHolidayTable();
        presentPublicHolidays($results);
    }

    function presentPublicHolidays($list) {
        if(Array.isArray($list)) {
            if($list.length > 0) {
                let $publicHolidayTable = document.getElementById('publicHolidayTable');
                let $tr = document.createElement('tr');

                let $dateTH = document.createElement('tH');
                let $dateH = document.createTextNode('Date');
                $dateTH.appendChild($dateH);

                let $nameTH = document.createElement('tH');
                let $nameH = document.createTextNode('Holiday Name');
                $nameTH.appendChild($nameH);

                let $localTH = document.createElement('tH');
                let $localH = document.createTextNode('Known As');
                $localTH.appendChild($localH);

                $tr.appendChild($dateTH);
                $tr.appendChild($nameTH);
                $tr.appendChild($localTH);

                $publicHolidayTable.appendChild($tr);

                for(let $zxc = 0; $zxc < $list.length; $zxc++) {
                    
                    let $tr = document.createElement('tr');

                    let $dateTD = document.createElement('td');
                    $dateTD.classList.add('mlpx');
                    let $dateText = document.createTextNode($list[$zxc].date);
                    $dateTD.appendChild($dateText);

                    let $nameTD = document.createElement('td');
                    let $nameText = document.createTextNode($list[$zxc].name);
                    $nameTD.appendChild($nameText);

                    let $localTD = document.createElement('td');
                    let $localText = document.createTextNode($list[$zxc].localName);
                    $localTD.appendChild($localText);

                    $tr.appendChild($dateTD);
                    $tr.appendChild($nameTD);
                    $tr.appendChild($localTD);

                    $publicHolidayTable.appendChild($tr);

                }
            } else {
                let noResultDiv = document.createElement('div');
                let noResultP = document.createElement('p');
                noResultP.classList.add('noResultParagraph');
                let noResultText = document.createTextNode('No Public Holidays Found.');
                noResultP.appendChild(noResultText);
                noResultDiv.appendChild(noResultP);
                document.getElementById('publicHolidayTable').appendChild(noResultDiv);
            }
        } else {
            let noResultDiv = document.createElement('div');
            let noResultP = document.createElement('p');
            noResultP.classList.add('noResultParagraph');
            let noResultText = document.createTextNode('No Public Holidays Found.');
            noResultP.appendChild(noResultText);
            noResultDiv.appendChild(noResultP);
            document.getElementById('publicHolidayTable').appendChild(noResultDiv);

        }
    }

    function emptyHolidayTable() {
        let $publicHolidayTable = document.getElementById('publicHolidayTable');
        let $hjk = 0;
        while($publicHolidayTable.firstChild) {
            //console.log($hjk);
            $publicHolidayTable.removeChild($publicHolidayTable.firstChild);
            //$hjk++;
        }
    }

    /*
    async function getOpenWeatherHistory($countryCode) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getOpenWeatherHistory.php',
            type: 'POST',
            data: {
                countryCode: $countryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            },
            error(err) {
                console.error(err);
            }
        });
        console.log("Open Weather History");
        console.dir($results);
    }
    */

    async function getNews($countryCode) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getNews.php',
            type: 'POST',
            data: {
                countryCode: $countryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            },
            error(err) {
                console.error(err);
            }
        });
        //console.log("News API");
        //console.dir($results);
        await emptyNews(); //removes DOM nodes from previous country news api

        //if $results['articles'].length == 0 then add single div with notice of no news found


        presentNews($results['articles']);
    }

    async function emptyNews() {
        let $hjk = 0;
        let newsBody = document.getElementById('newsBody');
        while(newsBody.firstChild) {
            //console.log($hjk);
            newsBody.removeChild(newsBody.firstChild);
            //$hjk++;
        }
    }

    async function presentNews($articles) {

        try {
            $('#newsCountryName').html('News Articles for '+$countryName);
            if($articles.length > 0) {
                for(let $mn=0; $mn < $articles.length; $mn++) {//

                    let card = document.createElement('div');
                    card.classList.add('card');
                    card.classList.add('newsCard');
                    let cardHeader = document.createElement('div');
                    cardHeader.classList.add('card-header');
                    cardHeader.id = 'heading'+($mn+1);
                    let btn = document.createElement('div');
                    btn.classList.add('newsTitle');
                    btn.classList.add('btn-block');
                    btn.classList.add('text-left');
                    btn.setAttribute('data-toggle', 'collapse');
                    btn.setAttribute('data-target', '#collapse'+($mn+1));
                    btn.setAttribute('aria-expanded', 'true');
                    btn.setAttribute('aria-controls', 'collapse'+($mn+1));
                    let titleText = $articles[$mn]['title'];
                    
                    let sourceName = $articles[$mn]['source']['name'];

                    let titleSection = document.createTextNode(titleText);
                    let sourceSection = document.createTextNode(sourceName+' - ');
                    let span = document.createElement('span');
                    span.classList.add('newsPaper');
                    span.appendChild(sourceSection);

                    btn.appendChild(span);
                    btn.appendChild(titleSection);
                    cardHeader.appendChild(btn);
                    
                    let author = $articles[$mn]['author'];
                    let authorText = '  (author: '+$articles[$mn]['author']+')';
                    let authorSection = document.createTextNode(authorText);
                    let span2 = document.createElement('span');
                    span2.classList.add('author');
                    span2.appendChild(authorSection);

                    let imgSrc = $articles[$mn]['urlToImage'];
                    
                    let imageObj = document.createElement('img');
                    imageObj.classList.add('newsImage');
                    imageObj.setAttribute('alt', 'News Article Image');

                    if(imgSrc) {
                        //let urlIndex = imgSrc.indexOf('?');
                        //imgSrc = imgSrc.substring(0,urlIndex);
                        imageObj.src = imgSrc;
                    }

                    let link = $articles[$mn]['url'];
                    let linkText = '-> Click here to read more. <-'
                    let linkSection = document.createTextNode(linkText);
                    let span3 = document.createElement('span');
                    span3.classList.add('link');
                    span3.appendChild(linkSection);
                    let anchor = document.createElement('a');
                    anchor.appendChild(span3);
                    anchor.setAttribute('href',link);
                    anchor.setAttribute('target','_blank');

                    let content = $articles[$mn]['content'];
                    if(content) {
                        let index = content.indexOf('chars]');
                        if(index > 0) {
                            let sub = content.substring(0, index);
                            let index2 = content.lastIndexOf('[');
                            content = content.substring(0, index2);
                        }
                    } else {
                        content = 'Content not found.';
                    }

                    let collapse = document.createElement('div');
                    collapse.id = 'collapse'+($mn+1);
                    collapse.classList.add('collapse');
                    //collapse.classList.add('show');
                    collapse.setAttribute('aria-labelledby', 'heading'+($mn+1));
                    collapse.setAttribute('data-parent', '#newsBody');

                    let cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');
                    cardBody.classList.add('newsDesc');
                    let bodyText = document.createTextNode(content);//$articles[$mn]['description']
                    if(imgSrc) {
                        cardBody.append(imageObj);
                    }
                    cardBody.appendChild(bodyText);
                    cardBody.appendChild(anchor);
                    if(author) {
                        cardBody.appendChild(span2);
                    }
                    collapse.appendChild(cardBody);

                    card.appendChild(cardHeader);
                    card.appendChild(collapse);

                    document.getElementById('newsBody').appendChild(card);

                }
                
            } else {
                let noResultDiv = document.createElement('div');
                let noResultP = document.createElement('p');
                noResultP.classList.add('noResultParagraph');
                let noResultText = document.createTextNode('No News Articles Found.');
                noResultP.appendChild(noResultText);
                noResultDiv.appendChild(noResultP);
                document.getElementById('newsBody').appendChild(noResultDiv);
            }
        }
        catch(err) {
            //do nothing as error will be image src not found
            console.log("Image could not be loaded: "+err);
        }
    }
    
    async function getWindyWebcams($countryCode) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getWindyWebCams.php',
            type: 'POST',
            data: {
                countryCode: $countryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            }
        });
        if($results) {
            console.log("Windy Webcams");
            console.dir($results);
        }
    }
    
    async function getCovidData() {
        let $results = null;
        await $.ajax({
            url: 'PHP/getCovidData.php',
            type: 'GET',
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            }
        });
        if($results) {
            console.log("Covid Data");
            console.dir($results);
        }
    }

    async function getCovidResults($countryCode) {
        let $results = null;
        await $.ajax({
            url: 'PHP/getPostmanCovid.php',
            type: 'POST',
            data: {
                countryCode: $countryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res['data'];
                }
            }
        });
        //console.log("COVID-19");
        //console.dir($results);
        $('#covidCountryName').html('COVID-19 Statistics For '+$results['Country']);

        let date = $results['Date'].substring(0,10);
        dateArr = date.split('-');
        let newDate = dateArr[2]+' / '+dateArr[1]+' / '+dateArr[0];

        $('#covidDate').html(newDate);
        $('#covidNewCases').html($results['NewConfirmed']);
        $('#covidNewDeaths').html($results['NewDeaths']);
        $('#covidNewRecovered').html($results['NewRecovered']);
        $('#covidTotalCases').html($results['TotalConfirmed']);
        $('#covidTotalDeaths').html($results['TotalDeaths']);
        $('#covidTotalRecovered').html($results['TotalRecovered']);
    }

    async function getRestCountry($thisCountryCode) {
        let $result = null;
        await $.ajax({
            url: 'PHP/getRestCountry.php',
            type: 'POST',
            data: {
                countryCode: $thisCountryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $result = res['data'];
                }
            },
            error: function(err) {
                console.error(err);
            }
        });

        //console.log('rest details:');
        //console.dir($result);
        
        if($result) {

            let myNode = document.getElementById('languages');
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }
            myNode = document.getElementById('borders');
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }
            myNode = document.getElementById('modalImageDiv');
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }

            $capital = $result.capital; //used when fetching data to assign capital with different marker
            $('#capital').html($result.capital);

            //$population = $result.population;
            let population = parseInt($result.population);//$result.population;// parseInt($result.population);
            //let formatter = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(population);
            $('#population').html(population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            
            //$currency = $result.currencies[0].name;
            $('#currencies').html($result['currencies'][0].name);
            $currencyCode = $result['currencies'][0].code;
            $currencySymbol = $result['currencies'][0].symbol;
            $('#exRate').html($result['currencies'][0]['symbol']);

            let $iso_a3;
            let $ctry;

            for(let bn=0; bn < $result.borders.length; bn++) {
                //$borders.push($result.borders[bn]);
                let li = document.createElement('li');

                $iso_a3 = $result.borders[bn];
                $ctry = getCountryNameIso_a3($iso_a3);

                let txtItem = document.createTextNode($ctry);
                li.appendChild(txtItem);
                document.getElementById('borders').appendChild(li);
            }

            for(let nm = 0; nm < $result.languages.length; nm++) {
                //$languages.push($result.languages[nm].name);
                let li = document.createElement('li');
                let txtItem = document.createTextNode($result.languages[nm].name);
                li.appendChild(txtItem);
                document.getElementById('languages').appendChild(li);
            }

            //$restCountryName = $result.name;
            $('#countryName').html($result.name);

            let div = document.getElementById('modalImageDiv');
            let image = document.createElement('img');
            image.src = $result['flag'];
            image.setAttribute('alt', 'Country Flag');
            image.classList.add('countryFlagImage');

            let title = document.createTextNode($result.demonym+' Flag');
            let h = document.createElement('p');
            h.classList.add('countryNameFlagTitle');
            h.appendChild(title);

            div.appendChild(image);
            div.appendChild(h);
        }
    }

    async function getBattutaData($thisCountryCode) {
        let $result = null;
        await $.ajax({
            url: 'PHP/getBattuta.php',
            type: 'POST',
            data: {
                countryCode: $thisCountryCode
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    //console.log("Battuta");
                    //console.dir(res['data']);
                    $result = res['data'];
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
        if($result) {
            //console.log("battuta: ");
            //console.dir($result);
            //const myBlueIcon = new LeafIcon({iconUrl: 'Images/my_blue_svg_icon.svg'});
            //const myPurpleIcon = new LeafIcon({iconUrl: 'Images/my_purple_svg_icon.svg'});
            //const myRedIcon = new LeafIcon({iconUrl: 'Images/my_red_svg_icon.svg'});
            let blueMarker = L.ExtraMarkers.icon({
                icon: 'fa-circle',
                markerColor: 'blue',
                shape: 'circle',
                prefix: 'far'
            });
            let capitalMarker = L.ExtraMarkers.icon({
                icon: 'fa-star',
                markerColor: 'red',
                shape: 'circle',
                prefix: 'far'
            });

            let $battutaArray = [];
            let $latlng;
            let $markerCluster = L.markerClusterGroup();
            
            for(let $zx = 0; $zx < $result.length; $zx++) {
                popupContent = ("<table class='tablePopup weatherPopup'>"+
                    "<tr><td><p class='battutaName'>"+$result[$zx]['city']+"<p></td></tr>"+
                    //"<tr><th>Latitude:</th><td>"+$result[$zx]['latitude']+"</td></tr>"+
                    //"<tr><th>Longitude:</th><td>"+$result[$zx]['longitude']+"</td></tr>"+
                    "<tr><td colspan='2' class='btnTD'>"+
                        "<div class='weatherDataBtn btn btn-success' id='wd"+$result[$zx]['latitude']+"-"+$result[$zx]['longitude']+"_cityName:"+$result[$zx]['city']+"' >Weather</div>"+//<i id='ie"+$cityID+"' class='fas fa-cloud-sun-rain fa-lg'></i>  
                    "</td></tr>"+
                    "<tr><td colspan='2' class='btnTD'>"+
                        "<div class='boundaryDiv noBoundary btn btn-primary' id='ub"+$result[$zx]['longitude']+"_"+$result[$zx]['latitude']+"'>Zoom In</div>"+//<i class='fas fa-border-style fa-lg'></i>
                    "</td></tr>"+
                    "</table>"
                );
                $latlng = [$result[$zx]['latitude'], $result[$zx]['longitude']];
                
                //console.log("country: "+$result[$zx]['city']);
                if($result[$zx]['city'].includes($capital)) {
                    //console.log($capital);
                    let $easymarker = L.marker($latlng, {
                        title: $result[$zx]['city'],
                        riseOnHover: true,
                        icon: capitalMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                    $battutaArray.push($easymarker);
                    $markerCluster.addLayer($easymarker);
                } else {
                    let $easyMarker = L.marker($latlng, {
                        title: $result[$zx]['city'],
                        riseOnHover: true,
                        icon: blueMarker
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                    /*
                    let $marker = L.marker($latlng, {
                        title: $result[$zx]['city'],
                        riseOnHover: true,
                        icon: myPurpleIcon
                    }).bindPopup(popupContent, {maxWidth: 'auto'}).setZIndexOffset(100);
                    */
                    $battutaArray.push($easyMarker);
                    $markerCluster.addLayer($easyMarker);
                }
                
                
                //$markerCluster.addLayer($marker);
                /*
                function onEachFeature(feature, layer) {
                    //if (feature.properties) {
                        layer.bindPopup($popupContent, {maxWidth: "auto"});
                    //}
                }

                $markerCluster.addLayer($latlng), {
                    onEachFeature: onEachFeature,
                    pointToLayer: function (geoJsonPoint, $latlng) {
                        return L.marker($latlng, {icon: myPurpleIcon});
                    }
                });
                
                /*
                function onEachFeature(feature, layer) {
                    if (feature.properties) {
                        layer.bindPopup($featurePopup, {maxWidth: "auto"});
                    }
                }

                $markerCluster.addLayer(L.geoJSON($placeData.features[0], {
                    onEachFeature: onEachFeature
                }));
                
                let $markerGeoJSON = L.geoJSON($placeData.features[0], {
                    onEachFeature: onEachFeature,
                    pointToLayer: function (geoJsonPoint, latlng) {
                        return L.marker(latlng, {icon: myPurpleIcon});
                    }
                });
                */

            }
            
            let $battutaLayer = L.layerGroup($battutaArray);
            $globalBattutaLayerGroup.addLayer($battutaLayer);
            document.getElementById('battuta_lds').classList.remove('display_lds');
            document.getElementById('battuta_lds').classList.add('hide_lds');

            $globalClusterLayerGroup.addLayer($markerCluster);
            document.getElementById('cluster_lds').classList.remove('display_lds');
            document.getElementById('cluster_lds').classList.add('hide_lds');
        }
        
        //return $result;
    }

    function getIso_a3($iso_a2) {
        //$globalCountryList
        for(let q = 0; q < $globalCountryList.length; q++) {
            if($iso_a2 == $globalCountryList[q]['code']) {
                return $globalCountryList[q]['iso_a3'];
            }
        }
    }

    function getCountryNameIso_a3($iso_a3) {
        for(let w = 0; w < $globalCountryList.length; w++) {
            if($iso_a3 == $globalCountryList[w]['iso_a3']) {
                return $globalCountryList[w]['name'];
            }
        }
    }


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
            return $result;
        }
        catch(err) {
            console.error(err);
        }
    }

    async function getHereLandmark($lat, $lng) {
        let $result = null;

        await $.ajax({
            url: 'PHP/getHereLandmark.php',
            type: 'POST',
            data: {
                lat: $lat,
                lng: $lng
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $result = res['data'];
                }
            },
            error: function(err) {
                console.error(err);
            }
        });
        console.log("getHereLandmark");
        console.dir($result);
    }


    async function getRoute($origin, $destination) {
        try {

            $access_token = await getHereToken();
            //console.log($access_token);
            if($access_token === null) {
                console.log("access_token = null");
                return null;
            }
            let $result;
            await $.ajax({
                url: 'PHP/getRoute.php',
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
            //console.log($access_token);
            let $results = await $.ajax({
                url: 'PHP/getHere.php',
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

                let latlng = [$cities[$i]['lat'], $cities[$i]['lng']];
                let $circle = L.circleMarker(latlng, {radius: 20, color: 'deeppink'});
                $boundsArray.push($circle);

            }
       }
       $globalCitiesLayer = new L.layerGroup($citiesArray);
       $globalCitiesLayerGroup.addLayer($globalCitiesLayer);
       document.getElementById('cities_lds').classList.remove('display_lds');
       document.getElementById('cities_lds').classList.add('hide_lds');
       
       $globalTownsLayer = new L.layerGroup($townsArray);
       $globalTownsLayerGroup.addLayer($globalTownsLayer);
       document.getElementById('owm_lds').classList.remove('display_lds');
       document.getElementById('owm_lds').classList.add('hide_lds');

       $globalBoundsLayer = new L.layerGroup($boundsArray);
       $globalBoundsLayerGroup.addLayer($globalBoundsLayer);
       document.getElementById('circle_lds').classList.remove('display_lds');
       document.getElementById('circle_lds').classList.add('hide_lds');
       
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
        //document.getElementById('owm_lds').classList.remove('display_lds');
        //document.getElementById('owm_lds').classList.add('hide_lds');
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

    async function fetchUniversalStates() {

        $universalStates = await getUniversalStates($countryName);

        let $markerCluster = L.markerClusterGroup();
        $universalDataArray = []; 

        myPurpleIcon = new LeafIcon({iconUrl: 'Images/my_purple_svg_icon.svg'});

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
                    }));
                    
                    let $markerGeoJSON = L.geoJSON($placeData.features[0], {
                        onEachFeature: onEachFeature,
                        pointToLayer: function (geoJsonPoint, latlng) {
                            return L.marker(latlng, {icon: myPurpleIcon});
                        }
                    });

                    $universalDataArray.push($markerGeoJSON);
                    
                } else {
                    continue;
                }
               
        }//end for

        $globalClusterLayerGroup.addLayer($markerCluster);
        document.getElementById('cluster_lds').classList.remove('display_lds');
        document.getElementById('cluster_lds').classList.add('hide_lds');

        let $universalLayer = L.layerGroup($universalDataArray);
        $globalUniversalLayerGroup.addLayer($universalLayer);
        document.getElementById('counties_lds').classList.remove('display_lds');
        document.getElementById('counties_lds').classList.add('hide_lds');

        
    }

    async function fetchTestData() {

        let $universalDataArray2 = [];
        $placeData1 = await getOpenCage('Little Bollington', 'gb');
        console.dir($placeData1);
        myTestPurpleIcon = new LeafIcon({iconUrl: 'Images/my_purple_svg_icon.svg'});
        
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
            onEachFeature: onEachFeature,
            pointToLayer: function (geoJsonPoint, latlng) {
                return L.marker(latlng, {icon: myTestPurpleIcon});
            }
        });
        $universalDataArray2.push($placeGeoJSON);
        let $universalLayer2 = L.layerGroup($universalDataArray2);
        $globalUniversalLayerGroup.addLayer($universalLayer2);
        document.getElementById('counties_lds').classList.remove('display_lds');
        document.getElementById('counties_lds').classList.add('hide_lds');

        console.log("OpenCage Rate: "+$openCageRate);
    }

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
                //console.log("currency");
                //console.dir($currencyInfo['rates'][$currencyCode]);

                $displayRate = $currencyInfo['rates'][$currencyCode];
                $('#exRate').html($currencySymbol+ ' '+$displayRate + " = $1 (USD)");

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
                //console.log("currency");
                //console.dir($rates['data']);
                $currencyInfo = $rates['data'];
                return true;
            }
        }
        catch(err) {
            //console.error(err);
            $currencyInfo = null;
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
                return $boundingBox['data']; 
            }  
        }
        catch(err) {
            console.error(err);
        }
    }



    function getCountryName($countryCode) {
        let $name = "country name not found";
        for(let k = 0; k < $globalCountryList.length; k++) {
            if($countryCode === $globalCountryList[k]['code']) {
                $name = $globalCountryList[k]['name'];
            }
        }
        return $name;
    }

    /*
    async function countryOutline($countryName) {
        let $geojson = await getGeoJSON($countryName);
        return $geojson;
    }
    */

    async function populateCountryList() {
        let $result = null;
        await $.ajax({
            url: 'PHP/getGeojsonCountryList.php',
            success: function(res) {
                $result = res;
            },
            error(err) {
                console.error(err);
            }
        });
        if($result.status.name == 'ok') {
            $globalCountryList = $result['data'];
            
            let currentLocation = await get();//get current geo location
            let currentCountryCode = await getCountryCode(currentLocation.coords.latitude, currentLocation.coords.longitude);//get countrycode from geo location
            
            $globalCountryList.forEach(item => {
                let $opt = document.createElement('option'); //create an option for the drop down list
                $opt.value = item.code;
                //let $p = document.createElement('p');
                //$p.innerHTML = item.name;
                let $text = document.createTextNode(item.name);
                $opt.appendChild($text);
                
                //$opt.appendChild($p);
                
                $('#navDropDown').append($opt);
            });

            //$countryCode = currentCountryCode;
            
            //$('#navDropDown option[value='+currentCountryCode+']').attr('selected','selected');//set country as selected option on drop down list
            $('#navDropDown option[value='+currentCountryCode+']').attr('selected','selected');
            //select.options[select.selectedIndex].style.backgroundColor = 'red';
        }
    }

    async function getAllGeonameCountries() {
        try {
            $result = await $.ajax({
                url: "PHP/getCountryList.php"
                //"/WorldMap/PHP/getCountryList.php"
            });
            if($result.status.name == "ok") {

                $globalCountryList = $result['data'];//saves country list in globally declared variable

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
        return $globalCountryList;
        /*
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
        */
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
        for(let i = 0; i < $globalCountryList.length; i++) {
            if($countryCode === $globalCountryList[i]['countryCode']) {
                $north = $globalCountryList[i]['north'];
                $south = $globalCountryList[i]['south'];
                $east = $globalCountryList[i]['east'];
                $west = $globalCountryList[i]['west'];
            }
        }
        $obj = {north: $north, south: $south, east: $east, west: $west};
        return $obj;
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




    async function setNewCountry($thisCountryCode, $thisCountryName) {

        //console.log("setNewCountry: "+$thisCountryCode, $thisCountryName);

       try {
            $('.loaderDiv').css('display', 'flex');
            // 5 lines below set #currencyDropDown list value
            /*
            let $c = 'United States';
            if($countryCode === 'US') {
                $c = 'United Kingdom';
            } 
            */

            //$("#CurrencyDropDown option:contains(" + $c +")").attr('selected','selected');
            //below we set new country
            $result = await $.ajax({
                url: "/WorldMap/PHP/getLatLong.php",
                type: 'POST',
                data: {
                    //country: "'"+$countryName+"'",
                    countryCode: "'"+$thisCountryCode+"'"
                }
            });
            if($result.status.name == "ok") {
                
                $lat = $result['data'][0]['lat'];
                $lng = $result['data'][0]['lng'];
                //console.log("LAT: "+$lat+", LNG: "+$lng);
                $latlng = {
                    latitude: $lat,
                    longitude: $lng,
                    countryName: $thisCountryName
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
        let c = await get();//get current location
        main(c.coords);
    }
    
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

    async function getOpenTripPlaces($lat, $lng) {
        //console.log("here");
        //console.log($lat,$lng);
        let $results = null;
        await $.ajax({
            url: 'PHP/getOpenTripPlaces.php',
            type: 'POST',
            data: {
                radius: 1,
                lat: $lat,
                lon: $lng
            },
            success: function(res) {
                if(res.status.name == 'ok') {
                    $results = res.data;
                }
            },
            error: function(err) {
                console.error(err);
            }
            
        });
        if($results) {
            //console.log("Open Trip Places");
            //console.dir($results);
        }
    }

    //view place polygon
    $(document).on('click', '.boundaryDiv', async function(event) {
        let $id = event.target.id;
        //console.log("boundaryDiv id: "+$id);
        let $element = document.getElementById($id);
        
        let $str = $id.substring(2);
        let $arr = $str.split('_');
        let $lat = $arr[0];
        let $lng = $arr[1];

        //get local objects


        let $shapeData = await getHereShapes($lat, $lng);

        //console.log("shape data");
        //console.dir($shapeData);

        if($shapeData.result === 'noShape') {
            if($element.classList.contains('noBoundary')) {
                
                let $bounds = [ [$shapeData.bounds.BottomRight.Latitude,$shapeData.bounds.BottomRight.Longitude], [$shapeData.bounds.TopLeft.Latitude,$shapeData.bounds.TopLeft.Longitude] ];

                let lat_max = $shapeData.bounds.BottomRight.Latitude;
                let lat_min = $shapeData.bounds.TopLeft.Latitude;
                let lon_max = $shapeData.bounds.TopLeft.Longitude;
                let lon_min = $shapeData.bounds.BottomRight.Longitude;

                //getOpenTripPlaces($lat, $lng);
                //let lon_min = $shapeData.bounds.BottomRight.Longitude;
                //let lat_min = $shapeData.bounds.BottomRight.Latitude;
                //let lon_max = $shapeData.bounds.TopLeft.Longitude;
                //let lat_max = $shapeData.bounds.TopLeft.latitude;
                //getOpenTripBbox($bounds[1][0],$bounds[1][1],$bounds[0][1],$bounds[0,0]);
                // getOpenTripBbox(lon_min,lon_max,lat_min,lat_max)

                
                //getOpenTripBbox($bounds[1][1], $bounds[1][0],$bounds[1][1],$bounds[0][1]);
                let objects = getOpenTripBbox(lon_max,lon_min,lat_max,lat_min);
                if(objects.features) {
                    populateOpenTripObjects(objects.features);
                }

                //console.dir('xxxx: '+$bounds[1][0]+', '+$bounds[0][0]+', '+$bounds[0][1]+', '+$bounds[1][1]);
                //console.log("shape Data");
                //console.dir($shapeData);

                $mapControl.flyToBounds($bounds);
                $element.classList.remove('noBoundary');
                $element.innerHTML = 'Zoom Out';
            } else {
                $mapControl.flyToBounds($globalFeatureGroup.getBounds());
                $element.classList.add('noBoundary');
                $element.innerHTML = 'Zoom In';
            }

        } else {
        
            if($element.classList.contains('noBoundary')) {
                if($polygonLayer) {
                    $mapControl.removeLayer($polygonLayer);
                }

                await getOpenTripPlaces($lat, $lng);
                
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

                $bounds = $pga[$index].getBounds();
                
                let lat_min = $bounds._southWest.lat;
                let lat_max = $bounds._northEast.lat;
                let lon_min = $bounds._southWest.lng;
                let lon_max = $bounds._northEast.lng;
                let openTripResponse = await getOpenTripBbox(lon_min,lon_max,lat_min,lat_max);

                if(openTripResponse['features']) {
                    populateOpenTripObjects(openTripResponse['features']);
                }
                

                $polygonLayer = $newLayer;
                $mapControl.fitBounds($pga[$index].getBounds());
                //$mapControl.flyToBounds($pga[$index].getBounds());

                
                //setTimeout(() => {
                //    $polygonLayer.addTo($mapControl);
                //}, 2000);
                
                $element.classList.remove('noBoundary');
                $element.innerHTML = 'Zoom Out';
                
            } else {
                $mapControl.removeLayer($polygonLayer);
                $mapControl.flyToBounds($globalFeatureGroup.getBounds());
                //$mapControl.fitBounds($globalFeatureGroup.getBounds());
                $globalOpenTripLayerGroup.clearLayers();
                $element.classList.add('noBoundary');
                $element.innerHTML = 'Zoom In';
            }
        
        }

    });

    

    async function getOpenTripBbox(lon_min,$lon_max,lat_min,$lat_max) {
        //console.log('lon_min: '+lon_min);
        //console.log('lon_max: '+$lon_max);
        //console.log('lat_min: '+lat_min);
        //console.log('lat_max: '+$lat_max);
        //console.log(':)');
        let $results = null;
        await $.ajax({
            url: 'PHP/getOpenTripBbox.php',
            type: 'POST',
            data: {
                lon_min: lon_min,
                lon_max: $lon_max,
                lat_min: lat_min,
                lat_max: $lat_max
            },
            success: function(res) {
                if(res['status']['name'] == 'ok') {
                    $results = res.data;
                }
            },
            error: function(err) {
                console.error(err);
            }
        });
        if($results) {
            //console.log("get Open Trip Bbox");
            //console.dir($results);
            return $results;
        }
    }

     
    function populateOpenTripObjects(arr) {
        $globalOpenTripLayerGroup.clearLayers();
        let otObjects = [];
        let latlng;

        if(arr.length > 0) {
            for(let ing=0; ing < arr.length; ing++) {

                let $marker;
                
                popupContent = ("<table class='tablePopup OTObjectsPopup'>"+
                    "<tr><td><p class='OPObjectsName'>"+arr[ing]['properties']['name']+"</p></td></tr>"+//<th>Name:</th>
                    "<tr><td class='openTripDataTD'><div class='openTripDataBtn btn btn-primary' id='tr"+arr[ing]['properties']['xid']+"' >Details</div></td></tr>"+
                    "</table>"
                );

                latlng = [arr[ing]['geometry']['coordinates'][1], arr[ing]['geometry']['coordinates'][0]];

                if(arr[ing]['properties']['kinds'].includes('churches') || arr[ing]['properties']['kinds'].includes('religion')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'deeppink'
                    }).bindPopup(popupContent, {minWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('cemeteries') || arr[ing]['properties']['kinds'].includes('burial_places')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'purple'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('guest_house') || arr[ing]['properties']['kinds'].includes('accomodations')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'yellow'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('mountain_peaks') || arr[ing]['properties']['kinds'].includes('natural') || arr[ing]['properties']['kinds'].includes('geological_formations')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'darkgreen'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('architecture') || arr[ing]['properties']['kinds'].includes('towers') || arr[ing]['properties']['kinds'].includes('other_towers')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'red'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('tumuluses') || arr[ing]['properties']['kinds'].includes('burial_places') || arr[ing]['properties']['kinds'].includes('archaeology')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'brown'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('other') || arr[ing]['properties']['kinds'].includes('unclassified') || arr[ing]['properties']['kinds'].includes('tourist')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'grey'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('defensive') || arr[ing]['properties']['kinds'].includes('fortifications')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'orange'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else if(arr[ing]['properties']['kinds'].includes('historic') || arr[ing]['properties']['kinds'].includes('other_building')) {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'orange'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                } else {
                    $marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'blue'
                    }).bindPopup(popupContent, {maxWidth: 'auto'});//.setZIndexOffset(100);
                }
                otObjects.push($marker);

            }
        }

        
                //cemeteries,historic,burial_places
                //mountain_peaks,interesting_places,natural,geological_formations, nature_reserves
                //view_points,other
                //architecture,towers,interesting_places,other_towers
                //tumuluses,historic,burial_places,archaeology
                //other,unclassified_objects,interesting_places,tourist_object
                //defensive_walls,historic,fortifications

        let openTripGroup = L.layerGroup(otObjects);
        $globalOpenTripLayerGroup.addLayer(openTripGroup);
        $globalOpenTripLayerGroup.addTo($mapControl);

    }

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

    
    //starting point
    //getAllGeonameCountries();
    populateCountryList();
    begin();

    /*
    var select = document.getElementById('navDropDown');
    select.onchange = function() {
        select.options[select.selectedIndex].style.backgroundColor = 'red';
    }
    */
    

});
