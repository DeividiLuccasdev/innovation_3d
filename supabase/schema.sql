-- Rode este arquivo uma vez em: Supabase > SQL Editor > New query

-- Produtos do catálogo
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 120),
  descricao text,
  preco numeric(10, 2) not null check (preco >= 0),
  categoria text not null check (categoria in ('Decoração', 'Geek', 'Utilidades', 'Personalizados')),
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

-- Depois de criar o seu usuário em Authentication > Users, rode:
-- insert into public.administradores (user_id)
-- select id from auth.users where email = 'seu-email@exemplo.com';
