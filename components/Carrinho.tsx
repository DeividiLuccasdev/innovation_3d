"use client";

import { createContext, useCallback, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  CHAVE_ARMAZENAMENTO,
  MAX_QUANTIDADE,
  lerCarrinho,
  mensagemPedido,
  subtotal,
  totalItens,
  valorEntrega,
  type Entrega,
  type ItemCarrinho,
} from "@/lib/carrinho";
import { formatarCep, soDigitos, type OpcaoFrete, type RespostaFrete } from "@/lib/frete";
import { formatarPreco, type Produto } from "@/lib/produtos";
import { linkWhatsApp } from "@/lib/whatsapp";

type ContextoCarrinho = {
  itens: ItemCarrinho[];
  aberto: boolean;
  abrir: () => void;
  fechar: () => void;
  adicionar: (p: Produto) => void;
  alterar: (id: string, quantidade: number) => void;
  remover: (id: string) => void;
  limpar: () => void;
};

const Contexto = createContext<ContextoCarrinho | null>(null);

export function useCarrinho() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCarrinho precisa estar dentro de <CarrinhoProvider>");
  return ctx;
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [aberto, setAberto] = useState(false);

  // O carrinho fica salvo neste navegador; se o armazenamento estiver bloqueado, funciona só na visita
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItens(lerCarrinho(localStorage.getItem(CHAVE_ARMAZENAMENTO)));
    } catch {}
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(itens));
    } catch {}
  }, [itens, carregado]);

  const abrir = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);

  const valor: ContextoCarrinho = {
    itens,
    aberto,
    abrir,
    fechar,
    adicionar: (p) =>
      setItens((atual) => {
        const existente = atual.find((i) => i.id === p.id);
        if (existente) {
          return atual.map((i) => (i.id === p.id ? { ...i, quantidade: Math.min(MAX_QUANTIDADE, i.quantidade + 1) } : i));
        }
        return [...atual, { id: p.id, nome: p.nome, preco: p.preco, foto: p.fotos[0] ?? null, quantidade: 1 }];
      }),
    alterar: (id, quantidade) =>
      setItens((atual) =>
        atual.map((i) => (i.id === id ? { ...i, quantidade: Math.min(MAX_QUANTIDADE, Math.max(1, quantidade)) } : i))
      ),
    remover: (id) => setItens((atual) => atual.filter((i) => i.id !== id)),
    limpar: () => setItens([]),
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

const IconeCarrinho = ({ tamanho = 20 }: { tamanho?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4h2l2.4 11h10.8L21 7H6.2" />
    <circle cx="9.5" cy="19.5" r="1.5" />
    <circle cx="17" cy="19.5" r="1.5" />
  </svg>
);

export function BotaoCarrinho() {
  const { itens, abrir } = useCarrinho();
  const qtd = totalItens(itens);
  return (
    <button type="button" className="btn-carrinho" onClick={abrir} aria-label={`Abrir carrinho, ${qtd} ${qtd === 1 ? "item" : "itens"}`}>
      <IconeCarrinho />
      {qtd > 0 && <span className="carrinho-qtd" key={qtd}>{qtd}</span>}
    </button>
  );
}

export function BotaoAdicionar({ produto }: { produto: Produto }) {
  const { adicionar } = useCarrinho();
  const [feito, setFeito] = useState(false);

  useEffect(() => {
    if (!feito) return;
    const t = setTimeout(() => setFeito(false), 1600);
    return () => clearTimeout(t);
  }, [feito]);

  return (
    <button
      type="button"
      className={`btn btn-azul btn-pedir ${feito ? "adicionado" : ""}`}
      onClick={() => {
        adicionar(produto);
        setFeito(true);
      }}
    >
      {feito ? "Adicionado ✓" : (<><IconeCarrinho tamanho={17} /> Adicionar</>)}
    </button>
  );
}

export function GavetaCarrinho() {
  const { itens, aberto, fechar, alterar, remover, limpar } = useCarrinho();
  const [cep, setCep] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [cidade, setCidade] = useState("");
  const [erroFrete, setErroFrete] = useState("");
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [nome, setNome] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto, fechar]);

  if (!aberto) return null;

  async function calcularFrete(e: FormEvent) {
    e.preventDefault();
    setErroFrete("");
    setOpcoes(null);
    setEntrega(null);
    setConsultando(true);
    try {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep }),
      });
      const dados: RespostaFrete & { erro?: string } = await resposta.json();
      if (!resposta.ok) {
        setErroFrete(dados.erro ?? "Não foi possível calcular agora.");
        return;
      }
      setCidade(dados.cidade ? `${dados.cidade}/${dados.uf}` : "");
      setOpcoes(dados.opcoes);
      setEntrega(dados.opcoes.length ? null : { tipo: "a-calcular", cep });
    } catch {
      setErroFrete("Não foi possível calcular agora. Você pode finalizar e combinamos o frete.");
      if (soDigitos(cep).length === 8) setEntrega({ tipo: "a-calcular", cep });
    } finally {
      setConsultando(false);
    }
  }

  const total = subtotal(itens) + valorEntrega(entrega);
  const podeFinalizar = itens.length > 0 && entrega !== null;

  return (
    <div className="gaveta-fundo" onClick={(e) => e.target === e.currentTarget && fechar()}>
      <aside className="gaveta" role="dialog" aria-modal="true" aria-label="Carrinho">
        <header className="gaveta-topo">
          <h2>Seu carrinho</h2>
          <button type="button" className="chat-fechar" aria-label="Fechar carrinho" onClick={fechar}>
            ×
          </button>
        </header>

        {itens.length === 0 ? (
          <div className="gaveta-vazia">
            <IconeCarrinho tamanho={40} />
            <p>Seu carrinho está vazio.</p>
            <a className="btn btn-azul" href="#produtos" onClick={fechar}>
              Ver produtos
            </a>
          </div>
        ) : (
          <div className="gaveta-corpo">
            <ul className="gaveta-itens">
              {itens.map((i) => (
                <li key={i.id}>
                  <div className="gaveta-foto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {i.foto ? <img src={i.foto} alt="" /> : <IconeCarrinho tamanho={22} />}
                  </div>
                  <div className="gaveta-info">
                    <b>{i.nome}</b>
                    <small>{formatarPreco(i.preco)} cada</small>
                    <div className="gaveta-qtd">
                      <button type="button" aria-label={`Diminuir ${i.nome}`} onClick={() => (i.quantidade > 1 ? alterar(i.id, i.quantidade - 1) : remover(i.id))}>
                        −
                      </button>
                      <span aria-live="polite">{i.quantidade}</span>
                      <button type="button" aria-label={`Aumentar ${i.nome}`} onClick={() => alterar(i.id, i.quantidade + 1)}>
                        +
                      </button>
                      <button type="button" className="gaveta-remover" onClick={() => remover(i.id)}>
                        Remover
                      </button>
                    </div>
                  </div>
                  <span className="gaveta-preco">{formatarPreco(i.preco * i.quantidade)}</span>
                </li>
              ))}
            </ul>

            <section className="gaveta-bloco">
              <h3>Entrega</h3>
              <label className="opcao-entrega">
                <input type="radio" name="entrega" checked={entrega?.tipo === "retirada"} onChange={() => setEntrega({ tipo: "retirada" })} />
                <span>
                  <b>Retirada combinada</b>
                  <small>Combinamos local e horário pelo WhatsApp</small>
                </span>
                <em>Grátis</em>
              </label>

              <form className="gaveta-cep" onSubmit={calcularFrete}>
                <input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="CEP para envio"
                  aria-label="CEP para envio"
                  value={cep}
                  onChange={(e) => setCep(formatarCep(e.target.value))}
                />
                <button type="submit" className="btn btn-linha" disabled={consultando || soDigitos(cep).length !== 8}>
                  {consultando ? "…" : "Calcular"}
                </button>
              </form>
              {erroFrete && <p className="erro">{erroFrete}</p>}
              {cidade && <small className="mono gaveta-cidade">Entrega para {cidade}</small>}
              {opcoes?.map((o) => (
                <label key={o.servico} className="opcao-entrega">
                  <input
                    type="radio"
                    name="entrega"
                    checked={entrega?.tipo === "correios" && entrega.servico === o.servico}
                    onChange={() => setEntrega({ tipo: "correios", servico: o.servico, preco: o.preco, prazo: o.prazo, cep })}
                  />
                  <span>
                    <b>{o.servico}</b>
                    <small>até {o.prazo} dias úteis após o envio</small>
                  </span>
                  <em>{formatarPreco(o.preco)}</em>
                </label>
              ))}
              {entrega?.tipo === "a-calcular" && (
                <p className="gaveta-nota">Envio pelos Correios para o CEP {entrega.cep}. O valor do frete vai junto com a confirmação do pedido.</p>
              )}
            </section>

            <section className="gaveta-bloco">
              <h3>Seus dados</h3>
              <input className="gaveta-campo" placeholder="Seu nome" aria-label="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />
              <textarea
                className="gaveta-campo"
                placeholder="Observações: cor, tamanho, nome para personalizar…"
                aria-label="Observações"
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                maxLength={500}
              />
            </section>
          </div>
        )}

        {itens.length > 0 && (
          <footer className="gaveta-rodape">
            <div className="gaveta-total">
              <span>Subtotal</span>
              <span>{formatarPreco(subtotal(itens))}</span>
            </div>
            <div className="gaveta-total">
              <span>Entrega</span>
              <span>
                {entrega === null ? "escolha acima" : entrega.tipo === "correios" ? formatarPreco(entrega.preco) : entrega.tipo === "retirada" ? "Grátis" : "a calcular"}
              </span>
            </div>
            <div className="gaveta-total forte">
              <span>Total</span>
              <span>{formatarPreco(total)}</span>
            </div>
            <a
              className={`btn btn-whats-pedido ${podeFinalizar ? "" : "desativado"}`}
              aria-disabled={!podeFinalizar}
              target="_blank"
              rel="noopener noreferrer"
              href={podeFinalizar ? linkWhatsApp(mensagemPedido(itens, entrega, nome, observacoes)) : undefined}
              onClick={(e) => !podeFinalizar && e.preventDefault()}
            >
              Finalizar pedido pelo WhatsApp
            </a>
            <small className="gaveta-nota">
              {podeFinalizar
                ? "Confirmamos disponibilidade, prazo e pagamento pelo WhatsApp."
                : "Escolha a entrega para finalizar."}
            </small>
            <button type="button" className="gaveta-limpar" onClick={limpar}>
              Esvaziar carrinho
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
