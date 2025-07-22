

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CodeXml, Copy, Check, Cog, Wifi, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const arduinoCodeTemplate = `
/*
  VigiaTemp - Universal Code with WiFi Manager
  ===========================================
  
  REQUIRED LIBRARY: For this code to work, you MUST install the "WiFiManager" 
  library in your Arduino IDE.
  To do this:
  1. Go to Tools > Manage Libraries...
  2. In the search box, type "WiFiManager" (by tzapu).
  3. Click Install.

  How it works:
  1. When powered on, the ESP32 tries to connect to a saved network.
  2. If it fails, it creates a WiFi Access Point named "VigiaTemp-Config".
  3. Connect your phone or computer to this network.
  4. A configuration portal will automatically open in your browser.
  5. Select your WiFi network, enter the password, and the server address.
  6. The ESP32 will save the information and connect to your network.
*/
#include <WiFi.h>
#include <WiFiManager.h> // Library for the configuration portal
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- Hardware Settings ---
// GPIO pin where the DS18B20 data pin is connected
const int oneWireBus = 4; // GPIO 4

// --- Global Variables ---
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);
unsigned long lastTime = 0;
unsigned long timerDelay = 30000; // Send data every 30 seconds

// Variables to store WiFiManager settings
char server_url[100]; // Stores the server URL

void setup() {
  Serial.begin(115200);
  sensors.begin();

  // Start WiFiManager
  WiFiManager wm;
  
  // Create a custom field in the portal for the server URL
  WiFiManagerParameter custom_server_url("server", "Server URL", "{serverName}", 100);
  wm.addParameter(&custom_server_url);

  // Try to connect to WiFi. If it fails, start the configuration portal.
  // The Access Point name will be "VigiaTemp-Config"
  if (!wm.autoConnect("VigiaTemp-Config")) {
    Serial.println("Failed to connect and timeout expired. Restarting...");
    delay(3000);
    ESP.restart(); // Restart ESP if configuration is not completed
  }

  // If the connection is successful
  Serial.println("\\nConnected to your WiFi network!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC Address: ");
  Serial.println(WiFi.macAddress());

  // Save the value from the custom field to our variable
  strcpy(server_url, custom_server_url.getValue());
  Serial.print("Server URL configured to: ");
  Serial.println(server_url);
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    sensors.requestTemperatures(); 
    float temperatureC = sensors.getTempCByIndex(0);

    if (temperatureC == DEVICE_DISCONNECTED_C) {
      Serial.println("Error: Could not read temperature from sensor.");
      return;
    }

    Serial.print("Temperature: ");
    Serial.print(temperatureC);
    Serial.println(" °C");

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      
      http.begin(server_url);
      http.addHeader("Content-Type", "application/json");

      String jsonPayload = "{\\"macAddress\\":\\"" + String(WiFi.macAddress()) + "\\",\\"temperature\\":" + String(temperatureC) + "}";

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
  
  const [appUrl, setAppUrl] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateCode = () => {
    if (!appUrl) {
      toast({
        variant: "destructive",
        title: t('deviceConfigurator.errorTitle', 'Campos Obrigatórios'),
        description: t('deviceConfigurator.errorDescription', 'Por favor, preencha a URL do Aplicativo.'),
      });
      return;
    }

    const code = arduinoCodeTemplate
      .replace(/{serverName}/g, appUrl)
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
          Gere um código universal para o seu dispositivo. Este código usa um portal web para permitir que qualquer pessoa configure a rede WiFi sem precisar editar o código-fonte.
        </p>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary"/>
            {t('deviceConfigurator.formTitle', 'Configuração Universal (WiFiManager)')}
          </CardTitle>
          <CardDescription>
           A única informação necessária é a URL do seu aplicativo. As credenciais de WiFi serão solicitadas ao usuário final através de um portal de configuração.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appUrl">{t('deviceConfigurator.appUrlLabel', 'URL do Aplicativo')} <span className="text-destructive">*</span></Label>
            <Input id="appUrl" value={appUrl} onChange={e => setAppUrl(e.target.value)} placeholder="https://seu-app-implantado.vercel.app/api/sensor" />
            <p className="text-xs text-muted-foreground">{t('deviceConfigurator.appUrlDescription', 'Insira a URL completa da sua aplicação, terminando com /api/sensor.')}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleGenerateCode}>
                <CodeXml className="mr-2 h-4 w-4" />
                {t('deviceConfigurator.generateButton', 'Gerar Código Universal')}
            </Button>
        </CardFooter>
      </Card>
      
      {generatedCode && (
        <>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dependência Obrigatória / Required Dependency</AlertTitle>
          <AlertDescription>
            <p><strong>PT:</strong> Antes de compilar, você <strong>precisa</strong> instalar a biblioteca <strong>`WiFiManager`</strong> (de tzapu) na sua Arduino IDE. Vá em `Ferramentas` → `Gerenciar Bibliotecas...` e pesquise por `WiFiManager`.</p>
            <p className="mt-2"><strong>EN:</strong> Before compiling, you <strong>must</strong> install the <strong>`WiFiManager`</strong> library (by tzapu) in your Arduino IDE. Go to `Tools` → `Manage Libraries...` and search for `WiFiManager`.</p>
          </AlertDescription>
        </Alert>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>{t('deviceConfigurator.generatedCodeTitle', 'Código Gerado para Arduino IDE')}</CardTitle>
                <CardDescription>Copie e cole na sua Arduino IDE. Lembre-se de instalar as bibliotecas necessárias, conforme o aviso acima.</CardDescription>
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
        </>
      )}
    </div>
  );
}
