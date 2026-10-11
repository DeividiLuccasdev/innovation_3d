-- Adiciona a categoria "Arte sacra". Rode uma vez em: Supabase > SQL Editor > New query

alter table public.produtos drop constraint if exists produtos_categoria_check;

alter table public.produtos add constraint produtos_categoria_check check (categoria in (
    'Decoração residencial',
    'Decoração personalizada',
    'Festas e eventos',
    'Escritórios e ambientes comerciais',
    'Decoração geek e temática',
    'Organização e decoração funcional',
    'Arte sacra'
));
