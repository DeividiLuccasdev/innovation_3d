"use client";

import { useState } from "react";
import CardProduto from "./CardProduto";
import { CATEGORIAS, ordenarProdutos, type Produto } from "@/lib/produtos";

export default function Catalogo({
  produtos,
  exemplo,
}: {
  produtos: Produto[];
  exemplo: boolean;
}) {
  const [filtro, setFiltro] = useState<string>("Todos");
  const lista = ordenarProdutos(
    produtos.filter((p) => filtro === "Todos" || p.categoria === filtro)
  );

  return (
    <>
      <div className="cab">
        <div>
          <h2>Nossos produtos</h2>
          <p>Escolha o seu e peça pelo WhatsApp. Produtos esgotados podem ser feitos sob encomenda.</p>
        </div>
        <div className="filtros" role="group" aria-label="Filtrar por categoria">
          {["Todos", ...CATEGORIAS].map((c) => (
            <button key={c} className="filtro" aria-pressed={c === filtro} onClick={() => setFiltro(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {exemplo && (
        <span className="aviso-exemplo mono">
          Produtos de exemplo: configure o Supabase e cadastre os seus em /admin
        </span>
      )}

      <div className="grade">
        {lista.map((p) => (
          <CardProduto key={p.id} produto={p} />
        ))}
        {lista.length === 0 && <p>Nenhum produto nesta categoria ainda.</p>}
      </div>
    </>
  );
}
