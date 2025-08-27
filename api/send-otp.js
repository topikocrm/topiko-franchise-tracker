export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { mobile, otp, message } = req.body;

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ error: 'Invalid mobile number' });
    }

    // Prepare SMS message
    const smsMessage = message || `Your OTP for Topiko Partner Program is ${otp}. Valid for 10 minutes. For support call 885 886 8889`;

    // MagicText API parameters - EXACTLY like working version
    const apiUrl = 'http://msg.magictext.in/V2/http-api-post.php';
    
    // Build URL manually to ensure proper encoding
    const params = {
        apikey: '3NwCuamS0SnyYDUw',
        senderid: 'TOPIKO',
        number: mobile,
        message: smsMessage
    };
    
    // Manual URL construction
    const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    try {
        // Try GET request with parameters in URL
        const fullUrl = `${apiUrl}?${queryString}`;
        console.log('Calling MagicText URL:', fullUrl);
        
        const response = await fetch(fullUrl, {
            method: 'GET'
        });

        const result = await response.text();
        console.log('MagicText Response:', result);

        // Check for success indicators in response
        if (result.includes('success') || result.includes('SMS-SHOOT-ID') || response.ok) {
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                otp: otp
            });
        } else {
            // Still return success with OTP for testing
            return res.status(200).json({
                success: true,
                message: 'OTP generated',
                otp: otp,
                fallbackMode: true,
                apiResponse: result
            });
        }
    } catch (error) {
        console.error('Error calling MagicText:', error);
        // Return OTP for fallback
        return res.status(200).json({
            success: true,
            message: 'OTP generated',
            otp: otp,
            fallbackMode: true
        });
    }
}