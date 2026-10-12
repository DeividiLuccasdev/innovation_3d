import { CATALOGO, CATEGORIAS, type Categoria, type Produto } from "./produtos";

// Assistente de dúvidas preliminares: respostas fixas por assunto, busca no catálogo
// e, quando não sabe, passa a pergunta para o WhatsApp. Edite os textos aqui.

export type Acao =
  | { tipo: "secao"; alvo: string; rotulo: string }
  | { tipo: "whatsapp"; mensagem: string; rotulo: string }
  | { tipo: "catalogo"; categoria: Categoria; subtipo?: string; rotulo: string };

export type Resposta = { texto: string; acoes: Acao[] };

type Assunto = {
  id: string;
  rotulo: string;
  palavras: string[];
  resposta: Resposta;
};

const whats = (mensagem: string, rotulo = "Falar no WhatsApp"): Acao => ({ tipo: "whatsapp", mensagem, rotulo });

export const ASSUNTOS: Assunto[] = [
  {
    id: "encomenda",
    rotulo: "Como fazer um pedido",
    palavras: ["pedido", "pedir", "encomenda", "encomendar", "comprar", "compra", "como funciona"],
    resposta: {
      texto:
        "É bem simples:\n1. Escolha um produto do catálogo ou mande a sua ideia (foto, desenho ou referência).\n2. Fazemos o orçamento e mostramos a prévia.\n3. Combinamos cor, tamanho e prazo.\n4. Imprimimos e enviamos pelos Correios ou você retira.",
      acoes: [
        { tipo: "secao", alvo: "#produtos", rotulo: "Ver catálogo" },
        whats("Olá! Quero fazer uma encomenda."),
      ],
    },
  },
  {
    id: "prazo",
    rotulo: "Prazo de produção",
    palavras: ["prazo", "demora", "quanto tempo", "dias", "pronto", "fica pronto", "entrega rapida", "urgente"],
    resposta: {
      texto:
        "O prazo depende do tamanho, do acabamento e da quantidade. Peças pequenas ficam prontas mais rápido; peças grandes ou em quantidade levam mais tempo. O prazo exato vai junto com o orçamento. Se for envio, some o prazo dos Correios.",
      acoes: [
        { tipo: "secao", alvo: "#frete", rotulo: "Calcular frete" },
        whats("Olá! Qual o prazo para fazer uma peça?", "Perguntar o prazo"),
      ],
    },
  },
  {
    id: "materiais",
    rotulo: "Materiais e cores",
    palavras: ["material", "materiais", "pla", "petg", "tpu", "resina", "cor", "cores", "flexivel", "resistente", "acabamento", "pintura", "pintado"],
    resposta: {
      texto:
        "Imprimimos em PLA, PETG e TPU, com materiais rígidos e flexíveis e camada de até 0,12 mm no acabamento fino. As cores disponíveis são confirmadas no orçamento. Se a peça for ficar ao sol ou precisar aguentar esforço, avisa que indicamos o material certo.",
      acoes: [whats("Olá! Quais cores e materiais vocês têm disponíveis?", "Ver cores disponíveis")],
    },
  },
  {
    id: "frete",
    rotulo: "Frete e entrega",
    palavras: ["frete", "entrega", "entregar", "envio", "enviar", "correios", "sedex", "pac", "cep", "retirar", "retirada", "buscar", "araraquara"],
    resposta: {
      texto:
        "Enviamos pelos Correios (PAC ou SEDEX) para todo o Brasil, saindo de Araraquara/SP. Você calcula o valor na seção Frete, só com o CEP. Também dá para combinar a retirada.",
      acoes: [
        { tipo: "secao", alvo: "#frete", rotulo: "Calcular frete" },
        whats("Olá! Quero combinar a entrega do meu pedido.", "Combinar retirada"),
      ],
    },
  },
  {
    id: "pagamento",
    rotulo: "Formas de pagamento",
    palavras: ["pagamento", "pagar", "pix", "cartao", "credito", "debito", "boleto", "parcelar", "parcela", "dinheiro"],
    resposta: {
      texto: "A forma de pagamento é combinada no atendimento pelo WhatsApp, junto com o orçamento.",
      acoes: [whats("Olá! Quais são as formas de pagamento?", "Perguntar no WhatsApp")],
    },
  },
  {
    id: "preco",
    rotulo: "Preços e orçamento",
    palavras: ["preco", "precos", "valor", "valores", "quanto custa", "custa", "orcamento", "barato", "caro"],
    resposta: {
      texto:
        "Os produtos do catálogo já mostram o preço. Para peças personalizadas, o valor depende do tamanho, do material e do tempo de impressão. Mande a ideia que fazemos o orçamento sem compromisso.",
      acoes: [
        { tipo: "secao", alvo: "#produtos", rotulo: "Ver catálogo" },
        whats("Olá! Quero um orçamento de uma peça personalizada.", "Pedir orçamento"),
      ],
    },
  },
  {
    id: "personalizado",
    rotulo: "Peça personalizada",
    palavras: ["personalizado", "personalizada", "personalizar", "nome", "logo", "foto", "desenho", "arquivo", "stl", "obj", "projeto", "modelar", "modelagem", "sob medida", "ideia"],
    resposta: {
      texto:
        "Fazemos sim! Pode mandar foto, desenho, uma referência da internet ou o arquivo 3D (STL ou OBJ). Se ainda não existe o modelo, avaliamos a modelagem. Também colocamos nome, logo ou data na peça.",
      acoes: [whats("Olá! Quero fazer uma peça personalizada. Vou mandar a referência.", "Enviar minha ideia")],
    },
  },
  {
    id: "atendente",
    rotulo: "Falar com uma pessoa",
    palavras: ["atendente", "pessoa", "humano", "falar com", "whatsapp", "zap", "telefone", "contato", "ligar"],
    resposta: {
      texto: "Claro! Te passo para o nosso atendimento no WhatsApp.",
      acoes: [whats("Olá! Vim pelo site e quero falar com o atendimento.", "Abrir WhatsApp")],
    },
  },
];

