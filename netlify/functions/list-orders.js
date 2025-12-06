import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import jwt from 'jsonwebtoken';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default_secret_dev';

export const handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    // Auth Check
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Missing Authorization Header' }) };
    }

    try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET_KEY);
    } catch (err) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid Token' }) };
    }

    try {
        const secretKey = process.env.VITE_PAGARME_SECRET_KEY;
        const auth = Buffer.from(secretKey + ':').toString('base64');
        const baseURL = 'https://api.pagar.me/core/v5';

        // Fetch last 50 orders
        const response = await fetch(`${baseURL}/orders?page=1&size=50&sort=created_at&order=desc`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        });

        if (!response.ok) {
            const err = await response.json();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: err.message || 'Erro ao buscar pedidos' })
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
