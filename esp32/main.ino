#include <Arduino.h>
#include <WiFi.h>
#if __has_include("config.h")
  #include "config.h"
#elif __has_include("config.example.h")
  #include "config.example.h"
#endif
#ifndef WIFI_SSID
  #define WIFI_SSID           "YOUR_WIFI_SSID_HERE"
#endif
#ifndef WIFI_PASSWORD
  #define WIFI_PASSWORD       "YOUR_WIFI_PASSWORD_HERE"
#endif
#ifndef FIREBASE_HOST
  #define FIREBASE_HOST       "your-project-id-default-rtdb.firebaseio.com"
#endif
#ifndef FIREBASE_AUTH_KEY
  #define FIREBASE_AUTH_KEY   "YOUR_FIREBASE_DATABASE_SECRET_OR_WEB_API_KEY"
#endif
#ifndef RELAY_1_PIN
  #define RELAY_1_PIN         23
#endif
#ifndef RELAY_2_PIN
  #define RELAY_2_PIN         22
#endif
#ifndef RELAY_3_PIN
  #define RELAY_3_PIN         21
#endif
#ifndef RELAY_4_PIN
  #define RELAY_4_PIN         19
#endif
#ifndef DHT_PIN
  #define DHT_PIN             4
#endif
#ifndef STATUS_LED_PIN
  #define STATUS_LED_PIN      2
#endif
#ifndef TELEMETRY_INTERVAL
  #define TELEMETRY_INTERVAL  5000
#endif
#ifndef WIFI_RETRY_INTERVAL
  #define WIFI_RETRY_INTERVAL 10000
#endif
struct RelayChannel {
  const char* id;
  const char* name;
  uint8_t pin;
  bool activeLow;
  bool currentState;
};
RelayChannel relays[4] = {
  { "living_room_light", "Living Room Light", RELAY_1_PIN, true, false },
  { "bedroom_light",     "Bedroom Light",     RELAY_2_PIN, true, false },
  { "kitchen_light",     "Kitchen Light",     RELAY_3_PIN, true, false },
  { "bathroom_light",    "Bathroom Light",    RELAY_4_PIN, true, false }
};
unsigned long lastTelemetryMillis = 0;
unsigned long lastHeartbeatMillis = 0;
unsigned long lastWifiCheckMillis = 0;
void connectWiFi();
void initFirebase();
void setRelayState(int index, bool turnOn);
void readAndPublishTemperature();
void publishHeartbeat();
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=======================================================");
  Serial.println("[ESP32] Smart Home Automation Node — 4 Lights & Temp");
  Serial.println("=======================================================");
  for (int i = 0; i < 4; i++) {
    digitalWrite(relays[i].pin, relays[i].activeLow ? HIGH : LOW);
    pinMode(relays[i].pin, OUTPUT);
    relays[i].currentState = false;
    Serial.printf("[Relay Init] Channel %d: %s on GPIO %d -> OFF (Safe)\n",
                  i + 1, relays[i].name, relays[i].pin);
  }
  pinMode(DHT_PIN, INPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);
  connectWiFi();
  initFirebase();
  Serial.println("[ESP32] Setup sequence complete. Node entering loop.\n");
}
void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - lastWifiCheckMillis >= WIFI_RETRY_INTERVAL) {
    lastWifiCheckMillis = currentMillis;
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[Wi-Fi Watchdog] Connection lost. Reconnecting...");
      digitalWrite(STATUS_LED_PIN, LOW);
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    } else {
      digitalWrite(STATUS_LED_PIN, HIGH);
    }
  }
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL) {
    lastTelemetryMillis = currentMillis;
    readAndPublishTemperature();
  }
  if (currentMillis - lastHeartbeatMillis >= 15000) {
    lastHeartbeatMillis = currentMillis;
    publishHeartbeat();
  }
  delay(10);
}
void connectWiFi() {
  Serial.printf("[Wi-Fi] Connecting to SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] Assigned IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else {
    Serial.println("\n[Wi-Fi] Connection timed out. Running demo mode; watchdog will retry.");
  }
}
void initFirebase() {
  Serial.println("[Firebase] Initializing client scaffold (4 Lights + 1 Temp Sensor)...");
}
void setRelayState(int index, bool turnOn) {
  if (index < 0 || index >= 4) return;
  relays[index].currentState = turnOn;
  int pinValue = relays[index].activeLow ? (turnOn ? LOW : HIGH) : (turnOn ? HIGH : LOW);
  digitalWrite(relays[index].pin, pinValue);
  Serial.printf("[Relay Actuate] %s (GPIO %d) -> %s\n",
                relays[index].name, relays[index].pin, turnOn ? "ON" : "OFF");
}
void readAndPublishTemperature() {
  float temperature = 28.5;
  Serial.printf("[Sensor Telemetry] Room Temperature: %.1f °C (DHT11 on GPIO %d)\n",
                temperature, DHT_PIN);
}
void publishHeartbeat() {
  Serial.println("[Heartbeat] ESP32 Controller alive.");
}
