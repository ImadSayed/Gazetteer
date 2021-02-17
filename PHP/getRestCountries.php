<?php
//https://restcountries.eu/rest/v2/all
    $executionStartTime = microtime(true) / 1000;

	//$url='https://restcountries.eu/rest/v2/all?fields=name;capital;currencies';
    //$url='https://restcountries.eu/rest/v2/name/france?fullText=true';
    $url='https://restcountries.eu/rest/v2/alpha/gb';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);
	
	curl_close($ch);

    $decode = json_decode($result,true);

    /*
    $a = array();

    for($i = 0; $i < sizeof($decode); $i++) {
        array_push($a, $decode[$i]['name']);
    }

    */

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "rest countries received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 
?>



