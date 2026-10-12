-- Rode este arquivo uma vez em: Supabase > SQL Editor > New query

-- Produtos do catálogo
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 120),
  descricao text,
  preco numeric(10, 2) not null check (preco >= 0),
  categoria text not null constraint produtos_categoria_check check (categoria in (
    'Decoração residencial',
    'Decoração personalizada',
    'Festas e eventos',
    'Escritórios e ambientes comerciais',
    'Decoração geek e temática',
    'Organização e decoração funcional',
    'Arte sacra',
    'Encomendas personalizadas',
    'ETs e alienígenas'
  )),
  subcategoria text,
  material text,
  tamanho text,
  tempo_impressao text,
  fotos text[] not null default '{}',
  esgotado boolean not null default false,
  destaque boolean not null default false,
  criado_em timestamptz not null default now()
);

-- Quem pode mexer no catálogo: só os usuários listados aqui
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.produtos enable row level security;
alter table public.administradores enable row level security;

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.administradores where user_id = auth.uid());
$$;

drop policy if exists "Catálogo é público" on public.produtos;
create policy "Catálogo é público" on public.produtos
  for select using (true);

drop policy if exists "Só admin altera o catálogo" on public.produtos;
create policy "Só admin altera o catálogo" on public.produtos
  for all to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

-- Fotos dos produtos (leitura pública, envio só pelo admin)
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

drop policy if exists "Fotos são públicas" on storage.objects;
create policy "Fotos são públicas" on storage.objects
  for select using (bucket_id = 'produtos');

drop policy if exists "Só admin envia fotos" on storage.objects;
create policy "Só admin envia fotos" on storage.objects
  for all to authenticated
  using (bucket_id = 'produtos' and public.eh_admin())
  with check (bucket_id = 'produtos' and public.eh_admin());

-- Pedidos e orçamentos feitos pelo site
-- Pedidos: o cliente só cria pela função criar_pedido, que busca os preços no catálogo
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  criado_em timestamptz not null default now(),
  status text not null default 'novo' check (status in (
    'novo', 'aguardando pagamento', 'pago', 'em produção', 'enviado', 'concluído', 'cancelado'
  )),
  nome text not null check (char_length(nome) between 2 and 80),
  email text not null check (char_length(email) between 5 and 120),
  telefone text not null check (char_length(telefone) between 10 and 15),
  entrega jsonb not null,
  itens jsonb not null,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  frete numeric(10, 2) not null default 0 check (frete >= 0),
  total numeric(10, 2) not null check (total >= 0),
  observacoes text check (char_length(observacoes) <= 500)
);

-- Orçamentos de peças personalizadas e contatos
create table if not exists public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  status text not null default 'novo' check (status in ('novo', 'respondido', 'fechado', 'descartado')),
  nome text not null check (char_length(nome) between 2 and 80),
  email text not null check (char_length(email) between 5 and 120),
  telefone text not null check (char_length(telefone) between 10 and 15),
  assunto text check (char_length(assunto) <= 160),
  descricao text not null check (char_length(descricao) between 10 and 2000),
  referencia text check (char_length(referencia) <= 500)
);

alter table public.pedidos enable row level security;
alter table public.orcamentos enable row level security;

-- Só o administrador vê e altera pedidos e orçamentos
drop policy if exists "Admin gerencia pedidos" on public.pedidos;
create policy "Admin gerencia pedidos" on public.pedidos
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

drop policy if exists "Admin gerencia orçamentos" on public.orcamentos;
create policy "Admin gerencia orçamentos" on public.orcamentos
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- Qualquer visitante pode enviar um orçamento (mas não lê nenhum)
drop policy if exists "Visitante envia orçamento" on public.orcamentos;
create policy "Visitante envia orçamento" on public.orcamentos
  for insert to anon, authenticated with check (status = 'novo');

-- Cria o pedido calculando o subtotal com os preços do catálogo (o navegador não define preço)
create or replace function public.criar_pedido(dados jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  prod record;
  qtd int;
  lista jsonb := '[]'::jsonb;
  soma numeric := 0;
  valor_frete numeric := coalesce((dados->>'frete')::numeric, 0);
  novo_codigo text;
begin
  if jsonb_typeof(dados->'itens') <> 'array'
     or jsonb_array_length(dados->'itens') = 0
     or jsonb_array_length(dados->'itens') > 50 then
    raise exception 'Carrinho inválido';
  end if;
  if valor_frete < 0 or valor_frete > 2000 then
    raise exception 'Frete inválido';
  end if;

  for item in select * from jsonb_array_elements(dados->'itens') loop
    qtd := (item->>'quantidade')::int;
    if qtd is null or qtd < 1 or qtd > 99 then
      raise exception 'Quantidade inválida';
    end if;
    select id, nome, preco, esgotado into prod from produtos where id = (item->>'id')::uuid;
    if not found then
      raise exception 'Produto não encontrado';
    end if;
    if prod.esgotado then
      raise exception 'Produto esgotado: %', prod.nome;
    end if;
    soma := soma + prod.preco * qtd;
    lista := lista || jsonb_build_object('id', prod.id, 'nome', prod.nome, 'preco', prod.preco, 'quantidade', qtd);
  end loop;

  novo_codigo := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  insert into pedidos (codigo, nome, email, telefone, entrega, itens, subtotal, frete, total, observacoes)
  values (
    novo_codigo,
    dados->>'nome',
    dados->>'email',
    dados->>'telefone',
    coalesce(dados->'entrega', '{}'::jsonb),
    lista,
    soma,
    valor_frete,
    soma + valor_frete,
    nullif(dados->>'observacoes', '')
  );

  return novo_codigo;
end;
$$;

revoke all on function public.criar_pedido(jsonb) from public;
grant execute on function public.criar_pedido(jsonb) to anon, authenticated;

-- Depois de criar o seu usuário em Authentication > Users, rode:
-- insert into public.administradores (user_id)
-- select id from auth.users where email = 'seu-email@exemplo.com';
