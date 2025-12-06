import jwt from 'jsonwebtoken';

const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD;
const SECRET_KEY = process.env.VITE_PAGARME_SECRET_KEY || 'default_secret_dev';

export const handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const { password } = JSON.parse(event.body);

        if (password !== ADMIN_PASSWORD) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Senha incorreta' })
            };
        }

        // Generate Token
        const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '12h' });

        return {
            statusCode: 200,
            body: JSON.stringify({ token })
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno no servidor' })
        };
    }
};
