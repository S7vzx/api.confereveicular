import fetch from 'node-fetch'; // Ensure fetch is available, though Node 18+ has it globally
import { Buffer } from 'buffer';

export const handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        const { amount, description, customer } = JSON.parse(event.body);
        const baseURL = 'https://api.pagar.me/core/v5';

        // Auth header
        // Netlify env vars are available in process.env
        const secretKey = process.env.VITE_PAGARME_SECRET_KEY;
        if (!secretKey) {
            console.error('Missing VITE_PAGARME_SECRET_KEY');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Configuration error: Missing Secret Key' })
            };
        }

        const auth = Buffer.from(secretKey + ':').toString('base64');
        const accountId = process.env.VITE_PAGARME_ACCOUNT_ID;

        const payload = {
            account_id: accountId,
            items: [
                {
                    amount,
                    description,
                    quantity: 1,
                    code: 'consultation',
                },
            ],
            customer: {
                name: customer.name || 'Cliente Confere',
                email: customer.email,
                type: 'individual',
                document: customer.document?.replace(/\D/g, '') || '00000000000',
                phones: {
                    mobile_phone: {
                        country_code: '55',
                        area_code: '11',
                        number: '999999999',
                    },
                },
            },
            payments: [
                {
                    payment_method: 'pix',
                    pix: {
                        expires_in: 3600,
                    },
                },
            ],
        };

        const response = await fetch(`${baseURL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Pagar.me API Error:', err);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: err.message || 'Erro ao criar Pix' })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (err) {
        console.error('Function error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: err.message || 'Erro interno' })
        };
    }
};
