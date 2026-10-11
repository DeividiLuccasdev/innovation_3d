export const CATEGORIAS = ["Decoração", "Geek", "Utilidades", "Personalizados"] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: Categoria;
  material: string | null;
  tamanho: string | null;
  tempo_impressao: string | null;
  fotos: string[];
  esgotado: boolean;
  destaque: boolean;
  criado_em: string;
};

// Mostrados enquanto o Supabase não está configurado
export const PRODUTOS_EXEMPLO: Produto[] = [
  ["Vaso Espiral Low-Poly", 59.9, "Decoração", "PLA Seda", "12 × 12 × 18 cm", "7 h", false, true],
  ["Dragão Articulado", 89.9, "Geek", "PLA", "30 cm", "9 h", true, false],
  ["Suporte para Headset", 44.9, "Utilidades", "PETG", "25 cm de altura", "5 h", false, false],
  ["Chaveiro com Nome", 12.9, "Personalizados", "PLA", "6 cm", "40 min", false, true],
  ["Luminária Lua 3D", 119.9, "Decoração", "PLA Branco", "15 cm de diâmetro", "14 h", false, false],
  ["Organizador de Mesa", 39.9, "Utilidades", "PETG", "20 × 10 × 9 cm", "6 h", false, false],
].map(([nome, preco, categoria, material, tamanho, tempo, esgotado, destaque], i) => ({
  id: `exemplo-${i}`,
  nome: nome as string,
  descricao: null,
  preco: preco as number,
  categoria: categoria as Categoria,
  material: material as string,
  tamanho: tamanho as string,
  tempo_impressao: tempo as string,
  fotos: [],
  esgotado: esgotado as boolean,
  destaque: destaque as boolean,
  criado_em: new Date(0).toISOString(),
}));

export function ordenarProdutos(lista: Produto[]) {
  return [...lista].sort(
    (a, b) =>
      Number(b.destaque) - Number(a.destaque) ||
      Number(a.esgotado) - Number(b.esgotado) ||
      b.criado_em.localeCompare(a.criado_em)
  );
}

export const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
