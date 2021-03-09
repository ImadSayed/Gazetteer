<?php

require 'myCredentials.php';

$APITOKEN = $universalAPIToken;
$useremail = $universalUserEmail;

$executionStartTime = microtime(true) / 1000;



$curl = curl_init();
curl_setopt_array($curl, array( 
    CURLOPT_URL => "https://www.universal-tutorial.com/api/getaccesstoken", 
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_SSL_VERIFYPEER => 0,
    CURLOPT_RETURNTRANSFER => true, 
    CURLOPT_ENCODING => "", 
    CURLOPT_MAXREDIRS => 10, 
    CURLOPT_TIMEOUT => 0, 
    CURLOPT_FOLLOWLOCATION => true, 
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, 
    CURLOPT_CUSTOMREQUEST => "GET", 
    CURLOPT_HTTPHEADER => [ 
        "Accept: application/json",
        "api-token: ".$APITOKEN,
        "user-email: ".$useremail
    ],
));

$response = curl_exec($curl); 
curl_close($curl); 

$token = json_decode($response,true);

$auth_token = $token['auth_token'];

//"https://www.universal-tutorial.com/api/countries/"
//"https://www.universal-tutorial.com/api/states/United Kingdom"
//"https://www.universal-tutorial.com/api/cities/Cheshire"

$url = "https://www.universal-tutorial.com/api/countries/";

if($_REQUEST['toGet'] === 'states') {
    $url = "https://www.universal-tutorial.com/api/states/".$_REQUEST['countryName'];
} else if($_REQUEST['toGet'] === 'cities') {
    $url = "https://www.universal-tutorial.com/api/cities/".$_REQUEST['stateName'];
}



$curl = curl_init();
curl_setopt_array($curl, array( 
    CURLOPT_URL => $url,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_SSL_VERIFYPEER => 0,
    CURLOPT_RETURNTRANSFER => true, 
    CURLOPT_ENCODING => "", 
    CURLOPT_MAXREDIRS => 10, 
    CURLOPT_TIMEOUT => 0, 
    CURLOPT_FOLLOWLOCATION => true, 
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, 
    CURLOPT_CUSTOMREQUEST => "GET", 
    CURLOPT_HTTPHEADER => [ 
        "Authorization: Bearer ".$auth_token,
        "Accept: application/json"
    ],
));

$result = curl_exec($curl); 
curl_close($curl); 


$decode = json_decode($result,true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "borders received";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);


?>