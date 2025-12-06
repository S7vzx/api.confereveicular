
// In-memory storage for coupons (WARNING: Volatile on serverless)
// In a real production app, use a database.
let coupons = [];
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.VITE_PAGARME_SECRET_KEY || 'default_secret_dev';

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Detect if this is a validation request
        // Netlify redirect from /api/validate-coupon -> /functions/coupons
        // event.path might still preserve the original path or show the function path?
        // Usually event.path is the request path.
        const isValidation = event.path.includes('validate-coupon');
        const path = event.path.replace('/api/coupons', '').replace('/api/validate-coupon', '').replace(/^\//, '');

        // VALIDATE COUPON
        if (isValidation && event.httpMethod === 'POST') {
            const { code } = JSON.parse(event.body);
            const coupon = coupons.find(c => c.code === code);
            if (!coupon) {
                return { statusCode: 200, headers, body: JSON.stringify({ valid: false }) };
            }
            return { statusCode: 200, headers, body: JSON.stringify({ valid: true, discount: coupon.discount }) };
        }

        // CRUD OPERATIONS

        // GET /api/coupons
        if (event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(coupons)
            };
        }

        // POST /api/coupons
        if (event.httpMethod === 'POST') {
            const { code, discount } = JSON.parse(event.body);

            if (!code || discount == null) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Code and discount required' }) };
            }

            if (coupons.find(c => c.code === code)) {
                return { statusCode: 409, headers, body: JSON.stringify({ message: 'Coupon already exists' }) };
            }

            coupons.push({ code, discount: Number(discount) });
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ code, discount })
            };
        }

        // DELETE /api/coupons/:code
        if (event.httpMethod === 'DELETE') {
            // Path should be just the code now
            const code = path;
            if (!code) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Coupon code required' }) };
            }

            const index = coupons.findIndex(c => c.code === code);
            if (index === -1) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Coupon not found' }) };
            }

            coupons.splice(index, 1);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Coupon deleted' })
            };
        }

        return { statusCode: 405, headers, body: 'Method Not Allowed' };

    } catch (error) {
        console.error('Coupon function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
