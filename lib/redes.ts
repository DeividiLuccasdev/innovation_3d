// Redes sociais da loja (os perfis podem ser trocados por NEXT_PUBLIC_INSTAGRAM e
// NEXT_PUBLIC_YOUTUBE, sempre sem a arroba)
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || "inovation__3d";
const YOUTUBE = process.env.NEXT_PUBLIC_YOUTUBE || "inovation_3d_Araraquara";

export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM}/`;
export const INSTAGRAM_ARROBA = `@${INSTAGRAM}`;

export const YOUTUBE_URL = `https://www.youtube.com/@${YOUTUBE}`;
export const YOUTUBE_ARROBA = `@${YOUTUBE}`;
