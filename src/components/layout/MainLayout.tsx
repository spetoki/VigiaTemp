
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/layout/AppHeader';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { AuthProvider } from '@/context/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: MainLayoutProps) {
  const { t } = useSettings();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // This effect only runs on the client side, after the component has mounted.
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const baseFooterText = t('footer.copyright', '© {year} VigiaTemp. Todos os direitos reservados ao Irineu bonitão.');
  
  // By waiting for currentYear to be set, we ensure the server-rendered HTML
  // and the initial client render are identical, preventing a hydration error.
  const footerText = currentYear 
    ? t('footer.copyright', '© {year} VigiaTemp. Todos os direitos reservados ao Irineu bonitão.', { year: currentYear })
    : baseFooterText.replace(' {year}', ''); // Render without the year on the server and initial client render.

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="bg-primary text-primary-foreground text-center p-4 text-sm">
        {footerText}
      </footer>
      <Toaster />
    </div>
  );
}


export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </SettingsProvider>
  );
}
