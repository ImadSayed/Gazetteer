<?php

require 'myCredentials.php';

$APIKEY = $hereAPIKEY;

$url = 'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?apiKey='.$APIKEY.'&mode=retrieveLandmarks&prox='.$_REQUEST['lng'].','.$_REQUEST['lat'].',1000';

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

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
?>