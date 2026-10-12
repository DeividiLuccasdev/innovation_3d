import { limpar, validarContato } from "@/lib/contato";
import { supabase, supabaseConfigurado } from "@/lib/supabase";

// Pedido de orçamento ou contato feito pelo formulário do site
export async function POST(request: Request) {
  const corpo = await request.json().catch(() => ({}));

  // Campo escondido: só robôs preenchem
  if (limpar(corpo.site, 100)) return Response.json({ ok: true });

  const { contato, erro } = validarContato(corpo);
  if (!contato) return Response.json({ erro }, { status: 400 });

  const descricao = String(corpo.descricao ?? "").trim().slice(0, 2000);
  if (descricao.length < 10) {
    return Response.json({ erro: "Conte um pouco mais sobre o que você precisa (mínimo de 10 letras)." }, { status: 400 });
  }

  if (!supabaseConfigurado) {
    return Response.json({ erro: "A loja ainda não está recebendo orçamentos pelo site." }, { status: 503 });
  }

  const { error } = await supabase()
    .from("orcamentos")
    .insert({
      ...contato,
      assunto: limpar(corpo.assunto, 160) || null,
      descricao,
      referencia: limpar(corpo.referencia, 500) || null,
    });

  if (error) {
    console.error("Erro ao salvar orçamento:", error.message);
    return Response.json({ erro: "Não foi possível enviar agora. Tente de novo em instantes." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
