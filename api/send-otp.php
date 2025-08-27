<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$mobile = isset($input['mobile']) ? $input['mobile'] : '';
$otp = isset($input['otp']) ? $input['otp'] : '';
$message = isset($input['message']) ? $input['message'] : '';

// Validate inputs
if (empty($mobile) || empty($otp)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Mobile and OTP are required'
    ]);
    exit();
}

// Clean mobile number
$cleanMobile = preg_replace('/[^0-9]/', '', str_replace('+91', '', $mobile));

// Validate mobile format (10 digits)
if (strlen($cleanMobile) !== 10) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid mobile number format'
    ]);
    exit();
}

// Test number bypass
if ($cleanMobile === '8272500000') {
    echo json_encode([
        'success' => true,
        'message' => 'Test mode - OTP not sent',
        'otp' => '0827',
        'testMode' => true
    ]);
    exit();
}

// Prepare SMS message
if (empty($message)) {
    $message = "Your OTP for Topiko Partner Program is $otp. Valid for 10 minutes. For support call 885 886 8889";
}

// MagicText API parameters
$apikey = '3NwCuamS0SnyYDUw';
$senderid = 'TOPIKO';

// Prepare API URL
$apiUrl = 'http://msg.magictext.in/V2/http-api-post.php';
$params = http_build_query([
    'apikey' => $apikey,
    'senderid' => $senderid,
    'number' => $cleanMobile,
    'message' => $message
]);

// Send SMS using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Log response for debugging
error_log("MagicText Response: " . $response);

// Check if SMS was sent successfully
if ($httpCode == 200 && strpos($response, 'success') !== false) {
    echo json_encode([
        'success' => true,
        'message' => 'OTP sent successfully',
        'otp' => $otp
    ]);
} else {
    // Still return success but indicate fallback mode
    echo json_encode([
        'success' => true,
        'message' => 'OTP generated',
        'otp' => $otp,
        'fallbackMode' => true,
        'note' => 'SMS may be delayed. Use OTP shown on screen if needed.'
    ]);
}
?>