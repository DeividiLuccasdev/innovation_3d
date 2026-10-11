import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && chave);

// Endereço do projeto (público), mostrado no login para conferir a configuração
export const projetoSupabase = url ? url.replace(/^https?:\/\//, "").replace(/\/+$/, "") : null;

let cliente: SupabaseClient | null = null;

// A chave "anon" é pública por natureza: quem protege os dados são as regras
// de acesso (RLS) definidas em supabase/schema.sql.
export function supabase() {
  if (!url || !chave) {
    throw new Error("Supabase não configurado. Veja o README.");
  }

  cliente ??= createClient(url, chave);
  return cliente;
}

export const BUCKET_FOTOS = "produtos";
