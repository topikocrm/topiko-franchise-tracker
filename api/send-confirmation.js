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

    const { mobile, message } = req.body;

    // If a pre-formatted message is provided, use it directly
    if (message && mobile) {
        // Validate mobile number (10 digits)
        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ error: 'Invalid mobile number' });
        }

        // EXACT format that works - using JSON like OTP API!
        const postData = {
            apikey: '3NwCuamS0SnyYDUw',
            senderid: 'TOPIKO',
            number: mobile,
            message: message,
            format: 'json'
        };

        console.log('Sending confirmation SMS:', JSON.stringify(postData));

        try {
            // Send SMS via API - EXACTLY like the working OTP version
            const response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                const result = await response.text();
                console.log('SMS API Response:', result);
                
                try {
                    const jsonResult = JSON.parse(result);
                    
                    if (jsonResult.status === 'OK' || jsonResult.message === 'message Submitted successfully') {
                        return res.status(200).json({
                            success: true,
                            message: 'Confirmation SMS sent successfully',
                            smsMessage: message,
                            smsResponse: jsonResult
                        });
                    }
                    
                    if (jsonResult.status === 'AZQ01' || jsonResult.message) {
                        console.error('MagicText Error:', jsonResult.message);
                        return res.status(500).json({
                            success: false,
                            error: jsonResult.message || 'Failed to send SMS',
                            details: result
                        });
                    }
                } catch (parseError) {
                    console.log('Non-JSON response:', result);
                }
                
                return res.status(200).json({
                    success: true,
                    message: 'Confirmation SMS sent successfully',
                    smsMessage: message
                });
            } else {
                console.error('SMS API Error:', response.status, response.statusText);
                return res.status(500).json({
                    error: 'Failed to send confirmation SMS',
                    details: `API returned ${response.status}`
                });
            }
        } catch (error) {
            console.error('Failed to send confirmation SMS:', error);
            return res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    }

    // Legacy support for old format (type, product, dateTime)
    const { type, product, dateTime } = req.body;
    
    if (!mobile || !type || !dateTime) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ error: 'Invalid mobile number' });
    }

    // Format product name
    const formatProductName = (productKey) => {
        const productNames = {
            'hebt': 'HEBT',
            'flex': 'Flex',
            'topiko': 'Topiko',
            'display': 'Display'
        };
        return productNames[productKey] || productKey;
    };

    // For legacy format, just use the dateTime string as-is if it contains IST
    let formattedDateTime = dateTime;
    if (dateTime && !dateTime.includes('IST')) {
        // Only try to parse if it doesn't already have IST
        try {
            const date = new Date(dateTime);
            if (!isNaN(date.getTime())) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = months[date.getMonth()];
                const day = date.getDate();
                let hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12 || 12;
                let timeStr = `${hours}`;
                if (minutes > 0) timeStr += `:${minutes.toString().padStart(2, '0')}`;
                timeStr += ampm;
                formattedDateTime = `${month} ${day} ${timeStr}`;
            }
        } catch (e) {
            // If parsing fails, use as-is
            formattedDateTime = dateTime;
        }
    }

    // Prepare the message based on type
    let legacyMessage;
    if (type === 'demo') {
        const productName = formatProductName(product);
        legacyMessage = `Your demo for ${productName} is confirmed on ${formattedDateTime}. For assistance, call 885 886 8889 - Topiko -TOPIKO`;
    } else if (type === 'call') {
        legacyMessage = `Your call with Topiko team is scheduled for ${formattedDateTime}. For any assistance call 885 886 8889. -TOPIKO`;
    } else {
        return res.status(400).json({ error: 'Invalid booking type' });
    }

    // Send SMS using MagicText API
    const postData = {
        apikey: '3NwCuamS0SnyYDUw',
        senderid: 'TOPIKO',
        number: mobile,
        message: legacyMessage,
        format: 'json'
    };

    console.log('Sending confirmation SMS (legacy):', JSON.stringify(postData));

    try {
        const response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            const result = await response.text();
            console.log('SMS API Response:', result);
            
            try {
                const jsonResult = JSON.parse(result);
                
                if (jsonResult.status === 'OK' || jsonResult.message === 'message Submitted successfully') {
                    return res.status(200).json({
                        success: true,
                        message: 'Confirmation SMS sent successfully',
                        smsMessage: legacyMessage,
                        smsResponse: jsonResult
                    });
                }
                
                if (jsonResult.status === 'AZQ01' || jsonResult.message) {
                    console.error('MagicText Error:', jsonResult.message);
                    return res.status(500).json({
                        success: false,
                        error: jsonResult.message || 'Failed to send SMS',
                        details: result
                    });
                }
            } catch (parseError) {
                console.log('Non-JSON response:', result);
            }
            
            return res.status(200).json({
                success: true,
                message: 'Confirmation SMS sent successfully',
                smsMessage: legacyMessage
            });
        } else {
            console.error('SMS API Error:', response.status, response.statusText);
            return res.status(500).json({
                error: 'Failed to send confirmation SMS',
                details: `API returned ${response.status}`
            });
        }
    } catch (error) {
        console.error('Failed to send confirmation SMS:', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}