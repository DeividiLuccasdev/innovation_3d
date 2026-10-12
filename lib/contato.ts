// Validação dos dados de contato enviados pelos formulários (pedido e orçamento)

export type Contato = { nome: string; email: string; telefone: string };

export const limpar = (valor: unknown, maximo: number) =>
  String(valor ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximo);

export const soNumeros = (valor: string) => valor.replace(/\D/g, "");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Celular ou fixo com DDD: 10 ou 11 números (aceita +55 na frente)
export function normalizarTelefone(valor: string) {
  let n = soNumeros(valor);
  if (n.length > 11 && n.startsWith("55")) n = n.slice(2);
  return n;
}

export function formatarTelefone(valor: string) {
  const n = normalizarTelefone(valor).slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

export function validarContato(corpo: Record<string, unknown>): { contato?: Contato; erro?: string } {
  const nome = limpar(corpo.nome, 80);
  const email = limpar(corpo.email, 120).toLowerCase();
  const telefone = normalizarTelefone(String(corpo.telefone ?? ""));
  if (nome.length < 2) return { erro: "Informe seu nome." };
  if (!EMAIL.test(email)) return { erro: "Informe um e-mail válido." };
  if (telefone.length < 10 || telefone.length > 11) return { erro: "Informe um telefone com DDD." };
  return { contato: { nome, email, telefone } };
}
