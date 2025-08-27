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
        
        // MagicText API parameters (matching working version)
        const postData = {
            apikey: '3NwCuamS0SnyYDUw',
            senderid: 'TOPIKO',
            number: cleanMobile,
            message: smsMessage,
            format: 'json'
        };
        
        try {
            // Send SMS via API (using JSON format like the working version)
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
                
                return res.status(200).json({
                    success: true,
                    message: 'OTP sent successfully',
                    otp: otp // Return OTP for verification
                });
            } else {
                console.error('SMS API Error:', response.status, response.statusText);
                // Still return success but with fallback mode
                return res.status(200).json({
                    success: true,
                    message: 'OTP generated',
                    otp: otp,
                    fallbackMode: true,
                    note: 'SMS service issue. Use OTP shown on screen.'
                });
            }
        } catch (error) {
            console.error('Failed to send SMS:', error);
            // Return success with fallback mode
            return res.status(200).json({
                success: true,
                message: 'OTP generated',
                otp: otp,
                fallbackMode: true,
                note: 'Use OTP shown on screen.'
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