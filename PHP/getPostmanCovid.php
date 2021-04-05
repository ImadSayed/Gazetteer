<?php

$executionStartTime = microtime(true) / 1000;

//$url = 'https://api.covid19api.com/live/country/'.$_REQUEST['countryCode'].'/status/confirmed';
//$url = 'https://api.covid19api.com/country/'.$_REQUEST['countryCode'].'/status/confirmed/live?from=2020-03-01T00:00:00Z&to=2021-03-30T00:00:00Z';
$url = 'https://api.covid19api.com/summary';

//X-Access-Token 5cf9dfd5-3449-485e-b5ae-70a60e997864

$header = [ 
    "X-Access-Token: 5cf9dfd5-3449-485e-b5ae-70a60e997864"
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

$countryCode = $_REQUEST['countryCode'];
$indexOfCountry = null;
for($i=0; $i < sizeof($decode['Countries']); $i++) {
    if($decode['Countries'][$i]['CountryCode'] == $countryCode) {
        $indexOfCountry = $i;
    }
}
$countryData = null;
if($indexOfCountry) {
    $countryData = $decode['Countries'][$indexOfCountry];
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "results received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $countryData;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 
?>