<?php
	$executionStartTime = microtime(true) / 1000;

	$url='../JSON/countryBorders.geo.json';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);
	
	curl_close($ch);

	$decode = json_decode($result,true);

	$arr = [];
	for($i = 0; $i < sizeof($decode['features']); $i++) {
		array_push($arr, $decode['features'][$i]['properties']);//['name']
	}

	
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "borders received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $arr;//$decode['properties']
	
	header('Content-Type: application/json; charset=UTF-8');
    
    //print_r("name: ".$country);
	echo json_encode($output); 

?>