-- Só para quem já rodou o schema.sql antigo (4 categorias).
-- Rode uma vez em: Supabase > SQL Editor > New query

alter table public.produtos add column if not exists subcategoria text;

alter table public.produtos drop constraint if exists produtos_categoria_check;

update public.produtos set categoria = case categoria
  when 'Decoração' then 'Decoração residencial'
  when 'Personalizados' then 'Decoração personalizada'
  when 'Geek' then 'Decoração geek e temática'
  when 'Utilidades' then 'Organização e decoração funcional'
  else categoria
end;

alter table public.produtos add constraint produtos_categoria_check check (categoria in (
    'Decoração residencial',
    'Decoração personalizada',
    'Festas e eventos',
    'Escritórios e ambientes comerciais',
    'Decoração geek e temática',
    'Organização e decoração funcional'
));
