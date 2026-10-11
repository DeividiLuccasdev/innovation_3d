// Tamanhos de pacote oferecidos na consulta de frete (medidas em cm, peso em kg)
export const PACOTES = {
  pequeno: { nome: "Pequeno", exemplo: "chaveiro, topo de bolo", altura: 6, largura: 11, comprimento: 16, peso: 0.3 },
  medio: { nome: "Médio", exemplo: "vaso, luminária, imagem até 20 cm", altura: 15, largura: 20, comprimento: 25, peso: 1 },
  grande: { nome: "Grande", exemplo: "peças acima de 25 cm", altura: 25, largura: 30, comprimento: 40, peso: 3 },
} as const;

export type Pacote = keyof typeof PACOTES;

export type OpcaoFrete = { servico: string; preco: number; prazo: number };

export type RespostaFrete = {
  cidade: string | null;
  uf: string | null;
  opcoes: OpcaoFrete[];
  erro?: string;
};

export const soDigitos = (cep: string) => cep.replace(/\D/g, "");

export const formatarCep = (cep: string) => {
  const d = soDigitos(cep).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
