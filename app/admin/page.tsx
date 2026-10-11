"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import CardProduto from "@/components/CardProduto";
import Marca from "@/components/Marca";
import { CATALOGO, CATEGORIAS, ordenarProdutos, type Categoria, type Produto } from "@/lib/produtos";
import { BUCKET_FOTOS, projetoSupabase, supabase, supabaseConfigurado } from "@/lib/supabase";

type Formulario = {
  nome: string;
  descricao: string;
  preco: string;
  categoria: Categoria;
  subcategoria: string;
  material: string;
  tamanho: string;
  tempo_impressao: string;
  fotos: string[];
};

const VAZIO: Formulario = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "Decoração residencial",
  subcategoria: "",
  material: "",
  tamanho: "",
  tempo_impressao: "",
  fotos: [],
};

const MAX_FOTOS = 6;

// Reduz a foto para no máximo 1400px e converte para WebP antes de enviar
async function comprimir(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao processar a foto."))), "image/webp", 0.85)
  );
}

function caminhoDaFoto(url: string) {
  const marcador = `/object/public/${BUCKET_FOTOS}/`;
  const i = url.indexOf(marcador);
  return i >= 0 ? decodeURIComponent(url.slice(i + marcador.length)) : null;
}

function mensagemDeErro(erro: unknown) {
  const texto = erro instanceof Error ? erro.message : String((erro as { message?: string })?.message ?? erro);

  if (/row-level security|permission|not authorized|Unauthorized/i.test(texto)) {
    return "Seu usuário não está cadastrado como administrador. Veja o passo 4 do README.";
  }

  return texto || "Algo deu errado. Tente de novo.";
}

