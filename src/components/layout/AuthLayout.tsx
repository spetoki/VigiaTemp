
"use client";

import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayoutContent({ children }: AuthLayoutProps) {
  const { language } = useSettings();

  useEffect(() => {
    if (typeof document !== 'undefined' && language) {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AuthLayoutContent>{children}</AuthLayoutContent>
      </AuthProvider>
    </SettingsProvider>
  );
}
