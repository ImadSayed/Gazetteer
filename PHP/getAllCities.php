<?php

$executionStartTime = microtime(true) / 1000;
$curl = curl_init();
//limit=10 as per api pricing limitation

curl_setopt_array($curl, [
	CURLOPT_URL => "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=10&countryIds=".$_REQUEST['countryCode'],
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_SSL_VERIFYPEER => 0,
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"x-rapidapi-host: wft-geo-db.p.rapidapi.com",
		"x-rapidapi-key: 96d9f588b9msh0530d69b07375e0p1d75d2jsn159acfb32dd0"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	$decode = json_decode($response,true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "places received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;//$response;//

	header('Content-Type: application/json; charset=UTF-8');

	
	echo json_encode($output); 
}

?>