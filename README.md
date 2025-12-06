# 🚗 Confere Veicular – Plataforma de Consulta e Histórico Veicular

![Banner](public/uploads/logo%20nova.png)

## 📌 Sobre o Projeto

O **Confere Veicular** é uma aplicação web moderna e robusta que permite consultas detalhadas de veículos. Oferece uma experiência segura e intuitiva para quem deseja verificar débitos, leilões, restrições e dados cadastrais antes da compra.

---

## 🚀 Funcionalidades Principais

### 🔍 Usuário
- **Consulta rápida por placa**
- **Relatório preliminar gratuito** (marca, modelo, ano, cor)
- **Relatório completo (pago)** com Renavam, Chassi, Motor, Proprietário, histórico de roubo/furto e leilões
- **Checkout transparente** com upsells estratégicos (débitos, leilão, dados do proprietário)
- **Pagamento via Pix** com QR Code e liberação automática via webhook

### 🛡️ Administrador
- **Dashboard de vendas** (receita, status de pagamentos)
- **Notificações em tempo real** (sons e alertas visuais)
- **Gestão de pedidos** (histórico completo)

---

## 🛠️ Tecnologias Utilizadas

### Front‑end
- **React** – Biblioteca principal para UI
- **Vite** – Build tool ultrarrápida
- **TypeScript** – Tipagem estática
- **Tailwind CSS** – Estilização utility‑first
- **Shadcn/ui** – Componentes reutilizáveis baseados em Radix UI
- **Lucide React** – Ícones leves

### Back‑end & Serviços
- **Supabase** – Banco PostgreSQL + Auth
- **Pagar.me** – Gateway de pagamentos Pix
- **Node.js** – API serverless

### Qualidade
- **ESLint & Prettier** – Padronização de código
- **Zod** – Validação de schemas

---

## 📂 Estrutura do Projeto

```
src/
├─ components/   # UI reutilizável
├─ hooks/        # Custom hooks (useToast, etc.)
├─ pages/        # Admin, Checkout, Resultado
├─ services/     # Integrações externas
├─ lib/          # Utilitários e configs
└─ assets/       # Imagens e arquivos estáticos
```

---

## ✨ Destaques de UX/UI

- **Design responsivo** (mobile & desktop)
- **Stepper de checkout**: “Consulta → Pagamento → Relatório”
- **Trust signals**: selos de segurança e provas sociais
- **Feedback visual**: loaders, toasts, skeletons

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo `LICENSE` para mais detalhes.

---

Desenvolvido com 💙 pela equipe **Confere Veicular**.
