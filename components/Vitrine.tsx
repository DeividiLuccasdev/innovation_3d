"use client";

import { useState } from "react";
import IconeCategoria from "./IconeCategoria";
import { formatarPreco, ordenarProdutos, type Produto } from "@/lib/produtos";
import { VITRINE, produtosDoGrupo } from "@/lib/vitrine";
import { linkWhatsApp } from "@/lib/whatsapp";

const MAX_FOTOS = 8;

export default function Vitrine({ produtos }: { produtos: Produto[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  const grupo = aberto === null ? null : VITRINE[aberto];
  const lista = grupo ? ordenarProdutos(produtosDoGrupo(produtos, grupo)).slice(0, MAX_FOTOS) : [];

  return (
    <>
      <ul className="vitrine-opcoes">
        {VITRINE.map((g, i) => (
          <li key={g.titulo}>
            <button
              type="button"
              aria-expanded={aberto === i}
              aria-controls="vitrine-painel"
              onClick={() => setAberto(aberto === i ? null : i)}
            >
              {g.titulo}
              <span aria-hidden="true">{aberto === i ? "−" : "+"}</span>
            </button>
          </li>
        ))}
      </ul>

      {grupo && (
        <div className="vitrine-painel" id="vitrine-painel">
          <h3>{grupo.titulo}</h3>
          {lista.length > 0 ? (
            <div className="vitrine-fotos">
              {lista.map((p) => (
                <a
                  key={p.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={linkWhatsApp(`Olá! Quero algo como: ${p.nome}`)}
                >
                  <div className="vitrine-foto">
                    {p.fotos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.fotos[0]} alt={p.nome} loading="lazy" />
                    ) : (
                      <IconeCategoria categoria={p.categoria} />
                    )}
                  </div>
                  <span>{p.nome}</span>
                  <small>{formatarPreco(p.preco)}</small>
                </a>
              ))}
            </div>
          ) : (
            <p>As fotos desta linha chegam em breve. Conte o que você precisa que a gente mostra exemplos.</p>
          )}
          <a
            className="btn btn-vermelho"
            target="_blank"
            rel="noopener noreferrer"
            href={linkWhatsApp(`Olá! Quero um orçamento de: ${grupo.titulo.toLowerCase()}`)}
          >
            Pedir orçamento desta linha
          </a>
        </div>
      )}
    </>
  );
}
