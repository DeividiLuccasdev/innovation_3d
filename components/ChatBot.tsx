"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ASSUNTOS, SAUDACAO, responder, type Acao, type Resposta } from "@/lib/chatbot";
import type { Produto } from "@/lib/produtos";
import { linkWhatsApp } from "@/lib/whatsapp";

type Mensagem = { de: "bot" | "cliente"; texto: string; acoes?: Acao[] };

// Leva o catálogo até a categoria/tipo escolhido (o Catalogo escuta este evento)
export const EVENTO_FILTRO = "innovation:filtrar-catalogo";

export default function ChatBot({ produtos }: { produtos: Produto[] }) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ de: "bot", ...SAUDACAO }]);
  const [texto, setTexto] = useState("");
  const fim = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" });
  }, [mensagens, aberto]);

  useEffect(() => {
    if (!aberto) return;
    campo.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto]);

  function perguntar(pergunta: string, resposta?: Resposta) {
    const r = resposta ?? responder(pergunta, produtos);
    setMensagens((atual) => [...atual, { de: "cliente", texto: pergunta }, { de: "bot", ...r }]);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    perguntar(texto.trim());
    setTexto("");
  }

  function agir(acao: Acao) {
    if (acao.tipo === "whatsapp") {
      window.open(linkWhatsApp(acao.mensagem), "_blank", "noopener,noreferrer");
      return;
    }
    setAberto(false);
    if (acao.tipo === "catalogo") {
      window.dispatchEvent(new CustomEvent(EVENTO_FILTRO, { detail: { categoria: acao.categoria, subtipo: acao.subtipo } }));
      return;
    }
    document.querySelector(acao.alvo)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <button
        type="button"
        className="chat-abrir"
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente de dúvidas"}
        aria-expanded={aberto}
        aria-controls="chat-janela"
        onClick={() => setAberto(!aberto)}
      >
        {aberto ? (
          <span aria-hidden="true" className="chat-x">×</span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5h16v11H9l-5 4z" />
            <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" strokeLinecap="round" strokeWidth="2.6" />
          </svg>
        )}
      </button>

      {aberto && (
        <section className="chat" id="chat-janela" role="dialog" aria-label="Assistente da Innovation 3D">
          <header className="chat-topo">
            <span className="chat-avatar" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/globo-marca.webp" alt="" />
            </span>
            <span>
              <b>Inno</b>
              <small>Assistente virtual · respostas rápidas</small>
            </span>
            <button type="button" className="chat-fechar" aria-label="Fechar assistente" onClick={() => setAberto(false)}>
              ×
            </button>
          </header>

          <div className="chat-mensagens" aria-live="polite">
            {mensagens.map((m, i) => (
              <div key={i} className={`chat-msg ${m.de}`}>
                <p>{m.texto}</p>
                {m.acoes && m.acoes.length > 0 && (
                  <div className="chat-acoes">
                    {m.acoes.map((a) => (
                      <button key={a.rotulo} type="button" className={a.tipo === "whatsapp" ? "whats" : ""} onClick={() => agir(a)}>
                        {a.rotulo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={fim} />
          </div>

          <div className="chat-assuntos" role="group" aria-label="Assuntos">
            {ASSUNTOS.map((a) => (
              <button key={a.id} type="button" onClick={() => perguntar(a.rotulo, a.resposta)}>
                {a.rotulo}
              </button>
            ))}
          </div>

          <form className="chat-form" onSubmit={enviar}>
            <input
              ref={campo}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ex.: vocês fazem topo de bolo?"
              aria-label="Sua pergunta"
              maxLength={300}
            />
            <button type="submit" aria-label="Enviar" disabled={!texto.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 20.5 21 12 3 3.5l2.6 7L15 12l-9.4 1.5z" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </>
  );
}
