
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Wrench, Pencil, X } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// --- New Types and Data Structure ---
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
  // This check ensures we only access localStorage on the client
  if (typeof window !== 'undefined') {
    localStorage.setItem('hardware_components', JSON.stringify(components));
  }
};

// --- Updated ComponentItem ---
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
          key={component.imageUrl} // Re-render image when src changes
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
  const { authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [components, setComponents] = useState<Component[]>(defaultComponents);
  const [mainDiagramUrl, setMainDiagramUrl] = useState("https://placehold.co/800x600.png");
  
  const isAdmin = authState === 'admin';

  useEffect(() => {
    // This effect runs only on the client side, making it safe to access localStorage.
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
          <div className="flex gap-4 items-start">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">5</div>
            <div>
              <h3 className="font-semibold">{t('hardwareAssembly.step5Title', 'Verificação Final e Conexão')}</h3>
              <p className="text-muted-foreground">{t('hardwareAssembly.step5Description', 'Revise todas as conexões para garantir que estão corretas e firmes. Uma vez confirmado, conecte o cabo USB do seu computador à placa ESP32. Um LED na placa deve acender, indicando que ela está ligada.')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('hardwareAssembly.nextStepsTitle', 'Próximos Passos')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('hardwareAssembly.nextStepsDescription', 'Com o hardware montado, o próximo passo é programar o ESP32. Você pode usar o software gratuito **Arduino IDE** para escrever e carregar o código no seu ESP32 (nenhuma placa Arduino é necessária). PlatformIO é outra ótima alternativa.')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
