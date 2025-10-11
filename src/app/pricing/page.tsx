
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Star, Gem, CheckCircle, Cpu } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const PricingCard = ({ title, icon: Icon, price, duration, features, discount, recommended }: {
    title: string;
    icon: React.ElementType;
    price: string;
    duration: string;
    features: string[];
    discount: string;
    recommended?: boolean;
}) => (
    <Card className={`flex flex-col ${recommended ? 'border-primary shadow-lg' : ''}`}>
        <CardHeader className="items-center pb-4">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <CardDescription className="text-xs">{duration}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 text-center">
            <p className="text-2xl font-bold">{price}</p>
            <p className="text-xs text-muted-foreground">por sensor</p>
            <ul className="space-y-1 text-sm text-muted-foreground pt-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start justify-center gap-2 text-center">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter className="flex-col pt-4">
            <div className="bg-primary/10 text-primary font-bold text-xs py-1 px-3 rounded-full text-center">
                {discount}
            </div>
        </CardFooter>
    </Card>
);

export default function PricingPage() {
    const { t } = useSettings();

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline text-primary">Nossos Planos de Licenciamento</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Escolha o plano que melhor se adapta à sua necessidade e garanta o controle total da sua produção.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PricingCard 
                    title="Plano Prata"
                    icon={Award}
                    price="R$ 350,00"
                    duration="Licença de 6 Meses"
                    features={["Suporte via WhatsApp", "Ideal para projetos curtos", "Desconto válido para pagamento à vista ou parcelado em até 6x."]}
                    discount="desconto para 6 ou mais sensores de 5%"
                />
                <PricingCard 
                    title="Plano Bronze"
                    icon={Star}
                    price="R$ 600,00"
                    duration="Licença de 12 Meses"
                    features={["Suporte via WhatsApp", "Ciclo anual de monitoramento", "Desconto válido para pagamento à vista ou parcelado em até 6x."]}
                    discount="desconto para 6 ou mais sensores de 10%"
                    recommended
                />
                <PricingCard 
                    title="Plano Ouro"
                    icon={Gem}
                    price="R$ 2.500,00"
                    duration="Licença Permanente"
                    features={["Suporte via WhatsApp", "1 ano de assistência prioritária", "Desconto válido para pagamento à vista ou parcelado em até 6x."]}
                    discount="desconto para 6 ou mais sensores de 10%"
                />
            </div>
            
            <Card className="mt-8 shadow-lg border-secondary">
                <CardHeader className="items-center text-center pb-4">
                    <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">Equipamento Físico (Sensor)</CardTitle>
                    </div>
                    <CardDescription className="text-xs">Opcional: adquira o hardware pronto para usar.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-2xl font-bold">R$ 150,00</p>
                    <p className="text-xs text-muted-foreground">por unidade de sensor</p>
                    <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-start justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                            <span>Sensor de temperatura de alta precisão</span>
                        </li>
                        <li className="flex items-start justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                            <span>Placa ESP32 com conectividade WiFi</span>
                        </li>
                        <li className="flex items-start justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                            <span>Montado e pronto para configurar</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter className="flex-col pt-4">
                    <div className="bg-primary/10 text-primary font-bold text-xs py-1 px-3 rounded-full">
                        desconto de 30% na compra de 6 ou mais sensores
                    </div>
                </CardFooter>
            </Card>

            <p className="text-xl font-semibold text-center mt-8">
                Para adquirir, entre em contato via WhatsApp com Irineu Marcos Bartnik: +55 45 99931-4560.
            </p>
        </div>
    );
}
