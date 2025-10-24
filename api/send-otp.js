export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { mobile, otp, message } = req.body;

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ error: 'Invalid mobile number' });
    }

    // Prepare SMS API data - EXACT SAME FORMAT AS WORKING PROJECT
    const postData = {
        apikey: '3NwCuamS0SnyYDUw',
        senderid: 'TOPIKO',
        number: mobile,
        message: message,
        format: 'json'
    };

    try {
        // Try multiple approaches to match your working PHP code
        let response;
        let responseText;
        
        // First try: JSON with proper headers (like your PHP cURL)
        try {
            console.log('Trying JSON with cURL-like headers...');
            console.log('Sending to MagicText:', JSON.stringify(postData));
            
            response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Topiko-SMS-API/1.0'
                },
                body: JSON.stringify(postData)
            });
            
            responseText = await response.text();
            console.log('JSON Response:', response.status, responseText);
            
            if (!response.ok || responseText.includes('error') || responseText.includes('Error')) {
                throw new Error('JSON method failed');
            }
        } catch (jsonError) {
            console.log('JSON failed, trying form-encoded like some APIs prefer...');
            
            // Second try: Form-encoded data (some SMS APIs prefer this)
            const formData = new URLSearchParams();
            formData.append('apikey', '3NwCuamS0SnyYDUw');
            formData.append('senderid', 'TOPIKO');
            formData.append('number', mobile);
            formData.append('message', message);
            formData.append('format', 'json');
            
            response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: formData.toString()
            });
            
            responseText = await response.text();
            console.log('Form Response:', response.status, responseText);
        }

        console.log('Final MagicText Response Status:', response.status, response.statusText);
        console.log('Final MagicText Response Body:', responseText);

        if (response.ok) {
            // Try to parse the response to see what MagicText actually said
            let magicTextResponse = null;
            try {
                magicTextResponse = JSON.parse(responseText);
                console.log('Parsed MagicText Response:', magicTextResponse);
            } catch (parseError) {
                console.log('MagicText returned non-JSON:', responseText);
            }
            
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                otp: otp, // Return OTP for verification
                magicTextResponse: magicTextResponse || responseText // Include actual API response
            });
        } else {
            console.error('MagicText API Error:', response.status, responseText);
            return res.status(500).json({
                error: 'Failed to send OTP',
                details: responseText
            });
        }
    } catch (error) {
        console.error('Network error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}