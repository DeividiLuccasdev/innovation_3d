import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Innovation 3D | Imaginou? A gente imprime.",
  description:
    "Produtos impressos em 3D: decoração, geek, utilidades e peças personalizadas. Peça pelo WhatsApp.",
  openGraph: {
    title: "Innovation 3D",
    description: "Imaginou? A gente imprime.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,600;0,800;0,900;1,800&family=Poppins:wght@700;800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
