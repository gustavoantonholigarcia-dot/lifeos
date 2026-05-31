/**
 * Helpers visuais/utilitários do CRM TAWA — avatar, WhatsApp, frieza de contato.
 */

// Paleta editorial pra avatares (tons quentes/terrosos do tema)
const AVATAR_CORES = [
  '#6B8FB8', // azul
  '#E8A845', // mel
  '#8FA899', // verde sálvia
  '#C97064', // terracota
  '#B89FD9', // lavanda
  '#D4A574', // areia
  '#87A878', // oliva
  '#E8B4A0', // pêssego
];

/** Iniciais a partir do nome (até 2 letras). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Cor estável do avatar derivada do nome. */
export function corAvatar(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) {
    h = (h * 31 + nome.charCodeAt(i)) % 100000;
  }
  return AVATAR_CORES[h % AVATAR_CORES.length];
}

/** Normaliza telefone BR e monta link do WhatsApp (wa.me). */
export function linkWhatsApp(telefone: string | null): string | null {
  if (!telefone) return null;
  let digits = telefone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (!digits.startsWith('55')) digits = '55' + digits;
  return `https://wa.me/${digits}`;
}

/** Dias decorridos desde uma data ISO (ou null). */
export function diasDesde(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const ms = Date.now() - d.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Rótulo de frieza: "hoje", "ontem", "Xd". Null se < 1 dia. */
export function rotuloFrieza(iso: string | null): { texto: string; frio: boolean } | null {
  const dias = diasDesde(iso);
  if (dias == null) return null;
  if (dias <= 0) return { texto: 'hoje', frio: false };
  if (dias === 1) return { texto: 'ontem', frio: false };
  return { texto: `${dias}d sem contato`, frio: dias >= 14 };
}
