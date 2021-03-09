<?php

$name = $_REQUEST['name'];

$executionStartTime = microtime(true) / 1000;
$domain = $_SERVER['HTTP_HOST'];
$currentDirectory = dirname(dirname($_SERVER['PHP_SELF']));
$url = $domain.$currentDirectory.'/JSON/countryBorders.geo.json';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

$index = 0;
for($n = 0; $n < sizeof($decode['features']); $n++) {
    
    if($name === "'".$decode['features'][$n]['properties']['iso_a2']."'") {
        $index = $n;
    } 
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "borders received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode['features'][$index];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>