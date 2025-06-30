/*
  VigiaTemp - Firmware de Exemplo para ESP32 e Sensor DS18B20

  Este código:
  1. Conecta o ESP32 a uma rede WiFi.
  2. Lê a temperatura de um sensor DS18B20 a cada 30 segundos.
  3. Envia os dados (endereço MAC e temperatura) para a API do seu aplicativo VigiaTemp.

  == Pré-requisitos (Arduino IDE) ==
  1. Instale o suporte para a placa ESP32 no seu Gerenciador de Placas.
  2. Instale as seguintes bibliotecas através do "Gerenciador de Bibliotecas":
     - "DallasTemperature" por Miles Burton (e suas dependências, como a OneWire).
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // Para conexões HTTPS
#include <OneWire.h>
#include <DallasTemperature.h>

// --- Configurações do WiFi ---
const char* ssid = "RPNET_DAYANE";
const char* password = "Designer!1los";

// --- Configurações do Servidor ---
// IMPORTANTE: Substitua "https://SEU_APP_URL" pela URL principal do seu aplicativo.
// Exemplo: https://meu-app-incrivel.firebaseapp.com/api/sensor
String serverUrl = "https://SEU_APP_URL/api/sensor"; 

// --- Configurações do Sensor de Temperatura ---
#define ONE_WIRE_BUS 4 // Pino GPIO onde o pino de DADOS do sensor DS18B20 está conectado
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Inicializa o sensor
  sensors.begin();

  // Conectar ao WiFi
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Endereço MAC do ESP32 (use este no app): ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  // Solicita a leitura da temperatura
  sensors.requestTemperatures(); 
  float temperatureC = sensors.getTempCByIndex(0); // Lê a temperatura do primeiro sensor no barramento

  // Verifica se a leitura foi bem-sucedida
  if (temperatureC == DEVICE_DISCONNECTED_C) {
    Serial.println("Erro: Não foi possível ler a temperatura do sensor! Verifique a conexão.");
    delay(5000); // Tenta novamente em 5 segundos
    return;
  }
  
  Serial.print("Temperatura lida: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  // Verifica se o WiFi está conectado antes de enviar os dados
  if(WiFi.status() == WL_CONNECTED) {
    
    WiFiClientSecure client;
    HTTPClient http;
    
    // IMPORTANTE: A linha abaixo desativa a verificação de certificado SSL.
    // Isso simplifica a conexão para este protótipo, mas é inseguro para produção.
    client.setInsecure();

    // Inicia a conexão segura (HTTPS)
    http.begin(client, serverUrl);
    
    // Adiciona o cabeçalho para indicar que estamos enviando dados em formato JSON
    http.addHeader("Content-Type", "application/json");

    // Cria o corpo da requisição (payload JSON)
    String macAddress = WiFi.macAddress();
    String jsonPayload = "{\"macAddress\":\"" + macAddress + "\",\"temperature\":" + String(temperatureC) + "}";

    Serial.print("Enviando payload para o servidor: ");
    Serial.println(jsonPayload);

    // Envia a requisição POST
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Código de resposta HTTP: ");
      Serial.println(httpResponseCode);
      Serial.print("Resposta do servidor: ");
      Serial.println(response);
    } else {
      Serial.print("Erro na requisição POST, código de erro: ");
      Serial.println(httpResponseCode);
    }
    
    // Fecha a conexão
    http.end();
  } else {
    Serial.println("Erro na conexão WiFi, tentando reconectar...");
    WiFi.begin(ssid, password); // Tenta reconectar
  }

  // Aguarda 30 segundos antes da próxima leitura e envio
  Serial.println("Aguardando 30 segundos para a próxima leitura...");
  delay(30000);
}
