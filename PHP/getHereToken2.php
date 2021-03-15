<?php

$needNewToken = true;
//$domain = $_SERVER['HTTP_HOST'];
//$mainDirectory = dirname(dirname($_SERVER['PHP_SELF']));
//$filePath = $domain.$mainDirectory."/Files/hereApiToken.txt";//causing issues
$filePath = '../Files/hereApiToken.txt';

$myfile = fopen($filePath, "r") or die("Unable to open file!");
$typeLine = fgets($myfile);//read first line which token type

if ($typeLine != "") {

        $expireLine = fgets($myfile);//expires_in
        $timeLine = fgets($myfile);//time at time of writting
        $accessLine = fgets($myfile);//access_token
        fclose($myfile);
        $index = strpos($timeLine, ':');
        $time = substr($timeLine, $index+1);

        $index = strpos($expireLine, ':');
        $expiresIn = substr($expireLine, $index+1);

        $now = time();

        //echo "<br><br>expiresIn: ".$now." : ".gettype($now)."<br><br>";
        //echo "<br><br>expiresIn: ".$expiresIn." : ".gettype($expiresIn)."<br><br>";

        settype($expiresIn, 'integer');
        settype($time, 'integer');

        //echo "<br><br>expiresIn: ".$expiresIn." : ".gettype($expiresIn)."<br><br>";

        //$expIn = $expiresIn + 0;//intval($expiresIn);//intval($expiresIn);

        //echo "<br><br>ExpIn: ".$expIn." : ".gettype($expIn)."<br><br>";

        $timeExpiresIn = $time + $expiresIn;

        if($timeExpiresIn > $now) {
            $index = strpos($accessLine, ':');
            $access_token = substr($accessLine, $index+1);
            $needNewToken = false;
            echo $access_token;
        }
}

if($needNewToken) {

    require 'myCredentials.php';
                      
    $ACCESS_KEY_ID = $here_ACCESS_KEY_ID;
    $ACCESS_KEY_SECRET = $here_ACCESS_KEY_SECRET;

    $signingKey = urlencode($ACCESS_KEY_SECRET).'&';
    $unique_identifier = strval(time());
    $unique_identifier = $unique_identifier * 2;
    $grant_type = 'client_credentials';
    $oauth_consumer_key = $ACCESS_KEY_ID;
    $oauth_nonce = $unique_identifier;
    $oauth_signature_method = "HMAC-SHA256";
    $oauth_timestamp = time();
    $oauth_version = '1.0';
    $timeStamp1 = strval(time());
    $timeStamp1 = $timeStamp1 + 0;

    $HereTokenService = urlencode('https://account.api.here.com/oauth2/token');

    $parameterString = urlencode('grant_type='.$grant_type.'&oauth_consumer_key='.$oauth_consumer_key.'&oauth_nonce='.$oauth_nonce.'&oauth_signature_method='.$oauth_signature_method.'&oauth_timestamp='.$oauth_timestamp.'&oauth_version=1.0');

    $baseString = 'POST&'.$HereTokenService.'&'.$parameterString;

    $s = hash_hmac('sha256', $baseString, $signingKey, true);
    $signature = base64_encode($s);

    $Esignature = urlencode($signature);

    $url = 'https://account.api.here.com/oauth2/token';
    $curl = curl_init();

    curl_setopt_array($curl, array(
    CURLOPT_URL => $url,
    /*CURLOPT_SSL_VERIFYHOST => 0,*/
    CURLOPT_SSL_VERIFYPEER => 0,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
    CURLOPT_HTTPHEADER => array(
        'oauth_consumer_key: '.urlencode($ACCESS_KEY_ID),
        'oauth_nonce: '.urlencode($oauth_nonce),
        'oauth_signature: '.urlencode($signature),
        'oauth_signature_method: '.urlencode($oauth_signature_method),
        'oauth_timestamp: '.urlencode($oauth_timestamp),
        'oauth_version: '.urlencode($oauth_version),
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: OAuth oauth_consumer_key="'.urlencode($ACCESS_KEY_ID).'",oauth_signature_method="'.urlencode($oauth_signature_method).'",oauth_timestamp="'.urlencode($oauth_timestamp).'",oauth_nonce="'.urlencode($oauth_nonce).'",oauth_version="'.urlencode($oauth_version).'",oauth_signature="'.urlencode($signature).'"'
    ),
    ));

    $response = curl_exec($curl);

    curl_close($curl);

    $data = json_decode($response,true);

    $myfile = fopen($filePath, "w") or die("Unable to open file!");
    //die("Unable to open file!") returns false

    if($myfile) {
        $accessToken = $data['access_token'];
        $expiresIn = $data['expires_in'];
        $tokenType = $data['token_type'];

        $txt = "token_type:".$tokenType;
        fwrite($myfile, $txt);

        $txt = "\nexpires_in:".$expiresIn;
        fwrite($myfile, $txt);

        $txt = "\ntime:".time();
        fwrite($myfile, $txt);

        $txt = "\naccess_token:".$accessToken;
        fwrite($myfile, $txt);

        fclose($myfile);
    } else {
        $accessToken = null;
    }

    echo $accessToken;

}


?>