"use client";

import { useState } from "react";
import Galeria from "./Galeria";
import IconeCategoria from "./IconeCategoria";
import { formatarPreco, nomeCurto, type Produto } from "@/lib/produtos";
import { linkWhatsApp } from "@/lib/whatsapp";

export default function CardProduto({
  produto,
  children,
}: {
  produto: Produto;
  children?: React.ReactNode;
}) {
  const [fotoAtual, setFotoAtual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const totalFotos = produto.fotos.length;
  // A lista de fotos pode diminuir no admin; volta para a primeira se o índice sobrar
  const indice = fotoAtual < totalFotos ? fotoAtual : 0;
  const mudarFoto = (passo: number) => setFotoAtual((indice + passo + totalFotos) % totalFotos);
  const specs = [
    produto.material,
    produto.tamanho,
    produto.tempo_impressao && `impressão ${produto.tempo_impressao}`,
  ].filter(Boolean);

  return (
    <article className={`card ${produto.esgotado ? "esgotado" : ""}`}>
      <div className="foto">
        <div className="etiquetas">
          <span className="tag" title={produto.categoria}>{nomeCurto(produto.categoria)}</span>
          {produto.destaque && <span className="tag destaque">Destaque</span>}
        </div>

        {totalFotos > 0 ? (
          <button type="button" className="foto-abrir" aria-label={`Ampliar fotos de ${produto.nome}`} onClick={() => setAmpliada(true)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={produto.fotos[indice]} alt={produto.nome} loading="lazy" />
          </button>
        ) : (
          <IconeCategoria categoria={produto.categoria} />
        )}

        {totalFotos > 1 && (
          <>
            <button type="button" className="foto-seta esquerda" aria-label="Foto anterior" onClick={() => mudarFoto(-1)}>
              ‹
            </button>
            <button type="button" className="foto-seta direita" aria-label="Próxima foto" onClick={() => mudarFoto(1)}>
              ›
            </button>
            <span className="foto-contador mono">
              {indice + 1}/{totalFotos}
            </span>
          </>
        )}

        {produto.esgotado && <div className="faixa-esgotado">ESGOTADO</div>}
      </div>

      <div className="info">
        {produto.subcategoria && <span className="tipo mono">{produto.subcategoria}</span>}
        <h3>{produto.nome}</h3>
        {produto.descricao && <p style={{ margin: 0, color: "var(--muted)" }}>{produto.descricao}</p>}
        {specs.length > 0 && <div className="specs mono">{specs.join(" · ")}</div>}
        <div className="rodape-card">
          <span className="preco">{formatarPreco(produto.preco)}</span>
          {produto.esgotado ? (
            <button className="btn btn-azul btn-pedir" disabled>
              Esgotado
            </button>
          ) : (
            <a
              className="btn btn-azul btn-pedir"
              target="_blank"
              rel="noopener noreferrer"
              href={linkWhatsApp(
                `Olá! Tenho interesse em: ${produto.nome} (${formatarPreco(produto.preco)})`
              )}
            >
              Pedir
            </a>
          )}
        </div>
        <a
          className="personalizar"
          target="_blank"
          rel="noopener noreferrer"
          href={linkWhatsApp(
            produto.esgotado
              ? `Olá! Vi que ${produto.nome} está esgotado. Vocês fazem sob encomenda?`
              : `Olá! Quero personalizar: ${produto.nome} (cor, tamanho ou nome)`
          )}
        >
          {produto.esgotado ? "Encomendar mesmo assim" : "Quero personalizar"}
        </a>
      </div>

      {children}

      {ampliada && (
        <Galeria fotos={produto.fotos} titulo={produto.nome} inicial={indice} aoFechar={() => setAmpliada(false)} />
      )}
    </article>
  );
}
