import { soDigitos, type OpcaoFrete, type RespostaFrete } from "@/lib/frete";
import { buscarCidade, cotar } from "@/lib/frete-servidor";

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => ({}));
  const cep = soDigitos(String(corpo.cep ?? ""));

  if (cep.length !== 8) {
    return Response.json({ erro: "Digite um CEP com 8 números." }, { status: 400 });
  }

  const local = await buscarCidade(cep);
  if (!local) {
    return Response.json({ erro: "CEP não encontrado. Confira os números." }, { status: 400 });
  }

  let opcoes: OpcaoFrete[] = [];
  try {
    opcoes = await cotar(cep);
  } catch (falha) {
    console.error("Falha ao cotar frete:", falha);
  }

  return Response.json({ ...local, opcoes } satisfies RespostaFrete);
}
