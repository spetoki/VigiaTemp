
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/context/SettingsContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CodeXml, Copy, Check, AlertCircle, FileCode2, Wifi, Settings, HelpCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const generateWebSerialTestCode = () => `
// Código de Teste Mínimo - "Olá, Mundo!" Serial
// O objetivo deste código é apenas testar a conexão USB e o Monitor Serial.
void setup() {
  // Inicia a comunicação Serial na velocidade padrão.
  // IMPORTANTE: No Monitor Serial do Arduino IDE, selecione "115200" no canto inferior direito.
  Serial.begin(115200);
}

void loop() {
  // Envia a mensagem "Olá, Mundo! A placa está funcionando." pela porta USB a cada 2 segundos.
  Serial.println("Olá, Mundo! A placa está funcionando.");
  delay(2000); // Espera 2 segundos.
}
`;


const generateCppCode = (config: {
  configType: 'wifimanager' | 'hardcoded' | 'webserial';
  appUrl?: string;
  pin?: string;
  interval?: string;
  ssid?: string;
  password?: string;
}) => {

  if (config.configType === 'webserial') {
    return generateWebSerialTestCode();
  }

  // Garante que a URL base não tenha uma barra no final e que o /api/sensor seja adicionado.
  const baseUrl = (config.appUrl || '').replace(/\/$/, '');
  const finalAppUrl = `${baseUrl}/api/sensor`;

  const commonIncludes = `
// Bibliotecas necessárias. Instale-as através do Gerenciador de Bibliotecas do Arduino IDE:
// - DallasTemperature
// - OneWire
// - ArduinoJson
// - WiFiManager (apenas para o modo Universal)
#include <WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
`;

  const commonSetupAndLoop = `
// --- Configurações Editáveis ---
const char* app_url = "${finalAppUrl}"; // URL do seu aplicativo VigiaTemp
const int SENSOR_PIN = ${config.pin};           // Pino de dados do sensor DS18B20
const int SEND_INTERVAL_SEC = ${config.interval};  // Intervalo de envio em segundos

// --- Inicialização de Componentes ---
OneWire oneWire(SENSOR_PIN);
DallasTemperature sensors(&oneWire);
DeviceAddress sensorAddress;

unsigned long previousMillis = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("\\nIniciando...");

  // Inicia o sensor
  sensors.begin();
  if (!sensors.getAddress(sensorAddress, 0)) {
    Serial.println("ERRO: Sensor DS18B20 não encontrado!");
  } else {
    Serial.print("Sensor encontrado no endereço: ");
    printAddress(sensorAddress);
    Serial.println();
  }

  connectWiFi();
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= (SEND_INTERVAL_SEC * 1000)) {
    previousMillis = currentMillis;
    
    float tempC = getTemperature();
    if (tempC != DEVICE_DISCONNECTED_C) {
      sendTemperature(tempC);
    } else {
      Serial.println("Falha ao ler o sensor.");
    }
  }
}

float getTemperature() {
  sensors.requestTemperatures(); 
  float temperature = sensors.getTempC(sensorAddress);
  Serial.print("Temperatura lida: ");
  Serial.print(temperature);
  Serial.println(" *C");
  return temperature;
}

void sendTemperature(float temperature) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(app_url);
    http.addHeader("Content-Type", "application/json");

    // Usa a nova sintaxe recomendada para ArduinoJson 7+
    JsonDocument doc;
    doc["macAddress"] = WiFi.macAddress();
    doc["temperature"] = temperature;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    Serial.print("Enviando dados para: ");
    Serial.println(app_url);
    Serial.print("Corpo da requisição: ");
    Serial.println(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Código de resposta HTTP: ");
      Serial.println(httpResponseCode);
      Serial.print("Resposta do servidor: ");
      Serial.println(response);
    } else {
      Serial.print("Erro no envio - Código: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi Desconectado. Tentando reconectar...");
    connectWiFi();
  }
}

void printAddress(DeviceAddress deviceAddress) {
  for (uint8_t i = 0; i < 8; i++) {
    if (deviceAddress[i] < 16) Serial.print("0");
    Serial.print(deviceAddress[i], HEX);
  }
}
`;

  if (config.configType === 'hardcoded') {
    return `
#include <WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Credenciais de WiFi (Fixas) ---
const char* ssid = "${config.ssid}";
const char* password = "${config.password}";

void connectWiFi() {
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) { // Tenta por 10 segundos
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\\nWiFi conectado!");
    Serial.print("Endereço IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\\nFalha ao conectar. Verifique as credenciais e o sinal.");
  }
}
${commonSetupAndLoop}
`;
  }

  // WiFiManager implementation
  return `
${commonIncludes}
#include <WiFiManager.h> // Biblioteca adicional para configuração universal

void connectWiFi() {
  WiFiManager wm;
  
  // ATENÇÃO: A linha abaixo força o ESP a esquecer as credenciais salvas.
  // Depois de configurar o WiFi pela primeira vez, comente (adicione // no início) 
  // esta linha e grave o código novamente para que ele possa se reconectar automaticamente.
  wm.resetSettings();
  
  bool res = wm.autoConnect("VigiaTemp-Config", "senha123");

  if(!res) {
      Serial.println("Falha ao conectar. Reiniciando...");
      ESP.restart();
  } 
  else {
      Serial.println("Conectado ao WiFi!");
      Serial.print("Endereço IP: ");
      Serial.println(WiFi.localIP());
  }
}
${commonSetupAndLoop}
`;
};

type ConfigType = 'wifimanager' | 'hardcoded' | 'webserial';

