
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Wrench, Pencil, X, Usb, BookOpenCheck, FileCode2, LifeBuoy, Pointer, Bluetooth } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface Component {
  id: string;
  nameKey: string;
  defaultName: string;
  hint: string;
  imageUrl: string;
}

const defaultComponents: Component[] = [
  { id: 'esp32', nameKey: 'hardwareAssembly.component1', defaultName: 'Placa de Desenvolvimento ESP32', hint: 'esp32 board', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'ds18b20', nameKey: 'hardwareAssembly.component2', defaultName: 'Sensor de Temperatura DS18B20 (versão de 3 pinos)', hint: 'ds18b20 sensor', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'breadboard', nameKey: 'hardwareAssembly.component3', defaultName: 'Protoboard (Placa de Ensaio)', hint: 'breadboard', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'jumper-wires', nameKey: 'hardwareAssembly.component4', defaultName: 'Jumper Wires (Fios Macho-Macho)', hint: 'jumper wires', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'resistor', nameKey: 'hardwareAssembly.component5', defaultName: 'Resistor de 4.7kΩ (cores: amarelo, roxo, vermelho)', hint: 'resistor', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'usb-cable', nameKey: 'hardwareAssembly.component6', defaultName: 'Cabo USB para conectar o ESP32 ao computador', hint: 'usb cable', imageUrl: 'https://placehold.co/150x150.png' }
];

const setStoredComponents = (components: Component[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hardware_components', JSON.stringify(components));
  }
};

