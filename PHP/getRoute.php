<?php

require 'FlexiblePolyline.php';
require 'myCredentials.php';

$APIKEY = $hereAPIKEY;

/*
  pedestrian, car, truck, bicycle and scooter
  summary or travelSummary
 
  Authorization: Bearer eyJhbGceOyJSAMPLEiIsImN0eSISAMPLEt7VTFIllwIM0cKNCjN2WCCTqlwEEmk-t3gx1BpqUFoeBSAMPLEvhj8nl-RBGcyoljY...
  Cache-Control: no-cache
  */

$url = 'https://router.hereapi.com/v8/routes?transportMode=car&destination='.$_REQUEST['destinationLat'].','.$_REQUEST['destinationLng'].'&origin='.$_REQUEST['originLat'].','.$_REQUEST['originLng'].'&return=polyline,actions,instructions&apiKey='.$APIKEY;//&return=travelSummary


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

$data = $decode["routes"][0]["sections"][0]["polyline"];



$dataArray = FlexiblePolyline::decode($data);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "borders received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['polyline'] = $dataArray;
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
