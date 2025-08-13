
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/context/SettingsContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CodeXml, Copy, Check, AlertCircle, FileCode2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const generateYamlCode = (config: {
  deviceName: string;
  appUrl: string;
  sensorPin: string;
  interval: string;
  ssid: string;
  password?: string;
}) => `
substitutions:
  name: ${config.deviceName}
  friendly_name: ${config.deviceName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
  update_interval: ${config.interval}s
  pin_ds18b20: GPIO${config.sensorPin}
  app_api_url: ${config.appUrl}

esphome:
  name: \${name}
  friendly_name: \${friendly_name}

esp32:
  board: esp32dev
  framework:
    type: arduino

# Habilitar o logger para depuração
logger:
  level: INFO

# Habilitar a API para comunicação com o Home Assistant
api:

# Habilitar atualizações Over-the-Air (OTA)
ota:

# Configurações de WiFi para conectar à sua rede
wifi:
  ssid: "${config.ssid}"
  password: "${config.password || ''}"

  # Fallback para criar um Access Point se a conexão falhar
  ap:
    ssid: "\${friendly_name} Fallback AP"
    password: "senha-vigia"

# Configura o sensor de temperatura DS18B20
dallas:
  - pin: \${pin_ds18b20}

sensor:
  - platform: dallas
    address: 0x # Deixe o ESPHome descobrir o endereço automaticamente na primeira vez
    name: "\${friendly_name} Temperature"
    id: temp_sensor
    on_value:
      # A cada nova leitura, envia os dados para a API do VigiaTemp
      then:
        - http_request:
            method: POST
            url: \${app_api_url}
            headers:
              Content-Type: application/json
            json:
              macAddress: !lambda |-
                return wifi_info.mac_address;
              temperature: !lambda |-
                return x;
            verify_ssl: false # Ignora verificação SSL, comum para servidores de desenvolvimento
`;

export default function EsphomeConfiguratorPage() {
  const { t } = useSettings();
  const { toast } = useToast();

  const [deviceName, setDeviceName] = useState('sensor_estufa_1');
  const [appUrl, setAppUrl] = useState('https://vigia-temp.vercel.app/api/sensor');
  const [sensorPin, setSensorPin] = useState('4');
  const [sendInterval, setSendInterval] = useState('30');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setError('');
    if (!deviceName || !ssid || !appUrl || !sensorPin || !sendInterval) {
      setError(t('deviceConfigurator.errorCredentials', 'Todos os campos são obrigatórios.'));
      return;
    }
    const code = generateYamlCode({ deviceName, appUrl, sensorPin, interval: sendInterval, ssid, password });
    setGeneratedCode(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setIsCopied(true);
      toast({
        title: t('deviceConfigurator.copySuccessTitle', 'Copiado!'),
        description: t('deviceConfigurator.copySuccessDescription', 'O código YAML foi copiado para a sua área de transferência.'),
      });
      setTimeout(() => setIsCopied(false), 2000);
    }, () => {
      toast({
        variant: 'destructive',
        title: t('deviceConfigurator.copyErrorTitle', 'Falha ao Copiar'),
        description: t('deviceConfigurator.copyErrorDescription', 'Não foi possível copiar o código.'),
      });
    });
  };
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <FileCode2 className="mr-3 h-8 w-8" />
          {t('esphome.title', 'Configurador de YAML para ESPHome')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('esphome.description', 'Gere o código de configuração YAML para seu dispositivo ESP32 ser usado com o ESPHome e Home Assistant.')}
        </p>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('esphome.formTitle', 'Configuração do Dispositivo para ESPHome')}</CardTitle>
          <CardDescription>
            {t('esphome.formDescription', 'Preencha os campos abaixo. O código gerado deverá ser colado no seu painel ESPHome.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('deviceConfigurator.errorTitle', 'Campos Obrigatórios')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}

          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="deviceName">{t('esphome.deviceNameLabel', 'Nome do Dispositivo (sem espaços)')}</Label>
                  <Input id="deviceName" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="Ex: sensor_estufa_1" />
                  <p className="text-sm text-muted-foreground">{t('esphome.deviceNameDescription', 'Use letras minúsculas, números e underlines. Este será o nome do dispositivo na rede.')}</p>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="ssid">{t('deviceConfigurator.ssidLabel', 'Nome da Rede WiFi (SSID)')}</Label>
                      <Input id="ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="Ex: MinhaRedeWiFi" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="password">{t('deviceConfigurator.passwordLabel', 'Senha da Rede WiFi (Opcional)')}</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
               </div>
               <Separator />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="app-url">{t('deviceConfigurator.appUrlLabel', 'URL do Aplicativo')}</Label>
            <Input id="app-url" value={appUrl} onChange={(e) => setAppUrl(e.target.value)} />
            <p className="text-sm text-muted-foreground">
                {t('deviceConfigurator.appUrlDescription', 'Insira a URL completa da sua aplicação, terminando com /api/sensor.')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="sensor-pin">{t('deviceConfigurator.pinLabel', 'Pino do Sensor (GPIO)')}</Label>
                <Input id="sensor-pin" type="number" value={sensorPin} onChange={(e) => setSensorPin(e.target.value)} />
                <p className="text-sm text-muted-foreground">
                    {t('deviceConfigurator.pinDescription', 'Pino de dados para o sensor DS18B20. O padrão é 4.')}
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="send-interval">{t('deviceConfigurator.intervalLabel', 'Intervalo de Envio (segundos)')}</Label>
                <Input id="send-interval" type="number" value={sendInterval} onChange={(e) => setSendInterval(e.target.value)} />
                <p className="text-sm text-muted-foreground">
                    {t('deviceConfigurator.intervalDescription', 'Frequência de envio dos dados. O padrão é 30s.')}
                </p>
            </div>
          </div>
         
          <Button onClick={handleGenerate}>
            <CodeXml className="mr-2 h-4 w-4" />
            {t('esphome.generateButton', 'Gerar Código YAML')}
          </Button>
        </CardContent>
      </Card>
      
      {generatedCode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('esphome.generatedCodeTitle', 'Código YAML Gerado para ESPHome')}</CardTitle>
            <CardDescription>
                {t('esphome.generatedCodeDescription', 'Copie este código e cole-o em um novo dispositivo no painel do ESPHome.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 h-8 w-8"
              onClick={handleCopy}
            >
              {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              <span className="sr-only">{isCopied ? t('deviceConfigurator.copiedButton', 'Copiado!') : t('deviceConfigurator.copyButton', 'Copiar Código')}</span>
            </Button>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              <code className="language-yaml">{generatedCode}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Como Usar no ESPHome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>No painel do Home Assistant, vá para a seção **ESPHome**.</li>
                <li>Clique no botão **"+ NEW DEVICE"** (canto inferior direito).</li>
                <li>Selecione **"Continue"** na primeira tela, e na tela seguinte escolha **"Install manually"**.</li>
                <li>Na janela que abrir, clique em **"MODERN FORMAT"**.</li>
                <li>Apague todo o conteúdo que estiver lá e **cole o código YAML** gerado acima.</li>
                <li>Clique em **"SAVE"** e depois em **"INSTALL"**. Siga as instruções do ESPHome para a primeira gravação via cabo USB.</li>
                <li>Após a primeira gravação, o dispositivo aparecerá no painel e futuras atualizações serão sem fio (OTA).</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}
