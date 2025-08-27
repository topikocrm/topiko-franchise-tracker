export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { mobile, otp, message } = req.body;
        
        // Validate inputs
        if (!mobile || !otp) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mobile and OTP are required' 
            });
        }
        
        // Format mobile number (remove +91 if present)
        const cleanMobile = mobile.replace(/^\+91/, '').replace(/\D/g, '');
        
        // Validate mobile format (10 digits)
        if (cleanMobile.length !== 10) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid mobile number format' 
            });
        }
        
        // Test number bypass
        if (cleanMobile === '8272500000') {
            console.log('📱 Test number detected, bypassing SMS');
            return res.status(200).json({
                success: true,
                message: 'Test mode - OTP not sent',
                otp: otp,
                testMode: true
            });
        }
        
        // Prepare message
        const smsMessage = message || `Your OTP for Topiko Partner Program is ${otp}. Valid for 10 minutes. For support call 885 886 8889`;
        
        // MagicText API parameters
        const params = new URLSearchParams({
            apikey: '3NwCuamS0SnyYDUw',
            senderid: 'TOPIKO',
            number: cleanMobile,
            message: smsMessage
        });
        
        // Send SMS via MagicText API
        const response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        const responseText = await response.text();
        console.log('MagicText Response:', responseText);
        
        // Check if SMS was sent successfully
        if (response.ok && responseText.includes('success')) {
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                otp: otp // Return OTP for verification
            });
        } else {
            console.error('SMS sending failed:', responseText);
            return res.status(500).json({
                success: false,
                error: 'Failed to send OTP',
                details: responseText
            });
        }
        
    } catch (error) {
        console.error('Error in send-otp API:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}