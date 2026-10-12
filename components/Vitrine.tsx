"use client";

import { useState } from "react";
import Galeria from "./Galeria";
import IconeCategoria from "./IconeCategoria";
import { formatarPreco, ordenarProdutos, type Produto } from "@/lib/produtos";
import { VITRINE, produtosDoGrupo } from "@/lib/vitrine";
import { INSTAGRAM_URL, YOUTUBE_URL } from "@/lib/redes";
import { abrirOrcamento } from "./Orcamento";

const MAX_FOTOS = 8;

export default function Vitrine({ produtos }: { produtos: Produto[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  const [ampliado, setAmpliado] = useState<Produto | null>(null);
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
                <div key={p.id} className="vitrine-item">
                  {p.fotos[0] ? (
                    <button
                      type="button"
                      className="vitrine-foto"
                      aria-label={`Ver fotos de ${p.nome}`}
                      onClick={() => setAmpliado(p)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.fotos[0]} alt={p.nome} loading="lazy" />
                      {p.fotos.length > 1 && <span className="mono">{p.fotos.length} fotos</span>}
                    </button>
                  ) : (
                    <div className="vitrine-foto">
                      <IconeCategoria categoria={p.categoria} />
                    </div>
                  )}
                  <button type="button" onClick={() => abrirOrcamento(`Algo como: ${p.nome}`)}>
                    <span>{p.nome}</span>
                    <small>{formatarPreco(p.preco)} · pedir</small>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>As fotos desta linha chegam em breve. Conte o que você precisa que a gente mostra exemplos.</p>
          )}
          <button type="button" className="btn btn-vermelho" onClick={() => abrirOrcamento(grupo.titulo)}>
            Pedir orçamento desta linha
          </button>
          <span className="vitrine-redes">
            Veja mais trabalhos no{" "}
            <a target="_blank" rel="noopener noreferrer" href={INSTAGRAM_URL}>
              Instagram
            </a>{" "}
            e no{" "}
            <a target="_blank" rel="noopener noreferrer" href={YOUTUBE_URL}>
              YouTube
            </a>
          </span>
        </div>
      )}

      {ampliado && <Galeria fotos={ampliado.fotos} titulo={ampliado.nome} aoFechar={() => setAmpliado(null)} />}
    </>
  );
}