export default function Admin() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(supabaseConfigurado);

  useEffect(() => {
    if (!supabaseConfigurado) return;

    supabase()
      .auth.getSession()
      .then(({ data }) => {
        setSessao(data.session);
        setCarregandoSessao(false);
      });

    const { data } = supabase().auth.onAuthStateChange((_evento, s) => setSessao(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="topo">
        <div className="wrap">
          <Marca />
          <span className="mono" style={{ marginLeft: "auto", color: "var(--muted)" }}>
            Painel do administrador
          </span>
        </div>
      </header>

      <main className="wrap admin-pagina">
        {!supabaseConfigurado ? (
          <p className="aviso">
            O Supabase ainda não foi configurado. Siga os passos do README e preencha as variáveis{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
        ) : carregandoSessao ? (
          <p>Carregando…</p>
        ) : sessao ? (
          <Painel email={sessao.user.email ?? ""} />
        ) : (
          <Login />
        )}
      </main>
    </>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEntrando(true);
    try {
      const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) setErro(erroDeLogin(error.message));
    } catch (falha) {
      setErro(`Não foi possível conectar ao Supabase: ${falha instanceof Error ? falha.message : falha}`);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <form className="login" onSubmit={entrar}>
      <h1>Entrar</h1>
      {erro && <p className="erro">{erro}</p>}
      <label>
        E-mail
        <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      </label>
      <label>
        Senha
        <input id="login-senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
      </label>
      <button className="btn btn-azul" type="submit" disabled={entrando}>
        {entrando ? "Entrando…" : "Entrar"}
      </button>
      <small className="mono projeto">Projeto: {projetoSupabase ?? "não configurado"}</small>
    </form>
  );
}

// Traduz os erros mais comuns do Supabase; os demais aparecem como vieram
function erroDeLogin(mensagem: string) {
  if (/invalid login credentials/i.test(mensagem)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(mensagem)) return "E-mail ainda não confirmado no Supabase.";
  if (/invalid api key|no api key/i.test(mensagem))
    return "Chave do Supabase inválida: confira NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel.";
  if (/failed to fetch|network/i.test(mensagem))
    return "Sem conexão com o Supabase: confira NEXT_PUBLIC_SUPABASE_URL na Vercel.";
  return `Não foi possível entrar: ${mensagem}`;
}

function Painel({ email }: { email: string }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState<Formulario>(VAZIO);
  const [editando, setEditando] = useState<string | null>(null);
  const [novasFotos, setNovasFotos] = useState<{ arquivo: File; previa: string }[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [confirmarRemocao, setConfirmarRemocao] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase().from("produtos").select("*");
    if (error) {
      setErro(mensagemDeErro(error));
      return;
    }
    setProdutos((data ?? []).map((p) => ({ ...p, preco: Number(p.preco) })));
  }, []);

  useEffect(() => {
    // Busca inicial do catálogo; o estado é atualizado quando a resposta chega
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  function avisar(texto: string) {
    setErro("");
    setMensagem(`${texto} O site público atualiza em até 30 segundos.`);
  }

  function limparFormulario() {
    novasFotos.forEach((f) => URL.revokeObjectURL(f.previa));
    setForm(VAZIO);
    setEditando(null);
    setNovasFotos([]);
  }

  function editar(p: Produto) {
    limparFormulario();
    setEditando(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: p.preco.toFixed(2).replace(".", ","),
      categoria: CATEGORIAS.includes(p.categoria) ? p.categoria : VAZIO.categoria,
      subcategoria: p.subcategoria ?? "",
      material: p.material ?? "",
      tamanho: p.tamanho ?? "",
      tempo_impressao: p.tempo_impressao ?? "",
      fotos: p.fotos,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function escolherFotos(arquivos: FileList | null) {
    if (!arquivos) return;
    const espaco = MAX_FOTOS - form.fotos.length - novasFotos.length;
    const escolhidas = Array.from(arquivos).slice(0, Math.max(0, espaco));
    if (arquivos.length > escolhidas.length) setErro(`Cada produto pode ter até ${MAX_FOTOS} fotos.`);
    setNovasFotos((atual) => [
      ...atual,
      ...escolhidas.map((arquivo) => ({ arquivo, previa: URL.createObjectURL(arquivo) })),
    ]);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");

    const preco = Number(form.preco.replace(/\./g, "").replace(",", "."));
    if (!form.nome.trim() || !Number.isFinite(preco) || preco < 0) {
      setErro("Informe o nome e um preço válido, por exemplo 49,90.");
      return;
    }

    setSalvando(true);
    try {
      const urls: string[] = [];
      for (const { arquivo } of novasFotos) {
        const blob = await comprimir(arquivo);
        const caminho = `${crypto.randomUUID()}.webp`;
        const { error } = await supabase().storage.from(BUCKET_FOTOS).upload(caminho, blob, {
          contentType: "image/webp",
          cacheControl: "31536000",
        });
        if (error) throw error;
        urls.push(supabase().storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl);
      }

      const dados = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        preco,
        categoria: form.categoria,
        subcategoria: form.subcategoria || null,
        material: form.material.trim() || null,
        tamanho: form.tamanho.trim() || null,
        tempo_impressao: form.tempo_impressao.trim() || null,
        fotos: [...form.fotos, ...urls],
      };

      const { error } = editando
        ? await supabase().from("produtos").update(dados).eq("id", editando)
        : await supabase().from("produtos").insert(dados);
      if (error) throw error;

      avisar(editando ? `"${dados.nome}" atualizado.` : `"${dados.nome}" adicionado ao catálogo.`);
      limparFormulario();
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(p: Produto, campo: "esgotado" | "destaque") {
    const { error } = await supabase().from("produtos").update({ [campo]: !p[campo] }).eq("id", p.id);
    if (error) return setErro(mensagemDeErro(error));
    if (campo === "esgotado") avisar(!p.esgotado ? `"${p.nome}" marcado como esgotado.` : `"${p.nome}" disponível de novo.`);
    await carregar();
  }

  async function remover(p: Produto) {
    const { error } = await supabase().from("produtos").delete().eq("id", p.id);
    if (error) return setErro(mensagemDeErro(error));

    const caminhos = p.fotos.map(caminhoDaFoto).filter((c): c is string => Boolean(c));
    if (caminhos.length) await supabase().storage.from(BUCKET_FOTOS).remove(caminhos);

    setConfirmarRemocao(null);
    if (editando === p.id) limparFormulario();
    avisar(`"${p.nome}" removido.`);
    await carregar();
  }

  const campo = (nome: keyof Formulario) => ({
    value: form[nome] as string,
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [nome]: e.target.value }),
  });

  return (
    <>
      <div className="admin-topo">
        <h1>Produtos</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="mono" style={{ color: "var(--muted)" }}>{email}</span>
          <a className="btn btn-linha btn-admin" href="/" target="_blank" rel="noopener noreferrer">Ver site</a>
          <button className="btn btn-linha btn-admin" onClick={() => supabase().auth.signOut()}>Sair</button>
        </div>
      </div>

      {mensagem && <p className="aviso" role="status">{mensagem}</p>}
      {erro && <p className="erro" role="alert">{erro}</p>}

      <div className="admin" style={{ marginTop: 16 }}>
        <h3>{editando ? "Editar produto" : "Novo produto"}</h3>
        <p className="sub">As fotos são reduzidas automaticamente antes do envio. Até {MAX_FOTOS} por produto.</p>
        <form className="form" onSubmit={salvar}>
          <label>Nome<input id="p-nome" required placeholder="Ex.: Vaso geométrico" {...campo("nome")} /></label>
          <label>Preço (R$)<input id="p-preco" required inputMode="decimal" placeholder="49,90" {...campo("preco")} /></label>
          <label>
            Categoria
            <select id="p-categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as Categoria, subcategoria: "" })}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Tipo de produto
            <select id="p-subcategoria" value={form.subcategoria} onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}>
              <option value="">Sem tipo definido</option>
              {CATALOGO[form.categoria].itens.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Material<input id="p-material" placeholder="PLA" {...campo("material")} /></label>
          <label>Tamanho<input id="p-tamanho" placeholder="12 × 12 × 18 cm" {...campo("tamanho")} /></label>
          <label>Tempo de impressão<input id="p-tempo" placeholder="6 h" {...campo("tempo_impressao")} /></label>
          <label className="largo">Descrição (opcional)<textarea id="p-descricao" rows={2} {...campo("descricao")} /></label>

          <div className="largo fotos-form">
            {form.fotos.map((url) => (
              <figure key={url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" />
                <button type="button" aria-label="Tirar esta foto" onClick={() => setForm({ ...form, fotos: form.fotos.filter((f) => f !== url) })}>×</button>
              </figure>
            ))}
            {novasFotos.map((f) => (
              <figure key={f.previa}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.previa} alt="" />
                <button type="button" aria-label="Tirar esta foto" onClick={() => { URL.revokeObjectURL(f.previa); setNovasFotos(novasFotos.filter((n) => n !== f)); }}>×</button>
              </figure>
            ))}
            <label htmlFor="p-fotos" className="btn btn-linha">Adicionar fotos</label>
            <input id="p-fotos" type="file" accept="image/*" multiple hidden onChange={(e) => { escolherFotos(e.target.files); e.target.value = ""; }} />
          </div>

          <div className="largo" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-vermelho" type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Adicionar produto"}
            </button>
            {editando && <button type="button" className="btn btn-linha" onClick={limparFormulario}>Cancelar edição</button>}
          </div>
        </form>
      </div>

      <div className="grade">
        {ordenarProdutos(produtos).map((p) => (
          <CardProduto key={p.id} produto={p}>
            <div className="controles-admin">
              <button className={`mini ${p.esgotado ? "ativo-esg" : ""}`} onClick={() => alternar(p, "esgotado")}>
                {p.esgotado ? "Esgotado ✓" : "Marcar esgotado"}
              </button>
              <button className={`mini ${p.destaque ? "ativo-dest" : ""}`} onClick={() => alternar(p, "destaque")}>
                {p.destaque ? "Destaque ✓" : "Destacar"}
              </button>
              <button className="mini" onClick={() => editar(p)}>Editar</button>
              {confirmarRemocao === p.id ? (
                <>
                  <button className="mini ativo-esg" onClick={() => remover(p)}>Confirmar remoção</button>
                  <button className="mini" onClick={() => setConfirmarRemocao(null)}>Cancelar</button>
                </>
              ) : (
                <button className="mini perigo" onClick={() => setConfirmarRemocao(p.id)}>Remover</button>
              )}
            </div>
          </CardProduto>
        ))}
        {produtos.length === 0 && <p>Nenhum produto cadastrado ainda. Use o formulário acima.</p>}
      </div>
    </>
  );
}
