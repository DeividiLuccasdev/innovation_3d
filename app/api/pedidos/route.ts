import { limpar, validarContato } from "@/lib/contato";
import { soDigitos } from "@/lib/frete";
import { cotar } from "@/lib/frete-servidor";
import { supabase, supabaseConfigurado } from "@/lib/supabase";

// Registra o pedido do carrinho. Os preços dos produtos são calculados no banco
// (função criar_pedido) e o frete dos Correios é cotado de novo aqui no servidor.
export async function POST(request: Request) {
  const corpo = await request.json().catch(() => ({}));

  const { contato, erro } = validarContato(corpo);
  if (!contato) return Response.json({ erro }, { status: 400 });

  const itens = Array.isArray(corpo.itens)
    ? corpo.itens
        .slice(0, 50)
        .map((i: { id?: unknown; quantidade?: unknown }) => ({
          id: String(i?.id ?? ""),
          quantidade: Math.min(99, Math.max(1, Math.round(Number(i?.quantidade) || 1))),
        }))
        .filter((i: { id: string }) => /^[0-9a-f-]{36}$/i.test(i.id))
    : [];
  if (itens.length === 0) return Response.json({ erro: "Seu carrinho está vazio." }, { status: 400 });

  const tipo = String(corpo.entrega?.tipo ?? "");
  let entrega: Record<string, unknown>;
  let frete = 0;

  if (tipo === "retirada") {
    entrega = { tipo: "retirada" };
  } else if (tipo === "correios" || tipo === "a-calcular") {
    const cep = soDigitos(String(corpo.entrega?.cep ?? ""));
    const endereco = {
      logradouro: limpar(corpo.entrega?.logradouro, 120),
      numero: limpar(corpo.entrega?.numero, 20),
      complemento: limpar(corpo.entrega?.complemento, 60),
      bairro: limpar(corpo.entrega?.bairro, 80),
      cidade: limpar(corpo.entrega?.cidade, 80),
      uf: limpar(corpo.entrega?.uf, 2).toUpperCase(),
    };
    if (cep.length !== 8 || !endereco.logradouro || !endereco.numero || !endereco.cidade) {
      return Response.json({ erro: "Preencha o endereço de entrega (rua, número e cidade)." }, { status: 400 });
    }
    entrega = { tipo: "a-calcular", cep, ...endereco };

    if (tipo === "correios") {
      const servico = limpar(corpo.entrega?.servico, 60);
      const opcao = (await cotar(cep).catch(() => [])).find((o) => o.servico === servico);
      // Se a cotação mudou ou falhou, o pedido segue com o frete a confirmar
      if (opcao) {
        entrega = { tipo: "correios", servico: opcao.servico, prazo: opcao.prazo, cep, ...endereco };
        frete = opcao.preco;
      }
    }
  } else {
    return Response.json({ erro: "Escolha a forma de entrega." }, { status: 400 });
  }

  if (!supabaseConfigurado) {
    return Response.json({ erro: "A loja ainda não está recebendo pedidos pelo site." }, { status: 503 });
  }

  const { data, error } = await supabase().rpc("criar_pedido", {
    dados: { ...contato, entrega, frete, itens, observacoes: limpar(corpo.observacoes, 500) },
  });

  if (error) {
    console.error("Erro ao criar pedido:", error.message);
    const mensagem = /esgotado/i.test(error.message)
      ? error.message.replace(/^.*?(Produto esgotado)/, "$1") + ". Tire-o do carrinho para continuar."
      : /não encontrado/i.test(error.message)
        ? "Um dos produtos do carrinho não está mais no catálogo. Tire-o do carrinho para continuar."
        : "Não foi possível registrar o pedido agora. Tente de novo em instantes.";
    return Response.json({ erro: mensagem }, { status: 400 });
  }

  return Response.json({ codigo: data as string, frete, freteConfirmado: entrega.tipo !== "a-calcular" });
}
