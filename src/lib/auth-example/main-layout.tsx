
"use client";

import type { ReactNode } from 'react';
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useAuth, AuthProvider } from './auth-context'; // Ajuste o caminho
import LockScreen from './lock-screen'; // Ajuste o caminho

interface MainLayoutProps {
  children: ReactNode;
}

// Este é o componente que faz a troca entre a tela de bloqueio e o app
function LayoutContent({ children }: MainLayoutProps) {
  const { isLocked } = useAuth();
  
  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 
        Coloque aqui o Header e o Footer do seu aplicativo, 
        eles só aparecerão quando o app estiver desbloqueado.
      */}
      <header className="bg-primary text-primary-foreground p-4">
        <h1>Meu Aplicativo Desbloqueado</h1>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="text-center p-4 bg-muted">
        <p>© 2024 Meu App</p>
      </footer>
      <Toaster />
    </div>
  );
}

// Este é o componente que você deve usar no seu RootLayout
export function MainLayout({ children }: MainLayoutProps) {
  return (
    // O AuthProvider já está aqui, então você só precisa
    // usar <MainLayout> no seu arquivo layout.tsx principal.
      <LayoutContent>{children}</LayoutContent>
  );
}


// Exemplo de como usar no seu `src/app/layout.tsx` principal:
/*
import { AuthProvider } from '@/lib/auth-example/auth-context';
import { MainLayout } from '@/lib/auth-example/main-layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
*/
