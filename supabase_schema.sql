-- Tabela de Pedidos (Orders)
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  external_id text, -- ID do Pagar.me
  customer_name text,
  customer_email text,
  customer_document text,
  customer_phone text,
  amount integer, -- Valor em centavos
  status text default 'pending', -- pending, paid, failed
  items jsonb, -- Itens do pedido salvos como JSON
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Cupons
create table if not exists coupons (
  code text primary key,
  discount numeric, -- Ex: 0.10 para 10%
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar RLS (Row Level Security) é recomendado, mas para simplificar o MVP inicial
-- e permitir que nossa API/Client escreva, vamos deixar aberto ou criar policies depois.
-- Por enquanto, como a API key é Anon e vamos usar no front, precisamos de policies básicas ou desativar RLS.
-- O ideal para produção: Apenas o Backend (Node) escreve com a Service Role Key, ou Policies bem restritas.
-- Para esse setup rápido:

alter table orders enable row level security;
alter table coupons enable row level security;

-- Permitir leitura pública de cupons (para validar no front)
create policy "Enable read access for all users" on coupons for select using (true);

-- Permitir criação de pedidos por qualquer um (anon)
create policy "Enable insert access for all users" on orders for insert with check (true);

-- Permitir ler pedidos (apenas para admin futuramente, mas por enquanto aberto para simplificar dashboard dev)
-- ATTENTION: Em produção real, você deve restringir isso!
create policy "Enable read access for all users" on orders for select using (true);

-- Permitir update de status (para nosso Admin marcar como pago)
create policy "Enable update access for all users" on orders for update using (true);
