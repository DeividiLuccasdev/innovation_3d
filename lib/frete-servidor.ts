import { PACOTE, soDigitos, type OpcaoFrete } from "./frete";

// Cotação de PAC e SEDEX via Melhor Envio. Sem MELHOR_ENVIO_TOKEN,
// só confirma a cidade do CEP e o frete é confirmado junto com o pedido.
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;
// CEP de onde as peças saem; a variável CEP_ORIGEM pode trocar
const CEP_ORIGEM = soDigitos(process.env.CEP_ORIGEM || "14802269");
const API = process.env.MELHOR_ENVIO_URL ?? "https://melhorenvio.com.br";

type ServicoMelhorEnvio = {
  name: string;
  price?: string;
  custom_price?: string;
  delivery_time?: number;
  custom_delivery_time?: number;
  error?: string;
  company?: { name: string };
};

export async function buscarCidade(cep: string) {
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    const dados = await resposta.json();
    if (dados.erro) return null;
    return {
      cidade: dados.localidade as string,
      uf: dados.uf as string,
      logradouro: (dados.logradouro as string) || null,
      bairro: (dados.bairro as string) || null,
    };
  } catch {
    // ViaCEP fora do ar não impede a cotação
    return { cidade: null, uf: null, logradouro: null, bairro: null };
  }
}

export async function cotar(cep: string): Promise<OpcaoFrete[]> {
  if (!TOKEN || CEP_ORIGEM.length !== 8) return [];

  const resposta = await fetch(`${API}/api/v2/me/shipment/calculate`, {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": "Innovation 3D (site)",
    },
    body: JSON.stringify({
      from: { postal_code: CEP_ORIGEM },
      to: { postal_code: cep },
      package: {
        height: PACOTE.altura,
        width: PACOTE.largura,
        length: PACOTE.comprimento,
        weight: PACOTE.peso,
      },
      services: "1,2", // Correios PAC e SEDEX
    }),
  });

  if (!resposta.ok) {
    console.error("Melhor Envio respondeu", resposta.status, await resposta.text());
    return [];
  }

  const servicos = (await resposta.json()) as ServicoMelhorEnvio[];
  return servicos
    .filter((s) => !s.error && (s.custom_price ?? s.price))
    .map((s) => ({
      servico: s.company?.name ? `${s.company.name} ${s.name}` : s.name,
      preco: Number(s.custom_price ?? s.price),
      prazo: s.custom_delivery_time ?? s.delivery_time ?? 0,
    }))
    .sort((a, b) => a.preco - b.preco);
}
