"use client";

import { useState, type FormEvent } from "react";
import { formatarPreco } from "@/lib/produtos";
import { PACOTE, formatarCep, type RespostaFrete } from "@/lib/frete";

export default function Frete() {
  const [cep, setCep] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState<RespostaFrete | null>(null);
  const [erro, setErro] = useState("");

  async function consultar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setResultado(null);
    setConsultando(true);
    try {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) setErro(dados.erro ?? "Não foi possível consultar agora.");
      else setResultado(dados);
    } catch {
      setErro("Não foi possível consultar agora. Tente de novo em instantes.");
    } finally {
      setConsultando(false);
    }
  }

  const destino = resultado?.cidade ? `${resultado.cidade}/${resultado.uf}` : `CEP ${cep}`;
  const medidas = `${PACOTE.comprimento} × ${PACOTE.largura} × ${PACOTE.altura} cm e ${String(PACOTE.peso).replace(".", ",")} kg`;

  return (
    <div className="frete">
      <div>
        <h2>Calcular frete</h2>
        <p>Enviamos pelos Correios para qualquer cidade do Brasil. Informe o CEP de entrega.</p>
        <a
          className="mono dica"
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
        >
          Não sabe seu CEP?
        </a>
      </div>

      <form className="frete-form" onSubmit={consultar}>
        <label>
          CEP de entrega
          <input
            id="frete-cep"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            required
            value={cep}
            onChange={(e) => setCep(formatarCep(e.target.value))}
          />
        </label>
        <button className="btn btn-azul" type="submit" disabled={consultando}>
          {consultando ? "Consultando…" : "Calcular frete"}
        </button>

        <div aria-live="polite">
          {erro && <p className="erro">{erro}</p>}

          {resultado && resultado.opcoes.length > 0 && (
            <div className="frete-resultado">
              <span className="mono">Entrega para {destino}</span>
              <ul>
                {resultado.opcoes.map((o) => (
                  <li key={o.servico}>
                    <span>{o.servico}</span>
                    <b>{formatarPreco(o.preco)}</b>
                    <small>até {o.prazo} dias úteis</small>
                  </li>
                ))}
              </ul>
              <small>
                Valores estimados para um pacote médio ({medidas}); o valor final depende da peça. O prazo
                conta a partir do envio.
              </small>
            </div>
          )}

          {resultado && resultado.opcoes.length === 0 && (
            <div className="frete-resultado">
              <span className="mono">Entregamos em {destino}</span>
              <p>
                Adicione os produtos ao carrinho e finalize o pedido com este CEP: confirmamos o valor exato do PAC
                e do SEDEX por e-mail antes do pagamento.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
