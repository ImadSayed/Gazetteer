<?php
//use Exception;

class XFlexiblePolyline
{

    public const FORMAT_VERSION = 1;
    public const DEFAULT_PRECISION = 5;
    public const ENCODING_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    public const DECODING_TABLE = [
        62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
        22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
        36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
    ];

    public const ABSENT     = 0;
    public const LEVEL      = 1;
    public const ALTITUDE   = 2;
    public const ELEVATION  = 3;
    public const RESERVED1  = 4;
    public const RESERVED2  = 5;
    public const CUSTOM1    = 6;
    public const CUSTOM2    = 7;

    public static function decode(string $encoded): array
    {
        $decoded = self::decodeUnsignedValues($encoded);
        $header = self::decodeHeader($decoded[0], $decoded[1]);
        
        $factorDegree = 10 ** $header['precision'];
        $factorZ = 10 ** $header['thirdDimPrecision'];
        $thirdDim = $header['thirdDim'];

        $lastLat = 0;
        $lastLng = 0;
        $lastZ = 0;
        $res = [];
    
        $i = 2;
        for (; $i < count($decoded);) {
            $deltaLat = self::toSigned($decoded[$i]) / $factorDegree;
            $deltaLng = self::toSigned($decoded[$i + 1]) / $factorDegree;
            $lastLat += $deltaLat;
            $lastLng += $deltaLng;
    
            if ($thirdDim) {
                $deltaZ = self::toSigned($decoded[$i + 2]) / $factorZ;
                $lastZ += $deltaZ;
                $res[] = [$lastLat, $lastLng, $lastZ];
                $i += 3;
            } else {
                $res[] = [$lastLat, $lastLng];
                $i += 2;
            }
        }
    
        if ($i !== count($decoded)) {
            throw new Exception('Invalid encoding. Premature ending reached');
        }
    
        return [
            'precision' => $header['precision'],
            'thirdDim' => $header['thirdDim'],
            'thirdDimPrecision' => $header['thirdDimPrecision'],
            'polyline' => $res
        ];
    }

    public static function decodeHeader(int $version, int $encodedHeader): array
    {
        if ($version !== self::FORMAT_VERSION) {
            throw new Exception('Invalid format version');
        }
        $headerNumber = (string)+$encodedHeader;
        $precision = $headerNumber & 15;
        $thirdDim = ($headerNumber >> 4) & 7;
        $thirdDimPrecision = ($headerNumber >> 7) & 15;
        return compact('precision', 'thirdDim', 'thirdDimPrecision');
    }

    public static function toSigned(int $val): string
    {
        $res = $val;
        if ($res & 1) {
            $res = ~$res;
        }
        $res >>= 1;
        return (string)+$res;
    }

    public static function decodeUnsignedValues(string $encoded): array
    {
        $result = 0;
        $shift = 0;
        $resList = [];

        $characters = str_split($encoded);
        
        foreach ($characters as $char) {
            $value = self::decodeChar($char);
            $result |= ($value & 0x1F) << $shift;

            if (($value & 0x20) === 0) {
                $resList[] = $result;
                $result = 0;
                $shift = 0;
            } else {
                $shift += 5;
            }
        }
    
        if ($shift > 0) {
            throw new Exception('Invalid encoding');
        }
        
        return $resList;
    }

    public static function decodeChar(string $char): string
    {
        try {
            $charcode = mb_ord($char);
            $decoded = self::DECODING_TABLE[$charcode - 45];
        } catch (Exception $e) {
            throw new Exception('Char could not be decoded');
        }

        return $decoded;
    }

    public static function getThirdDimension(string $encoded): int
    {
        $decoded = self::decodeUnsignedValues($encoded);
        $header = self::decodeHeader($decoded[0], $decoded[1]);
        return $header['thirdDim'];
    }


    
}