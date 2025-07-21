
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta página foi desativada para implementar um fluxo de criação de usuário exclusivo pelo administrador.
// A rota agora redireciona para a página de login.
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  // Renderiza null ou um loader enquanto redireciona
  return null;
}
