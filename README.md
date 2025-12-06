# 🚗 Confere Veicular - Plataforma de Consulta e Histórico Veicular

![Confere Veicular Banner](public/uploads/logo%20nova.png)

## 📌 Sobre o Projeto

O **Confere Veicular** é uma aplicação web moderna e robusta desenvolvida para facilitar consultas detalhadas do histórico de veículos. A plataforma oferece uma experiência intuitiva e segura para usuários que buscam informações críticas antes de comprar um veículo, como débitos, leilões, restrições e dados cadastrais completos.

Focado em conversão e usabilidade, o projeto conta com um fluxo de checkout otimizado, integração com pagamentos via Pix e um painel administrativo para gestão de vendas.

---

## 🚀 Funcionalidades Principais

### 🔍 Para o Usuário
- **Consulta Rápida por Placa**: Busca instantânea de veículos com validação de formato.
- **Relatório Preliminar Gratuito**: Exibição de dados básicos (Marca, Modelo, Ano, Cor) para confirmação.
- **Relatório Completo (Pago)**: Acesso a dados sensíveis como Renavam, Chassi, Motor, Proprietário, Histórico de Roubo/Furto e Leilões.
- **Checkout Transparente**: Fluxo de pagamento simplificado com upsells estratégicos (Débitos, Leilão, Dados do Proprietário).
- **Pagamento via Pix**: Geração instantânea de QR Code e Copia e Cola com liberação automática via Webhook.

### 🛡️ Para o Administrador
- **Dashboard de Vendas**: Visão geral de pedidos, receita e status de pagamentos.
- **Notificações em Tempo Real**: Alertas sonoros e visuais para novas vendas aprovadas.
- **Gestão de Pedidos**: Acesso ao histórico completo de transações e detalhes dos clientes.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as tecnologias mais modernas do ecossistema React, garantindo performance, escalabilidade e excelente experiência de desenvolvimento.

### Front-end
- **[React](https://reactjs.org/)**: Biblioteca principal para construção da interface.
- **[Vite](https://vitejs.dev/)**: Build tool ultrarrápida para desenvolvimento ágil.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para maior segurança e manutenibilidade do código.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework utility-first para estilização rápida e responsiva.
- **[Shadcn/ui](https://ui.shadcn.com/)**: Componentes de UI reutilizáveis e acessíveis baseados em Radix UI.
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones leve e consistente.

### Back-end & Serviços
- **[Supabase](https://supabase.com/)**: Banco de dados PostgreSQL e autenticação.
- **[Pagar.me](https://pagar.me/)**: Gateway de pagamentos para processamento seguro de transações Pix.
- **[Node.js (Serverless/API)](https://nodejs.org/)**: Integrações de backend para consultas e webhooks.

### Ferramentas de Qualidade
- **ESLint & Prettier**: Padronização e linting de código.
- **Zod**: Validação de schemas e dados.

---

## 🏁 Como Executar o Projeto

Siga os passos abaixo para rodar a aplicação em seu ambiente local.

### Pré-requisitos
- Node.js (v18 ou superior)
- Gerenciador de pacotes (npm, yarn ou pnpm)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/api.confereveicular.git
   cd api.confereveicular
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto com base nas chaves necessárias (Supabase, Pagar.me, APIs de consulta).
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   VITE_PAGARME_API_KEY=sua_chave_pagarme
   ```

4. **Inicie o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:8080`.

---

## 📂 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis (UI, Layouts, etc.)
├── hooks/             # Custom Hooks (useToast, etc.)
├── pages/             # Páginas da aplicação (Admin, Checkout, Resultado)
├── services/          # Integrações com APIs externas
├── lib/               # Utilitários e configurações (utils.ts)
└── assets/            # Imagens e arquivos estáticos
```

---

## ✨ Destaques de UX/UI

- **Design Responsivo**: Otimizado para funcionar perfeitamente em Mobile e Desktop.
- **Stepper de Checkout**: Guia visual "Consulta > Pagamento > Relatório" para reduzir atrito.
- **Trust Signals**: Selos de segurança e prova social estrategicamente posicionados.
- **Feedback Visual**: Loaders, Toasts e Skeletons para melhor percepção de performance.

---

Desenvolvido com 💙 pela equipe **Confere Veicular**.
