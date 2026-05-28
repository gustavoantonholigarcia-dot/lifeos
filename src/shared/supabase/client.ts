import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

function isConfigured(url?: string, key?: string): boolean {
  return Boolean(
    url &&
      key &&
      !url.includes('COLE_AQUI') &&
      !key.includes('COLE_AQUI') &&
      url.startsWith('https://'),
  );
}

export const isSupabaseConfigured = isConfigured(supabaseUrl, supabaseAnonKey);

/**
 * Storage adapter SSR-safe.
 * - Em RN (iOS/Android): usa AsyncStorage
 * - Em web no browser: usa localStorage
 * - Em web durante SSR (window indefinido): retorna stub (não persiste)
 */
const storageAdapter = (() => {
  if (Platform.OS !== 'web') return AsyncStorage;

  // Web: verifica se window existe (SSR vs browser)
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return {
      getItem: async (_k: string) => null,
      setItem: async (_k: string, _v: string) => undefined,
      removeItem: async (_k: string) => undefined,
    };
  }
  return {
    getItem: async (k: string) => window.localStorage.getItem(k),
    setItem: async (k: string, v: string) => window.localStorage.setItem(k, v),
    removeItem: async (k: string) => window.localStorage.removeItem(k),
  };
})();

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: storageAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/**
 * Retorna o client Supabase ou lança erro se não configurado.
 */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      '[lifeOS] Supabase não configurado. ' +
        'Edite app.json -> expo.extra.supabaseUrl e supabaseAnonKey ' +
        'com os valores do seu projeto Supabase.',
    );
  }
  return supabase;
}

export type Database = {
  // Tipos gerados depois via `supabase gen types typescript`
};
