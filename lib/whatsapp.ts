export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "5516993321465";

export function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

export function telefoneFormatado() {
  const n = WHATSAPP.replace(/^55/, "");
  return n.length === 11 ? `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}` : n;
}
