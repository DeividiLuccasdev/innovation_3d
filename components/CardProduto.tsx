"use client";

import { useState } from "react";
import IconeCategoria from "./IconeCategoria";
import { formatarPreco, type Produto } from "@/lib/produtos";
import { linkWhatsApp } from "@/lib/whatsapp";

export default function CardProduto({
  produto,
  children,
}: {
  produto: Produto;
  children?: React.ReactNode;
}) {
  const [fotoAtual, setFotoAtual] = useState(0);
  const specs = [
    produto.material,
    produto.tamanho,
    produto.tempo_impressao && `impressão ${produto.tempo_impressao}`,
  ].filter(Boolean);

  return (
    <article className={`card ${produto.esgotado ? "esgotado" : ""}`}>
      <div className="foto">
        <div className="etiquetas">
          <span className="tag">{produto.categoria}</span>
          {produto.destaque && <span className="tag destaque">Destaque</span>}
        </div>

        {produto.fotos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produto.fotos[fotoAtual] ?? produto.fotos[0]} alt={produto.nome} loading="lazy" />
        ) : (
          <IconeCategoria categoria={produto.categoria} />
        )}

        {produto.fotos.length > 1 && (
          <div className="galeria-mini">
            {produto.fotos.map((foto, i) => (
              <button
                key={foto}
                aria-label={`Foto ${i + 1}`}
                aria-current={i === fotoAtual}
                onClick={() => setFotoAtual(i)}
              />
            ))}
          </div>
        )}

        {produto.esgotado && <div className="faixa-esgotado">ESGOTADO</div>}
      </div>

      <div className="info">
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
      </div>

      {children}
    </article>
  );
}
