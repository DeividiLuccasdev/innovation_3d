// Pacote médio usado em toda cotação (média das peças: cm e kg)
export const PACOTE = { altura: 15, largura: 20, comprimento: 27, peso: 1.4 };

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
