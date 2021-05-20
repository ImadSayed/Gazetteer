<?php


//type: annualavg, mavg, annualanom
//var: pr or tas
//start: 2020
//end 2021
// ISO3 country code,


$url = 'http://climatedataapi.worldbank.org/climateweb/rest/v1/country/annualavg/tas/1980/1999/gbr?format=json';

//$url = 'http://climatedataapi.worldbank.org/climateweb/rest/v1/country/'.$_REQUEST['type'].'/'.$_REQUEST['var'].'/'.$_REQUEST['start'].'/'.$_REQUEST['end'].'/'.$_REQUEST['ISO3'];

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