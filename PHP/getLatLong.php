<?php

require 'myCredentials.php';

$username = $geonamesUsername;

$executionStartTime = microtime(true) / 1000;

$url='../JSON/countryBorders.geo.json';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

$country = $_REQUEST['country'];
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