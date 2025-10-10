
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Database, Server, Fingerprint, Share2, FileText, Contact } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function PrivacyPolicyPage() {
    const { t } = useSettings();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline text-primary">Política de Privacidade</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Última atualização: 02 de agosto de 2024
                </p>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Nosso Compromisso com a Privacidade
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>
                        A sua privacidade e a segurança dos seus dados são de extrema importância para nós. Esta Política de Privacidade descreve como o aplicativo VigiaTemp ("nós", "nosso", "aplicativo") coleta, usa, armazena e protege suas informações. Ao utilizar o VigiaTemp, você concorda com a coleta e uso de informações de acordo com esta política.
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Database className="h-6 w-6 text-primary" />
                        Quais Dados Coletamos?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-muted-foreground">O VigiaTemp opera com um sistema de "espaços de trabalho" isolados, acessados por uma chave numérica de 4 dígitos. Todos os dados listados abaixo são armazenados de forma segura e vinculados exclusivamente à chave de acesso utilizada.</p>
                    <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                        <li>**Dados de Sensores:** Informações de identificação cadastradas por você (nome, localização, modelo, IP, MAC), dados de operação (temperatura, limites) e histórico de medições.</li>
                        <li>**Dados de Alertas:** Registros de todos os alertas gerados, incluindo qual sensor disparou, o motivo e o horário.</li>
                        <li>**Dados de Rastreabilidade de Lotes:** Informações inseridas no formulário de lotes, como nome do produtor, pesos, tempos de processo e classificação.</li>
                        <li>**Dados de Gerenciamento de Usuários:** Caso utilize a funcionalidade, coletamos nome, e-mail, função e status dos usuários que você cadastra no seu espaço de trabalho.</li>
                        <li>**Dados de Configuração Local:** Preferências como tema, idioma e unidade de temperatura são salvas apenas no seu navegador.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Server className="h-6 w-6 text-primary" />
                        Como Usamos os Seus Dados?
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>Utilizamos os dados coletados para fornecer e manter o serviço, exibir temperaturas, gerar gráficos, registrar alertas, garantir a segurança através da sua chave de acesso e melhorar a sua experiência no aplicativo.</p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Fingerprint className="h-6 w-6 text-primary" />
                        Armazenamento e Segurança
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>Seus dados são armazenados de forma segura no Firebase Firestore (um serviço da Google). A arquitetura do banco de dados garante que os dados de uma chave de acesso sejam completamente isolados e inacessíveis por outras chaves.</p>
                    <p>Embora nenhum método de transmissão pela Internet seja 100% seguro, utilizamos práticas e tecnologias comercialmente aceitáveis para proteger suas informações.</p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Share2 className="h-6 w-6 text-primary" />
                        Compartilhamento de Dados
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>Nós não vendemos nem alugamos suas informações para terceiros. O compartilhamento ocorre apenas com provedores de serviço (Google/Firebase) para operar o aplicativo ou em caso de obrigação legal.</p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <FileText className="h-6 w-6 text-primary" />
                        Seus Direitos (LGPD)
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>Você, como titular dos dados, tem o direito de acessar, corrigir e excluir suas informações (sensores, lotes, usuários) a qualquer momento através da interface do aplicativo. A exclusão de dados é uma ação permanente.</p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Contact className="h-6 w-6 text-primary" />
                        Contato
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:</p>
                    <ul className="list-disc list-inside">
                        <li>**Responsável:** Irineu Marcos Bartnik</li>
                        <li>**WhatsApp:** +55 45 99931-4560</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
