<?php
require 'myCredentials.php';
$APIKEY = $weatherStackApiKey;

$date = getDate();

$startDate = null;
$endDate = null;

//print_r($date);
$day = $date['mday'];
$month = $date['mon'];
$year = $date['year'];
$lastMonth = $month==='1' ? '12' : $month-1;
$lastYear = $year - 1;
echo $lastYear.' '.$lastMonth.' '.$day;

$startDate = $day.'-'.$lastMonth.'-'.$lastYear;
$endDate = $day.'-'.$month.'-'.$lastYear;

//it turns out that this api doesnt allow searchers per year for free plans, you must be more precise with date.

$url = 'http://api.weatherstack.com/historical?access_key='.$APIKEY.'&query=GB&historical_date_start='.$startDate.'&historical_date_end='.$endDate;//2015-01-25

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