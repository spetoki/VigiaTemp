
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

const generateCppCode = (appUrl: string, pin: string, interval: string) => `
// Bibliotecas necessárias. Instale-as através do Gerenciador de Bibliotecas do Arduino IDE:
// - WiFiManager by tzapu
// - DallasTemperature
// - OneWire
// - ArduinoJson

#include <WiFi.h>
#include <WiFiManager.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Configurações Editáveis ---
const char* app_url = "${appUrl}"; // URL do seu aplicativo VigiaTemp
const int SENSOR_PIN = ${pin};           // Pino de dados do sensor DS18B20
const int SEND_INTERVAL_SEC = ${interval};  // Intervalo de envio em segundos

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

  // Inicia o WiFiManager para configuração universal
  WiFiManager wm;
  // wm.resetSettings(); // Descomente para forçar a reconfiguração na próxima inicialização
  
  bool res = wm.autoConnect("VigiaTemp-Config", "senha123"); // SSID do portal e senha

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
    
    // Inicia a conexão com a URL da API
    http.begin(app_url);
    http.addHeader("Content-Type", "application/json");

    // Cria o corpo da requisição JSON
    StaticJsonDocument<200> doc;
    doc["macAddress"] = WiFi.macAddress();
    doc["temperature"] = temperature;

    String requestBody;
    serializeJson(doc, requestBody);

    // Envia a requisição POST
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
    // O ESP32 tentará reconectar automaticamente
  }
}

// Função auxiliar para imprimir o endereço do sensor
void printAddress(DeviceAddress deviceAddress) {
  for (uint8_t i = 0; i < 8; i++) {
    if (deviceAddress[i] < 16) Serial.print("0");
    Serial.print(deviceAddress[i], HEX);
  }
}
`;

export default function DeviceConfiguratorPage() {
  const { t } = useSettings();
  const { toast } = useToast();

  const [appUrl, setAppUrl] = useState('https://vigia-temp.vercel.app/api/sensor');
  const [sensorPin, setSensorPin] = useState('4');
  const [sendInterval, setSendInterval] = useState('30');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    if (!appUrl) {
      setError(t('deviceConfigurator.errorDescription', 'Por favor, preencha a URL do Aplicativo.'));
      return;
    }
    setError('');
    const code = generateCppCode(appUrl, sensorPin, sendInterval);
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
          {t('deviceConfigurator.description', 'Gere um código universal para o seu dispositivo. Este código usa um portal web para permitir que qualquer pessoa configure a rede WiFi sem precisar editar o código-fonte.')}
        </p>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('deviceConfigurator.formTitle', 'Configuração Universal (WiFiManager)')}</CardTitle>
          <CardDescription>
            {t('deviceConfigurator.formDescription', 'A única informação necessária é a URL do seu aplicativo. As credenciais de WiFi serão solicitadas ao usuário final através de um portal de configuração.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('deviceConfigurator.errorTitle', 'Campos Obrigatórios')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}
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
            {t('deviceConfigurator.generateButton', 'Gerar Código Universal')}
          </Button>
        </CardContent>
      </Card>
      
      {generatedCode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('deviceConfigurator.generatedCodeTitle', 'Código Gerado para Arduino IDE')}</CardTitle>
            <CardDescription>
                {t('deviceConfigurator.generatedCodeDescription', 'Copie, cole na sua Arduino IDE e instale a biblioteca \'WiFiManager\' pelo Gerenciador de Bibliotecas.')}
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
