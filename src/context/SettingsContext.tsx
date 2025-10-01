
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

// --- CONFIGURAÇÃO DE ACESSO ---
const ACCESS_KEYS: string[] = ["8352", "5819", "2743", "9067", "1482", "7539", "4201", "6915", "0378", "9254"];
const MASTER_UNLOCK_KEY = '6894';
const UNLOCKED_KEY_PREFIX = 'vigiatemp_unlocked';
const ACTIVE_KEY_STORAGE = 'vigiatemp_active_key';
const FAILED_ATTEMPTS_KEY = 'vigiatemp_failed_attempts';
const LOCKOUT_END_TIME_KEY = 'vigiatemp_lockout_end_time';

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
    return (await import('@/locales/pt.json')).default; // Fallback para PT
  }
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>('C');
  const [language, setLanguageState] = useState<LanguageCode>('pt-BR');
  const [theme, setThemeState] = useState<Theme>('light');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const savedActiveKey = localStorage.getItem(ACTIVE_KEY_STORAGE);
    if (savedActiveKey) {
        const unlockedStatus = localStorage.getItem(`${UNLOCKED_KEY_PREFIX}_${savedActiveKey}`);
        if (unlockedStatus === 'true') {
            setActiveKey(savedActiveKey);
            setIsLocked(false);
        }
    }

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
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
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
    }
  };
  
  const unlockApp = (key: string): boolean => {
    if (ACCESS_KEYS.includes(key)) {
      localStorage.setItem(`${UNLOCKED_KEY_PREFIX}_${key}`, 'true');
      localStorage.setItem(ACTIVE_KEY_STORAGE, key);
      setActiveKey(key);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (activeKey) {
        localStorage.removeItem(`${UNLOCKED_KEY_PREFIX}_${activeKey}`);
    }
    localStorage.removeItem(ACTIVE_KEY_STORAGE);
    setIsLocked(true);
    setActiveKey(null);
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
      Object.entries(replacements).forEach(([rKey, value]) => {
        text = text.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(value));
      });
    }
    return text;
  }, [translations]);

  const storageKeys = {
    sensors: activeKey ? `users/${activeKey}/sensors` : '',
    alerts: activeKey ? `users/${activeKey}/alerts` : '',
    lots: activeKey ? `users/${activeKey}/lots` : '',
    stock: activeKey ? `users/${activeKey}/stock` : '',
    components: 'global_hardware_components',
    diagram: 'global_hardware_diagram'
  };

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
