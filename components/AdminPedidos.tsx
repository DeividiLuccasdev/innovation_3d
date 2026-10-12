"use client";

import { useCallback, useEffect, useState } from "react";
import { formatarPreco } from "@/lib/produtos";
import { formatarCep } from "@/lib/frete";
import { formatarTelefone } from "@/lib/contato";
import { supabase } from "@/lib/supabase";

type Entrega = {
  tipo: "retirada" | "correios" | "a-calcular";
  servico?: string;
  prazo?: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

type Pedido = {
  id: string;
  codigo: string;
  criado_em: string;
  status: string;
  nome: string;
  email: string;
  telefone: string;
  entrega: Entrega;
  itens: { id: string; nome: string; preco: number; quantidade: number }[];
  subtotal: number;
  frete: number;
  total: number;
  observacoes: string | null;
};

type Orcamento = {
  id: string;
  criado_em: string;
  status: string;
  nome: string;
  email: string;
  telefone: string;
  assunto: string | null;
  descricao: string;
  referencia: string | null;
};

const STATUS_PEDIDO = ["novo", "aguardando pagamento", "pago", "em produção", "enviado", "concluído", "cancelado"];
const STATUS_ORCAMENTO = ["novo", "respondido", "fechado", "descartado"];

const data = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

function textoEntrega(e: Entrega) {
  if (e.tipo === "retirada") return "Retirada em Araraquara/SP";
  const endereco = [
    [e.logradouro, e.numero].filter(Boolean).join(", "),
    e.complemento,
    e.bairro,
    [e.cidade, e.uf].filter(Boolean).join("/"),
    e.cep ? `CEP ${formatarCep(e.cep)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const forma = e.tipo === "correios" ? `${e.servico} (até ${e.prazo} dias úteis)` : "Frete a calcular";
  return `${forma} — ${endereco}`;
}

// Contato iniciado pela loja: o telefone do cliente abre no WhatsApp só aqui no painel
const linkCliente = (telefone: string) => `https://wa.me/55${telefone.replace(/\D/g, "")}`;

function Contato({ nome, email, telefone, assunto }: { nome: string; email: string; telefone: string; assunto: string }) {
  return (
    <p className="pedido-contato">
      <b>{nome}</b>
      <a href={`mailto:${email}?subject=${encodeURIComponent(assunto)}`}>{email}</a>
      <a href={`tel:+55${telefone.replace(/\D/g, "")}`}>{formatarTelefone(telefone)}</a>
      <a href={linkCliente(telefone)} target="_blank" rel="noopener noreferrer">
        WhatsApp do cliente
      </a>
    </p>
  );
}

function SeletorStatus({ valor, opcoes, aoMudar }: { valor: string; opcoes: string[]; aoMudar: (s: string) => void }) {
  return (
    <select className={`status-select s-${valor.replace(/\s/g, "-")}`} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-label="Status">
      {opcoes.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  );
}

export default function AdminPedidos({ tabela }: { tabela: "pedidos" | "orcamentos" }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [abertos, setAbertos] = useState(true);

  const carregar = useCallback(async () => {
    setErro("");
    const { data: linhas, error } = await supabase().from(tabela).select("*").order("criado_em", { ascending: false }).limit(200);
    if (error) {
      setErro(
        error.code === "42P01" || /does not exist|schema cache/i.test(error.message)
          ? "Tabela não encontrada. Rode a migração 005_pedidos_orcamentos.sql no SQL Editor do Supabase."
          : `Não foi possível carregar: ${error.message}`
      );
    } else if (tabela === "pedidos") {
      setPedidos((linhas ?? []).map((p) => ({ ...p, subtotal: Number(p.subtotal), frete: Number(p.frete), total: Number(p.total) })));
    } else {
      setOrcamentos(linhas ?? []);
    }
    setCarregando(false);
  }, [tabela]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function mudarStatus(id: string, status: string) {
    const { error } = await supabase().from(tabela).update({ status }).eq("id", id);
    if (error) setErro(`Não foi possível alterar o status: ${error.message}`);
    else if (tabela === "pedidos") setPedidos((l) => l.map((p) => (p.id === id ? { ...p, status } : p)));
    else setOrcamentos((l) => l.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const finalizados = tabela === "pedidos" ? ["concluído", "cancelado"] : ["fechado", "descartado"];
  const filtrar = <T extends { status: string }>(l: T[]) => (abertos ? l.filter((x) => !finalizados.includes(x.status)) : l);
  const listaPedidos = filtrar(pedidos);
  const listaOrcamentos = filtrar(orcamentos);
  const vazio = tabela === "pedidos" ? listaPedidos.length === 0 : listaOrcamentos.length === 0;

  return (
    <div className="pedidos-admin">
      <div className="pedidos-barra">
        <label className="pedidos-filtro">
          <input type="checkbox" checked={abertos} onChange={(e) => setAbertos(e.target.checked)} />
          Só em aberto
        </label>
        <button type="button" className="mini" onClick={carregar}>
          Atualizar
        </button>
      </div>

      {erro && <p className="erro" role="alert">{erro}</p>}
      {carregando && <p className="sub">Carregando…</p>}
      {!carregando && !erro && vazio && (
        <p className="sub">{tabela === "pedidos" ? "Nenhum pedido por aqui ainda." : "Nenhum pedido de orçamento por aqui ainda."}</p>
      )}

      {tabela === "pedidos" &&
        listaPedidos.map((p) => (
          <article key={p.id} className="pedido-card">
            <header>
              <span>
                <b className="mono">Pedido {p.codigo}</b>
                <small>{data(p.criado_em)}</small>
              </span>
              <SeletorStatus valor={p.status} opcoes={STATUS_PEDIDO} aoMudar={(s) => mudarStatus(p.id, s)} />
            </header>
            <ul>
              {p.itens.map((i) => (
                <li key={i.id}>
                  <span>
                    {i.quantidade}× {i.nome}
                  </span>
                  <span>{formatarPreco(i.preco * i.quantidade)}</span>
                </li>
              ))}
              <li>
                <span>Frete</span>
                <span>{p.entrega.tipo === "a-calcular" ? "a calcular" : formatarPreco(p.frete)}</span>
              </li>
              <li className="forte">
                <span>Total</span>
                <span>{formatarPreco(p.total)}</span>
              </li>
            </ul>
            <p className="pedido-entrega">{textoEntrega(p.entrega)}</p>
            {p.observacoes && <p className="pedido-obs">“{p.observacoes}”</p>}
            <Contato nome={p.nome} email={p.email} telefone={p.telefone} assunto={`Innovation 3D — pedido ${p.codigo}`} />
          </article>
        ))}

      {tabela === "orcamentos" &&
        listaOrcamentos.map((o) => (
          <article key={o.id} className="pedido-card">
            <header>
              <span>
                <b>{o.assunto || "Orçamento"}</b>
                <small>{data(o.criado_em)}</small>
              </span>
              <SeletorStatus valor={o.status} opcoes={STATUS_ORCAMENTO} aoMudar={(s) => mudarStatus(o.id, s)} />
            </header>
            <p className="pedido-obs">{o.descricao}</p>
            {o.referencia && /^https?:\/\//i.test(o.referencia) && (
              <a className="pedido-ref" href={o.referencia} target="_blank" rel="noopener noreferrer nofollow">
                Ver referência
              </a>
            )}
            <Contato nome={o.nome} email={o.email} telefone={o.telefone} assunto={`Innovation 3D — ${o.assunto || "orçamento"}`} />
          </article>
        ))}
    </div>
  );
}
