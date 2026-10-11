import type { Categoria, Produto } from "./produtos";

// Grupos da seção "Tem uma ideia?": cada um junta categorias e tipos do catálogo
export const VITRINE: { titulo: string; categorias: Categoria[]; tipos: string[] }[] = [
  {
    titulo: "Chaveiros e brindes com nome ou logo",
    categorias: [],
    tipos: [
      "Chaveiros personalizados",
      "Brindes corporativos",
      "Logotipos empresariais em 3D",
      "Troféus personalizados",
      "Lembrancinhas de aniversário",
      "Lembrancinhas de casamento",
      "Lembrancinhas de batizado",
      "Lembrancinhas de primeira comunhão",
      "Lembrancinhas de crisma",
    ],
  },
  {
    titulo: "Peças de reposição e suportes sob medida",
    categorias: [],
    tipos: [
      "Peças de reposição sob medida",
      "Suportes para celular",
      "Suportes para fones de ouvido",
      "Suportes para livros",
      "Suportes para plantas",
      "Suportes decorativos para acessórios",
      "Suportes temáticos para controles",
      "Organizadores de cabos",
    ],
  },
  {
    titulo: "Miniaturas, action figures e decoração temática",
    categorias: ["Decoração geek e temática"],
    tipos: ["Miniaturas de animais", "Miniaturas personalizadas"],
  },
  {
    titulo: "Presentes e decoração para datas especiais",
    categorias: ["Decoração residencial", "Decoração personalizada"],
    tipos: ["Enfeites de Natal", "Enfeites de Páscoa"],
  },
];

export const produtosDoGrupo = (produtos: Produto[], grupo: (typeof VITRINE)[number]) =>
  produtos.filter(
    (p) => grupo.categorias.includes(p.categoria) || (p.subcategoria !== null && grupo.tipos.includes(p.subcategoria))
  );
