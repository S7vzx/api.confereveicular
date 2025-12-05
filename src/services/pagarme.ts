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
        // Call local backend proxy to avoid CORS and hide Secret Key
        const response = await fetch('http://localhost:4000/api/create-pix', {
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
        return response.json();
    },
};

export const getPublicKey = () => import.meta.env.VITE_PAGARME_PUBLIC_KEY;
export default pagarme;