# Confere Veicular

Sistema de consulta veicular com integração Pagar.me e WDAPI.

## 🚀 Como Rodar

Para que o sistema funcione corretamente (especialmente a segurança da API e o banco de dados), você precisa rodar **dois terminais**:

### Terminal 1: Backend (Servidor)
Este comando inicia o servidor que protege sua API Key e salva os pedidos.
```bash
node server.js
```
*O servidor rodará na porta 4000.*

### Terminal 2: Frontend (Site)
Este comando inicia o site.
```bash
npm run dev
```
*O site rodará na porta 8080 (ou similar).*

## 🛠 Configuração (.env)
Certifique-se de que seu arquivo `.env` tenha as chaves configuradas:
- `WDAPI_TOKEN`: Token da API de placas.
- `VITE_SUPABASE_URL` / `KEY`: Banco de dados.
- `VITE_PAGARME_SECRET_KEY`: Pagamentos.
