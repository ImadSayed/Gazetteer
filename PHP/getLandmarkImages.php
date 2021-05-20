<?php

require 'myCredentials.php';

$APIKEY = $openTripMapApiKey;

//$arr = $_REQUEST['xid_array'];
//$dataArray = [];


$executionStartTime = microtime(true) / 1000;
$xid = $_REQUEST['xid'];//'W238385297';

$url = 'https://api.opentripmap.com/0.1/en/places/xid/'.$xid.'?apikey='.$APIKEY;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

//print_r($decode);
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "results received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 