const ComponentItem = ({
  component,
  isEditing,
  onImageUpload,
}: {
  component: Component;
  isEditing: boolean;
  onImageUpload: (componentId: string, imageBase64: string) => void;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { t } = useSettings();
  const name = t(component.nameKey, component.defaultName);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onImageUpload(component.id, base64);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative flex flex-col items-center gap-2 p-2 border rounded-lg shadow-sm bg-card group">
      <div className="flex h-[150px] w-[150px] items-center justify-center rounded-md bg-muted/50">
        <Image
          src={component.imageUrl}
          alt={name}
          width={150}
          height={150}
          className="rounded-md aspect-square object-cover"
          data-ai-hint={component.hint}
          key={component.imageUrl}
        />
      </div>
      <p className="text-sm font-medium text-center text-card-foreground">{name}</p>

      {isEditing && (
        <div className="absolute inset-0 bg-black/60 flex-col gap-2 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
            <Pencil className="mr-2 h-4 w-4" />
            {t('hardwareAssembly.changeImage', 'Alterar Imagem')}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default function HardwareAssemblyPage() {
  const { t } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [components, setComponents] = useState<Component[]>(defaultComponents);
  const [mainDiagramUrl, setMainDiagramUrl] = useState("https://placehold.co/800x600.png");
  
  const isAdmin = false;

  useEffect(() => {
    const getStoredComponents = (): Component[] => {
      try {
        const stored = localStorage.getItem('hardware_components');
        const parsed = stored ? JSON.parse(stored) : defaultComponents;
        return defaultComponents.map(def => parsed.find((p: Component) => p.id === def.id) || def);
      } catch {
        return defaultComponents;
      }
    };
    
    setComponents(getStoredComponents());
    const storedDiagram = localStorage.getItem('hardware_diagram');
    if (storedDiagram) {
      setMainDiagramUrl(storedDiagram);
    }
  }, []);

  const handleImageUpload = (componentId: string, imageBase64: string) => {
    const updatedComponents = components.map(c =>
      c.id === componentId ? { ...c, imageUrl: imageBase64 } : c
    );
    setComponents(updatedComponents);
    setStoredComponents(updatedComponents);
  };

  const handleDiagramUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setMainDiagramUrl(base64);
        localStorage.setItem('hardware_diagram', base64);
      }
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Wrench className="mr-3 h-8 w-8" />
            {t('hardwareAssembly.title', 'Guia de Montagem do Hardware')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('hardwareAssembly.description', 'Siga este guia passo a passo para montar seu primeiro protótipo de sensor de temperatura com ESP32 e DS18B20.')}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            {isEditing ? (
              <>
                <X className="mr-2 h-4 w-4" />
                {t('hardwareAssembly.exitEditMode', 'Sair da Edição')}
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                {t('hardwareAssembly.enterEditMode', 'Editar Página')}
              </>
            )}
          </Button>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary"/>
            {t('hardwareAssembly.componentsTitle', 'Componentes Necessários')}
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {components.map(comp => (
              <ComponentItem
                key={comp.id}
                component={comp}
                isEditing={isEditing}
                onImageUpload={handleImageUpload}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('hardwareAssembly.wiringDiagramTitle', 'Diagrama de Conexão')}</CardTitle>
          <CardDescription>
            {t('hardwareAssembly.wiringDiagramDescription', 'A imagem abaixo ilustra como os componentes devem ser conectados. Siga as cores dos fios para facilitar.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center relative group">
           <Image
              src={mainDiagramUrl}
              alt={t('hardwareAssembly.wiringDiagramAlt', 'Diagrama de ligação do ESP32 com o sensor DS18B20')}
              width={800}
              height={600}
              className="rounded-lg border"
              data-ai-hint="esp32 ds18b20"
              key={mainDiagramUrl}
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" asChild>
                  <label>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('hardwareAssembly.changeImage', 'Alterar Imagem')}
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleDiagramUpload} />
                  </label>
                </Button>
              </div>
            )}
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('hardwareAssembly.stepsTitle', 'Passo a Passo da Montagem')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">1</div>
            <div>
              <h3 className="font-semibold">{t('hardwareAssembly.step1Title', 'Posicione o ESP32 na Protoboard')}</h3>
              <p className="text-muted-foreground">{t('hardwareAssembly.step1Description', 'Encaixe a placa ESP32 no centro da protoboard, atravessando a divisão central. Isso permite que você acesse os pinos de ambos os lados.')}</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">2</div>
            <div>
              <h3 className="font-semibold">{t('hardwareAssembly.step2Title', 'Conecte a Alimentação')}</h3>
              <p className="text-muted-foreground">{t('hardwareAssembly.step2Description', 'Use jumpers para conectar o pino "3V3" (ou 3.3V) do ESP32 à linha de alimentação positiva (+) da protoboard (geralmente marcada com vermelho). Conecte o pino "GND" do ESP32 à linha de aterramento negativa (-) da protoboard (marcada com azul).')}</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">3</div>
            <div>
              <h3 className="font-semibold">{t('hardwareAssembly.step3Title', 'Conecte o Sensor DS18B20')}</h3>
              <p className="text-muted-foreground">{t('hardwareAssembly.step3Description', 'Encaixe o sensor DS18B20 na protoboard. Conecte o pino VCC (alimentação) do sensor à linha positiva (+). Conecte o pino GND do sensor à linha negativa (-). Conecte o pino de DADOS (Data) do sensor a um pino GPIO do ESP32, como o pino "GPIO 4" (ou D4).')}</p>
            </div>
          </div>
           <div className="flex gap-4 items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">4</div>
            <div>
              <h3 className="font-semibold">{t('hardwareAssembly.step4Title', 'Adicione o Resistor de Pull-up (MUITO IMPORTANTE)')}</h3>
              <p className="text-muted-foreground">{t('hardwareAssembly.step4Description', 'Conecte o resistor de 4.7kΩ entre o pino de DADOS do sensor (o mesmo conectado ao GPIO 4) e a linha de alimentação positiva (+). Este resistor é crucial para a comunicação estável com o sensor.')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Card className="shadow-lg border-amber-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <LifeBuoy className="h-5 w-5"/>
            {t('hardwareAssembly.nextStepsTitle', 'Próximo Passo: Gravar o Firmware')}
          </CardTitle>
          <CardDescription>
            {t('hardwareAssembly.nextStepsDescription', 'Com o hardware montado, o próximo passo é gravar o software (firmware) na placa. Se você não está conseguindo, leia estas dicas.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{t('hardwareAssembly.step1Driver', '1. Instale os Drivers USB (Causa #1 de problemas)')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('hardwareAssembly.step1DriverDescription', 'Seu computador precisa de um "tradutor" (driver) para conversar com a placa. A maioria dos problemas de conexão ocorre porque este driver está faltando. Identifique o chip USB na sua placa (um chip retangular perto do conector USB) e instale o driver correspondente:')}
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><strong className="font-semibold">{t('hardwareAssembly.step1DriverCP210x', 'Driver CP210x:')}</strong> {t('hardwareAssembly.step1DriverCP210xInfo', 'Para a maioria das placas ESP32. Baixe em')} <a href="https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers" target="_blank" rel="noopener noreferrer" className="text-primary underline">Silicon Labs</a>.</li>
              <li><strong className="font-semibold">{t('hardwareAssembly.step1DriverCH340', 'Driver CH340:')}</strong> {t('hardwareAssembly.step1DriverCH340Info', 'Para placas mais baratas ou clones. Baixe em')} <a href="https://www.wch-ic.com/downloads/CH341SER_EXE.html" target="_blank" rel="noopener noreferrer" className="text-primary underline">WCH</a>.</li>
            </ul>
             <p className="text-muted-foreground text-sm mt-2">
              {t('hardwareAssembly.step1DriverRestart', 'Após instalar, **reinicie o seu computador** e tente o Instalador Web novamente.')}
            </p>
          </div>
           <div>
            <h3 className="font-semibold">{t('hardwareAssembly.step2Cable', '2. Use um Cabo USB de DADOS')}</h3>
            <p className="text-muted-foreground text-sm">
             {t('hardwareAssembly.step2CableDescription', 'Certifique-se de que está usando um cabo USB capaz de transferir dados, e não apenas um cabo de carregamento de celular. Muitos cabos baratos não possuem os fios necessários para a comunicação. Na dúvida, teste com outro cabo.')}
            </p>
          </div>
           <div>
            <h3 className="font-semibold">{t('hardwareAssembly.step3Boot', '3. Modo de "Boot" Manual')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('hardwareAssembly.step3BootDescription', 'O "Modo de Boot" é o que diz à placa para aceitar um novo software. O Instalador Web tenta fazer isso automaticamente, mas às vezes falha. Faça manualmente:')}
            </p>
             <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>{t('hardwareAssembly.step3BootStep1', 'Com a placa desconectada, **pressione e segure o botão "BOOT"**.')}</li>
                <li>{t('hardwareAssembly.step3BootStep2', 'Mantendo-o pressionado, **conecte o cabo USB**.')}</li>
                <li>{t('hardwareAssembly.step3BootStep3', '**Solte o botão "BOOT"**.')}</li>
                <li>{t('hardwareAssembly.step3BootStep4', 'Agora, vá para a página do **Instalador Web** e tente conectar.')}</li>
             </ol>
          </div>
           <div>
            <h3 className="font-semibold flex items-center gap-2"><Bluetooth className="h-4 w-4"/>{t('hardwareAssembly.step4Bluetooth', 'Alternativa: Gravação via Bluetooth (Android)')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('hardwareAssembly.step4BluetoothDescription', 'Se a conexão USB continuar falhando, você pode tentar gravar o firmware via Bluetooth. Isso requer que você tenha conseguido gravar o firmware inicial pelo menos uma vez. Depois, você pode usar um aplicativo Android como o **"Web Bluetooth DFU"** para enviar atualizações de firmware (`.bin`) para a placa sem usar cabos.')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-lg border-primary/50">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-primary"/>
                {t('hardwareAssembly.configuratorCard.title', 'Gere seu Código Personalizado')}
            </CardTitle>
            <CardDescription>
                {t('hardwareAssembly.configuratorCard.description', 'Em vez de editar o código manualmente, use nosso configurador interativo para gerar o código exato para o seu dispositivo com apenas alguns cliques. É mais fácil e menos propenso a erros.')}
            </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/device-configurator">
                        {t('hardwareAssembly.configuratorCard.button', 'Abrir Configurador de Dispositivo')}
                    </Link>
                </Button>
            </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/50">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Usb className="h-5 w-5 text-primary"/>
                {t('hardwareAssembly.webFlasherCard.title', 'Instale o Firmware Facilmente')}
            </CardTitle>
            <CardDescription>
                {t('hardwareAssembly.webFlasherCard.description', 'Use nosso instalador web para programar seu ESP32 diretamente pelo navegador com apenas um clique. É a maneira mais fácil de começar.')}
            </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/web-flasher">
                        {t('hardwareAssembly.webFlasherCard.button', 'Abrir Instalador Web')}
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

    

    
