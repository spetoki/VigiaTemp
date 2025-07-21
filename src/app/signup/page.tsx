

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

// Esta página foi desativada para implementar um fluxo de criação de usuário exclusivo pelo administrador.
// A rota agora redireciona para a página de login.
export default function SignupPage() {
  const router = useRouter();
  const { t } = useSettings();
  const { authState } = useAuth();
  
  useEffect(() => {
    // Redirect only if the user is not already being redirected or authenticated
    if (authState !== 'loading') {
       router.replace('/login');
    }
  }, [router, authState]);

  // Renderiza null ou um loader enquanto redireciona
  return null;
}
