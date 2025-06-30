/**
 * @file esp32-firmware-example.ino
 * @brief Firmware de exemplo para o ESP32 com sensor de temperatura DS18B20.
 * 
 * Este código conecta o ESP32 a uma rede WiFi, lê a temperatura de um sensor DS18B20
 * a cada 30 segundos e envia os dados para a API do aplicativo VigiaTemp.
 * 
 * Dependências (Instalar via Gerenciador de Bibliotecas da Arduino IDE):
 * - OneWire by Paul Stoffregen
 * - DallasTemperature by Miles Burton
 * - ArduinoJson by Benoit Blanchon
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// --- Configurações do Usuário (ALTERE AQUI!) ---
const char* ssid = "RPNET_DAYANE"; // O nome da sua rede WiFi
const char* password = "Designer!1los"; // A senha da sua rede WiFi

// IMPORTANTE: Substitua pela URL principal do seu aplicativo implantado no App Hosting.
// Deve terminar com /api/sensor
// Exemplo: "https://seu-app-id.web.app/api/sensor"
const char* serverUrl = "https://SEU_APP_URL.web.app/api/sensor"; 

// Pino do ESP32 onde o pino de dados do sensor DS18B20 está conectado
const int oneWireBus = 4; // GPIO 4

// --- Fim das Configurações ---

// Configuração do sensor OneWire
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);
DeviceAddress sensorDeviceAddress;

// Variáveis de controle
unsigned long lastTempRequest = 0;
const long tempRequestInterval = 30000; // Enviar dados a cada 30 segundos (30000 ms)

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n--- VigiaTemp Sensor ---");
  connectToWifi();
  
  sensors.begin();
  Serial.print("Localizando sensor DS18B20... ");
  if (!sensors.getAddress(sensorDeviceAddress, 0)) {
    Serial.println("Não foi possível encontrar o sensor. Verifique as conexões!");
    // Para aqui se o sensor não for encontrado
    while(true); 
  } else {
    Serial.print("Sensor encontrado no endereço: ");
    printAddress(sensorDeviceAddress);
    Serial.println();
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // Verifica se o intervalo de tempo para enviar dados foi atingido
  if (currentMillis - lastTempRequest >= tempRequestInterval) {
    lastTempRequest = currentMillis;

    // Se o WiFi não estiver conectado, tenta reconectar
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi desconectado. Tentando reconectar...");
      connectToWifi();
    }

    // Se o WiFi estiver conectado, lê a temperatura e envia para o servidor
    if (WiFi.status() == WL_CONNECTED) {
      float tempC = getTemperature();
      if (tempC != DEVICE_DISCONNECTED_C) {
        sendTemperature(tempC);
      }
    }
  }
}

void connectToWifi() {
  Serial.print("Conectando ao WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempt = 0;
  while (WiFi.status() != WL_CONNECTED && attempt < 20) {
    delay(500);
    Serial.print(".");
    attempt++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConectado ao WiFi!");
    Serial.print("Endereço IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Endereço MAC: ");
    Serial.println(WiFi.macAddress());
  } else {
    Serial.println("\nFalha ao conectar ao WiFi. Verifique suas credenciais.");
  }
}

float getTemperature() {
  Serial.print("Solicitando temperatura... ");
  sensors.requestTemperatures(); 
  float tempC = sensors.getTempC(sensorDeviceAddress);

  if(tempC == DEVICE_DISCONNECTED_C) {
    Serial.println("Erro: Não foi possível ler a temperatura do sensor.");
    return DEVICE_DISCONNECTED_C;
  }
  
  Serial.print(tempC);
  Serial.println(" °C");
  return tempC;
}

void sendTemperature(float temperature) {
  HTTPClient http;
  
  Serial.print("Enviando dados para o servidor: ");
  Serial.println(serverUrl);

  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Cria o corpo da requisição JSON
  StaticJsonDocument<100> doc;
  doc["macAddress"] = WiFi.macAddress();
  doc["temperature"] = temperature;

  String requestBody;
  serializeJson(doc, requestBody);

  // Envia a requisição POST
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Código de resposta HTTP: ");
    Serial.println(httpResponseCode);
    Serial.print("Resposta do servidor: ");
    Serial.println(response);
  } else {
    Serial.print("Erro no envio do POST. Código: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

// Função auxiliar para imprimir o endereço do sensor
void printAddress(DeviceAddress deviceAddress) {
  for (uint8_t i = 0; i < 8; i++) {
    if (deviceAddress[i] < 16) Serial.print("0");
    Serial.print(deviceAddress[i], HEX);
  }
}
