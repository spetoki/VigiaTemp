"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, LineChart, ClipboardList, Grid3X3 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import Link from 'next/link';

export default function QuickAccessCard() {
  const { t } = useSettings();

  const quickLinks = [
    { href: '/sensors', label: t('nav.sensors', 'Sensores'), icon: Settings },
    { href: '/alerts', label: t('nav.alerts', 'Alertas'), icon: Bell },
    { href: '/sensor-charts', label: t('nav.sensorCharts', 'Gráficos'), icon: LineChart },
    { href: '/traceability', label: t('nav.traceability', 'Rastreabilidade'), icon: ClipboardList },
  ];

  return (
    <Card className="flex-grow shadow-md">
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Acesso Rápido
        </CardTitle>
        <CardDescription>
            Navegue para as seções mais importantes com um clique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickLinks.map((link) => (
            <Button asChild key={link.href} variant="outline" className="justify-start h-12">
              <Link href={link.href}>
                <link.icon className="mr-2 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
