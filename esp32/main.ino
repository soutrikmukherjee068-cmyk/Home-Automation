/**
 * ============================================================================
 * ESP32 Smart Home Node — Firmware Starter Scaffold (College Prototype)
 * Scope: 4 Independent Lights + 1 Temperature Sensor (DHT11/DS18B20)
 * ============================================================================
 * Hardware Target: ESP32 Dev Module / NodeMCU-32S
 * Target Database: Google Firebase Realtime Database
 *
 * System Architecture:
 * 1. Connects to 2.4GHz Wi-Fi with non-blocking reconnection resilience.
 * 2. Synchronizes with Firebase Realtime Database:
 *    - Listens to path:   /home/devices/{lightId}/command
 *    - Updates path:      /home/devices/{lightId}/state (Physical Confirmation)
 *    - Reports telemetry: /home/sensors/temperature (Value & Unit)
 *    - Heartbeat ping:    /home/controller/online
 * 3. Actuates 4 relay channels with safe startup state (all OFF).
 * 4. Reads 1 dedicated temperature sensor (DHT11 on GPIO 4).
 * ============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>

// Configuration header resolution with automatic fallback
#if __has_include("config.h")
  #include "config.h"
#elif __has_include("config.example.h")
  #include "config.example.h"
#endif

// --- Fallback Definitions (guarantees error-free compilation) ---
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

// Pin Fallbacks (NodeMCU-32S Pinout)
#ifndef RELAY_1_PIN
  #define RELAY_1_PIN         23  // Channel 1: Living Room Light
#endif
#ifndef RELAY_2_PIN
  #define RELAY_2_PIN         22  // Channel 2: Bedroom Light
#endif
#ifndef RELAY_3_PIN
  #define RELAY_3_PIN         21  // Channel 3: Kitchen Light
#endif
#ifndef RELAY_4_PIN
  #define RELAY_4_PIN         19  // Channel 4: Bathroom Light
#endif
#ifndef DHT_PIN
  #define DHT_PIN             4   // DHT11 / DS18B20 Sensor Data Pin
#endif
#ifndef STATUS_LED_PIN
  #define STATUS_LED_PIN      2   // Built-in Blue Status LED
#endif

// Timing Fallbacks (milliseconds)
#ifndef TELEMETRY_INTERVAL
  #define TELEMETRY_INTERVAL  5000  // 5 seconds
#endif
#ifndef WIFI_RETRY_INTERVAL
  #define WIFI_RETRY_INTERVAL 10000 // 10 seconds
#endif

// Note: In Phase 2, install "Firebase-ESP-Client" by Mobizt and "DHT sensor library" by Adafruit
// #include <Firebase_ESP_Client.h>
// #include <addons/TokenHelper.h>
// #include <addons/RTDBHelper.h>
// #include <DHT.h>

// --- Device & Pin Definitions ---
struct RelayChannel {
  const char* id;
  const char* name;
  uint8_t pin;
  bool activeLow;
  bool currentState;
};

// Map the 4 independent light channels
RelayChannel relays[4] = {
  { "living_room_light", "Living Room Light", RELAY_1_PIN, true, false },
  { "bedroom_light",     "Bedroom Light",     RELAY_2_PIN, true, false },
  { "kitchen_light",     "Kitchen Light",     RELAY_3_PIN, true, false },
  { "bathroom_light",    "Bathroom Light",    RELAY_4_PIN, true, false }
};

// Global Timing Trackers
unsigned long lastTelemetryMillis = 0;
unsigned long lastHeartbeatMillis = 0;
unsigned long lastWifiCheckMillis = 0;

// --- Function Declarations (prevents undeclared symbol errors) ---
void connectWiFi();
void initFirebase();
void setRelayState(int index, bool turnOn);
void readAndPublishTemperature();
void publishHeartbeat();

/**
 * Hardware Setup Routine
 */
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=======================================================");
  Serial.println("[ESP32] Smart Home Automation Node — 4 Lights & Temp");
  Serial.println("=======================================================");

  // 1. Initialize 4 Relay Pins safely to OFF state before setting OUTPUT
  // Setting digitalWrite before pinMode prevents momentary bootup relay click
  for (int i = 0; i < 4; i++) {
    digitalWrite(relays[i].pin, relays[i].activeLow ? HIGH : LOW);
    pinMode(relays[i].pin, OUTPUT);
    relays[i].currentState = false;
    Serial.printf("[Relay Init] Channel %d: %s on GPIO %d -> OFF (Safe)\n", 
                  i + 1, relays[i].name, relays[i].pin);
  }

  // 2. Initialize Temperature Sensor & Status LED Pins
  pinMode(DHT_PIN, INPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  // 3. Connect to Wi-Fi Network
  connectWiFi();

  // 4. Firebase Client Initialization (Phase 2)
  initFirebase();

  Serial.println("[ESP32] Setup sequence complete. Node entering loop.\n");
}

