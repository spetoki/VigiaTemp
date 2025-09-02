
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Wrench, Pencil, X, Usb, BookOpenCheck, FileCode2, LifeBuoy, Pointer, Bluetooth, Download, Wifi } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Component {
  id: string;
  nameKey: string;
  defaultName: string;
  hint: string;
  imageUrl: string;
}

const defaultComponents: Component[] = [
  { id: 'esp32', nameKey: 'hardwareAssembly.component1', defaultName: 'Placa de Desenvolvimento ESP32', hint: 'esp32 board', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'ds18b20', nameKey: 'hardwareAssembly.component2', defaultName: 'Sensor de Temperatura DS18B20 (componente ou módulo)', hint: 'ds18b20 sensor module', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'breadboard', nameKey: 'hardwareAssembly.component3', defaultName: 'Protoboard (Placa de Ensaio)', hint: 'breadboard', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'jumper-wires', nameKey: 'hardwareAssembly.component4', defaultName: 'Jumper Wires (Fios Macho-Facho)', hint: 'jumper wires', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'resistor', nameKey: 'hardwareAssembly.component5', defaultName: 'Resistor de 4.7kΩ (se não usar módulo adaptador)', hint: 'resistor', imageUrl: 'https://placehold.co/150x150.png' },
  { id: 'usb-cable', nameKey: 'hardwareAssembly.component6', defaultName: 'Cabo USB para conectar o ESP32 ao computador', hint: 'usb cable', imageUrl: 'https://placehold.co/150x150.png' }
];

