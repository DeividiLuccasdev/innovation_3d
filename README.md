# Inovation 3D

Site da **Inovation 3D**: catálogo de produtos impressos em 3D com pedidos pelo WhatsApp e um painel para o dono cadastrar produtos, enviar fotos e marcar o que está esgotado.

> **Imaginou? A gente imprime.**

## O que o site faz

- **Página inicial:** slogan, catálogo com filtro por categoria, encomenda personalizada e "como funciona".
- **Pedido pelo WhatsApp:** cada produto abre o WhatsApp com a mensagem pronta ("Olá! Tenho interesse em: …").
- **Esgotado:** o produto ganha a faixa "ESGOTADO", a foto fica em cinza e o botão de pedido é desativado.
- **Painel (`/admin`):** login, cadastro e edição de produtos, até 6 fotos por produto (reduzidas automaticamente antes do envio), marcar esgotado ou destaque, remover.

Enquanto o Supabase não está configurado, a página mostra produtos de exemplo.

## Tecnologias

- Next.js (App Router) e TypeScript
- Supabase: banco Postgres, armazenamento das fotos e login
- Hospedagem na Vercel

## Configuração (uma vez só)

1. **Crie um projeto no [Supabase](https://supabase.com)** (plano gratuito).
2. **Crie as tabelas:** em *SQL Editor > New query*, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em *Run*.
3. **Crie o seu usuário:** em *Authentication > Users > Add user*, informe e-mail e senha e marque *Auto Confirm User*.
   Recomendado: em *Authentication > Sign In / Providers*, desligue *Allow new users to sign up*.
4. **Torne o seu usuário administrador:** no *SQL Editor*, rode (com o seu e-mail):
   ```sql
   insert into public.administradores (user_id)
   select id from auth.users where email = 'seu-email@exemplo.com';
   ```
5. **Pegue as chaves:** em *Project Settings > API*, copie a *Project URL* e a chave *anon public*.

## Rodando localmente

```bash
cp .env.example .env.local   # preencha as chaves do passo 5
npm install
npm run dev
```

Acesse http://localhost:3000 e o painel em http://localhost:3000/admin.

## Publicando na Vercel

1. Em [vercel.com/new](https://vercel.com/new), importe este repositório.
2. Em *Environment Variables*, adicione `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_WHATSAPP`.
3. Clique em *Deploy*.

## Segurança

A chave *anon* do Supabase fica no navegador por natureza. Quem protege os dados são as regras de acesso (RLS) em `supabase/schema.sql`: qualquer pessoa só **lê** o catálogo e as fotos; criar, alterar, remover e enviar fotos exige estar logado **e** estar na tabela `administradores`.

## Estrutura

```
app/
├── page.tsx            # página inicial
├── admin/page.tsx      # painel do administrador
└── globals.css
components/             # cards, catálogo, marca
lib/                    # Supabase, produtos, WhatsApp
supabase/schema.sql     # tabelas e regras de acesso
public/                 # logo
```
