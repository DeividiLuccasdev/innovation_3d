import type { Categoria } from "@/lib/produtos";

// Ilustração usada quando o produto ainda não tem foto
export default function IconeCategoria({ categoria }: { categoria: Categoria | string }) {
  switch (categoria) {
    case "Decoração geek e temática":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#E1262D" strokeWidth="4" strokeLinejoin="round">
          <path d="M50 10l34 20v40L50 110 16 70V30z" fill="#FFE1E2" />
          <path d="M16 30l34 20 34-20M50 50v60" />
        </svg>
      );
    case "Escritórios e ambientes comerciais":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#0B2F7A" strokeWidth="4" strokeLinejoin="round">
          <rect x="14" y="40" width="72" height="60" rx="8" fill="#E6ECF8" />
          <path d="M30 40V22h40v18M14 64h72" />
        </svg>
      );
    case "Encomendas personalizadas":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#E1262D" strokeWidth="4" strokeLinejoin="round">
          <rect x="14" y="50" width="72" height="56" rx="6" fill="#FFE1E2" />
          <rect x="10" y="36" width="80" height="16" rx="4" fill="#DCE8FF" stroke="#1660E8" />
          <path d="M50 36v70M50 36c-8-16-26-16-22-4 3 6 22 4 22 4zm0 0c8-16 26-16 22-4-3 6-22 4-22 4z" />
        </svg>
      );
    case "ETs e alienígenas":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#2BD48A" strokeWidth="4" strokeLinejoin="round">
          <path d="M50 10c22 0 34 16 34 36 0 26-20 52-34 62C36 98 16 72 16 46c0-20 12-36 34-36z" fill="#D9FBEA" />
          <path d="M26 50c8-2 16 4 18 14-10 2-18-4-18-14zM74 50c-8-2-16 4-18 14 10 2 18-4 18-14z" fill="#0B1530" stroke="#0B1530" />
          <path d="M44 88h12" />
        </svg>
      );
    case "Arte sacra":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#0B2F7A" strokeWidth="4" strokeLinejoin="round">
          <path d="M42 8h16v26h22v16H58v62H42V50H20V34h22z" fill="#E6ECF8" />
          <circle cx="50" cy="42" r="30" stroke="#E1262D" strokeDasharray="4 7" />
        </svg>
      );
    case "Festas e eventos":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#E1262D" strokeWidth="4" strokeLinejoin="round">
          <rect x="16" y="62" width="68" height="40" rx="6" fill="#FFE1E2" />
          <rect x="26" y="40" width="48" height="22" rx="5" fill="#DCE8FF" stroke="#1660E8" />
          <path d="M50 40V24M50 24c-5-6 0-12 0-14 0 2 5 8 0 14z" />
        </svg>
      );
    case "Organização e decoração funcional":
      return (
        <svg viewBox="0 0 100 120" fill="none" stroke="#1660E8" strokeWidth="4" strokeLinejoin="round">
          <rect x="12" y="50" width="76" height="46" rx="8" fill="#DCE8FF" />
          <path d="M37 50v46M63 50v46" />
          <rect x="22" y="22" width="22" height="28" rx="4" fill="#FFE1E2" stroke="#E1262D" />
        </svg>
      );
    case "Decoração personalizada":
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
