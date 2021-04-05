<?php

require 'myCredentials.php';

$username = $geonamesUsername;

$executionStartTime = microtime(true) / 1000;

$countryCode = $_REQUEST['countryCode'];

$executionStartTime = microtime(true) / 1000;
$url2='http://api.geonames.org/searchJSON?country='.$countryCode.'&maxRows=1&username='.$username;

$ph = curl_init();
curl_setopt($ph, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ph, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ph, CURLOPT_URL,$url2);

$result=curl_exec($ph);

curl_close($ph);

$decode = json_decode($result,true);	


$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "borders received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode['geonames'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>