/**
 * Heurística local (regex) pra classificar texto → módulo + prioridade.
 * Zero IA, zero latência, custo zero. Resolve ~80% dos casos.
 */

import type { Modulo } from '@/modules/tawa/types';

type Resultado = {
  modulo: Modulo;
  prazo_em?: string;            // ISO se detectou data
  confianca: 'alta' | 'media' | 'baixa';
};

// Palavras-chave por módulo
const KEYWORDS: Record<Modulo, string[]> = {
  tawa: [
    'tawa', 'cliente', 'proposta', 'contrato', 'orçamento', 'orcamento',
    'comercial', 'jurídico', 'juridico', 'logística', 'logistica',
    'fornecedor', 'lead', 'edital', 'licitação', 'licitacao',
    'empenho', 'ata', 'pregão', 'pregao', 'secretaria', 'prefeitura',
    'consórcio', 'consorcio', 'pedido', 'venda', 'comprador',
  ],
  utfpr: [
    'utfpr', 'aula', 'prova', 'trabalho', 'exercício', 'exercicio',
    'estudar', 'computação', 'computacao', 'administração', 'administracao',
    'professor', 'matéria', 'materia', 'moodle', 'tcc',
  ],
  ruah: [
    'ruah', 'igreja', 'reunião', 'reuniao', 'ministério', 'ministerio',
    'promoção humana', 'promocao humana', 'irmão', 'irmao', 'oração', 'oracao',
    'ação social', 'acao social', 'teatro', 'evangelização', 'evangelizacao',
  ],
  intercambio: [
    'intercâmbio', 'intercambio', 'visto', 'passaporte', 'embaixada',
    'destination', 'aplicação', 'aplicacao',
  ],
  projeto: [
    'projeto', 'side project', 'app', 'pessoal', 'side',
  ],
};

// Palavras de urgência
const URGENCIA_ALTA = /\b(urgente|asap|hoje|agora|imediato|prioridade)\b/i;
const URGENCIA_BAIXA = /\b(quando der|algum dia|sem pressa|baixa|low)\b/i;

/**
 * Classifica o texto em um módulo.
 * Default: tawa (mais provável dado o uso do Gustavo).
 */
export function classificarModulo(texto: string): Resultado {
  const lower = texto.toLowerCase();
  const scores: Record<Modulo, number> = {
    tawa: 0,
    utfpr: 0,
    ruah: 0,
    projeto: 0,
    intercambio: 0,
  };

  for (const [mod, palavras] of Object.entries(KEYWORDS) as [Modulo, string[]][]) {
    for (const palavra of palavras) {
      if (lower.includes(palavra)) {
        scores[mod] += palavra.length > 5 ? 3 : 1; // palavras longas têm mais peso
      }
    }
  }

  const topMod = (Object.entries(scores) as [Modulo, number][])
    .sort((a, b) => b[1] - a[1])[0];

  const modulo = topMod[1] > 0 ? topMod[0] : 'tawa'; // default tawa
  const confianca = topMod[1] >= 6 ? 'alta' : topMod[1] >= 2 ? 'media' : 'baixa';

  return {
    modulo,
    prazo_em: detectarPrazo(texto),
    confianca,
  };
}

/**
 * Detecta data/hora no texto.
 * Suporta: "hoje", "amanhã", "sexta", "dia 30", "30/05", "às 14h", etc.
 */
function detectarPrazo(texto: string): string | undefined {
  const lower = texto.toLowerCase();
  const agora = new Date();

  // "hoje [HHh|HH:MM]"
  if (/\bhoje\b/.test(lower)) {
    const d = new Date(agora);
    const hora = extrairHora(lower);
    if (hora) {
      d.setHours(hora.h, hora.m, 0, 0);
    } else {
      d.setHours(18, 0, 0, 0); // default fim do dia
    }
    return d.toISOString();
  }

  // "amanhã [HHh|HH:MM]"
  if (/\bamanh[aã]\b/.test(lower)) {
    const d = new Date(agora);
    d.setDate(d.getDate() + 1);
    const hora = extrairHora(lower);
    d.setHours(hora?.h ?? 9, hora?.m ?? 0, 0, 0);
    return d.toISOString();
  }

  // "dd/mm" ou "dd/mm/yyyy"
  const data = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (data) {
    const dia = parseInt(data[1], 10);
    const mes = parseInt(data[2], 10) - 1;
    let ano = data[3] ? parseInt(data[3], 10) : agora.getFullYear();
    if (ano < 100) ano += 2000;
    const d = new Date(ano, mes, dia);
    const hora = extrairHora(lower);
    d.setHours(hora?.h ?? 9, hora?.m ?? 0, 0, 0);
    return d.toISOString();
  }

  // Dias da semana
  const diasSemana: Record<string, number> = {
    domingo: 0, segunda: 1, terça: 2, terca: 2, quarta: 3,
    quinta: 4, sexta: 5, sábado: 6, sabado: 6,
  };
  for (const [nome, idx] of Object.entries(diasSemana)) {
    if (new RegExp(`\\b${nome}\\b`).test(lower)) {
      const d = new Date(agora);
      const diff = (idx - d.getDay() + 7) % 7 || 7; // próximo dia X
      d.setDate(d.getDate() + diff);
      const hora = extrairHora(lower);
      d.setHours(hora?.h ?? 9, hora?.m ?? 0, 0, 0);
      return d.toISOString();
    }
  }

  return undefined;
}

function extrairHora(texto: string): { h: number; m: number } | null {
  // "às 14:30" ou "14h30" ou "14h" ou "14:00"
  const match = texto.match(/\b(\d{1,2})(?:h|:)(\d{0,2})\b/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    if (h >= 0 && h < 24) return { h, m };
  }
  return null;
}

/**
 * Detecta prioridade pelo texto.
 */
export function detectarPrioridade(texto: string): 'alta' | 'media' | 'baixa' | 'sem' {
  if (URGENCIA_ALTA.test(texto)) return 'alta';
  if (URGENCIA_BAIXA.test(texto)) return 'baixa';
  return 'sem';
}
