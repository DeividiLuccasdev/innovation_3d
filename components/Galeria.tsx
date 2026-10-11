"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Visualizador de fotos em tela cheia: setas, teclado, arrastar no celular e miniaturas.
// Vai direto para o <body> para não ficar preso dentro do card (que se move no hover).
export default function Galeria({
  fotos,
  titulo,
  inicial = 0,
  aoFechar,
}: {
  fotos: string[];
  titulo: string;
  inicial?: number;
  aoFechar: () => void;
}) {
  const [atual, setAtual] = useState(inicial);
  const toqueX = useRef<number | null>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const total = fotos.length;
  const ir = (passo: number) => setAtual((i) => (i + passo + total) % total);

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
      if (e.key === "ArrowRight") setAtual((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setAtual((i) => (i - 1 + total) % total);
    };
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", tecla);
    };
  }, [aoFechar, total]);

  return createPortal(
    <div
      className="galeria"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${titulo}`}
      onClick={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <div className="galeria-topo">
        <span>
          {titulo}
          {total > 1 && <small className="mono"> · {atual + 1}/{total}</small>}
        </span>
        <button ref={fechar} type="button" className="galeria-fechar" aria-label="Fechar fotos" onClick={aoFechar}>
          ×
        </button>
      </div>

      <div
        className="galeria-palco"
        onTouchStart={(e) => (toqueX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toqueX.current === null) return;
          const delta = e.changedTouches[0].clientX - toqueX.current;
          if (Math.abs(delta) > 40) ir(delta < 0 ? 1 : -1);
          toqueX.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotos[atual]} alt={`${titulo}, foto ${atual + 1} de ${total}`} />
        {total > 1 && (
          <>
            <button type="button" className="galeria-seta esquerda" aria-label="Foto anterior" onClick={() => ir(-1)}>
              ‹
            </button>
            <button type="button" className="galeria-seta direita" aria-label="Próxima foto" onClick={() => ir(1)}>
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="galeria-miniaturas">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual}
              onClick={() => setAtual(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
