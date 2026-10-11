import type { Categoria } from "@/lib/produtos";

// Ilustração usada quando o produto ainda não tem foto
export default function IconeCategoria({ categoria }: { categoria: Categoria }) {
  switch (categoria) {
    case "Geek":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#E1262D" strokeWidth="4" strokeLinejoin="round">
          <path d="M50 10l34 20v40L50 110 16 70V30z" fill="#FFE1E2" />
          <path d="M16 30l34 20 34-20M50 50v60" />
        </svg>
      );
    case "Utilidades":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#0B2F7A" strokeWidth="4" strokeLinejoin="round">
          <rect x="14" y="40" width="72" height="60" rx="8" fill="#E6ECF8" />
          <path d="M30 40V22h40v18M14 64h72" />
        </svg>
      );
    case "Personalizados":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#1660E8" strokeWidth="4" strokeLinejoin="round">
          <circle cx="50" cy="34" r="18" fill="#DCE8FF" />
          <rect x="22" y="56" width="56" height="44" rx="10" fill="#FFE1E2" stroke="#E1262D" />
          <path d="M38 78h24" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#1660E8" strokeWidth="4" strokeLinejoin="round">
          <path d="M30 8h40l12 30-14 74H32L18 38z" fill="#DCE8FF" />
          <path d="M18 38h64M24 70h52M29 95h42" />
        </svg>
      );
  }
}
