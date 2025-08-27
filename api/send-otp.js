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
    
    console.log('Received request:', { mobile, otp, messageLength: message?.length });

    // Validate inputs
    if (!mobile || !otp) {
        return res.status(400).json({ 
            error: 'Mobile and OTP are required' 
        });
    }

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ 
            error: 'Invalid mobile number' 
        });
    }

    // Test number bypass
    if (mobile === '8272500000') {
        return res.status(200).json({
            success: true,
            message: 'Test mode - OTP not sent',
            otp: '0827',
            testMode: true
        });
    }

    // MagicText API credentials
    const postData = {
        apikey: '3NwCuamS0SnyYDUw',
        senderid: 'TOPIKO',
        number: mobile,
        message: message || `Your OTP for Topiko Partner Program is ${otp}. Valid for 10 minutes. For support call 885 886 8889`
    };

    console.log('Sending to MagicText:', postData);
    
    try {
        // Convert to URL-encoded format
        const params = new URLSearchParams(postData);
        
        // THIS WORKS FROM VERCEL BACKEND!
        const response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const result = await response.text();
        console.log('MagicText Response Status:', response.status);
        console.log('MagicText Response:', result);
        
        if (response.ok) {
            
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                otp: otp // Return for verification
            });
        } else {
            console.error('SMS API Error:', response.status);
            // Still return success with OTP for fallback
            return res.status(200).json({
                success: true,
                message: 'OTP generated',
                otp: otp,
                fallbackMode: true
            });
        }
    } catch (error) {
        console.error('SMS Error:', error.message);
        // Return success with OTP for fallback
        return res.status(200).json({
            success: true,
            message: 'OTP generated',
            otp: otp,
            fallbackMode: true
        });
    }
}