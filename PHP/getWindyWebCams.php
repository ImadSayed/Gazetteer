<?php
require 'myCredentials.php';
$APIKEY = $windyWebCamsAPIKey;


$executionStartTime = microtime(true) / 1000;

$url='https://api.windy.com/api/webcams/v2/list/country='.$_REQUEST['countryCode'];

$header = [ 
    "x-windy-key: ".$APIKEY
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_HTTPHEADER,$header);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);


$url = 'https://api.windy.com/api/webcams/v2/list/webcam={webcamid}[,{webcamid}...]';

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "results received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 
?>
