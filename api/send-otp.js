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

    // Validate inputs
    if (!mobile || !otp || !message) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ error: 'Invalid mobile number' });
    }

    // EXACT format that works - using JSON!
    const postData = {
        apikey: '3NwCuamS0SnyYDUw',  // ✅ HARDCODED, not a variable
        senderid: 'TOPIKO',
        number: mobile,
        message: message,
        format: 'json'
    };

    console.log('Sending to MagicText with JSON:', JSON.stringify(postData));

    try {
        // Send SMS via API - EXACTLY as working version
        const response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // ✅ JSON content type
            },
            body: JSON.stringify(postData)  // ✅ Stringify the object
        });

        if (response.ok) {
            const result = await response.text();
            console.log('SMS API Response:', result);
            
            try {
                const jsonResult = JSON.parse(result);
                
                // Check for success response like in working version
                if (jsonResult.status === 'OK' || jsonResult.message === 'message Submitted successfully') {
                    return res.status(200).json({
                        success: true,
                        message: 'OTP sent successfully',
                        otp: otp,  // Return OTP for verification
                        smsResponse: jsonResult
                    });
                }
                
                // Handle API errors
                if (jsonResult.status === 'AZQ01' || jsonResult.message) {
                    console.error('MagicText Error:', jsonResult.message);
                    return res.status(500).json({
                        success: false,
                        error: jsonResult.message || 'Failed to send SMS',
                        details: result
                    });
                }
            } catch (parseError) {
                // Response is not JSON, but might still be successful
                console.log('Non-JSON response:', result);
            }
            
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                otp: otp
            });
        } else {
            console.error('SMS API Error:', response.status, response.statusText);
            return res.status(500).json({
                error: 'Failed to send OTP',
                details: `API returned ${response.status}`
            });
        }
    } catch (error) {
        console.error('Failed to send OTP:', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}