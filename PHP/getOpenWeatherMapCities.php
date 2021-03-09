<?php
    //http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit={limit}&appid={API key}

    require 'myCredentials.php';

    $key = $OpenWeatherMapKey;

    $executionStartTime = microtime(true) / 1000;

	$url='http://api.openweathermap.org/geo/1.0/reverse?lat='.$_REQUEST['lat'].'&lon='.$_REQUEST{'lng'}.'&limit=100&appid='.$key;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);
	
	curl_close($ch);

    $decode = json_decode($result,true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "places received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

    /*
    "name": "City of London",
    "local_names": {
        "ar": "مدينة لندن",
        "ascii": "City of London",
        "bg": "Сити",
        "ca": "La City",
        "de": "London City",
        "el": "Σίτι του Λονδίνου",
        "en": "City of London",
        "fa": "سیتی لندن",
        "feature_name": "City of London",
        "fi": "Lontoon City",
        "fr": "Cité de Londres",
        "gl": "Cidade de Londres",
        "he": "הסיטי של לונדון",
        "hi": "सिटी ऑफ़ लंदन",
        "id": "Kota London",
        "it": "Londra",
        "ja": "シティ・オブ・ロンドン",
        "la": "Civitas Londinium",
        "lt": "Londono Sitis",
        "pt": "Cidade de Londres",
        "ru": "Сити",
        "sr": "Сити",
        "th": "นครลอนดอน",
        "tr": "Londra Şehri",
        "vi": "Thành phố Luân Đôn",
        "zu": "Idolobha weLondon"
        },
        "lat": 51.5128,
        "lon": -0.0918,
        "country": "GB"
    },
     */
?>
