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

    // Try both form data and JSON formats
    const formData = new URLSearchParams({
        apikey: '3NwCuamS0SnyYDUw',
        senderid: 'TOPIKO',
        number: mobile,
        message: message,
        format: 'json'
    });

    const jsonData = {
        apikey: '3NwCuamS0SnyYDUw',
        senderid: 'TOPIKO',
        number: mobile,
        message: message,
        format: 'json'
    };

    console.log('Sending to MagicText - Mobile:', mobile, 'Message:', message);

    try {
        let response;
        
        // Try form data first (most common for SMS APIs)
        try {
            console.log('Trying form data format...');
            response = await fetch('https://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (formError) {
            console.log('Form data failed, trying JSON:', formError.message);
            
            // Try JSON format
            response = await fetch('https://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });
            
            if (!response.ok) {
                // Try HTTP as last resort
                console.log('HTTPS JSON failed, trying HTTP form data...');
                response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                });
            }
        }

        console.log('Response status:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.text();
            console.log('SMS API Response:', result);
            
            try {
                const jsonResult = JSON.parse(result);
                console.log('Parsed JSON Response:', jsonResult);
                
                // Check for success response
                if (jsonResult.status === 'OK' || jsonResult.message === 'message Submitted successfully' || jsonResult.status === 'Success') {
                    return res.status(200).json({
                        success: true,
                        message: 'OTP sent successfully',
                        otp: otp,
                        smsResponse: jsonResult
                    });
                }
                
                // Handle API errors
                console.error('MagicText API Error:', jsonResult);
                return res.status(500).json({
                    success: false,
                    error: jsonResult.message || jsonResult.status || 'SMS API returned error',
                    details: jsonResult
                });
                
            } catch (parseError) {
                // Response is not JSON, treat as success if status is OK
                console.log('Non-JSON response (treating as success):', result);
                return res.status(200).json({
                    success: true,
                    message: 'OTP sent successfully',
                    otp: otp,
                    rawResponse: result
                });
            }
        } else {
            const errorText = await response.text();
            console.error('SMS API HTTP Error:', response.status, response.statusText, errorText);
            return res.status(500).json({
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
                details: errorText
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