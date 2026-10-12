export type ItemCarrinho = {
  id: string;
  nome: string;
  preco: number;
  foto: string | null;
  quantidade: number;
};

export type Entrega =
  | { tipo: "retirada" }
  | { tipo: "correios"; servico: string; preco: number; prazo: number; cep: string }
  | { tipo: "a-calcular"; cep: string };

export const MAX_QUANTIDADE = 99;
export const CHAVE_ARMAZENAMENTO = "innovation3d:carrinho";

export const subtotal = (itens: ItemCarrinho[]) => itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);

export const totalItens = (itens: ItemCarrinho[]) => itens.reduce((soma, i) => soma + i.quantidade, 0);

export const valorEntrega = (entrega: Entrega | null) => (entrega?.tipo === "correios" ? entrega.preco : 0);

// Lê o carrinho salvo no navegador, descartando o que não tiver o formato esperado
export function lerCarrinho(bruto: string | null): ItemCarrinho[] {
  try {
    const dados = JSON.parse(bruto ?? "[]");
    if (!Array.isArray(dados)) return [];
    return dados
      .filter((i) => i && typeof i.id === "string" && typeof i.nome === "string" && Number.isFinite(i.preco))
      .map((i) => ({
        id: i.id,
        nome: i.nome,
        preco: Number(i.preco),
        foto: typeof i.foto === "string" ? i.foto : null,
        quantidade: Math.min(MAX_QUANTIDADE, Math.max(1, Math.round(Number(i.quantidade) || 1))),
      }));
  } catch {
    return [];
  }
}
