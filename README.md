# Innovation 3D

Site da **Innovation 3D**: catálogo de produtos impressos em 3D com pedidos pelo WhatsApp e um painel para o dono cadastrar produtos, enviar fotos e marcar o que está esgotado.

> **Imaginou? A gente imprime.**

## O que o site faz

- **Página inicial:** slogan, catálogo com filtro por categoria, encomenda personalizada e "como funciona".
- **Pedido pelo WhatsApp:** cada produto abre o WhatsApp com a mensagem pronta ("Olá! Tenho interesse em: …").
- **Frete:** consulta por CEP com valor e prazo do PAC e do SEDEX (via Melhor Envio) ou orçamento pelo WhatsApp.
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
   Já tinha rodado uma versão antiga do `schema.sql` (com 4 categorias)? Rode também [`supabase/migracoes/001_categorias.sql`](supabase/migracoes/001_categorias.sql): ele cria o campo *tipo de produto* e move os produtos antigos para as novas categorias. Depois rode [`supabase/migracoes/002_arte_sacra.sql`](supabase/migracoes/002_arte_sacra.sql), que libera a categoria *Arte sacra*.
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

## Frete pelos Correios (opcional)

A seção *Calcular frete* confirma a cidade do CEP (ViaCEP) e, se configurada, mostra o valor e o prazo do **PAC** e do **SEDEX** para qualquer CEP do Brasil, calculados para um pacote médio (27 × 20 × 15 cm, 1,4 kg, definido em `lib/frete.ts`), via [Melhor Envio](https://melhorenvio.com.br), que é gratuito e não exige contrato com os Correios.

1. Crie a conta no Melhor Envio e gere um token em *Integrações > Permissões de acesso > Tokens* (marque a permissão `shipping-calculate`).
2. Na Vercel, adicione as variáveis (sem `NEXT_PUBLIC_`, elas ficam só no servidor):
   - `MELHOR_ENVIO_TOKEN`: o token gerado;
   - `CEP_ORIGEM` (opcional): o CEP de onde as peças são enviadas, só números. Sem ela, vale `14802269`.
3. Faça o *Redeploy*.

Sem o token, a consulta confirma a cidade e oferece o orçamento do frete pelo WhatsApp.

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
supabase/migracoes/     # alterações para bancos já criados
public/                 # logo
```
