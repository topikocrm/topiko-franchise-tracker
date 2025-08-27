export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }
    
    try {
        // Parse body if needed
        let body = req.body;
        if (!body && req.method === 'POST') {
            return res.status(400).json({ 
                success: false, 
                error: 'Request body is missing' 
            });
        }
        
        const { mobile, otp, message } = body;
        
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
                otp: '0827',
                testMode: true
            });
        }
        
        // Prepare message
        const smsMessage = message || `Your OTP for Topiko Partner Program is ${otp}. Valid for 10 minutes. For support call 885 886 8889`;
        
        console.log(`SMS Request - Number: ${cleanMobile}, OTP: ${otp}`);
        
        // IMPORTANT: Due to Vercel's HTTPS-only policy, we cannot directly call HTTP APIs
        // Options for production:
        // 1. Use an HTTPS SMS provider (Twilio, TextLocal, MSG91)
        // 2. Set up your own proxy server
        // 3. Use a service like AllOrigins or CORS-anywhere
        
        // For now, we'll return the OTP for display
        // The frontend will show it to the user
        
        // Attempt to send via a CORS proxy (this may or may not work depending on proxy availability)
        try {
            // Try using a public CORS proxy (note: unreliable for production)
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const apiUrl = encodeURIComponent(`http://msg.magictext.in/V2/http-api-post.php?apikey=3NwCuamS0SnyYDUw&senderid=TOPIKO&number=${cleanMobile}&message=${encodeURIComponent(smsMessage)}`);
            
            const response = await fetch(proxyUrl + apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain'
                }
            });
            
            if (response.ok) {
                const result = await response.text();
                console.log('SMS sent via proxy:', result);
                
                return res.status(200).json({
                    success: true,
                    message: 'OTP sent successfully',
                    otp: otp
                });
            }
        } catch (proxyError) {
            console.log('Proxy attempt failed:', proxyError.message);
        }
        
        // Fallback: Return OTP for on-screen display
        console.log('Returning OTP for on-screen display due to HTTPS restrictions');
        
        return res.status(200).json({
            success: true,
            message: 'OTP generated successfully',
            otp: otp,
            fallbackMode: true,
            note: 'Due to security restrictions, please use the OTP displayed on screen'
        });
        
    } catch (error) {
        console.error('Error in send-otp API:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}