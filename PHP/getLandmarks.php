<?php
require 'myCredentials.php';

$APIKEY = $geonamesUsername;

$url = 'http://api.geonames.org/countryInfoJSON?country='.$_REQUEST['countryCode'].'&username='.$APIKEY;
//$url = 'http://api.geonames.org/countryInfoJSON?username=imadsayed';

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

$north = $decode['geonames'][0]['north'];
$south = $decode['geonames'][0]['south'];
$east = $decode['geonames'][0]['east'];
$west = $decode['geonames'][0]['west'];

//lon_min='.$west
//lat_min='.$south.'
//lon_max='.$east
//lat_max='.$north

// -90 to 90 for latitude and -180 to 180 for longitude.

if($west > $east) {
    $east = 180;
}


$OpenAPIKEY = $openTripMapApiKey;

$url = 'https://api.opentripmap.com/0.1/en/places/bbox?lon_min='.$west.'&lat_min='.$south.'&lon_max='.$east.'&lat_max='.$north.'&format=geojson&apikey='.$OpenAPIKEY;//&kinds='.$_REQUEST['landmark'].'

//&kinds=museums,cultural,religion,churches,historic_architecture,interesting_places
//&rate=2

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);
/*
foreach ($decode['features'] as $feature) {
    $xid = $feature['properties']['xid'];
    $url = 'https://api.opentripmap.com/0.1/en/places/xid/'.$xid.'?apikey='.$OpenAPIKEY;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);
    $decodedResult = json_decode($result,true);
    if($decodedResult) {
        $feature['properties']['xidResult'] = $decodedResult;
    }
    
}
*/




$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "results received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 
//echo $decode;