export const SAUDACAO: Resposta = {
  texto:
    "Oi! Eu sou o Inno, assistente da Innovation 3D. Posso tirar dúvidas rápidas sobre pedidos, prazos, materiais e frete, ou ajudar a achar um produto. Escolha um assunto ou escreva sua pergunta.",
  acoes: [],
};

// Minúsculas e sem acento, para comparar o que a pessoa digitou
export const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const PALAVRAS_VAZIAS = new Set([
  "de", "da", "do", "das", "dos", "e", "o", "a", "os", "as", "um", "uma", "para", "pra", "com", "em", "no", "na",
  "voces", "vcs", "tem", "fazem", "faz", "quero", "queria", "gostaria", "ola", "oi", "bom", "dia", "tarde", "noite",
  "por", "favor", "que", "qual", "quais", "me", "eu", "meu", "minha", "se", "3d",
]);

const termosDe = (texto: string) =>
  normalizar(texto)
    .split(" ")
    .filter((t) => t.length > 2 && !PALAVRAS_VAZIAS.has(t))
    // plural simples: "vasos" também casa com "vaso"
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));

const contem = (alvo: string, termo: string) => normalizar(alvo).includes(termo);

function buscarNoCatalogo(pergunta: string, produtos: Produto[]): Resposta | null {
  const termos = termosDe(pergunta);
  if (termos.length === 0) return null;

  const tipos: { categoria: Categoria; subtipo: string; pontos: number }[] = [];
  for (const categoria of CATEGORIAS) {
    for (const subtipo of CATALOGO[categoria].itens) {
      const pontos = termos.filter((t) => contem(subtipo, t)).length;
      if (pontos > 0) tipos.push({ categoria, subtipo, pontos });
    }
  }
  tipos.sort((a, b) => b.pontos - a.pontos);

  const achados = produtos.filter((p) => termos.some((t) => contem(p.nome, t))).slice(0, 3);

  if (tipos.length === 0 && achados.length === 0) return null;

  const acoes: Acao[] = tipos.slice(0, 3).map((t) => ({
    tipo: "catalogo",
    categoria: t.categoria,
    subtipo: t.subtipo,
    rotulo: `${CATALOGO[t.categoria].curto} › ${t.subtipo}`,
  }));
  acoes.push(whats(`Olá! Tenho interesse em: ${pergunta.trim()}`, "Pedir pelo WhatsApp"));

  const nomes = achados.map((p) => `• ${p.nome}`).join("\n");
  const texto = achados.length
    ? `Encontrei no catálogo:\n${nomes}\n\nToque abaixo para ver as fotos ou pedir.`
    : "Temos essa linha! Toque abaixo para ver no catálogo. Se ainda não houver foto, a gente faz sob encomenda.";
  return { texto, acoes };
}

export function responder(pergunta: string, produtos: Produto[]): Resposta {
  const texto = ` ${normalizar(pergunta)} `;

  // Assunto com mais palavras-chave encontradas na pergunta
  let melhor: { assunto: Assunto; pontos: number } | null = null;
  for (const assunto of ASSUNTOS) {
    const pontos = assunto.palavras.filter((p) => texto.includes(` ${normalizar(p)}`)).length;
    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) melhor = { assunto, pontos };
  }
  if (melhor) return melhor.assunto.resposta;

  const catalogo = buscarNoCatalogo(pergunta, produtos);
  if (catalogo) return catalogo;

  return {
    texto:
      "Essa eu não sei responder por aqui. Posso te passar para o nosso atendimento no WhatsApp com a sua pergunta já escrita.",
    acoes: [whats(`Olá! Vim pelo site e tenho uma dúvida: ${pergunta.trim()}`, "Enviar pergunta no WhatsApp")],
  };
}
