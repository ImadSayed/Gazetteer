<?php
//api.openweathermap.org/data/2.5/find?lat=55.5&lon=37.5&cnt=10&appid={API key}
  require 'myCredentials.php';

  $appId = $OpenWeatherMapKey;

  $executionStartTime = microtime(true) / 1000;

  $url='http://api.openweathermap.org/data/2.5/find?lat='.$_REQUEST['lat'].'&lon='.$_REQUEST['lng'].'&cnt=10&appid='.$appId;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);
	
	curl_close($ch);

    //echo "result: ".$result;

    $decode = json_decode($result,true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "places received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 




/*
*
{
  "coord": {
    "lon": -122.08,
    "lat": 37.39
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 282.55,
    "feels_like": 281.86,
    "temp_min": 280.37,
    "temp_max": 284.26,
    "pressure": 1023,
    "humidity": 100
  },
  "visibility": 16093,
  "wind": {
    "speed": 1.5,
    "deg": 350
  },
  "clouds": {
    "all": 1
  },
  "dt": 1560350645,
  "sys": {
    "type": 1,
    "id": 5122,
    "message": 0.0139,
    "country": "US",
    "sunrise": 1560343627,
    "sunset": 1560396563
  },
  "timezone": -25200,
  "id": 420006353,
  "name": "Mountain View",
  "cod": 200
  }               
  */