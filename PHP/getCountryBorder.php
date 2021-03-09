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
    /*
    echo "getCountryBorder.php";
    echo "<br>";
    //echo $url;
    echo "<br>";
    //echo $decode;

    /*
    var_dump($decode['features'][0]['geometry']['coordinates'][0][0]);
    echo "<br /><br />";
    var_dump($decode['features'][0]['geometry']['coordinates'][1][0]);
    echo "<br /><br />";
    var_dump($decode['features'][0]['geometry']['coordinates'][2][0]);
    */
    //var_dump($decode[1]);

    /*
    var_dump($decode['features'][0]['geometry']['coordinates']);
    echo "<br /><br />";

    $arr = $decode['features'][0]['geometry']['coordinates'];

    echo $decode['features'][0]['properties']['name'];
    
    echo "<br /><br />";
    */

    //echo $decode['features'][1]['properties']['name'];
    $country = $_REQUEST['name'];
    /*
    echo "<script>";
    echo "country in php ".$country;
    echo "</script>";
    */

    $index = 0;
    //echo sizeof($decode['features']);
    for($n = 0; $n < sizeof($decode['features']); $n++) {
        if($country === "'".$decode['features'][$n]['properties']['name']."'") {
            
            //echo "in <br />";
            //echo $decode['features'][$n]['properties']['name'];

            $index = $n;
            //echo "index: ".$index;
        } 
    }


    $arr = $decode['features'][$index]['geometry']['coordinates'];
    //var_dump($arr);
    //echo sizeof($arr);
    //var_dump($arr);
    $latlngArr = [];
    $latlng = [];
    //print_r($arr[0]);
    //$latlng = [];

    for($i=0; $i < sizeof($arr); $i++) {

        if(sizeof($arr[$i]) > 1) {        

            for($j=0; $j < sizeof($arr[$i]); $j++) {

                /*
                echo "Lat: ".$decode['features'][$index]['geometry']['coordinates'][$i][$j][0];
                echo ", ";
                echo "Lng: ".$decode['features'][$index]['geometry']['coordinates'][$i][$j][1];
                echo "<br /><br />";
                */

                $lat = $decode['features'][$index]['geometry']['coordinates'][$i][$j][0];
                $lng = $decode['features'][$index]['geometry']['coordinates'][$i][$j][1];
                //$latlng = [$lat, $lng];//
                $latlng = ['lat' => $lat, 'lng' => $lng];
                array_push($latlngArr,$latlng);
            }
        /*
        echo "end of $i";
        echo "<br /><br />";
        */
        } else {
            for($j=0; $j < sizeof($arr[$i][0]); $j++) {

                /*
                echo "Lat: ".$decode['features'][$index]['geometry']['coordinates'][$i][0][$j][0];
                echo ", ";
                echo "Lng: ".$decode['features'][$index]['geometry']['coordinates'][$i][0][$j][1];
                echo "<br /><br />";
                */

                $lat = $decode['features'][$index]['geometry']['coordinates'][$i][0][$j][0];
                $lng = $decode['features'][$index]['geometry']['coordinates'][$i][0][$j][1];
                //$latlng = [$lat, $lng];//
                $latlng = ['lat' => $lat, 'lng' => $lng];
                array_push($latlngArr,$latlng);

            }

        }
    }




    
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "borders received";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $latlngArr;//$decode['properties']
	
	header('Content-Type: application/json; charset=UTF-8');
    
    //print_r("name: ".$country);
	echo json_encode($output); 
    
?>

