export const CATEGORIAS = [
  "Decoração residencial",
  "Decoração personalizada",
  "Festas e eventos",
  "Escritórios e ambientes comerciais",
  "Decoração geek e temática",
  "Organização e decoração funcional",
  "Arte sacra",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

// Nome curto (botões e etiquetas) e tipos de produto de cada categoria
export const CATALOGO: Record<Categoria, { curto: string; itens: string[]; aviso?: string }> = {
  "Decoração residencial": {
    curto: "Casa",
    itens: [
      "Vasos decorativos",
      "Cachepôs para plantas",
      "Esculturas abstratas",
      "Estatuetas decorativas",
      "Miniaturas de animais",
      "Bustos decorativos",
      "Mandalas 3D",
      "Quadros em relevo",
      "Painéis decorativos de parede",
      "Relógios de parede",
      "Porta-velas decorativos",
      "Centros de mesa",
      "Luminárias decorativas",
      "Abajures personalizados",
      "Enfeites para estantes",
      "Arte sacra",
    ],
  },
  "Decoração personalizada": {
    curto: "Personalizados",
    itens: [
      "Nomes em letras 3D",
      "Letras iniciais decorativas",
      "Placas com nomes de famílias",
      "Placas com frases personalizadas",
      "Fotos em litofania 3D",
      "Luminárias com fotografias",
      "Chaveiros personalizados",
      "Porta-retratos personalizados",
      "Miniaturas personalizadas",
      "Enfeites com datas comemorativas",
    ],
  },
  "Festas e eventos": {
    curto: "Festas",
    itens: [
      "Topos de bolo personalizados",
      "Enfeites para mesas de aniversário",
      "Centros de mesa temáticos",
      "Números decorativos 3D",
      "Letras para decoração de festas",
      "Lembrancinhas de casamento",
      "Lembrancinhas de aniversário",
      "Enfeites para chá de bebê",
      "Decoração para festas infantis",
      "Enfeites de Natal",
      "Enfeites de Páscoa",
    ],
  },
  "Escritórios e ambientes comerciais": {
    curto: "Empresas",
    itens: [
      "Logotipos empresariais em 3D",
      "Placas de identificação",
      "Letreiros personalizados",
      "Porta-cartões de visita",
      "Porta-canetas decorativos",
      "Organizadores de mesa",
      "Suportes para celular",
      "Suportes para fones de ouvido",
      "Displays para exposição de produtos",
      "Troféus personalizados",
      "Brindes corporativos",
      "Miniaturas de produtos empresariais",
    ],
  },
  "Decoração geek e temática": {
    curto: "Geek",
    itens: [
      "Miniaturas de personagens",
      "Estátuas de super-heróis",
      "Miniaturas de carros",
      "Miniaturas de motos",
      "Naves espaciais decorativas",
      "Dragões e criaturas fantásticas",
      "Suportes temáticos para controles",
      "Organizadores gamer",
      "Dioramas decorativos",
      "Peças de decoração inspiradas em jogos",
    ],
    aviso:
      "Para personagens e marcas protegidas, a comercialização pode exigir autorização dos titulares.",
  },
  "Organização e decoração funcional": {
    curto: "Organização",
    itens: [
      "Porta-joias",
      "Bandejas decorativas",
      "Porta-chaves de parede",
      "Organizadores de maquiagem",
      "Porta-óculos",
      "Suportes para livros",
      "Porta-controles remotos",
      "Organizadores de cabos",
      "Peças de reposição sob medida",
      "Suportes para plantas",
      "Caixas organizadoras decorativas",
      "Porta-guardanapos",
      "Suportes decorativos para acessórios",
    ],
  },
  "Arte sacra": {
    curto: "Arte sacra",
    itens: [
      "Imagens de santos",
      "Nossa Senhora Aparecida",
      "Nossa Senhora de Fátima",
      "Nossa Senhora das Graças",
      "Sagrada Família",
      "Crucifixos",
      "Anjos decorativos",
      "Divino Espírito Santo",
      "Oratórios",
      "Capelinhas",
      "Presépios",
      "Quadros religiosos em relevo",
      "Placas com orações",
      "Luminárias religiosas",
      "Porta-terços",
      "Lembrancinhas de batizado",
      "Lembrancinhas de primeira comunhão",
      "Lembrancinhas de crisma",
    ],
  },
};

// Tipos em ordem alfabética, no site e no painel
for (const grupo of Object.values(CATALOGO)) {
  grupo.itens.sort((a, b) => a.localeCompare(b, "pt-BR"));
}

// Nome curto da categoria; cai no próprio nome se for uma categoria antiga
export const nomeCurto = (categoria: string) =>
  CATALOGO[categoria as Categoria]?.curto ?? categoria;

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: Categoria;
  subcategoria: string | null;
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
  ["Vaso Espiral Low-Poly", 59.9, "Decoração residencial", "Vasos decorativos", "PLA Seda", "12 × 12 × 18 cm", "7 h", false, true],
  ["Nome em Letras 3D", 69.9, "Decoração personalizada", "Nomes em letras 3D", "PLA", "até 40 cm", "5 h", false, true],
  ["Topo de Bolo Personalizado", 34.9, "Festas e eventos", "Topos de bolo personalizados", "PLA", "15 cm", "2 h", false, true],
  ["Luminária Lua 3D", 119.9, "Decoração residencial", "Luminárias decorativas", "PLA Branco", "15 cm de diâmetro", "14 h", false, false],
  ["Logotipo Empresarial 3D", 149.9, "Escritórios e ambientes comerciais", "Logotipos empresariais em 3D", "PLA", "30 cm", "8 h", false, false],
  ["Dragão Articulado", 89.9, "Decoração geek e temática", "Dragões e criaturas fantásticas", "PLA", "30 cm", "9 h", true, false],
  ["Porta-joias Geométrico", 49.9, "Organização e decoração funcional", "Porta-joias", "PETG", "12 × 12 × 8 cm", "4 h", false, false],
].map(([nome, preco, categoria, subcategoria, material, tamanho, tempo, esgotado, destaque], i) => ({
  id: `exemplo-${i}`,
  nome: nome as string,
  descricao: null,
  preco: preco as number,
  categoria: categoria as Categoria,
  subcategoria: subcategoria as string | null,
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
