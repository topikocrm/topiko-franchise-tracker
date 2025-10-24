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
        // Send SMS via MagicText API - EXACT SAME AS WORKING PROJECT
        const response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                otp: otp // Return OTP for verification
            });
        } else {
            return res.status(500).json({
                error: 'Failed to send OTP'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}