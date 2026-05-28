/**
 * Agendador de notificações locais (expo-notifications).
 * Salva os IDs agendados em `notificacoes_agendadas` (Supabase) pra cancelar
 * quando a tarefa for deletada/editada/concluída.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { requireSupabase, supabase } from '@/shared/supabase';

// ============================================================================
// Setup
// ============================================================================
/**
 * Configura como notifications aparecem com app em foreground.
 * Chamar UMA vez no startup da app (root layout).
 */
export function configurarHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Pede permissão pra notificações. Retorna true se aceita.
 */
export async function pedirPermissoes(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Prazos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E04830',
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ============================================================================
// Schedule / Cancel
// ============================================================================
type AgendarInput = {
  tarefa_id: string;
  titulo: string;
  prazo_em: string;   // ISO
  user_id: string;
};

/**
 * Agenda 3 notificações pra tarefa: 24h antes, 1h antes, no horário.
 * Pula janelas que já passaram. Salva os IDs no Supabase.
 */
export async function agendarNotificacoesTarefa(input: AgendarInput): Promise<void> {
  if (!supabase) return;

  // Cancela tudo que existe pra essa tarefa antes (evita duplicar)
  await cancelarNotificacoesTarefa(input.tarefa_id, input.user_id);

  const prazo = new Date(input.prazo_em);
  const agora = new Date();

  type Janela = { mensagem: string; offsetMin: number };
  const janelas: Janela[] = [
    { mensagem: 'Vence amanhã', offsetMin: 24 * 60 },
    { mensagem: 'Vence em 1 hora', offsetMin: 60 },
    { mensagem: 'Prazo agora', offsetMin: 0 },
  ];

  const agendamentos = [];
  for (const j of janelas) {
    const data = new Date(prazo.getTime() - j.offsetMin * 60 * 1000);
    if (data <= agora) continue;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: input.titulo,
          body: j.mensagem,
          data: { tarefa_id: input.tarefa_id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: data,
        },
      });

      agendamentos.push({
        user_id: input.user_id,
        referencia_id: input.tarefa_id,
        referencia_tipo: 'tarefa',
        disparar_em: data.toISOString(),
        mensagem: j.mensagem,
        identificador_local: id,
        enviada: false,
      });
    } catch (e) {
      console.warn('[notif] falha ao agendar', j.mensagem, e);
    }
  }

  if (agendamentos.length > 0) {
    const { error } = await supabase.from('notificacoes_agendadas').insert(agendamentos);
    if (error) console.warn('[notif] falha ao salvar IDs', error.message);
  }
}

/**
 * Cancela todas as notificações pendentes de uma tarefa.
 * Lê os IDs do Supabase e cancela via expo-notifications.
 */
export async function cancelarNotificacoesTarefa(
  tarefa_id: string,
  user_id?: string,
): Promise<void> {
  if (!supabase) return;

  let query = supabase
    .from('notificacoes_agendadas')
    .select('id, identificador_local')
    .eq('referencia_id', tarefa_id)
    .eq('referencia_tipo', 'tarefa')
    .eq('enviada', false);

  if (user_id) query = query.eq('user_id', user_id);

  const { data, error } = await query;
  if (error) {
    console.warn('[notif] falha ao buscar IDs', error.message);
    return;
  }

  for (const row of data ?? []) {
    if (row.identificador_local) {
      await Notifications.cancelScheduledNotificationAsync(row.identificador_local).catch(
        () => {},
      );
    }
  }

  // Remove do banco
  const ids = (data ?? []).map((r) => r.id);
  if (ids.length > 0) {
    await supabase.from('notificacoes_agendadas').delete().in('id', ids);
  }
}

/**
 * Helper: pega user_id do auth + agenda.
 */
export async function agendarSeNecessario(tarefa: {
  id: string;
  titulo: string;
  prazo_em: string | null;
  prazo_tipo?: string | null;
  status?: string;
}) {
  // Não agendar se: sem prazo, prazo variável, ou já concluída
  if (!tarefa.prazo_em) return;
  if (tarefa.prazo_tipo === 'variavel') return;
  if (tarefa.status === 'concluido') return;

  const sb = requireSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;

  await agendarNotificacoesTarefa({
    tarefa_id: tarefa.id,
    titulo: tarefa.titulo,
    prazo_em: tarefa.prazo_em,
    user_id: user.id,
  });
}
