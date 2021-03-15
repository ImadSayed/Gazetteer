<?php
    require 'myCredentials.php';

    $APIKEY = $hereAPIKEY;

    $url = 'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?prox='.$_REQUEST['lng'].','.$_REQUEST['lat'].'&mode=retrieveAddresses&maxresults=5&additionaldata=includeShapeLevel,postalCode&gen=9';//&apiKey='.$APIKEY;

    $executionStartTime = microtime(true) / 1000;

    
    $header = array(
        "Authorization: Bearer ".$_REQUEST['access_token'],
        "Cache-Control: no-cache"
    );

	$ch = curl_init();
    //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);

	$result=curl_exec($ch);
	
	curl_close($ch);

    $decode = json_decode($result,true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "places received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

    /*
    "{
        "status":{
            "code":"200",
            "name":"ok",
            "description":"places received",
            "returnedIn":"1612982.2456871 ms"
        },
        "data":{
            "Response":{
                "MetaInfo":{
                    "Timestamp":"2021-03-01T11:07:21.925+0000",
                    "NextPageInformation":"2"
                },
                "View":[
                    {
                        "_type":"SearchResultsViewType",
                        "ViewId":0,
                        "Result":[
                            {
                                "Relevance":1,
                                "Distance":-3166.9000000000001,
                                "Direction":353,
                                "MatchLevel":"district",
                                "MatchQuality":{
                                    "Country":1,
                                    "State":1,
                                    "County":1,
                                    "City":1,
                                    "District":1,
                                    "PostalCode":1
                                },
                                "Location":{
                                    "LocationId":"NT_Is75LeAEDuVVBYsYgHlOUA",
                                    "LocationType":"area",
                                    "DisplayPosition":{
                                        "Latitude":53.479599999999998,
                                        "Longitude":-2.2487400000000002
                                    },
                                    "MapView":{
                                        "TopLeft":{
                                            "Latitude":53.57253,
                                            "Longitude":-2.4549799999999999
                                        },
                                        "BottomRight":{
                                            "Latitude":53.347020000000001,
                                            "Longitude":-2.0232100000000002
                                        }
                                    },
                                    "Address":{
                                        "Label":"Manchester, England, United Kingdom",
                                        "Country":"GBR",
                                        "State":"England",
                                        "County":"Lancashire",
                                        "City":"Manchester",
                                        "District":"Manchester",
                                        "PostalCode":"M3 3",
                                        "AdditionalData":[
                                            {
                                                "value":"United Kingdom",
                                                "key":"CountryName"
                                            },
                                            {
                                                "value":"England",
                                                "key":"StateName"
                                            },
                                            {
                                                "value":"Lancashire",
                                                "key":"CountyName"
                                            }
                                        ]
                                    },
                                    "MapReference":{
                                        "ReferenceId":"27268611",
                                        "MapId":"UWAM20151",
                                        "MapVersion":"Q1\/2020",
                                        "MapReleaseDate":"2021-02-06",
                                        "SideOfStreet":"neither",
                                        "StateId":"20248595",
                                        "CountyId":"20343938",
                                        "CityId":"20344206",
                                        "DistrictId":"20344207"
                                    },
                                    "Shape":{
                                        "_type":"WKTShapeType",
                                        "Value":"MULTIPOLYGON (
                                            (
                                                (-2.24955 53.47833, -2.25015 53.47843, -2.25182 53.47872, -2.25216 53.47878, -2.25315 53.47895, -2.25367 53.47905, -2.25387 53.47909, -2.25423 53.47916, -2.25438 53.47921, -2.25454 53.47931, -2.25462 53.47938, -2.25473 53.47948, -2.2549 53.47965, -2.25514 53.47989, -2.25533 53.48008, -2.25553 53.47995, -2.25567 53.48008, -2.25572 53.48013, -2.25575 53.48044, -2.25559 53.48055, -2.25543 53.48063, -2.25494 53.48083, -2.25445 53.48106, -2.25403 53.48124, -2.25338 53.4815, -2.25327 53.48152, -2.25287 53.48163, -2.25276 53.48167, -2.25283 53.4817, -2.25298 53.48176, -2.25314 53.48184, -2.25324 53.4819, -2.25285 53.48205, -2.251 53.48259, -2.25078 53.48234, -2.2507 53.48226, -2.25039 53.4819, -2.25012 53.48182, -2.25023 53.48162, -2.25028 53.4815, -2.25032 53.48143, -2.25021 53.48141, -2.25012 53.4814, -2.24998 53.48137, -2.24985 53.48135, -2.24992 53.48125, -2.24997 53.48117, -2.24936 53.48105, -2.24881 53.48096, -2.24863 53.48093, -2.24804 53.48083, -2.24812 53.48067, -2.24815 53.48062, -2.24825 53.48043, -2.24834 53.48025, -2.24841 53.48012, -2.24845 53.48003, -2.24782 53.47993, -2.24753 53.47979, -2.24734 53.4797, -2.24799 53.47973, -2.24711 53.4796, -2.24687 53.4795, -2.247 53.47917, -2.24885 53.47943, -2.24909 53.47913, -2.24925 53.47889, -2.24941 53.47863, -2.24955 53.47833), 
                                                (-2.25316 53.48055, -2.25285 53.48028, -2.25269 53.48014, -2.25262 53.48025, -2.25253 53.48043, -2.25242 53.48069, -2.25213 53.48134, -2.25205 53.48154, -2.25227 53.48154, -2.25238 53.48149, -2.25285 53.48124, -2.25316 53.48055)
                                            )
                                        )"
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    }"
    */
?>

