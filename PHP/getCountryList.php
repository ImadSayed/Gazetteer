<?php

	require 'myCredentials.php';

	$username = $geonamesUsername;

	$executionStartTime = microtime(true) / 1000;

	$url='http://api.geonames.org/countryInfoJSON?username='.$username;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);
	//echo '<script>';
	//echo 'console.log('. $result  .')';
	//echo '</script>';
	
	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "countries received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode['geonames'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

	/*
	//example result
							areaInSqKm: "468.0"
							capital: "Andorra la Vella"
							continent: "EU"
							continentName: "Europe"
							countryCode: "AD"
							countryName: "Andorra"
							currencyCode: "EUR"
							east: 1.786576000000025
							fipsCode: "AN"
							geonameId: 3041565
							isoAlpha3: "AND"
							isoNumeric: "020"
							languages: "ca"
							north: 42.65576500000003
							population: "77006"
							postalCodeFormat: "AD###"
							south: 42.42874300100004
							west: 1.4137600010000
	*/
?>