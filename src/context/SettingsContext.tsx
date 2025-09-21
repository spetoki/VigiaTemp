
"use client";

import type { TemperatureUnit, LanguageCode } from '@/types';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface Translations {
  [key: string]: string;
}

type Theme = 'light' | 'dark';

// This is the default key used if the text file isn't available.
const DEFAULT_ACCESS_KEY = '8352'; 
const UNLOCKED_KEY_PREFIX = 'vigiatemp_unlocked_status';
const ACTIVE_KEY_STORAGE = 'vigiatemp_active_key';

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

// NOTE: ACCESS_KEYS are defined in a separate file (chaves-de-desbloqueio.txt) which is read server-side
// and is not directly accessible here to avoid client-side fs module errors.
// The unlockApp function now relies on a hardcoded list for demonstration.
// In a real production scenario, this validation would happen on a server/API endpoint.
const ACCESS_KEYS: string[] = ["8352", "5819", "2743", "9067", "1482", "7539", "4201", "6915", "0378", "9254", "3160", "5786", "8429", "1093", "7248", "4961", "0527", "6380", "9714", "2805", "5493", "8176", "1620", "7058", "4392", "0817", "6534", "9281", "3706", "5149", "8823", "2357", "7904", "4618", "0275", "6193", "9540", "3081", "5627", "8394", "1850", "7409", "4126", "0783", "6451", "9808", "3265", "5932", "8609", "2176", "7731", "4488", "0045", "6712", "9379", "2846", "5513", "8180", "1647", "7214", "4881", "0438", "6005", "9672", "3139", "5706", "8373", "1840", "7407", "4974", "0541", "6108", "9775", "3242", "5809", "8476", "1943", "7510", "4077", "0644", "6211", "9878", "3345", "5912", "8579", "2046", "7613", "4180", "0747", "6314", "9981", "3448", "5015", "8682", "2149", "7716", "4283", "0850", "6417", "9084", "1122"];


export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>('C');
  const [language, setLanguageState] = useState<LanguageCode>('pt-BR');
  const [theme, setThemeState] = useState<Theme>('light');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);


  const storageKeys = {
    sensors: activeKey ? `users/${activeKey}/sensors` : '',
    alerts: activeKey ? `users/${activeKey}/alerts` : '',
    lots: activeKey ? `users/${activeKey}/lots` : '',
    components: activeKey ? `hardware_components_${activeKey}` : 'hardware_components',
    diagram: activeKey ? `hardware_diagram_${activeKey}` : 'hardware_diagram'
  };

  useEffect(() => {
    // This effect runs once on mount to check initial state from localStorage
    const savedActiveKey = localStorage.getItem(ACTIVE_KEY_STORAGE);
    
    if (savedActiveKey) {
        const unlockedStatus = localStorage.getItem(`${UNLOCKED_KEY_PREFIX}_${savedActiveKey}`);
        if (unlockedStatus === 'true') {
            setActiveKey(savedActiveKey); // Set key first
            setIsLocked(false); // Then unlock
        } else {
            setIsLocked(true);
            setActiveKey(null);
            localStorage.removeItem(ACTIVE_KEY_STORAGE);
        }
    } else {
        setIsLocked(true);
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
  
  const unlockApp = (key: string): boolean => {
    if (ACCESS_KEYS.includes(key)) {
      localStorage.setItem(`${UNLOCKED_KEY_PREFIX}_${key}`, 'true');
      localStorage.setItem(ACTIVE_KEY_STORAGE, key);
      setActiveKey(key); // Set key first
      setIsLocked(false); // Then unlock
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

    