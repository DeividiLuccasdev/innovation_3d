"use client";

import { useState, type FormEvent } from "react";
import { formatarPreco } from "@/lib/produtos";
import { PACOTES, formatarCep, type Pacote, type RespostaFrete } from "@/lib/frete";
import { linkWhatsApp } from "@/lib/whatsapp";

export default function Frete() {
  const [cep, setCep] = useState("");
  const [pacote, setPacote] = useState<Pacote>("medio");
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
        body: JSON.stringify({ cep, pacote }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) setErro(dados.erro ?? "Não foi possível consultar agora.");
      else setResultado(dados);
    } catch {
      setErro("Não foi possível consultar agora. Tente de novo ou fale no WhatsApp.");
    } finally {
      setConsultando(false);
    }
  }

  const destino = resultado?.cidade ? `${resultado.cidade}/${resultado.uf}` : `CEP ${cep}`;
  const mensagem = `Olá! Quero saber o frete para o CEP ${cep} (pacote ${PACOTES[pacote].nome.toLowerCase()}).`;

  return (
    <div className="frete">
      <div>
        <h2>Calcular frete</h2>
        <p>Enviamos pelos Correios para todo o Brasil. Informe seu CEP e o tamanho da peça.</p>
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
        <fieldset>
          <legend>Tamanho do pacote</legend>
          {(Object.keys(PACOTES) as Pacote[]).map((p) => (
            <label key={p} className="opcao-pacote">
              <input type="radio" name="pacote" value={p} checked={pacote === p} onChange={() => setPacote(p)} />
              <span>
                <b>{PACOTES[p].nome}</b>
                <small>{PACOTES[p].exemplo}</small>
              </span>
            </label>
          ))}
        </fieldset>
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
              <small>Valores estimados. O prazo conta a partir do envio, depois que a peça fica pronta.</small>
            </div>
          )}

          {resultado && resultado.opcoes.length === 0 && (
            <div className="frete-resultado">
              <span className="mono">Entregamos em {destino}</span>
              <p>Mande seu CEP no WhatsApp e respondemos com o valor exato do PAC e do SEDEX.</p>
              <a className="btn btn-vermelho" target="_blank" rel="noopener noreferrer" href={linkWhatsApp(mensagem)}>
                Consultar frete pelo WhatsApp
              </a>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
