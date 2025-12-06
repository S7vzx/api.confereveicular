import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Node 18+ has global fetch, but keep for compatibility
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
console.log('🚀 Server starting - executing server.js');
app.use(cors());
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.path);
    next();
});

// Simple root route for sanity check
app.get('/', (req, res) => res.send('Root OK'));
// Health check route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const baseURL = 'https://api.pagar.me/core/v5';
const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Basic ' + Buffer.from(process.env.VITE_PAGARME_SECRET_KEY + ':').toString('base64'),
};

const SECRET_KEY = process.env.VITE_PAGARME_SECRET_KEY || 'default_secret_dev';
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD;

// Auth Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, SECRET_KEY);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    console.log('Login attempt:', {
        received: password,
        expected: ADMIN_PASSWORD,
        match: password === ADMIN_PASSWORD
    });

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Senha incorreta' });
    }
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '12h' });
    res.json({ token });
});

// Create Pix endpoint
app.post('/api/create-pix', async (req, res) => {
    try {
        const { amount, description, customer } = req.body;
        const payload = {
            account_id: process.env.VITE_PAGARME_ACCOUNT_ID,
            items: [{ amount, description, quantity: 1, code: 'consultation' }],
            customer: {
                name: customer.name || 'Cliente Confere',
                email: customer.email,
                type: 'individual',
                document: customer.document?.replace(/\\D/g, '') || '00000000000',
                phones: { mobile_phone: { country_code: '55', area_code: '11', number: '999999999' } },
            },
            payments: [{ payment_method: 'pix', pix: { expires_in: 3600 } }],
        };
        const response = await fetch(`${baseURL}/orders`, { method: 'POST', headers, body: JSON.stringify(payload) });
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

// Get order by ID
app.get('/api/get-order', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Missing order ID' });
    try {
        const response = await fetch(`${baseURL}/orders/${id}`, { headers });
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

// In-memory storage for manual payment overrides
const manualPaidOrders = new Set();

// Mark order as paid manually (Protected)
app.post('/api/orders/:id/pay', authenticate, (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing order ID' });

    manualPaidOrders.add(id);
    console.log(`Order ${id} manually marked as paid`);
    res.json({ message: 'Order marked as paid successfully', status: 'paid' });
});

// List orders (Protected) mechanism updated to merge manual status
app.get('/api/list-orders', authenticate, async (req, res) => {
    try {
        const response = await fetch(`${baseURL}/orders?page=1&size=50&sort=created_at&order=desc`, { headers });
        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ message: err.message || 'Erro ao buscar pedidos' });
        }
        const data = await response.json();

        // Merge manual status
        if (data.data && Array.isArray(data.data)) {
            data.data = data.data.map(order => {
                if (manualPaidOrders.has(order.id)) {
                    return { ...order, status: 'paid' };
                }
                return order;
            });
        }

        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
});

// In-memory coupon storage
const coupons = [];

// Get all coupons (Protected)
app.get('/api/coupons', authenticate, (req, res) => {
    res.json(coupons);
});

// Create a new coupon (Protected)
app.post('/api/coupons', authenticate, (req, res) => {
    const { code, discount } = req.body;
    if (!code || discount == null) return res.status(400).json({ message: 'Code and discount are required' });
    if (coupons.find(c => c.code === code)) return res.status(409).json({ message: 'Coupon already exists' });
    coupons.push({ code, discount: Number(discount) });
    res.status(201).json({ code, discount });
});

// Delete a coupon (Protected)
app.delete('/api/coupons/:code', authenticate, (req, res) => {
    const { code } = req.params;
    const index = coupons.findIndex(c => c.code === code);
    if (index === -1) return res.status(404).json({ message: 'Coupon not found' });
    coupons.splice(index, 1);
    res.json({ message: 'Coupon deleted' });
});

// Validate coupon
app.post('/api/validate-coupon', (req, res) => {
    const { code } = req.body;
    const coupon = coupons.find(c => c.code === code);
    if (!coupon) return res.json({ valid: false });
    res.json({ valid: true, discount: coupon.discount });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
