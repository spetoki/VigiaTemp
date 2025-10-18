
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone, History, Rss } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { Badge } from '@/components/ui/badge';

// As atualizações do aplicativo são gerenciadas aqui.
// Para adicionar uma nova atualização, adicione um item no topo da lista.
const updates = [
    {
        version: "v1.2.0",
        date: "2024-08-03",
        titleKey: "updates.update1.title",
        defaultTitle: "Página de Atualizações e Mural de Avisos",
        descriptionKey: "updates.update1.description",
        defaultDescription: "Adicionada uma nova página para que os usuários possam ver as últimas 5 atualizações do sistema e um mural de avisos para comunicados importantes do desenvolvedor.",
    },
    {
        version: "v1.1.5",
        date: "2024-08-02",
        titleKey: "updates.update2.title",
        defaultTitle: "Correção no Gráfico de Pizza",
        descriptionKey: "updates.update2.description",
        defaultDescription: "Corrigido um bug que causava um erro de compilação na página de Análise de Dados devido ao novo status 'Offline' não ser reconhecido pelo gráfico.",
    },
    {
        version: "v1.1.4",
        date: "2024-08-02",
        titleKey: "updates.update3.title",
        defaultTitle: "Detecção de Sensores Offline",
        descriptionKey: "updates.update3.description",
        defaultDescription: "Implementado um sistema de 'watchdog' que agora marca um sensor como 'Offline' se ele não enviar dados por mais de 5 minutos, garantindo a detecção de falhas silenciosas.",
    },
    {
        version: "v1.1.3",
        date: "2024-08-02",
        titleKey: "updates.update4.title",
        defaultTitle: "Dados Dinâmicos no Painel e Gráficos",
        descriptionKey: "updates.update4.description",
        defaultDescription: "Corrigido o comportamento de dados 'congelados'. O painel agora busca dados a cada 5 segundos e os gráficos históricos utilizam exclusivamente dados reais do banco de dados.",
    },
    {
        version: "v1.1.2",
        date: "2024-08-01",
        titleKey: "updates.update5.title",
        defaultTitle: "Detalhes de Confirmação de Alerta",
        descriptionKey: "updates.update5.description",
        defaultDescription: "A tabela de alertas agora exibe diretamente quem confirmou um alerta e a nota associada, melhorando a rastreabilidade das ações.",
    }
];

// O mural de avisos é gerenciado aqui.
// Para adicionar um aviso, altere o conteúdo abaixo.
// A constante foi movida para DENTRO do componente para corrigir o erro de build do Next.js
// O SettingsContext agora tem sua própria cópia desta constante.
export default function UpdatesPage() {
    const { t } = useSettings();
    
    const notice = {
        id: "update_2025_10_18", // ID único para este aviso
        titleKey: "notice.nextUpdate.title",
        defaultTitle: "Próxima Atualização: Detecção de Falhas",
        date: "Agendada para: 18 de Outubro de 2025, às 00:01",
        contentKey: "notice.nextUpdate.content",
        defaultContent: "Implementaremos a auto-detecção de falhas nos sensores. Isso garantirá que você seja notificado não apenas quando a temperatura estiver errada, mas também quando o próprio sensor parar de funcionar."
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline text-primary flex items-center justify-center gap-3">
                    <Rss className="h-10 w-10" />
                    {t('updates.pageTitle', 'Atualizações e Avisos')}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    {t('updates.pageSubtitle', 'Fique por dentro das últimas novidades e comunicados importantes.')}
                </p>
            </div>

            {/* Mural de Avisos */}
            <Card className="shadow-lg border-primary/50 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                        <Megaphone className="h-6 w-6" />
                        {t('updates.noticeBoardTitle', 'Mural de Avisos')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h3 className="font-semibold text-lg text-foreground">{t(notice.titleKey, notice.defaultTitle)}</h3>
                    <p className="text-sm text-muted-foreground">{notice.date}</p>
                    <p className="text-base text-foreground/90">
                        {t(notice.contentKey, notice.defaultContent)}
                    </p>
                </CardContent>
            </Card>

            {/* Histórico de Atualizações */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <History className="h-6 w-6 text-primary" />
                        {t('updates.historyTitle', 'Últimas 5 Atualizações')}
                    </CardTitle>
                    <CardDescription>
                        {t('updates.historyDescription', 'Veja o que há de novo nas versões mais recentes do VigiaTemp.')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {updates.map((update, index) => (
                        <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-border">
                            <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-primary" />
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-foreground">{t(update.titleKey, update.defaultTitle)}</h3>
                                    <Badge variant="outline">{update.version}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{new Date(update.date).toLocaleDateString(t('localeCode', 'pt-BR'), { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-sm text-foreground/80 pt-1">
                                    {t(update.descriptionKey, update.defaultDescription)}
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
