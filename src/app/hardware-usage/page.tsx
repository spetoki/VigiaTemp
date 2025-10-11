"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, HardHat, Bolt, Cpu } from 'lucide-react';

export default function HardwareUsagePage() {

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline text-amber-600 flex items-center justify-center gap-3">
                    <AlertTriangle className="h-10 w-10" />
                    Termo de Responsabilidade
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Leia com atenção antes de montar ou utilizar o hardware.
                </p>
            </div>

            <Card className="shadow-lg border-amber-500 bg-amber-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl text-amber-700">
                        <HardHat className="h-6 w-6" />
                        Responsabilidade do Usuário
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-amber-900 space-y-4">
                    <p>
                        Ao montar, manusear ou utilizar o equipamento físico (sensor) fornecido ou construído com base neste guia, o usuário assume <strong>total responsabilidade</strong> por sua correta instalação, operação e segurança.
                    </p>
                    <p>
                        Recomenda-se enfaticamente que a montagem seja realizada por alguém com conhecimento básico em eletrônica. A segurança e a integridade do seu equipamento e do ambiente onde ele será instalado são de sua inteira responsabilidade.
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Bolt className="h-6 w-6 text-primary" />
                        Isenção de Responsabilidade do Vendedor
                    </CardTitle>
                    <CardDescription>
                        O vendedor, Irineu Marcos Bartnik, <strong>não se responsabiliza</strong> por quaisquer danos, perdas ou prejuízos, diretos ou indiretos, resultantes de:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                        <li><strong>Montagem incorreta:</strong> Danos causados por erros na conexão dos componentes, curtos-circuitos, inversão de polaridade ou solda inadequada.</li>
                        <li><strong>Uso indevido:</strong> Utilização do equipamento para finalidades para as quais não foi projetado ou em condições ambientais extremas não suportadas.</li>
                        <li><strong>Modificações no hardware:</strong> Alterações, reparos não autorizados ou substituição de componentes por peças incompatíveis.</li>
                        <li><strong>Condições elétricas externas:</strong> Danos decorrentes de picos de energia, raios, instabilidade na fonte de alimentação (USB ou outra) ou má qualidade da rede elétrica.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Cpu className="h-6 w-6 text-primary" />
                        Recomendações de Segurança
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                        <li>Sempre desconecte o dispositivo da fonte de energia antes de fazer qualquer alteração nas conexões.</li>
                        <li>Trabalhe em uma área limpa, seca e bem iluminada.</li>
                        <li>Verifique as conexões múltiplas vezes antes de ligar o dispositivo pela primeira vez.</li>
                        <li>Não deixe o protótipo exposto a umidade, líquidos ou poeira excessiva.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
