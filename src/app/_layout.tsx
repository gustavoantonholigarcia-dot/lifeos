import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

import {
  Spectral_400Regular_Italic,
  Spectral_500Medium_Italic,
  Spectral_600SemiBold_Italic,
  Spectral_400Regular,
  Spectral_500Medium,
} from '@expo-google-fonts/spectral';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';

import { queryClient } from '@/shared/query-client';

SplashScreen.preventAutoHideAsync().catch(() => {});

const modalHeader = {
  presentation: 'modal' as const,
  headerShown: true,
  contentStyle: { backgroundColor: '#1C1917' },
  headerStyle: { backgroundColor: '#1C1917' },
  headerTintColor: 'rgba(245,241,237,0.87)',
};

const pushHeader = {
  presentation: 'card' as const,
  headerShown: true,
  contentStyle: { backgroundColor: '#1C1917' },
  headerStyle: { backgroundColor: '#1C1917' },
  headerTintColor: 'rgba(245,241,237,0.87)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Spectral — display editorial
    'Spectral-Italic': Spectral_400Regular_Italic,
    'Spectral-Medium-Italic': Spectral_500Medium_Italic,
    'Spectral-SemiBold-Italic': Spectral_600SemiBold_Italic,
    Spectral_400Regular,
    Spectral_500Medium,
    // Inter — body
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // JetBrains Mono — meta
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-Medium': JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#1C1917' },
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />

            {/* Tarefas */}
            <Stack.Screen name="tarefa/nova" options={{ ...modalHeader, title: 'Nova tarefa' }} />
            <Stack.Screen name="tarefa/[id]" options={{ ...modalHeader, title: 'Editar tarefa' }} />

            {/* Agenda global (filtrada por módulo via ?modulo=tawa) */}
            <Stack.Screen
              name="agenda"
              options={{ ...pushHeader, title: 'Agenda' }}
            />

            {/* Estudos */}
            <Stack.Screen
              name="modules/estudos/index"
              options={{ ...pushHeader, title: 'Estudos' }}
            />
            <Stack.Screen
              name="modules/estudos/novo"
              options={{ ...modalHeader, title: 'Novo idioma' }}
            />
            <Stack.Screen name="modules/estudos/[id]" options={pushHeader} />
            <Stack.Screen
              name="modules/estudos/[id]/sessao-nova"
              options={{ ...modalHeader, title: 'Nova sessão' }}
            />

            {/* RUAH / Projetos / Intercâmbio */}
            <Stack.Screen
              name="modules/ruah/index"
              options={{ ...pushHeader, title: 'RUAH' }}
            />
            <Stack.Screen
              name="modules/projetos/index"
              options={{ ...pushHeader, title: 'Projetos' }}
            />
            <Stack.Screen
              name="modules/intercambio/index"
              options={{ ...pushHeader, title: 'Intercâmbio' }}
            />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
