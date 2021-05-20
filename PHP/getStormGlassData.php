<?php


require 'myCredentials.php';
$APIKEY = $stormGlassApiKey;

$executionStartTime = microtime(true) / 1000;

$date = date('U');

$d=strtotime("-10 Days");
$oldDate = date("U", $d);

//echo 'date: '.$date;
//echo '<br><br>';
//echo 'old: '.$oldDate;
//echo '<br><br>';



$url = 'https://api.stormglass.io/v2/weather/point?lat='.$_REQUEST['lat'].'&lng='.$_REQUEST['lng'].'&params=precipitation,airTemperature&start='.$oldDate.'&end='.$date;


$header = array(
    "Authorization: ".$APIKEY
);



$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
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
$output['status']['description'] = "results received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 