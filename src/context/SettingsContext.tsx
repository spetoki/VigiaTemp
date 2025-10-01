
"use client";

import type { TemperatureUnit, LanguageCode } from '@/types';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface Translations {
  [key: string]: string;
}

type Theme = 'light' | 'dark';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface SettingsContextType {
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string, fallback?: string, replacements?: Record<string, string | number>) => string;
  isLocked: boolean;
  unlockApp: (key: string) => boolean;
  lockApp: () => void;
  activeKey: string | null;
  storageKeys: {
    sensors: string;
    alerts: string;
    lots: string;
    stock: string;
    components: string;
    diagram: string;
  };
  installPromptEvent: BeforeInstallPromptEvent | null;
  triggerInstallPrompt: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

async function importLocale(locale: LanguageCode): Promise<Translations> {
  const langShort = locale.split('-')[0];
  try {
    switch (langShort) {
      case 'en':
        return (await import('@/locales/en.json')).default;
      case 'es':
        return (await import('@/locales/es.json')).default;
      case 'pt':
      default:
        return (await import('@/locales/pt.json')).default;
    }
  } catch (error) {
    console.error(`Could not load locale: ${locale}`, error);
    if (locale !== 'pt-BR') {
        return (await import('@/locales/pt.json')).default; // Fallback to PT if EN or ES fails
    }
    return {};
  }
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>('C');
  const [language, setLanguageState] = useState<LanguageCode>('pt-BR');
  const [theme, setThemeState] = useState<Theme>('light');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLocked, setIsLocked] = useState<boolean>(false); // App starts unlocked in demo mode
  const [activeKey, setActiveKey] = useState<string | null>('demo_user'); // Dummy key for demo mode
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  // No-op storage keys since Firebase is removed.
  const storageKeys = {
    sensors: 'demo',
    alerts: 'demo',
    lots: 'demo',
    stock: 'demo',
    components: 'demo_hardware_components',
    diagram: 'demo_hardware_diagram'
  };

  useEffect(() => {
    // This effect runs once on mount to check initial state from localStorage
    const storedUnit = localStorage.getItem('temperatureUnit') as TemperatureUnit | null;
    if (storedUnit) setTemperatureUnitState(storedUnit);

    const storedLang = localStorage.getItem('language') as LanguageCode | null;
    const initialLang = storedLang || 'pt-BR';
    setLanguageState(initialLang);
    loadTranslations(initialLang);

    const storedTheme = localStorage.getItem('theme') as Theme | null || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setThemeState(storedTheme);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
    
  }, []);

  useEffect(() => {
    // This effect handles applying the theme to the document
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }
  }, [theme]);
  
  const triggerInstallPrompt = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPromptEvent(null);
      });
    }
  };
  
  // Dummy auth functions
  const unlockApp = (key: string): boolean => {
    console.log("Modo Demo: Acesso direto, chave ignorada.");
    setIsLocked(false);
    return true;
  };

  const lockApp = () => {
     console.log("Modo Demo: Função de bloqueio desativada.");
     // In demo mode, we might not want to re-lock the app, or we can just set it to locked
     // For now, let's make it do nothing to prevent being locked out.
  };

  const loadTranslations = useCallback(async (lang: LanguageCode) => {
    const loadedTranslations = await importLocale(lang);
    setTranslations(loadedTranslations);
  }, []);

  const setTemperatureUnit = (unit: TemperatureUnit) => {
    setTemperatureUnitState(unit);
    localStorage.setItem('temperatureUnit', unit);
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    loadTranslations(lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const t = useCallback((key: string, fallback?: string, replacements?: Record<string, string | number>): string => {
    let text = translations[key] || fallback || key;
    if (replacements) {
      for (const rKey in replacements) {
        text = text.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(replacements[rKey]));
      }
    }
    return text;
  }, [translations]);

  return (
    <SettingsContext.Provider value={{ temperatureUnit, setTemperatureUnit, language, setLanguage, theme, setTheme, t, isLocked, unlockApp, lockApp, activeKey, storageKeys, installPromptEvent, triggerInstallPrompt }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
