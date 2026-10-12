"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { formatarTelefone } from "@/lib/contato";

const EVENTO = "innovation:orcamento";

// Abre o formulário de orçamento de qualquer lugar do site, já com o assunto preenchido
export function abrirOrcamento(assunto = "") {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { assunto } }));
}

export function BotaoOrcamento({
  assunto,
  className = "btn btn-azul",
  children = "Solicitar orçamento",
}: {
  assunto?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => abrirOrcamento(assunto)}>
      {children}
    </button>
  );
}

type Estado = "editando" | "enviando" | "enviado";

export default function ModalOrcamento() {
  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState<Estado>("editando");
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState({ nome: "", email: "", telefone: "", assunto: "", descricao: "", referencia: "", site: "" });
  const primeiro = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const abrir = (e: Event) => {
      const { assunto } = (e as CustomEvent<{ assunto: string }>).detail;
      setDados((d) => ({ ...d, assunto: assunto || d.assunto }));
      setEstado("editando");
      setErro("");
      setAberto(true);
    };
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    primeiro.current?.focus();
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  if (!aberto) return null;

  const campo = (nome: keyof typeof dados) => ({
    value: dados[nome],
    onChange: (e: { target: { value: string } }) => setDados({ ...dados, [nome]: e.target.value }),
  });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEstado("enviando");
    try {
      const resposta = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const r = await resposta.json();
      if (!resposta.ok) {
        setErro(r.erro ?? "Não foi possível enviar agora.");
        setEstado("editando");
        return;
      }
      setEstado("enviado");
      setDados((d) => ({ ...d, assunto: "", descricao: "", referencia: "" }));
    } catch {
      setErro("Não foi possível enviar agora. Verifique sua conexão e tente de novo.");
      setEstado("editando");
    }
  }

  return createPortal(
    <div className="modal-fundo" onClick={(e) => e.target === e.currentTarget && setAberto(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="orcamento-titulo">
        <header className="modal-topo">
          <h2 id="orcamento-titulo">{estado === "enviado" ? "Pedido de orçamento enviado" : "Solicitar orçamento"}</h2>
          <button type="button" className="chat-fechar" aria-label="Fechar" onClick={() => setAberto(false)}>
            ×
          </button>
        </header>

        {estado === "enviado" ? (
          <div className="modal-sucesso">
            <p>
              Recebemos sua solicitação! Vamos analisar e responder pelo e-mail <b>{dados.email}</b> ou pelo telefone
              informado, com o valor e o prazo.
            </p>
            <button type="button" className="btn btn-azul" onClick={() => setAberto(false)}>
              Voltar ao site
            </button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={enviar}>
            <p className="modal-intro">Conte o que você imaginou. Respondemos com o valor e o prazo, sem compromisso.</p>
            <label>
              Nome
              <input ref={primeiro} required maxLength={80} autoComplete="name" {...campo("nome")} />
            </label>
            <div className="modal-duas">
              <label>
                E-mail
                <input required type="email" maxLength={120} autoComplete="email" {...campo("email")} />
              </label>
              <label>
                Telefone com DDD
                <input
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(16) 99999-9999"
                  value={dados.telefone}
                  onChange={(e) => setDados({ ...dados, telefone: formatarTelefone(e.target.value) })}
                />
              </label>
            </div>
            <label>
              Assunto
              <input maxLength={160} placeholder="Ex.: chaveiros com logo da empresa" {...campo("assunto")} />
            </label>
            <label>
              O que você precisa?
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                placeholder="Descreva a peça: tamanho aproximado, cor, quantidade, nome ou texto, data que precisa…"
                {...campo("descricao")}
              />
            </label>
            <label>
              Link de referência (opcional)
              <input type="url" maxLength={500} placeholder="Link de uma imagem, Pinterest, modelo 3D…" {...campo("referencia")} />
            </label>
            {/* Campo escondido contra robôs */}
            <input className="campo-oculto" tabIndex={-1} autoComplete="off" aria-hidden="true" {...campo("site")} />
            {erro && <p className="erro">{erro}</p>}
            <button type="submit" className="btn btn-brilho" disabled={estado === "enviando"}>
              {estado === "enviando" ? "Enviando…" : "Enviar pedido de orçamento"}
            </button>
            <small className="gaveta-nota">Usamos seus dados só para responder a este pedido.</small>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
