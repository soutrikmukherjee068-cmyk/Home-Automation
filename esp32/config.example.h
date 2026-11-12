/**
 * ============================================================================
 * ESP32 Smart Home Node — Configuration Template
 * Prototype Scope: 4 Lights + 1 Temperature Sensor (DHT11/DS18B20)
 * ============================================================================
 * Copy this file to "config.h" and insert your local network parameters.
 * IMPORTANT: NEVER commit your actual "config.h" or production credentials to Git!
 */

#ifndef CONFIG_EXAMPLE_H
#define CONFIG_EXAMPLE_H

// 1. Wi-Fi Access Point Credentials
#define WIFI_SSID           "YOUR_WIFI_SSID_HERE"
#define WIFI_PASSWORD       "YOUR_WIFI_PASSWORD_HERE"

// 2. Google Firebase Project Configuration
#define FIREBASE_HOST       "your-project-id-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH_KEY   "YOUR_FIREBASE_DATABASE_SECRET_OR_WEB_API_KEY"

// 3. User Authentication (Optional for Firebase Token Auth)
#define USER_EMAIL          "home-node@yourdomain.com"
#define USER_PASSWORD       "NODE_SECRET_PASSPHRASE"

// 4. GPIO Pin Assignments (NodeMCU-32S Pinout)
// 4-Channel Relay Outputs (Active LOW: LOW = ON, HIGH = OFF)
#define RELAY_1_PIN         23  // Channel 1: Living Room Light
#define RELAY_2_PIN         22  // Channel 2: Bedroom Light
#define RELAY_3_PIN         21  // Channel 3: Kitchen Light
#define RELAY_4_PIN         19  // Channel 4: Bathroom Light

// 1 Dedicated Temperature Sensor Input
#define DHT_PIN             4   // DHT11 / DS18B20 Temperature Sensor Data Pin
#define STATUS_LED_PIN      2   // Built-in Blue LED for network heartbeat

// 5. Timing Parameters (in milliseconds)
#define TELEMETRY_INTERVAL  5000  // Push temperature every 5 seconds
#define WIFI_RETRY_INTERVAL 10000 // Attempt reconnect every 10 seconds

#endif // CONFIG_EXAMPLE_H