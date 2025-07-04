
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from '@/context/SettingsContext';
import type { LanguageCode, TemperatureUnit } from '@/types';
import { SlidersHorizontal, Palette, Thermometer } from 'lucide-react';

type Theme = 'light' | 'dark';

export default function SystemSettingsPage() {
  const { language, setLanguage, theme, setTheme, temperatureUnit, setTemperatureUnit, t } = useSettings();

  const languages: { value: LanguageCode; labelKey: string; defaultLabel: string }[] = [
    { value: 'pt-BR', labelKey: 'language.portuguese', defaultLabel: 'Português (Brasil)' },
    { value: 'en-US', labelKey: 'language.english', defaultLabel: 'Inglês (EUA)' },
    { value: 'es-ES', labelKey: 'language.spanish', defaultLabel: 'Espanhol (Espanha)' },
  ];

  const themes: { value: Theme; labelKey: string; defaultLabel: string }[] = [
    { value: 'light', labelKey: 'systemSettings.themeLight', defaultLabel: 'Claro' },
    { value: 'dark', labelKey: 'systemSettings.themeDark', defaultLabel: 'Escuro' },
  ];

  const units: { value: TemperatureUnit; label: string }[] = [
    { value: 'C', label: 'Celsius (°C)' },
    { value: 'F', label: 'Fahrenheit (°F)' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <SlidersHorizontal className="mr-3 h-8 w-8" /> 
          {t('systemSettings.title', 'Configurações do Sistema')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('systemSettings.description', 'Ajuste as configurações globais do aplicativo.')}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />{t('systemSettings.appearanceTitle', 'Aparência')}</CardTitle>
            <CardDescription>
              {t('systemSettings.appearanceDescription', 'Personalize a aparência do aplicativo.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-semibold">{t('systemSettings.themeLabel', 'Tema')}</Label>
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as Theme)}
                className="mt-2 space-y-2"
              >
                {themes.map((th) => (
                  <div key={th.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={th.value} id={`theme-${th.value}`} />
                    <Label htmlFor={`theme-${th.value}`} className="cursor-pointer">
                      {t(th.labelKey, th.defaultLabel)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />{t('systemSettings.languageSettingsTitle', 'Configurações de Idioma')}</CardTitle>
            <CardDescription>
              {t('systemSettings.languageSettingsDescription', 'Escolha o idioma de exibição do aplicativo.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as LanguageCode)}
              className="space-y-2"
            >
              {languages.map((lang) => (
                <div key={lang.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={lang.value} id={`lang-${lang.value}`} />
                  <Label htmlFor={`lang-${lang.value}`} className="cursor-pointer">
                    {t(lang.labelKey, lang.defaultLabel)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card className="w-full shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><Thermometer className="mr-2 h-5 w-5 text-primary" />{t('systemSettings.unitsTitle', 'Unidades de Medida')}</CardTitle>
            <CardDescription>
              {t('systemSettings.unitsDescription', 'Escolha as unidades de medida para exibição.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <Label className="text-base font-semibold">{t('systemSettings.temperatureUnitLabel', 'Unidade de Temperatura')}</Label>
              <RadioGroup
                value={temperatureUnit}
                onValueChange={(value) => setTemperatureUnit(value as TemperatureUnit)}
                className="mt-2 space-y-2"
              >
                {units.map((unit) => (
                  <div key={unit.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={unit.value} id={`unit-${unit.value}`} />
                    <Label htmlFor={`unit-${unit.value}`} className="cursor-pointer">
                      {unit.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
