import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

// React Query não sabe quando o app RN volta do background.
// Sem isso, abrir o app de manhã mostra os dados de ontem até refresh manual.
AppState.addEventListener('change', (status) => {
  focusManager.setFocused(status === 'active');
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2min
      gcTime: 1000 * 60 * 10, // 10min em cache
      retry: 1,
      // Com o focusManager acima, "focus" = app voltou ao primeiro plano.
      // Queries velhas (>2min) refazem sozinhas na volta.
      refetchOnWindowFocus: true,
    },
  },
});
