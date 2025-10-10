"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Goal, Eye } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function WhoWeArePage() {
    const { t } = useSettings();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline text-primary">{t('whoWeAre.title', 'Quem Somos: Inovação e Paixão pelo Agronegócio')}</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    {t('whoWeAre.subtitle', 'Entenda nossa missão, visão e os valores que impulsionam o VigiaTemp.')}
                </p>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Building2 className="h-6 w-6 text-primary" />
                        {t('whoWeAre.aboutUs.title', 'Sobre Nós')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>
                        {t('whoWeAre.aboutUs.p1', 'Nascemos da união entre a paixão pela tecnologia e o profundo respeito pelo campo. Somos um time de desenvolvedores e entusiastas do agronegócio que viram, na prática, os desafios enfrentados por produtores que buscam a excelência. O VigiaTemp surgiu de uma necessidade real: criar uma solução acessível, inteligente e confiável para monitorar processos críticos que definem a qualidade de safras inteiras, como a fermentação do cacau.')}
                    </p>
                </CardContent>
            </Card>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Goal className="h-6 w-6 text-primary" />
                        {t('whoWeAre.mission.title', 'Nossa Missão')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                     <p>
                        {t('whoWeAre.mission.p1', 'Nossa missão é empoderar o produtor rural com ferramentas de ponta. Acreditamos que a tecnologia não deve ser um privilégio, mas uma aliada poderosa para todos. Por isso, desenvolvemos um sistema que transforma dados complexos de temperatura em informações visuais, claras e acionáveis. Queremos que você tenha o controle total do seu processo, na palma da sua mão, permitindo tomadas de decisão mais rápidas e precisas.')}
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Eye className="h-6 w-6 text-primary" />
                        {t('whoWeAre.vision.title', 'Visão de Futuro')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>
                        {t('whoWeAre.vision.p1', 'Olhamos para o futuro com a certeza de que a inovação é o caminho para um agronegócio mais sustentável e produtivo. O VigiaTemp é apenas o começo. Estamos constantemente pesquisando e desenvolvendo novas funcionalidades, desde análises preditivas com inteligência artificial até a integração com outros sensores, sempre com o objetivo de entregar mais valor, segurança e tranquilidade para quem produz.')}
                    </p>
                     <p className="font-semibold italic text-foreground">
                        {t('whoWeAre.vision.p2', 'Somos mais do que uma empresa de software; somos parceiros na sua jornada pela qualidade.')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
