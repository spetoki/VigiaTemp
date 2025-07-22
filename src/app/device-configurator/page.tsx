

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
  VigiaTemp - Código Universal com WiFi Manager
  ===========================================
  
  BIBLIOTECA OBRIGATÓRIA: Para este código funcionar, você PRECISA instalar a 
  biblioteca "WiFiManager" na sua Arduino IDE. 
  Para fazer isso:
  1. Vá em Ferramentas > Gerenciar Bibliotecas...
  2. Na caixa de busca, digite "WiFiManager" (de tzapu).
  3. Clique em Instalar.

  Como funciona:
  1. Ao ligar, o ESP32 tenta se conectar a uma rede já salva.
  2. Se não conseguir, ele cria um Ponto de Acesso WiFi chamado "VigiaTemp-Config".
  3. Conecte seu celular ou computador a esta rede.
  4. Um portal de configuração abrirá automaticamente no seu navegador.
  5. Selecione sua rede WiFi, insira a senha e o endereço do servidor.
  6. O ESP32 salvará as informações e se conectará à sua rede.
*/
#include <WiFi.h>
#include <WiFiManager.h> // Biblioteca para o portal de configuração
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- Configurações de Hardware ---
// Pino GPIO onde o pino de dados do DS18B20 está conectado
const int oneWireBus = 4; // GPIO 4

// --- Variáveis Globais ---
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);
unsigned long lastTime = 0;
unsigned long timerDelay = 30000; // Enviar dados a cada 30 segundos

// Variáveis para armazenar as configurações do WiFiManager
char server_url[100]; // Armazena a URL do servidor

void setup() {
  Serial.begin(115200);
  sensors.begin();

  // Inicia o WiFiManager
  WiFiManager wm;
  
  // Cria um campo customizado no portal para a URL do servidor
  WiFiManagerParameter custom_server_url("server", "URL do Servidor", "{serverName}", 100);
  wm.addParameter(&custom_server_url);

  // Tenta conectar ao WiFi. Se falhar, inicia o portal de configuração.
  // O nome do Ponto de Acesso será "VigiaTemp-Config"
  if (!wm.autoConnect("VigiaTemp-Config")) {
    Serial.println("Falha ao conectar e tempo limite esgotado. Reiniciando...");
    delay(3000);
    ESP.restart(); // Reinicia o ESP se a configuração não for concluída
  }

  // Se a conexão for bem-sucedida
  Serial.println("\\nConectado à sua rede WiFi!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Endereço MAC: ");
  Serial.println(WiFi.macAddress());

  // Salva o valor do campo customizado na nossa variável
  strcpy(server_url, custom_server_url.getValue());
  Serial.print("URL do Servidor configurada para: ");
  Serial.println(server_url);
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    sensors.requestTemperatures(); 
    float temperatureC = sensors.getTempCByIndex(0);

    if (temperatureC == DEVICE_DISCONNECTED_C) {
      Serial.println("Erro: Não foi possível ler a temperatura do sensor.");
      return;
    }

    Serial.print("Temperatura: ");
    Serial.print(temperatureC);
    Serial.println(" °C");

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      
      http.begin(server_url);
      http.addHeader("Content-Type", "application/json");

      String jsonPayload = "{\\"macAddress\\":\\"" + String(WiFi.macAddress()) + "\\",\\"temperature\\":" + String(temperatureC) + "}";

      int httpResponseCode = http.POST(jsonPayload);
      
      Serial.print("Código de Resposta HTTP: ");
      Serial.println(httpResponseCode);
        
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Resposta do Servidor:");
        Serial.println(response);
      }
      
      http.end();
    } else {
      Serial.println("WiFi Desconectado");
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
          <AlertTitle>Dependência Obrigatória</AlertTitle>
          <AlertDescription>
            Antes de compilar, você <strong>precisa</strong> instalar a biblioteca <strong>`WiFiManager`</strong> (de tzapu) na sua Arduino IDE. Vá em `Ferramentas` → `Gerenciar Bibliotecas...` e pesquise por `WiFiManager`.
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
