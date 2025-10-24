export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Simple test endpoint to check MagicText API status
    const testData = {
        apikey: '3NwCuamS0SnyYDUw',
        senderid: 'TOPIKO',
        number: '9876543210', // Test number
        message: 'Test message from Topiko API',
        format: 'json'
    };

    console.log('Testing MagicText API with:', testData);

    try {
        // Try HTTPS first
        let response;
        try {
            console.log('Testing HTTPS endpoint...');
            response = await fetch('https://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
        } catch (httpsError) {
            console.log('HTTPS failed, trying HTTP:', httpsError.message);
            response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
        }

        const result = await response.text();
        console.log('Test API Response:', result);

        return res.status(200).json({
            success: true,
            httpStatus: response.status,
            responseText: result,
            endpoint: response.url
        });

    } catch (error) {
        console.error('Test API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}