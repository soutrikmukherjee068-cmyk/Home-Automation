# System Architecture — HOME Smart Automation (College Prototype)

## 1. Overview

The **HOME** smart automation system is engineered using a decoupled, event-driven Internet of Things (IoT) architecture designed for a polytechnic diploma college demonstration. The system is intentionally scoped to:
- **4 Independently Controlled Lights**: Living Room, Bedroom, Kitchen, Bathroom.
- **1 Temperature Sensor**: DHT11 or DS18B20 digital temperature sensor.
- **1 ESP32 Microcontroller**: Interfaced with a 4-channel relay module.

```
┌─────────────────────────────────┐
│     Client Web Dashboard        │  (HTML5 / CSS3 / Vanilla JS ES6+)
│     - Responsive (360px–1440px) │  - 4 Independent Light Toggles
│     - Light & Dark Themes       │  - Dedicated Temperature Monitor
│     - Activity Log & Diagnostics│  - ESP32 Hardware Status
└───────────────▲─────────────────┘
                │ WebSockets / HTTPS Stream
                ▼
┌─────────────────────────────────┐
│ Google Firebase Realtime DB     │  (Central Source of Truth)
│ /home/devices/{id}/command      │  <-- Requested user state
│ /home/devices/{id}/state        │  --> Physical relay confirmation
│ /home/sensors/temperature       │  --> Telemetry ({ value, unit })
│ /home/controller/online         │  --> Controller heartbeat
└───────────────▲─────────────────┘
                │ TLS WebSockets / Stream
                ▼
┌─────────────────────────────────┐
│  ESP32 Microcontroller Node     │  (NodeMCU-32S / ESP-WROOM-32)
│  - 4-Channel Relay Module       │  - Relay 1: Living Room Light (GPIO 23)
│  - 1 Temperature Sensor (DHT11) │  - Relay 2: Bedroom Light (GPIO 22)
│  - Wi-Fi Reconnection Watchdog │  - Relay 3: Kitchen Light (GPIO 21)
│  - Safe Startup (All Relays OFF)│  - Relay 4: Bathroom Light (GPIO 19)
└─────────────────────────────────┘  - Temp Data Pin: GPIO 4
```

---

## 2. Asynchronous State Decoupling Pattern

To ensure high reliability, the system separates **requested commands** from **reported hardware state**:

```json
{
  "home": {
    "devices": {
      "living_room_light": { "command": false, "state": false },
      "bedroom_light": { "command": false, "state": false },
      "kitchen_light": { "command": false, "state": false },
      "bathroom_light": { "command": false, "state": false }
    },
    "sensors": {
      "temperature": {
        "value": 28.5,
        "unit": "C"
      }
    },
    "controller": {
      "online": false
    }
  }
}
```

1. **User Action**: The dashboard user toggles a light switch. The web client writes `command: true` to `/home/devices/{lightId}/command`.
2. **Transmission**: Firebase pushes the updated `command` to the listening ESP32 via RTDB stream.
3. **Physical Actuation**: The ESP32 receives the event, pulls the relay GPIO low/high, confirms physical pin status, and publishes `state: true` back to Firebase.
4. **Client Confirmation**: The dashboard receives the updated `state`, confirming hardware actuation.
5. **Fault Tolerance**: If the ESP32 is powered off or disconnected from Wi-Fi, `command` changes, but `state` does not update, and the heartbeat indicates `online: false`. The user is immediately aware of hardware unavailability.

---

## 3. Directory Layout & Layer Boundaries

```
smart-home-automation/
│
├── frontend/
│   ├── index.html         # Semantic accessible HTML5 dashboard
│   ├── style.css          # Minimalist design system (Light/Dark themes)
│   ├── script.js          # Pure vanilla ES6+ controller & demo state
│   └── assets/            # Standalone SVG logo and offline icon assets
│
├── backend/
│   ├── config.js          # Application config, demo switches, and RTDB paths
│   ├── device-control.js  # 4-Light command and state abstraction
│   ├── sensor-data.js     # Single temperature telemetry service
│   └── firebase.js        # Firebase Realtime Database SDK scaffold
│
├── esp32/
│   ├── main.ino           # Arduino/ESP32 firmware starter scaffold (4 relays, 1 DHT11)
│   └── config.example.h   # Wi-Fi, Firebase, and GPIO configuration template
│
├── docs/
│   ├── ARCHITECTURE.md    # This document
│   ├── FIREBASE_SETUP.md  # Firebase configuration and security rules guide
│   └── ESP32_INTEGRATION.md # Hardware wiring, pinout, and flashing guide
│
├── .gitignore
├── .env.example
├── vercel.json
└── README.md
```

---

## 4. Hardware Safety Specifications

1. **Active LOW Relay Logic**: Most optocoupler-isolated relay modules trigger on LOW input. During MCU bootup, pins can float; therefore, pins are driven `HIGH` before `pinMode(pin, OUTPUT)` is engaged to prevent relays from pulsing at boot.
2. **Independent Channel Operation**: Each of the 4 relay channels operates independently on its own GPIO line. Switching one channel has zero effect on any other channel.
3. **Mains Isolation**: In physical demonstration, low-voltage 5V/12V DC indicator bulbs or LEDs can safely represent AC mains lights for academic presentation without electrical hazard.