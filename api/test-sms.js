export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Build form data manually
    const testFormBody = [
        'apikey=3NwCuamS0SnyYDUw',
        'senderid=TOPIKO',
        'number=9876543210',
        'message=Test+message+from+Topiko+API',
        'format=json'
    ].join('&');

    console.log('Testing MagicText API with form data:', testFormBody);

    try {
        // Try form data format first
        let response;
        try {
            console.log('Testing HTTPS with form data...');
            response = await fetch('https://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: testFormBody
            });
        } catch (httpsError) {
            console.log('HTTPS failed, trying HTTP:', httpsError.message);
            response = await fetch('http://msg.magictext.in/V2/http-api-post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: testFormBody
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