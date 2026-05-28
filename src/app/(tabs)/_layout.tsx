import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/shared/auth/use-auth';
import {
  configurarHandler,
  pedirPermissoes,
} from '@/shared/notifications/scheduler';

export default function TabsLayout() {
  const { user, loading, configured } = useAuth();

  useEffect(() => {
    configurarHandler();
  }, []);

  // Pede permissão de notificação quando usuário entra (uma vez)
  useEffect(() => {
    if (user) {
      pedirPermissoes().catch(() => {});
    }
  }, [user?.id]);

  if (loading) return null;
  if (!configured) return <AppTabs />;
  if (!user) return <Redirect href="/(auth)/login" />;

  return <AppTabs />;
}
