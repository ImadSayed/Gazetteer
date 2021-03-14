<?php
function getHereApiAccessToken()
{
    $API_URL="https://account.api.here.com/oauth2/token";

    $here_user_id = 'HERE-3f955dcf-5d7f-47de-a361-06e87ab664f6';
    $here_client_id = 'lXwSMDZfOuLLQdB04NP8';
    $here_ACCESS_KEY_ID = 'UgHRVaM46VA5TefVlC3YuQ';//'Hsi8FrEGoMXMabJYAqgWpA';
    $here_ACCESS_KEY_SECRET = '9-EIDu_HtY0BLZhgAKVS9YjzLAhlH6EQ5VYLrKHubm37gfGp57EFMTr1iuWaqM5fyaKNfI1x3ZI-dQ2x_QbrzQ';//'DJjoEuuXqnY5SfBhGMg0NEEyrigXWB-J73GjlsJlZbgyRETgz0uQMAyQhONCP9puUoIEqqWj1xn7-MgWdftjiQ';
    $signingkey = urlencode($here_ACCESS_KEY_SECRET).'&';                   

    $nonce=strval(time());
    $nonce = $nonce * 2;
    //$signing_key="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxx-xxxxxxxxxxxxxxx-xxxxx_x-xxxxxxxxxxxxxx"; //here.access.key.secret

    $signature_elements=array();
    $signature_elements['oauth_consumer_key']=$here_ACCESS_KEY_ID;
    $signature_elements['oauth_nonce']=$nonce;
    $signature_elements['oauth_signature_method']="HMAC-SHA256";
    $signature_elements['oauth_timestamp']=time();
    $signature_elements['oauth_version']="1.0";

    ksort($signature_elements);

    $base_string="";

    foreach($signature_elements as $key=>$val)
    {
        //$base_string.=urlencode($key).'='.urlencode($val).'&';
        $base_string.=$key.'='.$val.'&';
    }

    $base_string=rtrim($base_string, "&");
    $base_string = urlencode($base_string);
    $base_string = "POST&".urlencode($API_URL)."&".$base_string;

    $signature=hash_hmac('sha256', $base_string, $signingkey, true);

    $signature_base64=base64_encode($signature);

    $headers=array();
    $headers[]="Content-Type: application/x-www-form-urlencoded";
    $headers[]='Authorization: OAuth oauth_consumer_key="'.urlencode($signature_elements['oauth_consumer_key']).'", oauth_nonce="'.urlencode($nonce).'", oauth_signature="'.urlencode($signature_base64).'", oauth_signature_method="'.urlencode($signature_elements['oauth_signature_method']).'", oauth_timestamp="'.time().'", oauth_version="'.urlencode($signature_elements['oauth_version']).'"';

    $postData=array();
    $postData['grant_type']="client_credentials";
    $postData['expires_in']=50;

    $ch=curl_init();
    curl_setopt($ch, CURLOPT_URL, $API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    $response=curl_exec($ch);

    //br($response);

    $httpcode=curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if(curl_error($ch))
    {
        echo "cURL error: ". curl_error($ch);

        return false;
    }
        elseif($httpcode!=200)
        {
            echo "API responded with HTTP code: ". $httpcode;

            echo "<br><br />Response: ".$response;

            return false;
        }
        else
        {
            curl_close($ch);

            $json=json_decode($response, 1);

            br($json);

            if(empty($json))
            {
                echo "Failed to decode JSON";

                return false;
            }

            if(empty($json['access_token']))
            {
                echo "Missing access_token in API response: ".var_export($json, true);
            }

            return $json['access_token'];
        }

    return false;
}
getHereApiAccessToken();