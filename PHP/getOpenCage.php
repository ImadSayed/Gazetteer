<?php
//https://api.opencagedata.com/geocode/v1/json?q=LAT+LNG&key=YOUR-API-KEY
require 'myCredentials.php';

$key = $openCageAPIKEY;

$executionStartTime = microtime(true) / 1000;

//good info
//$url='https://api.opencagedata.com/geocode/v1/geojson?q=all&countrycode=gb&limit=100&key='.$key;
//urlencode('manchester village')

//$url='https://api.opencagedata.com/geocode/v1/json?q='.$_REQUEST['lat'].'+'.$_REQUEST['lng'].'&key='.$key;

$placeName = $_REQUEST['placeName'];
$countryCode = $_REQUEST['countryCode'];

$url='https://api.opencagedata.com/geocode/v1/geojson?q='.urlencode($placeName).'&countrycode='.urlencode($countryCode).'&limit=100&no_annotations=1&key='.$key;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "borders received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);