<?php

require 'myCredentials.php';
$APIKEY = $abstractApiHolidays;


$date = getDate();
$year = $date['year'];

//$url = 'https://holidays.abstractapi.com/v1?api_key='.$APIKEY.'&country=GB';//&year='.$year;
$url = 'https://date.nager.at/api/v2/publicholidays/'.$year.'/'.$_REQUEST['countryCode'];

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

?>