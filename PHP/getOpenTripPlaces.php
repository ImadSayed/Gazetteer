<?php

require 'myCredentials.php';
$APIKEY = $openTripMapApiKey;

// $url = 'https://api.opentripmap.com/0.1/en/places/radius?radius='.$_REQUEST['radius'].'&lon='.$_REQUEST['lon'].'&lat='.$_REQUEST['lat'].'&format=geojson&apikey='.$APIKEY;
$url = 'https://api.opentripmap.com/0.1/en/places/radius?radius=1000&lon=53.3901701&lat=-2.2082303&format=geojson&apikey='.$APIKEY;

//$url = 'https://api.opentripmap.com/0.1/en/places/bbox';

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);



$decode = json_decode($result,true);



$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "results received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 