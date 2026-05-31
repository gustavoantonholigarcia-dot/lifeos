/**
 * GATE 21 dias (definido no spec do LifeOS).
 *
 * Os módulos das Fases 2–4 (Treinos, UTFPR, RUAH, Projetos, Intercâmbio, Estudos)
 * ficam OCULTOS da navegação até o KPI primário ser validado:
 *   ≥4 dias/semana abrindo o app, por 14 dias seguidos, com Fase 1 em produção.
 *
 * O código dos módulos continua no repo (custo zero parado). Só não aparece
 * pra não diluir o foco e não fazer o app parecer abandonado durante o GATE.
 *
 * Quando passar no GATE: mude para `true`. Não antes — o critério existe
 * justamente pra neutralizar o viés de sunk cost.
 */
export const GATE_PASSOU = true;
