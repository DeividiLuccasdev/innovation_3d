import { CATALOGO, CATEGORIAS, type Categoria, type Produto } from "./produtos";

// Assistente de dúvidas preliminares: respostas fixas por assunto, busca no catálogo
// e, quando não sabe, abre o formulário com a pergunta. Edite os textos aqui.

export type Acao =
  | { tipo: "secao"; alvo: string; rotulo: string }
  | { tipo: "orcamento"; assunto: string; rotulo: string }
  | { tipo: "catalogo"; categoria: Categoria; subtipo?: string; rotulo: string }
  | { tipo: "carrinho"; rotulo: string };

export type Resposta = { texto: string; acoes: Acao[] };

type Assunto = {
  id: string;
  rotulo: string; // texto curto do botão
  pergunta: string; // pergunta completa que aparece no chat ao tocar no botão
  palavras: string[];
  resposta: Resposta;
};

const formulario = (assunto: string, rotulo = "Enviar pelo formulário"): Acao => ({ tipo: "orcamento", assunto, rotulo });

// Perguntas frequentes (textos definidos pela Innovation 3D)
export const ASSUNTOS: Assunto[] = [
  {
    id: "comprar",
    rotulo: "Como comprar",
    pergunta: "Como faço para comprar um produto?",
    palavras: ["comprar", "compra", "compro", "adquirir", "pedido", "pedir", "encomendar", "como funciona", "carrinho", "finalizar"],
    resposta: {
      texto:
        "Escolha o produto desejado em nosso catálogo, toque em Adicionar e, no carrinho, preencha a entrega e seus dados e toque em Confirmar pedido. Nossa equipe confirmará por e-mail os detalhes, a disponibilidade e o valor total da compra.",
      acoes: [
        { tipo: "secao", alvo: "#produtos", rotulo: "Ver catálogo" },
        { tipo: "carrinho", rotulo: "Ver meu carrinho" },
      ],
    },
  },
  {
    id: "personalizadas",
    rotulo: "Peças personalizadas",
    pergunta: "Vocês fazem impressões 3D personalizadas?",
    palavras: ["personalizado", "personalizada", "personalizadas", "personalizar", "nome", "logo", "foto", "imagem", "desenho", "arquivo", "stl", "obj", "modelar", "modelagem", "sob medida"],
    resposta: {
      texto:
        "Sim! Trabalhamos com peças personalizadas em impressão 3D. Toque em Solicitar orçamento, conte sua ideia e mande o link de uma imagem ou referência. Analisaremos a possibilidade de produção e respondemos com valor e prazo.",
      acoes: [formulario("Peça personalizada", "Solicitar orçamento")],
    },
  },
  {
    id: "prazo",
    rotulo: "Prazo de produção",
    pergunta: "Qual é o prazo de produção?",
    palavras: ["prazo", "demora", "quanto tempo", "dias", "pronto", "fica pronto", "urgente", "producao"],
    resposta: {
      texto:
        "O prazo depende do tamanho, da complexidade e da quantidade de peças solicitadas. Informamos a previsão de produção antes da confirmação do pedido.",
      acoes: [formulario("Prazo de produção", "Perguntar o prazo")],
    },
  },
  {
    id: "brasil",
    rotulo: "Entrega no Brasil",
    pergunta: "Vocês entregam para todo o Brasil?",
    palavras: ["entrega", "entregam", "entregar", "envio", "enviam", "enviar", "brasil", "correios", "outro estado", "minha cidade", "retirar", "retirada"],
    resposta: {
      texto:
        "Consulte a disponibilidade de envio para seu CEP. Informaremos as opções de transporte, os valores e os prazos estimados antes de finalizar o pedido.",
      acoes: [
        { tipo: "secao", alvo: "#frete", rotulo: "Consultar meu CEP" },
      ],
    },
  },
  {
    id: "frete",
    rotulo: "Calcular frete",
    pergunta: "Como posso calcular o frete?",
    palavras: ["frete", "calcular", "cep", "sedex", "pac", "valor do frete", "custo de envio"],
    resposta: {
      texto:
        "Informe seu CEP no campo de cálculo de frete, quando disponível, ou finalize o pedido com o seu CEP que confirmamos o frete exato. O valor depende do destino e das características do pedido.",
      acoes: [
        { tipo: "secao", alvo: "#frete", rotulo: "Calcular frete" },
      ],
    },
  },
  {
    id: "pagamento",
    rotulo: "Formas de pagamento",
    pergunta: "Quais são as formas de pagamento?",
    palavras: ["pagamento", "pagar", "forma de pagamento", "formas de pagamento", "boleto", "dinheiro"],
    resposta: {
      texto:
        "Aceitamos Pix e cartão de crédito.\n• Pix: você recebe o QR Code e o código copia e cola.\n• Cartão: pagamento pelo link seguro do Mercado Pago, com opção de parcelar.\nO pagamento é enviado junto com a confirmação do pedido.",
      acoes: [{ tipo: "carrinho", rotulo: "Ver meu carrinho" }],
    },
  },
  {
    id: "pix",
    rotulo: "Pix com QR Code",
    pergunta: "Como funciona o pagamento por Pix?",
    palavras: ["pix", "qr", "qrcode", "qr code", "copia e cola", "chave pix"],
    resposta: {
      texto:
        "No Pix você recebe um QR Code para escanear no app do seu banco e também o código copia e cola, caso esteja pelo celular. O valor já vem preenchido com o total do pedido. Assim que o pagamento cai, confirmamos e começamos a produção.",
      acoes: [{ tipo: "carrinho", rotulo: "Ver meu carrinho" }],
    },
  },
  {
    id: "cartao",
    rotulo: "Cartão e parcelamento",
    pergunta: "Posso pagar no cartão e parcelar?",
    palavras: ["cartao", "credito", "debito", "parcelar", "parcela", "parcelas", "parcelado", "parcelamento", "vezes", "juros"],
    resposta: {
      texto:
        "Aceitamos cartão de crédito pelo Mercado Pago, com opção de parcelamento. O número de parcelas e se há juros aparecem na tela de pagamento, antes de você confirmar.",
      acoes: [{ tipo: "carrinho", rotulo: "Ver meu carrinho" }],
    },
  },
  {
    id: "seguranca",
    rotulo: "Segurança dos dados",
    pergunta: "Meus dados e meu cartão ficam seguros?",
    palavras: ["seguranca", "seguro", "segura", "confiavel", "golpe", "fraude", "dados do cartao", "passar meu cartao", "passar o cartao", "meus dados", "privacidade", "lgpd"],
    resposta: {
      texto:
        "Pode ficar tranquilo:\n• O pagamento com cartão é processado pelo Mercado Pago, com certificação de segurança bancária (PCI DSS) e proteção antifraude.\n• A Innovation 3D não recebe nem guarda o número do seu cartão.\n• No Pix, você paga direto pelo app do seu banco.\n• Usamos seu nome, CEP e telefone só para entregar o pedido.",
      acoes: [],
    },
  },
  {
    id: "cor-tamanho",
    rotulo: "Cor e tamanho",
    pergunta: "Posso escolher a cor e o tamanho da peça?",
    palavras: ["cor", "cores", "tamanho", "tamanhos", "maior", "menor", "escolher", "medida", "medidas"],
    resposta: {
      texto:
        "Em muitos produtos, sim! As opções dependem do modelo e da disponibilidade de materiais. Peça um orçamento informando a cor e o tamanho que deseja e verificamos as possibilidades.",
      acoes: [formulario("Cor e tamanho de uma peça", "Consultar opções")],
    },
  },
  {
    id: "resistencia",
    rotulo: "Resistência",
    pergunta: "Os produtos são resistentes?",
    palavras: ["resistente", "resistencia", "quebra", "quebrar", "durabilidade", "dura", "material", "materiais", "pla", "petg", "tpu", "sol", "calor", "agua", "cuidados"],
    resposta: {
      texto:
        "A resistência depende do material utilizado, do formato da peça e das condições de uso. Nossa equipe pode orientar sobre os cuidados recomendados para cada produto.",
      acoes: [formulario("Resistência e cuidados com uma peça", "Perguntar à equipe")],
    },
  },
  {
    id: "fora-catalogo",
    rotulo: "Peça fora do catálogo",
    pergunta: "Posso solicitar uma peça que não está no catálogo?",
    palavras: ["nao esta no catalogo", "fora do catalogo", "nao tem no catalogo", "outra peca", "ideia", "referencia", "projeto"],
    resposta: {
      texto:
        "Sim! Envie sua ideia ou referência pelo formulário de orçamento. Avaliaremos a viabilidade da impressão e prepararemos um orçamento personalizado.",
      acoes: [formulario("Peça fora do catálogo", "Enviar referência")],
    },
  },
  {
    id: "troca",
    rotulo: "Troca e devolução",
    pergunta: "Como funciona a troca ou devolução?",
    palavras: ["troca", "trocar", "devolucao", "devolver", "arrependimento", "reembolso", "defeito", "garantia", "quebrado", "chegou quebrado"],
    resposta: {
      texto:
        "Envie sua solicitação pelo formulário, com o número do pedido, para receber as orientações. As solicitações serão analisadas conforme o Código de Defesa do Consumidor, incluindo o direito de arrependimento quando aplicável.",
      acoes: [formulario("Troca ou devolução", "Solicitar troca")],
    },
  },
  {
    id: "acompanhar",
    rotulo: "Acompanhar pedido",
    pergunta: "Como acompanhar meu pedido?",
    palavras: ["acompanhar", "rastreio", "rastreamento", "rastrear", "codigo de rastreio", "meu pedido", "status", "andamento", "chegou", "onde esta"],
    resposta: {
      texto:
        "Enviamos as atualizações do pedido por e-mail: confirmação, produção e envio. Quando houver rastreamento disponível, o código chega no seu e-mail.",
      acoes: [formulario("Andamento do meu pedido", "Falar sobre meu pedido")],
    },
  },
  {
    id: "quantidade",
    rotulo: "Grandes quantidades",
    pergunta: "É possível comprar em grandes quantidades?",
    palavras: ["quantidade", "quantidades", "atacado", "lote", "muitas", "varias", "brinde", "brindes", "lembrancinha", "lembrancinhas", "evento", "eventos", "empresa", "corporativo"],
    resposta: {
      texto:
        "Sim! Você pode solicitar um orçamento para quantidades maiores, brindes, lembrancinhas, eventos e pedidos corporativos. As condições serão definidas conforme o projeto.",
      acoes: [formulario("Grande quantidade", "Pedir orçamento")],
    },
  },
  {
    id: "atendente",
    rotulo: "Falar com a equipe",
    pergunta: "Quero falar com uma pessoa.",
    palavras: ["atendente", "pessoa", "humano", "falar com", "whatsapp", "zap", "telefone", "contato", "ligar", "email"],
    resposta: {
      texto: "Claro! Deixe sua mensagem no formulário que a nossa equipe responde por e-mail.",
      acoes: [formulario("Contato pelo site", "Falar com a equipe")],
    },
  },
];

export const SAUDACAO: Resposta = {
  texto:
    "Oi! Eu sou o Inno, assistente da Innovation 3D. Escolha uma das perguntas frequentes abaixo, escreva sua dúvida ou me diga o produto que procura.",
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
  acoes.push(formulario(pergunta.trim().slice(0, 160), "Pedir orçamento"));

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
      "Essa eu não sei responder por aqui. Envie sua pergunta pelo formulário que a nossa equipe responde por e-mail.",
    acoes: [formulario(`Dúvida: ${pergunta.trim()}`.slice(0, 160), "Enviar pergunta")],
  };
}
