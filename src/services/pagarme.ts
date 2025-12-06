import { supabase } from '@/lib/supabase';

const baseURL = 'https://api.pagar.me/core/v5';
const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Basic ' + btoa(import.meta.env.VITE_PAGARME_SECRET_KEY + ':'),
};

const pagarme = {
    get: async (endpoint: string) => {
        const response = await fetch(`${baseURL}${endpoint}`, { headers });
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    },
    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            let errorMsg = response.statusText;
            try {
                const errData = await response.json();
                if (errData.message) errorMsg = errData.message;
                else if (errData.errors && errData.errors.length) errorMsg = errData.errors.map((e: any) => e.message).join(', ');
            } catch (_) { }
            throw new Error(errorMsg);
        }
        return response.json();
    },
    createPixTransaction: async (amount: number, description: string, customer: any) => {
        // Call backend (local proxy or serverless function)
        const response = await fetch('/api/create-pix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                description,
                customer
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || response.statusText);
        }
        const order = await response.json();

        // Save to Supabase after Pagar.me creation
        try {
            await supabase.from('orders').insert({
                external_id: order.id,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_document: customer.document,
                customer_phone: customer.phone || '',
                amount: amount,
                status: order.status || 'pending',
                items: order.items || [{ amount, description, quantity: 1 }]
            });
        } catch (error) {
            console.error('Error saving order to Supabase:', error);
            // Don't fail the transaction if Supabase fails
        }

        return order;
    },
    getOrder: async (orderId: string) => {
        const response = await fetch(`/api/get-order?id=${orderId}`);
        if (!response.ok) {
            throw new Error('Erro ao verificar status do pedido');
        }
        return response.json();
    },
    getOrders: async (token?: string) => {
        // Fetch directly from Supabase
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Erro ao buscar pedidos');
        }

        // Transform to match Pagar.me format expected by Admin
        const transformedData = (data || []).map(order => ({
            id: order.external_id || order.id,
            status: order.status,
            created_at: order.created_at,
            customer: {
                name: order.customer_name,
                email: order.customer_email,
                document: order.customer_document,
                phone: order.customer_phone
            },
            items: order.items || [{ amount: order.amount, description: 'Consulta Veicular' }]
        }));

        return { data: transformedData };
    },
    // Coupons
    getCoupons: async (token?: string) => {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        return data || [];
    },
    createCoupon: async (code: string, discount: number, token?: string) => {
        const { data, error } = await supabase
            .from('coupons')
            .insert({ code, discount })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Failed to create coupon');
        }

        return data;
    },
    deleteCoupon: async (code: string, token?: string) => {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('code', code);

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Failed to delete coupon');
        }

        return { message: 'Coupon deleted' };
    },
    validateCoupon: async (code: string) => {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !data) {
            return { valid: false };
        }

        return { valid: true, discount: data.discount };
    },
    login: async (password: string) => {
        // Validate password directly against environment variable
        // This works both in development and production (Netlify)
        const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (password !== correctPassword) {
            throw new Error('Falha no login');
        }

        // Return a simple token (just for UI state, not for security)
        return { token: 'authenticated' };
    },
    markAsPaid: async (orderId: string, token: string) => {
        // Update directly in Supabase instead of calling server
        const { error } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .or(`external_id.eq.${orderId},id.eq.${orderId}`);

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Falha ao marcar como pago');
        }

        return { message: 'Order marked as paid successfully', status: 'paid' };
    }
};

export const getPublicKey = () => import.meta.env.VITE_PAGARME_PUBLIC_KEY;
export default pagarme;