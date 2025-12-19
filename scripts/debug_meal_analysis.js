const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables manually
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env file not found');
            return null;
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (err) {
        console.error('❌ Failed to load .env:', err);
        return null;
    }
}

async function testOpenRouter() {
    const env = loadEnv();
    if (!env || !env.OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY not found in .env');
        return;
    }

    const apiKey = env.OPENROUTER_API_KEY;
    console.log('🔑 Found API Key (first 5 chars):', apiKey.substring(0, 5) + '...');

    const payload = JSON.stringify({
        model: "openai/gpt-5",
        messages: [
            {
                role: "system",
                content: "You are a nutritionist. Respond with JSON only.",
            },
            {
                role: "user",
                content: "Analyze: 6 eggs",
            },
        ],
        max_tokens: 100,
    });

    const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': payload.length,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'FitGrit Debug',
        },
    };

    console.log('📡 Sending request to OpenRouter...');

    const req = https.request(options, (res) => {
        console.log(`Response Status: ${res.statusCode}`);

        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Response Body:');
            console.log(data.substring(0, 500)); // Print first 500 chars

            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('✅ Success! API is working.');
            } else {
                console.log('❌ API Failed.');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Request Error: ${e.message}`);
    });

    req.write(payload);
    req.end();
}

testOpenRouter();
