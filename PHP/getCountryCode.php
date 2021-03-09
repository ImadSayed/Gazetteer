<?php
/*http://api.geonames.org/countryCode?lat=47.03&lng=10.2&username=demo*/

require 'myCredentials.php';

$username = $geonamesUsername;

$executionStartTime = microtime(true) / 1000;

$url='http://api.geonames.org/countryCodeJSON?lat='.$_REQUEST['lat'].'&lng='.$_REQUEST['lng'].'&username='.$username;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "borders received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

//echo $decode;
//var_dump($decode);

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);








?>