import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Node 18+ has global fetch, but keep for compatibility
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const baseURL = 'https://api.pagar.me/core/v5';
const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Basic ' + Buffer.from(process.env.VITE_PAGARME_SECRET_KEY + ':').toString('base64'),
};

app.post('/api/create-pix', async (req, res) => {
    try {
        const { amount, description, customer } = req.body;
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
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ message: err.message || 'Erro ao criar Pix' });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
});

app.get('/api/get-order', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Missing order ID' });
    }

    try {
        const response = await fetch(`${baseURL}/orders/${id}`, {
            headers
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ message: err.message || 'Erro ao buscar pedido' });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
});

app.get('/api/list-orders', async (req, res) => {
    try {
        // Fetch last 50 orders
        const response = await fetch(`${baseURL}/orders?page=1&size=50&sort=created_at&order=desc`, {
            headers
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ message: err.message || 'Erro ao buscar pedidos' });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
