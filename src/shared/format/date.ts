/**
 * Utilitários de formatação de data em pt-BR (dd/MM/yyyy).
 */

import { format, isPast, isToday, isTomorrow, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Converte Date ou ISO string em "dd/MM/yyyy" */
export function formatarData(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/** Formato curto: "dd/MM" (sem ano) — útil pra prazos próximos */
export function formatarDataCurta(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return format(date, 'dd/MM', { locale: ptBR });
}

/** Formato com hora: "dd/MM/yyyy HH:mm" */
export function formatarDataHora(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/** "Hoje 14:30" / "Amanhã 09:00" / "Qua, 28/05" — pra prazos */
export function formatarPrazoRelativo(d: Date | string): {
  texto: string;
  urgencia: 'vencido' | 'hoje' | 'amanha' | 'futuro';
} {
  const date = typeof d === 'string' ? new Date(d) : d;
  const hora = format(date, 'HH:mm');

  if (isPast(date) && !isToday(date)) {
    return { texto: `Vencido · ${formatarDataCurta(date)}`, urgencia: 'vencido' };
  }
  if (isToday(date)) return { texto: `Hoje · ${hora}`, urgencia: 'hoje' };
  if (isTomorrow(date)) return { texto: `Amanhã · ${hora}`, urgencia: 'amanha' };

  const diaSemana = format(date, 'EEE', { locale: ptBR }).replace('.', '');
  return {
    texto: `${diaSemana}, ${formatarDataCurta(date)} · ${hora}`,
    urgencia: 'futuro',
  };
}

/**
 * Parseia uma string em formato BR (dd/MM/yyyy ou dd/MM/yyyy HH:mm) pra Date.
 * Retorna null se inválido.
 */
export function parsearDataBR(texto: string): Date | null {
  if (!texto?.trim()) return null;
  const limpo = texto.trim();

  // Tenta vários formatos
  const formatos = [
    'dd/MM/yyyy HH:mm',
    'dd/MM/yyyy',
    'dd/MM/yy HH:mm',
    'dd/MM/yy',
  ];

  for (const fmt of formatos) {
    const d = parse(limpo, fmt, new Date(), { locale: ptBR });
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

/** Converte Date pra ISO string (UTC) — formato esperado pelo Supabase */
export function dataParaISO(d: Date): string {
  return d.toISOString();
}
