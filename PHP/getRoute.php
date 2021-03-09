<?php

require 'FlexiblePolyline.php';
require 'myCredentials.php';

$APIKEY = $hereAPIKEY;

/*
  pedestrian, car, truck, bicycle and scooter
  summary or travelSummary
 */

$url = 'https://router.hereapi.com/v8/routes?transportMode=car&destination='.$_REQUEST['destinationLat'].','.$_REQUEST['destinationLng'].'&origin='.$_REQUEST['originLat'].','.$_REQUEST['originLng'].'&return=polyline,actions,instructions&apiKey='.$APIKEY;//&return=travelSummary


$executionStartTime = microtime(true) / 1000;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

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
