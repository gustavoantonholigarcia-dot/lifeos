import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase, isSupabaseConfigured } from '@/shared/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    configured: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!supabase) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    // Sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
        configured: true,
      });
    });

    // Listener pra mudanças (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
        configured: true,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

export async function signInWithEmail(email: string, senha: string) {
  if (!supabase) throw new Error('Supabase não configurado');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, senha: string, nome?: string) {
  if (!supabase) throw new Error('Supabase não configurado');
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase não configurado');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
