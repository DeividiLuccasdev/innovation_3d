import { PACOTES, soDigitos, type OpcaoFrete, type Pacote, type RespostaFrete } from "@/lib/frete";

// Cotação de PAC e SEDEX via Melhor Envio. Sem MELHOR_ENVIO_TOKEN e CEP_ORIGEM,
// só confirma a cidade do CEP e o site oferece o orçamento pelo WhatsApp.
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const CEP_ORIGEM = soDigitos(process.env.CEP_ORIGEM ?? "");
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

async function buscarCidade(cep: string) {
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    const dados = await resposta.json();
    if (dados.erro) return null;
    return { cidade: dados.localidade as string, uf: dados.uf as string };
  } catch {
    // ViaCEP fora do ar não impede a cotação
    return { cidade: null, uf: null };
  }
}

async function cotar(cep: string, pacote: Pacote): Promise<OpcaoFrete[]> {
  if (!TOKEN || CEP_ORIGEM.length !== 8) return [];

  const medidas = PACOTES[pacote];
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
        height: medidas.altura,
        width: medidas.largura,
        length: medidas.comprimento,
        weight: medidas.peso,
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

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => ({}));
  const cep = soDigitos(String(corpo.cep ?? ""));
  const pacote: Pacote = Object.hasOwn(PACOTES, corpo.pacote) ? corpo.pacote : "medio";

  if (cep.length !== 8) {
    return Response.json({ erro: "Digite um CEP com 8 números." }, { status: 400 });
  }

  const local = await buscarCidade(cep);
  if (!local) {
    return Response.json({ erro: "CEP não encontrado. Confira os números." }, { status: 400 });
  }

  let opcoes: OpcaoFrete[] = [];
  try {
    opcoes = await cotar(cep, pacote);
  } catch (falha) {
    console.error("Falha ao cotar frete:", falha);
  }

  return Response.json({ ...local, opcoes } satisfies RespostaFrete);
}
