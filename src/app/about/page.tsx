
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Layers, Cpu, ShieldCheck, Wrench, Users } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const techStack = [
  { name: 'Next.js', description: 'Estrutura web para React com foco em performance.' },
  { name: 'React & TypeScript', description: 'Para construir interfaces de usuário robustas e seguras.' },
  { name: 'Firebase Firestore', description: 'Banco de dados em tempo real para armazenar todos os dados.' },
  { name: 'Genkit (Google AI)', description: 'Para funcionalidades de inteligência artificial, como a otimização de alarmes.' },
  { name: 'ShadCN UI & Tailwind CSS', description: 'Para um design moderno, responsivo e personalizável.' },
  { name: 'ESP32/ESP8266', description: 'Microcontroladores de baixo custo para os sensores físicos.' },
];

export default function AboutPage() {
    const { t } = useSettings();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline text-primary">Sobre o VigiaTemp</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Entenda o que é o VigiaTemp, como ele funciona e as tecnologias por trás deste projeto.
                </p>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Lightbulb className="h-6 w-6 text-primary" />
                        O Que é o VigiaTemp?
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>
                        O VigiaTemp é uma aplicação web completa para **monitoramento de temperatura em tempo real**. Ele foi criado para ser uma solução robusta e flexível, ideal para processos onde a temperatura é um fator crítico, como na fermentação de cacau, em estufas, laboratórios ou até mesmo para monitorar a temperatura de equipamentos.
                    </p>
                    <p>
                        O objetivo é fornecer uma ferramenta acessível que combina hardware de baixo custo com um software moderno e inteligente, permitindo que qualquer pessoa possa implementar um sistema de monitoramento profissional.
                    </p>
                </CardContent>
            </Card>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Layers className="h-6 w-6 text-primary" />
                        Principais Funcionalidades
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                        <li>**Monitoramento em Tempo Real:** Visualize a temperatura de todos os seus sensores em um painel centralizado.</li>
                        <li>**Sistema de Alertas:** Receba notificações visuais e sonoras quando a temperatura sai dos limites que você definiu.</li>
                        <li>**Gráficos e Análise de Dados:** Compare o histórico de temperatura e analise a frequência de alertas para encontrar padrões.</li>
                        <li>**Rastreabilidade de Lotes:** Registre informações de produção e gere um QR Code para garantir a rastreabilidade do seu produto.</li>
                        <li>**Otimização com IA:** Use inteligência artificial para obter sugestões dos melhores limites de temperatura para o seu processo.</li>
                        <li>**Guia de Hardware:** Encontre guias para montar seu próprio sensor e um configurador que gera o código para você.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Cpu className="h-6 w-6 text-primary" />
                        Tecnologias Utilizadas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {techStack.map(tech => (
                        <div key={tech.name}>
                            <h3 className="font-semibold text-foreground">{tech.name}</h3>
                            <p className="text-sm text-muted-foreground">{tech.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Como Funciona o Acesso por Chave?
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground space-y-4">
                    <p>
                        O VigiaTemp não usa um sistema de login com e-mail e senha. Em vez disso, ele utiliza um **sistema de chaves de acesso de 4 dígitos**.
                    </p>
                    <p>
                        Cada chave de acesso cria um "espaço de trabalho" completamente separado e seguro no banco de dados. Isso significa que os dados de uma chave (sensores, alertas, lotes) são totalmente isolados e não podem ser acessados por usuários de outra chave. É uma forma simples e eficaz de garantir a privacidade e a organização dos dados para diferentes usuários ou projetos.
                    </p>
                </CardContent>
            </Card>

        </div>
    );
}
