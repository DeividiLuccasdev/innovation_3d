# Innovation 3D

Site da **Innovation 3D**: catálogo de produtos impressos em 3D com carrinho e pedido pelo próprio site, formulário de orçamento e um painel para o dono cadastrar produtos e acompanhar pedidos. O site não expõe WhatsApp: o contato com o cliente parte da loja.

> **Imaginou? A gente imprime.**

## O que o site faz

- **Página inicial:** slogan, catálogo com filtro por categoria, encomenda personalizada e "como funciona".
- **Carrinho:** o cliente adiciona produtos, escolhe retirada ou frete dos Correios informa endereço e contato e confirma o pedido, que é gravado no Supabase com número (ex.: `A1B2C3`). Os preços são conferidos no banco, então não dá para alterar o valor pelo navegador. O carrinho fica salvo no navegador.
- **Assistente Inno:** chat com respostas rápidas (pedido, prazo, materiais, frete, pagamento, personalização), busca no catálogo e, quando não sabe, abre o formulário de orçamento com a pergunta. Textos em `lib/chatbot.ts`.
- **Orçamento:** "Quero personalizar", "Pedir orçamento" e itens sob encomenda abrem um formulário (nome, e-mail, telefone, descrição e link de referência) que fica salvo para o painel.
- **Frete:** consulta por CEP com valor e prazo do PAC e do SEDEX (via Melhor Envio); sem cotação, o frete é confirmado junto com o pedido.
- **Esgotado:** o produto ganha a faixa "ESGOTADO", a foto fica em cinza e o botão de pedido é desativado.
- **Painel (`/admin`):** login, abas de **Pedidos** e **Orçamentos** (com status: novo, aguardando pagamento, pago, em produção, enviado…), cadastro e edição de produtos, até 6 fotos por produto (reduzidas automaticamente antes do envio), marcar esgotado ou destaque, remover.

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
   Já tinha rodado uma versão antiga do `schema.sql` (com 4 categorias)? Rode também [`supabase/migracoes/001_categorias.sql`](supabase/migracoes/001_categorias.sql): ele cria o campo *tipo de produto* e move os produtos antigos para as novas categorias. Depois rode [`supabase/migracoes/002_arte_sacra.sql`](supabase/migracoes/002_arte_sacra.sql), que libera a categoria *Arte sacra*, e [`supabase/migracoes/003_encomendas.sql`](supabase/migracoes/003_encomendas.sql), que libera *Encomendas personalizadas*, e [`supabase/migracoes/004_ets.sql`](supabase/migracoes/004_ets.sql), que libera *ETs e alienígenas*, e [`supabase/migracoes/005_pedidos_orcamentos.sql`](supabase/migracoes/005_pedidos_orcamentos.sql), que cria os pedidos e os orçamentos feitos pelo site.
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
2. Em *Environment Variables*, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Clique em *Deploy*.

## Frete pelos Correios (opcional)

A seção *Calcular frete* confirma a cidade do CEP (ViaCEP) e, se configurada, mostra o valor e o prazo do **PAC** e do **SEDEX** para qualquer CEP do Brasil, calculados para um pacote médio (27 × 20 × 15 cm, 1,4 kg, definido em `lib/frete.ts`), via [Melhor Envio](https://melhorenvio.com.br), que é gratuito e não exige contrato com os Correios.

1. Crie a conta no Melhor Envio e gere um token em *Integrações > Permissões de acesso > Tokens* (marque a permissão `shipping-calculate`).
2. Na Vercel, adicione as variáveis (sem `NEXT_PUBLIC_`, elas ficam só no servidor):
   - `MELHOR_ENVIO_TOKEN`: o token gerado;
   - `CEP_ORIGEM` (opcional): o CEP de onde as peças são enviadas, só números. Sem ela, vale `14802269`.
3. Faça o *Redeploy*.

Sem o token, a consulta confirma a cidade e o frete é confirmado junto com o pedido.

## Segurança

A chave *anon* do Supabase fica no navegador por natureza. Quem protege os dados são as regras de acesso (RLS) em `supabase/schema.sql`: qualquer pessoa só **lê** o catálogo e as fotos e **envia** pedidos de orçamento (sem poder lê-los); pedidos passam pela função `criar_pedido`, que recalcula os preços no banco; criar, alterar, remover e enviar fotos exige estar logado **e** estar na tabela `administradores`.

## Estrutura

```
app/
├── page.tsx            # página inicial
├── admin/page.tsx      # painel do administrador
└── globals.css
components/             # cards, catálogo, marca
lib/                    # Supabase, produtos, frete, carrinho, chat
supabase/schema.sql     # tabelas e regras de acesso
supabase/migracoes/     # alterações para bancos já criados
public/                 # logo
```
