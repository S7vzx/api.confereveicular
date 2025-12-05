/* eslint-disable no-undef */
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { amount, description, customer } = req.body;
    const baseURL = 'https://api.pagar.me/core/v5';

    // Auth header
    // Note: Vercel environment variables must be configured in Vercel project settings
    const auth = Buffer.from(process.env.VITE_PAGARME_SECRET_KEY + ':').toString('base64');

    try {
        const payload = {
            account_id: process.env.VITE_PAGARME_ACCOUNT_ID,
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
            return res.status(response.status).json({ message: err.message || 'Erro ao criar Pix' });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ message: err.message || 'Erro interno' });
    }
}
