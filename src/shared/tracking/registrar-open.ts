import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { supabase } from '@/shared/supabase';

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let registrado = false;

export async function registrarOpen() {
  if (registrado || !supabase) return;
  registrado = true;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('app_opens')
      .upsert({ user_id: user.id, data: hojeISO() }, { onConflict: 'user_id,data' });

    await salvarPushToken(user.id);
  } catch {
    registrado = false;
  }
}

async function salvarPushToken(userId: string) {
  try {
    // Push remoto (Expo) só funciona em development build com projectId EAS.
    // No Expo Go o token não é emitido — então saímos cedo sem quebrar o tracking.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;
    if (!projectId) return;

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    if (!token || !supabase) return;

    await supabase
      .from('push_tokens')
      .upsert(
        { user_id: userId, token, platform: Platform.OS, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,token' },
      );
  } catch {}
}
