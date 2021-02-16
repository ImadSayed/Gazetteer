<?php
//echo "lat=".$_REQUEST['lat']."&lon=".$_REQUEST['lng'];

/*
	CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_SSL_VERIFYPEER => 0,
*/


$executionStartTime = microtime(true) / 1000;

$curl = curl_init();
//".$_REQUEST['la']."
//".$_REQUEST['ln']."
//51.5085287758629
//-0.125741958618164
curl_setopt_array($curl, [
	CURLOPT_URL => "https://forward-reverse-geocoding.p.rapidapi.com/v1/reverse?lat=".$_REQUEST['la']."&lon=".$_REQUEST['ln']."&format=json&accept-language=en&polygon_threshold=0.0",
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
		"x-rapidapi-host: forward-reverse-geocoding.p.rapidapi.com",
		"x-rapidapi-key: 96d9f588b9msh0530d69b07375e0p1d75d2jsn159acfb32dd0"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	//echo $response;
	$decode = json_decode($response,true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "places received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;//$response;//

	header('Content-Type: application/json; charset=UTF-8');

	
	echo json_encode($output); 
}





//41.8755616
//
/**
 * 
 * 
 * {
	* "licence":"Data © OpenStreetMap contributors, ODbL 1.0. https:\/\/osm.org\/copyright",
	* "osm_id":147077307,
	* "address":{
		* "tourism":"Congress Plaza Hotel",
		* "road":"South Michigan Avenue",
		* "state":"Illinois",
		* "county":"Cook County",
		* "house_number":"520",
		* "city":"Chicago",
		* "suburb":"Loop",
		* "country":"United States of America",
		* "neighbourhood":"Loop",
		* "country_code":"us",
		* "postcode":"60605"
	* },
	* "osm_type":"way",
	* "boundingbox":
	* 		["41.8745191","41.8756014","-87.6251579","-87.6244863"],
	* "place_id":123627662,
	* "lat":"41.87490815",
	* "lon":"-87.6248194228993",
	* "display_name":"Congress Plaza Hotel, 520, South Michigan Avenue, Loop, Chicago, Cook County, Illinois, 60605, United States of America"
 * }
 */
?>