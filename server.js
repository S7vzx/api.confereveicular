import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

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

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos no .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Constants ---
const PAGARME_BASE_URL = 'https://api.pagar.me/core/v5';
const PAGARME_SECRET = process.env.VITE_PAGARME_SECRET_KEY;
const PAGARME_HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Basic ' + Buffer.from(PAGARME_SECRET + ':').toString('base64'),
};

const WDAPI_TOKEN = process.env.WDAPI_TOKEN;
const WDAPI_BASE_URL = "https://wdapi2.com.br/consulta";

const SECRET_KEY = process.env.VITE_PAGARME_SECRET_KEY || 'default_secret_dev';
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD;

// --- Middlewares ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, SECRET_KEY);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

// --- Routes ---

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', database: !!supabase }));

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Senha incorreta' });
    }
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '12h' });
    res.json({ token });
});

// --- NEW: Proxy para WDAPI (Protege o Token) ---
app.get('/api/consultar/:placa', async (req, res) => {
    const { placa } = req.params;

    if (!WDAPI_TOKEN) {
        console.error("❌ Erro: WDAPI_TOKEN não configurado no servidor.");
        return res.status(500).json({ erro: true, mensagem: "Erro de configuração do servidor" });
    }

    const cleanPlate = placa.replace(/[^a-zA-Z0-9]/g, "");
    console.log(`🔍 Consultando placa via Proxy: ${cleanPlate}`);

    try {
        const response = await fetch(`${WDAPI_BASE_URL}/${cleanPlate}/${WDAPI_TOKEN}`);

        if (!response.ok) {
            return res.status(response.status).json({ erro: true, mensagem: `Erro na API externa: ${response.statusText}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Erro no Proxy WDAPI:", error);
        res.status(500).json({ erro: true, mensagem: "Erro interno ao consultar API" });
    }
});


// --- Orders (Checkout & Pagar.me) ---

app.post('/api/create-pix', async (req, res) => {
    try {
        const { amount, description, customer } = req.body;

        // 1. Criar pedido no Pagar.me
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

        const response = await fetch(`${PAGARME_BASE_URL}/orders`, {
            method: 'POST',
            headers: PAGARME_HEADERS,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ message: err.message || 'Erro ao criar Pix' });
        }

        const data = await response.json();

        // 2. Salvar pedido no Supabase
        const { error: dbError } = await supabase
            .from('orders')
            .insert([{
                external_id: data.id,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_document: customer.document,
                amount: amount,
                status: 'pending',
                items: data
            }]);

        if (dbError) console.error("Erro ao salvar pedido no Supabase:", dbError);

        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
});

// Get order by ID (Pagar.me + Database Sync)
app.get('/api/get-order', async (req, res) => {
    const { id } = req.query; // Pagar.me ID
    if (!id) return res.status(400).json({ message: 'Missing order ID' });

    try {
        // Fetch from Pagar.me
        const response = await fetch(`${PAGARME_BASE_URL}/orders/${id}`, { headers: PAGARME_HEADERS });
        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ message: err.message || 'Erro ao buscar pedido' });
        }
        const data = await response.json();

        // Sync Status to Supabase if Paid
        if (data.status === 'paid') {
            await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('external_id', id);
        }

        // Check verification in Supabase (manual override check)
        const { data: dbOrder } = await supabase
            .from('orders')
            .select('status')
            .eq('external_id', id)
            .single();

        // If manually marked as paid in DB, reflect in response
        if (dbOrder && dbOrder.status === 'paid' && data.status !== 'paid') {
            data.status = 'paid';
        }

        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
});

// Mark order as paid manually (Protected)
app.post('/api/orders/:id/pay', authenticate, async (req, res) => {
    const { id } = req.params; // Expects Pagar.me External ID
    if (!id) return res.status(400).json({ message: 'Missing order ID' });

    // Update in Supabase
    const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('external_id', id);

    if (error) {
        console.error("Erro ao atualizar pedido:", error);
        return res.status(500).json({ message: 'Erro ao atualizar banco de dados' });
    }

    console.log(`Order ${id} manually marked as paid in DB`);
    res.json({ message: 'Order marked as paid successfully', status: 'paid' });
});

// List orders (Protected)
app.get('/api/list-orders', authenticate, async (req, res) => {
    try {
        // Fetch from Supabase instead of Pagar.me (Better for history/persistence)
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Map to expected format by frontend
        const formattedOrders = orders.map(o => ({
            id: o.external_id,
            status: o.status, // Database status (includes manual overrides)
            amount: o.amount,
            customer: {
                name: o.customer_name,
                email: o.customer_email
            },
            created_at: o.created_at
        }));

        res.json({ data: formattedOrders });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: err.message || 'Erro interno' });
    }
});

// --- Coupons (Supabase Persistent) ---

// Get all coupons
app.get('/api/coupons', authenticate, async (req, res) => {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// Create a new coupon
app.post('/api/coupons', authenticate, async (req, res) => {
    const { code, discount } = req.body;
    if (!code || discount == null) return res.status(400).json({ message: 'Code and discount required' });

    const { error } = await supabase
        .from('coupons')
        .insert([{ code, discount: Number(discount) }]);

    if (error) {
        if (error.code === '23505') return res.status(409).json({ message: 'Cupom já existe' });
        return res.status(500).json({ message: error.message });
    }

    res.status(201).json({ code, discount });
});

// Delete a coupon
app.delete('/api/coupons/:code', authenticate, async (req, res) => {
    const { code } = req.params;
    const { error } = await supabase.from('coupons').delete().eq('code', code);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Coupon deleted' });
});

// Validate coupon (Public)
app.post('/api/validate-coupon', async (req, res) => {
    const { code } = req.body;
    const { data, error } = await supabase
        .from('coupons')
        .select('discount')
        .eq('code', code)
        .single();

    if (error || !data) return res.json({ valid: false });
    res.json({ valid: true, discount: data.discount });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
