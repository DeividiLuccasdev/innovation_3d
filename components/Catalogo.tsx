"use client";

import { useState } from "react";
import CardProduto from "./CardProduto";
import { CATALOGO, CATEGORIAS, ordenarProdutos, type Categoria, type Produto } from "@/lib/produtos";
import { linkWhatsApp } from "@/lib/whatsapp";

export default function Catalogo({
  produtos,
  exemplo,
}: {
  produtos: Produto[];
  exemplo: boolean;
}) {
  const [categoria, setCategoria] = useState<Categoria | "Todos">("Todos");
  const [tipo, setTipo] = useState<string>("Todos");
  const grupo = categoria === "Todos" ? null : CATALOGO[categoria];

  const lista = ordenarProdutos(
    produtos.filter(
      (p) =>
        (categoria === "Todos" || p.categoria === categoria) &&
        (tipo === "Todos" || p.subcategoria === tipo)
    )
  );

  function escolherCategoria(c: Categoria | "Todos") {
    setCategoria(c);
    setTipo("Todos");
  }

  const pedido = tipo !== "Todos" ? tipo : categoria !== "Todos" ? categoria : "uma peça personalizada";

  return (
    <>
      <div className="cab">
        <div>
          <h2>Nossos produtos</h2>
          <p>Escolha o seu e peça pelo WhatsApp. Qualquer item pode ser personalizado ou feito sob encomenda.</p>
        </div>
        <div className="filtros" role="group" aria-label="Filtrar por categoria">
          {(["Todos", ...CATEGORIAS] as const).map((c) => (
            <button
              key={c}
              className="filtro"
              aria-pressed={c === categoria}
              title={c === "Todos" ? undefined : c}
              onClick={() => escolherCategoria(c)}
            >
              {c === "Todos" ? c : CATALOGO[c].curto}
            </button>
          ))}
        </div>
      </div>

      {grupo && (
        <div className="subcategorias">
          <h3>{categoria}</h3>
          <div className="filtros" role="group" aria-label={`Tipos de ${categoria}`}>
            {["Todos", ...grupo.itens].map((t) => (
              <button key={t} className="filtro filtro-mini" aria-pressed={t === tipo} onClick={() => setTipo(t)}>
                {t}
              </button>
            ))}
          </div>
          {grupo.aviso && <p className="aviso-categoria">{grupo.aviso}</p>}
        </div>
      )}

      {exemplo && (
        <span className="aviso-exemplo mono">
          Produtos de exemplo: configure o Supabase e cadastre os seus em /admin
        </span>
      )}

      <div className="grade">
        {lista.map((p) => (
          <CardProduto key={p.id} produto={p} />
        ))}
        {lista.length === 0 && (
          <div className="sob-encomenda">
            <span className="mono">sob encomenda</span>
            <h3>{pedido}</h3>
            <p>Ainda não temos fotos deste item no catálogo, mas a gente imprime. Conte o que você imaginou.</p>
            <a
              className="btn btn-azul"
              target="_blank"
              rel="noopener noreferrer"
              href={linkWhatsApp(`Olá! Quero um orçamento de: ${pedido}`)}
            >
              Solicitar orçamento
            </a>
          </div>
        )}
      </div>
    </>
  );
}
