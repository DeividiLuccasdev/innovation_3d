"use client";

import { createContext, useCallback, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  CHAVE_ARMAZENAMENTO,
  MAX_QUANTIDADE,
  lerCarrinho,
  subtotal,
  totalItens,
  valorEntrega,
  type Entrega,
  type ItemCarrinho,
} from "@/lib/carrinho";
import { formatarCep, soDigitos, type OpcaoFrete, type RespostaFrete } from "@/lib/frete";
import { formatarTelefone } from "@/lib/contato";
import { formatarPreco, type Produto } from "@/lib/produtos";

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

const ENDERECO_VAZIO = { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

export function GavetaCarrinho() {
  const { itens, aberto, fechar, alterar, remover, limpar } = useCarrinho();
  const [cep, setCep] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [erroFrete, setErroFrete] = useState("");
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [endereco, setEndereco] = useState(ENDERECO_VAZIO);
  const [contato, setContato] = useState({ nome: "", email: "", telefone: "" });
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmado, setConfirmado] = useState<{ codigo: string; email: string } | null>(null);

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
      setEndereco((atual) => ({
        ...atual,
        logradouro: dados.logradouro ?? atual.logradouro,
        bairro: dados.bairro ?? atual.bairro,
        cidade: dados.cidade ?? atual.cidade,
        uf: dados.uf ?? atual.uf,
      }));
      setOpcoes(dados.opcoes);
      setEntrega(dados.opcoes.length ? null : { tipo: "a-calcular", cep });
    } catch {
      setErroFrete("Não foi possível calcular agora. Você pode finalizar e confirmamos o frete com o pedido.");
      if (soDigitos(cep).length === 8) setEntrega({ tipo: "a-calcular", cep });
    } finally {
      setConsultando(false);
    }
  }

  async function confirmar(e: FormEvent) {
    e.preventDefault();
    if (!entrega) {
      setErro("Escolha a forma de entrega.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contato,
          observacoes,
          itens: itens.map((i) => ({ id: i.id, quantidade: i.quantidade })),
          entrega: entrega.tipo === "retirada" ? entrega : { ...entrega, ...endereco },
        }),
      });
      const r = await resposta.json();
      if (!resposta.ok) {
        setErro(r.erro ?? "Não foi possível registrar o pedido agora.");
        return;
      }
      setConfirmado({ codigo: r.codigo, email: contato.email });
      limpar();
      setEntrega(null);
      setOpcoes(null);
      setObservacoes("");
    } catch {
      setErro("Não foi possível registrar o pedido agora. Verifique sua conexão e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const total = subtotal(itens) + valorEntrega(entrega);
  const precisaEndereco = entrega !== null && entrega.tipo !== "retirada";
  const campoEndereco = (nome: keyof typeof ENDERECO_VAZIO) => ({
    value: endereco[nome],
    onChange: (e: { target: { value: string } }) => setEndereco({ ...endereco, [nome]: e.target.value }),
  });

  return (
    <div className="gaveta-fundo" onClick={(e) => e.target === e.currentTarget && fechar()}>
      <aside className="gaveta" role="dialog" aria-modal="true" aria-label="Carrinho">
        <header className="gaveta-topo">
          <h2>{confirmado ? "Pedido recebido!" : "Seu carrinho"}</h2>
          <button type="button" className="chat-fechar" aria-label="Fechar carrinho" onClick={fechar}>
            ×
          </button>
        </header>

        {confirmado ? (
          <div className="gaveta-vazia gaveta-confirmado">
            <span className="mono">Pedido nº {confirmado.codigo}</span>
            <p>
              Obrigado! Vamos conferir a disponibilidade e o prazo, e enviaremos a confirmação com o pagamento
              (Pix ou cartão) para <b>{confirmado.email}</b>.
            </p>
            <p className="gaveta-nota">Guarde o número do pedido para acompanhar.</p>
            <button
              type="button"
              className="btn btn-azul"
              onClick={() => {
                setConfirmado(null);
                fechar();
              }}
            >
              Continuar comprando
            </button>
          </div>
        ) : itens.length === 0 ? (
          <div className="gaveta-vazia">
            <IconeCarrinho tamanho={40} />
            <p>Seu carrinho está vazio.</p>
            <a className="btn btn-azul" href="#produtos" onClick={fechar}>
              Ver produtos
            </a>
          </div>
        ) : (
          <form className="gaveta-corpo" id="form-pedido" onSubmit={confirmar}>
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
                  <b>Retirada em Araraquara/SP</b>
                  <small>Combinamos local e horário após a confirmação</small>
                </span>
                <em>Grátis</em>
              </label>

              <div className="gaveta-cep">
                <input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="CEP para envio"
                  aria-label="CEP para envio"
                  value={cep}
                  onChange={(e) => setCep(formatarCep(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && calcularFrete(e)}
                />
                <button type="button" className="btn btn-linha" disabled={consultando || soDigitos(cep).length !== 8} onClick={calcularFrete}>
                  {consultando ? "…" : "Calcular"}
                </button>
              </div>
              {erroFrete && <p className="erro">{erroFrete}</p>}
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

              {precisaEndereco && (
                <div className="gaveta-endereco">
                  <input className="gaveta-campo largo" required placeholder="Rua / avenida" aria-label="Rua" autoComplete="address-line1" maxLength={120} {...campoEndereco("logradouro")} />
                  <input className="gaveta-campo" required placeholder="Número" aria-label="Número" maxLength={20} {...campoEndereco("numero")} />
                  <input className="gaveta-campo" placeholder="Complemento" aria-label="Complemento" autoComplete="address-line2" maxLength={60} {...campoEndereco("complemento")} />
                  <input className="gaveta-campo" placeholder="Bairro" aria-label="Bairro" maxLength={80} {...campoEndereco("bairro")} />
                  <input className="gaveta-campo" required placeholder="Cidade" aria-label="Cidade" autoComplete="address-level2" maxLength={80} {...campoEndereco("cidade")} />
                </div>
              )}
            </section>

            <section className="gaveta-bloco">
              <h3>Seus dados</h3>
              <input className="gaveta-campo" required placeholder="Nome completo" aria-label="Nome completo" autoComplete="name" maxLength={80} value={contato.nome} onChange={(e) => setContato({ ...contato, nome: e.target.value })} />
              <input className="gaveta-campo" required type="email" placeholder="E-mail" aria-label="E-mail" autoComplete="email" maxLength={120} value={contato.email} onChange={(e) => setContato({ ...contato, email: e.target.value })} />
              <input
                className="gaveta-campo"
                required
                inputMode="tel"
                placeholder="Telefone com DDD"
                aria-label="Telefone com DDD"
                autoComplete="tel"
                value={contato.telefone}
                onChange={(e) => setContato({ ...contato, telefone: formatarTelefone(e.target.value) })}
              />
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
          </form>
        )}

        {!confirmado && itens.length > 0 && (
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
            {erro && <p className="erro">{erro}</p>}
            <button type="submit" form="form-pedido" className="btn btn-brilho btn-confirmar" disabled={enviando || entrega === null}>
              {enviando ? "Enviando pedido…" : "Confirmar pedido"}
            </button>
            <small className="gaveta-nota">
              {entrega === null
                ? "Escolha a entrega para continuar."
                : "Você recebe a confirmação e o pagamento (Pix ou cartão) por e-mail. Usamos seus dados só para este pedido."}
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