const setStoredItem = (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
            console.error(`LocalStorage quota exceeded for key: ${key}`);
            return false;
        }
        console.error(`Failed to set localStorage item: ${key}`, e);
        return false;
    }
}

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
  const { t, storageKeys } = useSettings();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [components, setComponents] = useState<Component[]>(defaultComponents);
  const [mainDiagramUrl, setMainDiagramUrl] = useState("https://placehold.co/800x600.png");
  
  const isAdmin = true;

  useEffect(() => {
    const getStoredComponents = (): Component[] => {
      try {
        const stored = localStorage.getItem(storageKeys.components);
        const parsed = stored ? JSON.parse(stored) : defaultComponents;
        return defaultComponents.map(def => parsed.find((p: Component) => p.id === def.id) || def);
      } catch {
        return defaultComponents;
      }
    };
    
    setComponents(getStoredComponents());
    const storedDiagram = localStorage.getItem(storageKeys.diagram);
    if (storedDiagram) {
      setMainDiagramUrl(storedDiagram);
    }
  }, [storageKeys]);

  const handleImageUpload = (componentId: string, imageBase64: string) => {
    const updatedComponents = components.map(c =>
      c.id === componentId ? { ...c, imageUrl: imageBase64 } : c
    );
    setComponents(updatedComponents);
    const success = setStoredItem(storageKeys.components, JSON.stringify(updatedComponents));
    if (!success) {
      toast({
        variant: "destructive",
        title: "Erro de Armazenamento",
        description: "Não foi possível salvar a imagem. O armazenamento local está cheio. Tente usar uma imagem menor."
      });
    }
  };

  const handleDiagramUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setMainDiagramUrl(base64);
        const success = setStoredItem(storageKeys.diagram, base64);
        if (!success) {
          toast({
              variant: "destructive",
              title: "Erro de Armazenamento",
              description: "Não foi possível salvar a imagem do diagrama. O armazenamento local está cheio. Tente usar uma imagem menor."
          });
        }
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

       <Alert variant="default" className="border-sky-500/50 text-sky-600 bg-sky-500/5">
        <Download className="h-4 w-4 !text-sky-600" />
        <AlertTitle>Link do Driver USB (CP210x)</AlertTitle>
        <AlertDescription>
          <p>Se a sua placa não for reconhecida, o primeiro passo é instalar este driver. Este é o link oficial e seguro.</p>
          <Button asChild variant="link" className="p-0 h-auto text-sky-600 font-bold">
              <a href="https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers" target="_blank" rel="noopener noreferrer">
                Baixar Driver na Silicon Labs
              </a>
          </Button>
        </AlertDescription>
      </Alert>

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
              data-ai-hint="esp32 ds18b20 module"
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
              <h3 className="font-semibold">{t('hardwareAssembly.step4Title', 'Adicione o Resistor de Pull-up')}</h3>
              <p className="text-muted-foreground">{t('hardwareAssembly.step4Description', 'Conecte o resistor de 4.7kΩ entre o pino de DADOS do sensor e a linha de alimentação positiva (+). Este passo é crucial para a comunicação. **Observação:** Se você está usando um módulo adaptador para o DS18B20, este resistor já está incluído na placa do módulo e este passo pode ser ignorado.')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Card className="shadow-lg border-amber-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Wifi className="h-5 w-5"/>
            {t('hardwareAssembly.wifiConfig.title', 'Como Conectar o Dispositivo ao Wi-Fi')}
          </CardTitle>
          <CardDescription>
            {t('hardwareAssembly.wifiConfig.description', 'Seu dispositivo usa o portal "WiFiManager" para se conectar a qualquer rede. Siga os passos abaixo na primeira vez que ligar o dispositivo ou se precisar mudar de rede.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white font-bold text-lg flex-shrink-0">1</div>
                <div>
                    <h3 className="font-semibold">{t('hardwareAssembly.wifiConfig.step1.title', 'Ligue o Dispositivo pela Primeira Vez')}</h3>
                    <p className="text-muted-foreground text-sm">{t('hardwareAssembly.wifiConfig.step1.description', 'Conecte seu ESP32 a uma fonte de energia (USB). Como ele ainda não conhece nenhuma rede, ele criará seu próprio ponto de acesso Wi-Fi.')}</p>
                </div>
            </div>
             <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white font-bold text-lg flex-shrink-0">2</div>
                <div>
                    <h3 className="font-semibold">{t('hardwareAssembly.wifiConfig.step2.title', 'Conecte-se à Rede do Dispositivo')}</h3>
                    <p className="text-muted-foreground text-sm">{t('hardwareAssembly.wifiConfig.step2.description', 'No seu celular ou computador, procure por redes Wi-Fi. Encontre e conecte-se a uma rede chamada:')}</p>
                    <p className="text-sm font-mono font-bold bg-muted p-2 rounded-md my-2 text-center">VigiaTemp-Config</p>
                    <p className="text-muted-foreground text-sm">{t('hardwareAssembly.wifiConfig.step2.password', 'A senha para esta rede é:')} <strong className="font-mono">senha123</strong></p>
                </div>
            </div>
             <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white font-bold text-lg flex-shrink-0">3</div>
                <div>
                    <h3 className="font-semibold">{t('hardwareAssembly.wifiConfig.step3.title', 'Acesse o Portal de Configuração')}</h3>
                    <p className="text-muted-foreground text-sm">{t('hardwareAssembly.wifiConfig.step3.description', 'Após conectar à rede, o seu celular pode abrir o portal automaticamente. Se não abrir, abra o navegador e digite o seguinte endereço IP:')}</p>
                    <p className="text-sm font-mono font-bold bg-muted p-2 rounded-md my-2 text-center">192.168.4.1</p>
                </div>
            </div>
             <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white font-bold text-lg flex-shrink-0">4</div>
                <div>
                    <h3 className="font-semibold">{t('hardwareAssembly.wifiConfig.step4.title', 'Configure sua Rede')}</h3>
                    <p className="text-muted-foreground text-sm">{t('hardwareAssembly.wifiConfig.step4.description', 'No portal, clique em "Configure WiFi". Selecione a sua rede Wi-Fi principal na lista, digite a senha dela e clique em "save". O dispositivo irá reiniciar e se conectar automaticamente à sua rede. A partir de agora, ele lembrará dessa rede.')}</p>
                </div>
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
      </div>
    </div>
  );
}