/**
 * Main Continuous Loop
 */
void loop() {
  unsigned long currentMillis = millis();

  // 1. Wi-Fi Watchdog & Health Check
  if (currentMillis - lastWifiCheckMillis >= WIFI_RETRY_INTERVAL) {
    lastWifiCheckMillis = currentMillis;
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[Wi-Fi Watchdog] Connection lost. Reconnecting...");
      digitalWrite(STATUS_LED_PIN, LOW);
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    } else {
      digitalWrite(STATUS_LED_PIN, HIGH); // Steady status LED when online
    }
  }

  // 2. Temperature Telemetry Read & Push (Every 5 seconds)
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL) {
    lastTelemetryMillis = currentMillis;
    readAndPublishTemperature();
  }

  // 3. Controller Heartbeat Pulse (Every 15 seconds)
  if (currentMillis - lastHeartbeatMillis >= 15000) {
    lastHeartbeatMillis = currentMillis;
    publishHeartbeat();
  }

  // Small non-blocking yield to maintain watchdog stability
  delay(10);
}

/**
 * Connect to Local Wi-Fi
 */
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

/**
 * Initialize Firebase Realtime Database Client (Phase 2 Scaffold)
 */
void initFirebase() {
  Serial.println("[Firebase] Initializing client scaffold (4 Lights + 1 Temp Sensor)...");
  /*
    PHASE 2 IMPLEMENTATION:
    FirebaseConfig fbConfig;
    FirebaseAuth fbAuth;

    fbConfig.host = FIREBASE_HOST;
    fbConfig.api_key = FIREBASE_AUTH_KEY;
    fbAuth.user.email = USER_EMAIL;
    fbAuth.user.password = USER_PASSWORD;

    Firebase.begin(&fbConfig, &fbAuth);
    Firebase.reconnectWiFi(true);

    // Stream listener for 4 light commands: /home/devices
    if (!Firebase.RTDB.beginStream(&streamData, "/home/devices")) {
      Serial.printf("[Firebase Stream] Failed: %s\n", streamData.errorReason().c_str());
    } else {
      Firebase.RTDB.setStreamCallback(&streamData, streamCallback, streamTimeoutCallback);
    }
  */
}

/**
 * Actuate an Independent Relay and Report State to Database
 *
 * @param index - Index in relays array (0 to 3)
 * @param turnOn - Desired state (true = ON, false = OFF)
 */
void setRelayState(int index, bool turnOn) {
  if (index < 0 || index >= 4) return;

  relays[index].currentState = turnOn;
  int pinValue = relays[index].activeLow ? (turnOn ? LOW : HIGH) : (turnOn ? HIGH : LOW);
  digitalWrite(relays[index].pin, pinValue);

  Serial.printf("[Relay Actuate] %s (GPIO %d) -> %s\n", 
                relays[index].name, relays[index].pin, turnOn ? "ON" : "OFF");

  // Report physical confirmation to Firebase:
  // Firebase.RTDB.setBoolAsync(&fbData, String("/home/devices/") + relays[index].id + "/state", turnOn);
}

/**
 * Reads Physical Temperature Sensor (DHT11/DS18B20) and Publishes Telemetry
 */
void readAndPublishTemperature() {
  // In physical hardware phase, read via DHT library:
  // float temp = dht.readTemperature();
  // For starter scaffold, realistic baseline:
  float temperature = 28.5;

  Serial.printf("[Sensor Telemetry] Room Temperature: %.1f °C (DHT11 on GPIO %d)\n", 
                temperature, DHT_PIN);

  /*
    PHASE 2 PUBLISH:
    FirebaseJson json;
    json.set("value", temperature);
    json.set("unit", "C");
    json.set("timestamp", (double)millis());
    Firebase.RTDB.updateNodeAsync(&fbData, "/home/sensors/temperature", &json);
  */
}

/**
 * Reports Controller Node Heartbeat
 */
void publishHeartbeat() {
  Serial.println("[Heartbeat] ESP32 Controller alive.");
  /*
    PHASE 2 PUBLISH:
    Firebase.RTDB.setBoolAsync(&fbData, "/home/controller/online", true);
  */
}
