const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const { amount, description, customer } = JSON.parse(event.body);
        const baseURL = 'https://api.pagar.me/core/v5';

        // Pagar.me auth logic
        const secret = process.env.VITE_PAGARME_SECRET_KEY;
        if (!secret) throw new Error('Pagar.me Secret Key not configured');

        const basicAuth = Buffer.from(secret + ':').toString('base64');

        const payload = {
            account_id: process.env.VITE_PAGARME_ACCOUNT_ID,
            items: [{ amount, description, quantity: 1, code: 'consultation' }],
            customer: {
                name: customer.name || 'Cliente Confere',
                email: customer.email,
                type: 'individual',
                document: customer.document?.replace(/\D/g, '') || '00000000000',
                phones: { mobile_phone: { country_code: '55', area_code: '11', number: '999999999' } },
            },
            payments: [{ payment_method: 'pix', pix: { expires_in: 3600 } }],
        };

        const response = await fetch(`${baseURL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Basic ${basicAuth}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
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

    } catch (error) {
        console.error('Server error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: error.message || 'Erro interno' })
        };
    }
};
