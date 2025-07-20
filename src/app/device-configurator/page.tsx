

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CodeXml, Copy, Check, Cog } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';

const arduinoCodeTemplate = `
#include <WiFi.h>
#include <HTTPClient.h> // Biblioteca para fazer requisições HTTP (a tecnologia de comunicação)
#include <OneWire.h>
#include <DallasTemperature.h>

// --- User Settings ---
const char* ssid = "{ssid}";
const char* password = "{password}";
// Application URL (check the address after deploying in production)
const char* serverName = "{serverName}";

// --- Hardware Settings ---
// GPIO pin where the DS18B20 data pin is connected
const int oneWireBus = {oneWireBus}; // GPIO {oneWireBus}

// --- Global Variables ---
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);
unsigned long lastTime = 0;
// Send data every {timerDelaySeconds} seconds ({timerDelay} milliseconds)
unsigned long timerDelay = {timerDelay};

void setup() {
  Serial.begin(115200);
  sensors.begin();

  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi..");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC Address: ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    sensors.requestTemperatures(); 
    float temperatureC = sensors.getTempCByIndex(0);

    if(temperatureC == DEVICE_DISCONNECTED_C) {
      Serial.println("Error: Could not read temperature from sensor.");
      return;
    }

    Serial.print("Temperature: ");
    Serial.print(temperatureC);
    Serial.println(" °C");

    if(WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");

      String jsonPayload = "{\\"macAddress\\":\\"" + String(WiFi.macAddress()) + "\\",\\"temperature\\":" + String(temperatureC) + "}";

      // Envia a requisição POST para o servidor (nosso app)
      int httpResponseCode = http.POST(jsonPayload);
      
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);
        
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Server Response:");
        Serial.println(response);
      }
      
      http.end();
    } else {
      Serial.println("WiFi Disconnected");
    }
    
    lastTime = millis();
  }
}
`;


export default function DeviceConfiguratorPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [oneWireBus, setOneWireBus] = useState('4');
  const [timerDelay, setTimerDelay] = useState('30'); // in seconds for the input
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateCode = () => {
    if (!ssid || !password || !appUrl) {
      toast({
        variant: "destructive",
        title: t('deviceConfigurator.errorTitle', 'Campos Obrigatórios'),
        description: t('deviceConfigurator.errorDescription', 'Por favor, preencha o Nome da Rede, Senha e URL do Aplicativo.'),
      });
      return;
    }

    const code = arduinoCodeTemplate
      .replace(/{ssid}/g, ssid)
      .replace(/{password}/g, password)
      .replace(/{serverName}/g, appUrl)
      .replace(/{oneWireBus}/g, oneWireBus || '4')
      .replace(/{timerDelay}/g, String((parseInt(timerDelay, 10) || 30) * 1000))
      .replace(/{timerDelaySeconds}/g, timerDelay || '30')
      .trim();
    
    setGeneratedCode(code);
    setIsCopied(false);
  };
  
  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode).then(() => {
      setIsCopied(true);
      toast({
        title: t('deviceConfigurator.copySuccessTitle', 'Copiado!'),
        description: t('deviceConfigurator.copySuccessDescription', 'O código foi copiado para a sua área de transferência.'),
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
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
          <Cog className="mr-3 h-8 w-8" />
          {t('deviceConfigurator.title', 'Configurador de Código para ESP32')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('deviceConfigurator.description', 'Preencha os campos abaixo para gerar um código personalizado para o seu dispositivo ESP32. Isso garante que ele se conecte à sua rede e envie dados para este aplicativo.')}
        </p>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('deviceConfigurator.formTitle', 'Configurações do Dispositivo')}</CardTitle>
          <CardDescription>{t('deviceConfigurator.formDescription', 'Insira os dados da sua rede e do hardware. Os campos marcados com * são obrigatórios.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ssid">{t('deviceConfigurator.ssidLabel', 'Nome da Rede WiFi (SSID)')} <span className="text-destructive">*</span></Label>
              <Input id="ssid" value={ssid} onChange={e => setSsid(e.target.value)} placeholder="Ex: MinhaRedeCasa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('deviceConfigurator.passwordLabel', 'Senha da Rede WiFi')} <span className="text-destructive">*</span></Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appUrl">{t('deviceConfigurator.appUrlLabel', 'URL do Aplicativo')} <span className="text-destructive">*</span></Label>
            <Input id="appUrl" value={appUrl} onChange={e => setAppUrl(e.target.value)} placeholder="https://seu-app-implantado.vercel.app/api/sensor" />
            <p className="text-xs text-muted-foreground">{t('deviceConfigurator.appUrlDescription', 'Insira a URL completa da sua aplicação, terminando com /api/sensor.')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <Label htmlFor="oneWireBus">{t('deviceConfigurator.pinLabel', 'Pino do Sensor (GPIO)')}</Label>
              <Input id="oneWireBus" type="number" value={oneWireBus} onChange={e => setOneWireBus(e.target.value)} placeholder="4" />
              <p className="text-xs text-muted-foreground">{t('deviceConfigurator.pinDescription', 'Pino de dados do sensor DS18B20. O padrão é 4.')}</p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="timerDelay">{t('deviceConfigurator.intervalLabel', 'Intervalo de Envio (segundos)')}</Label>
              <Input id="timerDelay" type="number" value={timerDelay} onChange={e => setTimerDelay(e.target.value)} placeholder="30" />
              <p className="text-xs text-muted-foreground">{t('deviceConfigurator.intervalDescription', 'Frequência de envio de dados. Padrão é 30s.')}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleGenerateCode}>
                <CodeXml className="mr-2 h-4 w-4" />
                {t('deviceConfigurator.generateButton', 'Gerar Código')}
            </Button>
        </CardFooter>
      </Card>
      
      {generatedCode && (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>{t('deviceConfigurator.generatedCodeTitle', 'Código Gerado para Arduino IDE')}</CardTitle>
                <CardDescription>{t('deviceConfigurator.generatedCodeDescription', 'Copie e cole este código na sua Arduino IDE.')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
                {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                {isCopied ? t('deviceConfigurator.copiedButton', 'Copiado!') : t('deviceConfigurator.copyButton', 'Copiar Código')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[500px]">
              <pre><code>{generatedCode}</code></pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
