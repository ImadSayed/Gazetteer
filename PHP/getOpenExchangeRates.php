<?php
/*
https://openexchangerates.org/api/
                                    latest.json
                                    currencies.json
                                    historical/2013-02-16.json
                                                                    ?app_id=YOUR_APP_ID         
                                                                    &base=GBP
                                                                    &callback=someCallbackFunction
                                    */
    require 'myCredentials.php';

    $key = $openExchangeRatesAPIKEY;

    $executionStartTime = microtime(true) / 1000;

    $url='https://openexchangerates.org/api/latest.json?app_id='.$key;//&base=GBP || base='.$_REQUEST['currencyCode'] //currency isocode cannot be changed on free plan

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



?>