export default function DeviceConfiguratorPage() {
  const { t, activeKey } = useSettings();
  const { toast } = useToast();

  const [configType, setConfigType] = useState<ConfigType>('wifimanager');
  const [appUrl, setAppUrl] = useState('https://vigia-temp.vercel.app');
  const [sensorPin, setSensorPin] = useState('4');
  const [sendInterval, setSendInterval] = useState('30');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setError('');

    if (configType !== 'webserial') {
       if (!appUrl) {
        setError(t('deviceConfigurator.errorDescription', 'Por favor, preencha a URL do Aplicativo.'));
        return;
      }
      if (configType === 'hardcoded' && (!ssid || !password)) {
        setError(t('deviceConfigurator.errorCredentials', 'Para credenciais fixas, o SSID e a senha são obrigatórios.'));
        return;
      }
    }
   
    const code = generateCppCode({
      configType,
      appUrl,
      pin: sensorPin,
      interval: sendInterval,
      ssid,
      password,
    });
    setGeneratedCode(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setIsCopied(true);
      toast({
        title: t('deviceConfigurator.copySuccessTitle', 'Copiado!'),
        description: t('deviceConfigurator.copySuccessDescription', 'O código foi copiado para a sua área de transferência.'),
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
          {t('deviceConfigurator.title', 'Configurador de Código para ESP32')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('deviceConfigurator.description', 'Gere um código para o seu dispositivo. Escolha entre um código universal (com portal de configuração) ou um com credenciais de WiFi fixas.')}
        </p>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('deviceConfigurator.formTitle', 'Configuração do Dispositivo')}</CardTitle>
          <CardDescription>
            {t('deviceConfigurator.formDescription', 'Selecione o tipo de configuração e preencha os campos necessários.')}
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

          <RadioGroup value={configType} onValueChange={(value) => setConfigType(value as ConfigType)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Label htmlFor="type-webserial" className="cursor-pointer flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground">
                <RadioGroupItem value="webserial" id="type-webserial" className="sr-only" />
                <HelpCircle className="mb-3 h-6 w-6" />
                Alternativa (Web Serial)
                <span className="mt-2 text-center text-xs text-muted-foreground [&:has([data-state=checked])]:text-primary-foreground/80">Não consegue gravar? Use este código ultra-simples para testar a conexão USB básica.</span>
            </Label>
            <Label htmlFor="type-wifimanager" className="cursor-pointer flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground">
                <RadioGroupItem value="wifimanager" id="type-wifimanager" className="sr-only" />
                <Wifi className="mb-3 h-6 w-6" />
                Universal (WiFiManager)
                <span className="mt-2 text-center text-xs text-muted-foreground [&:has([data-state=checked])]:text-primary-foreground/80">Cria um portal para configurar o WiFi no próprio dispositivo. Ideal para flexibilidade.</span>
            </Label>
             <Label htmlFor="type-hardcoded" className="cursor-pointer flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground">
                <RadioGroupItem value="hardcoded" id="type-hardcoded" className="sr-only" />
                <Settings className="mb-3 h-6 w-6" />
                Credenciais Fixas
                <span className="mt-2 text-center text-xs text-muted-foreground [&:has([data-state=checked])]:text-primary-foreground/80">Grava o nome e a senha da rede diretamente no código. Mais simples, menos flexível.</span>
            </Label>
          </RadioGroup>

          <Separator />
          
          {configType === 'hardcoded' && (
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ssid">{t('deviceConfigurator.ssidLabel', 'Nome da Rede WiFi (SSID)')}</Label>
                        <Input id="ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="Ex: MinhaRedeWiFi" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('deviceConfigurator.passwordLabel', 'Senha da Rede WiFi')}</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                 </div>
                 <Separator />
            </div>
          )}
          
          {configType !== 'webserial' && (
             <>
                <div className="space-y-2">
                  <Label htmlFor="app-url">{t('deviceConfigurator.appUrlLabel', 'URL do Aplicativo')}</Label>
                  <Input id="app-url" value={appUrl} onChange={(e) => setAppUrl(e.target.value)} />
                  <p className="text-sm text-muted-foreground">
                      Insira a URL base da sua aplicação (Ex: https://meu-app.vercel.app). O caminho /api/sensor será adicionado automaticamente.
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
             </>
           )}
           
            {configType === 'webserial' && (
             <Alert variant="default" className="border-sky-500/50 text-sky-600 bg-sky-500/5">
               <HelpCircle className="h-4 w-4 !text-sky-600" />
               <AlertTitle>Como usar este código de teste</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>Clique em "Gerar Código" e copie o código.</li>
                      <li>Cole no Arduino IDE e tente gravar na placa (pressione BOOT ao conectar o USB).</li>
                      <li>Se a gravação funcionar, abra o Monitor Serial (Ctrl+Shift+M).</li>
                      <li>Você DEVE ver a mensagem "Olá, Mundo!..." aparecendo a cada 2 segundos.</li>
                      <li>Se vir a mensagem, sua conexão e drivers estão funcionando! Agora pode voltar e usar o código "Universal".</li>
                  </ol>
                </AlertDescription>
             </Alert>
           )}

          <Button onClick={handleGenerate}>
            <CodeXml className="mr-2 h-4 w-4" />
            {t('deviceConfigurator.generateButton', 'Gerar Código')}
          </Button>
        </CardContent>
      </Card>
      
      {generatedCode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('deviceConfigurator.generatedCodeTitle', 'Código Gerado para Arduino IDE')}</CardTitle>
            <CardDescription>
                {t('deviceConfigurator.generatedCodeDescription', 'Copie, cole na sua Arduino IDE e instale as bibliotecas necessárias pelo Gerenciador de Bibliotecas.')}
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
              <code className="language-cpp">{generatedCode}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    