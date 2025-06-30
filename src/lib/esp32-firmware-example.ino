/**
 * @file esp32-firmware-example.ino
 * @brief Exemplo de firmware para ESP32 que lê um sensor de temperatura DS18B20
 *        e envia os dados para o endpoint da API do aplicativo VigiaTemp.
 *
 * Bibliotecas necessárias (instale via Gerenciador de Bibliotecas da Arduino IDE):
 * - OneWire by Paul Stoffregen
 * - DallasTemperature by Miles Burton
 * - ArduinoJson by Benoit Blanchon
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- CONFIGURAÇÕES DO USUÁRIO ---
const char* ssid = "NOME_DA_SUA_REDE_WIFI";
const char* password = "SENHA_DA_SUA_REDE_WIFI";

// Substitua pela URL do seu aplicativo no Firebase Studio.
// Certifique-se de que a URL termina com /api/sensor
const char* serverUrl = "https://SEU-DOMINIO-DO-APP-AQUI/api/sensor";

// Pino do ESP32 onde o pino de dados do sensor DS18B20 está conectado.
#define ONE_WIRE_BUS 4

// --- FIM DAS CONFIGURAÇÕES ---


// Configuração do sensor de temperatura
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Variável para guardar o endereço MAC do ESP32
String macAddress;

void setup() {
  Serial.begin(115200);
  sensors.begin();
  
  delay(100);

  Serial.println("\nConectando ao WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  // Obtém o endereço MAC para usar como identificador único do sensor.
  macAddress = WiFi.macAddress();
  Serial.print("Endereço MAC: ");
  Serial.println(macAddress);
}

void loop() {
  // Pede a leitura da temperatura ao sensor
  sensors.requestTemperatures(); 
  float temperatureC = sensors.getTempCByIndex(0);

  if (temperatureC == DEVICE_DISCONNECTED_C) {
    Serial.println("Erro: Não foi possível ler a temperatura do sensor.");
    delay(5000); // Tenta novamente em 5 segundos
    return;
  }

  Serial.print("Temperatura lida: ");
  Serial.print(temperatureC);
  Serial.println(" °C");

  // Envia os dados para o servidor
  sendDataToServer(temperatureC);

  // Espera 30 segundos antes da próxima leitura
  Serial.println("Aguardando 30 segundos para a próxima leitura...");
  delay(30000);
}

void sendDataToServer(float temperature) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Cria o corpo da requisição JSON
    JsonDocument doc;
    doc["macAddress"] = macAddress;
    doc["temperature"] = temperature;

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.print("Enviando JSON: ");
    Serial.println(requestBody);

    // Faz a requisição POST
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Código de resposta HTTP: ");
      Serial.println(httpResponseCode);
      Serial.print("Resposta do servidor: ");
      Serial.println(response);
    } else {
      Serial.print("Erro na requisição POST. Código: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Erro: Desconectado do WiFi.");
  }
}
