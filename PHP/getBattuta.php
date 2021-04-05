<?php
require 'myCredentials.php';

$APIKEY = $battutaAPIKey;


$url = 'http://battuta.medunes.net/api/region/'.$_REQUEST['countryCode'].'/all/?key='.$APIKEY;//&apiKey='.$APIKEY;

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


$arr = [];
for($i = 0; $i < sizeof($decode); $i++) {
    $url = 'http://battuta.medunes.net/api/city/'.$_REQUEST['countryCode'].'/search/?region='.urlencode($decode[$i]['region']).'&key='.$APIKEY;

    $executionStartTime = microtime(true) / 1000;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

    $newResult=curl_exec($ch);

    curl_close($ch);

    $newDecode = json_decode($newResult,true);

    for($o=0; $o < sizeof($newDecode); $o++) {
        array_push($arr, $newDecode[$o]);
    }
    
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "places received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $arr;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 