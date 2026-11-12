# ESP32 Hardware Integration & Firmware Flashing Guide
## Scope: 4 Independent Lights + 1 Temperature Sensor (College Prototype)

This document provides complete instructions for wiring, configuring, and flashing an ESP32 microcontroller to act as the physical controller node for the **HOME** automation college prototype.

---

## 1. Bill of Materials (Hardware Scope)

| Component | Quantity | Description |
| :--- | :--- | :--- |
| **ESP32 Dev Module** | 1 | NodeMCU-32S / ESP-WROOM-32 (30-pin or 38-pin) |
| **4-Channel Relay Board** | 1 | 5V Optocoupler-isolated relay module (Active LOW) |
| **Temperature Sensor** | 1 | DHT11 digital temperature sensor (or DS18B20) |
| **Indicator Lights / Bulbs** | 4 | Low-voltage 5V/12V DC test bulbs or mains lamps with qualified supervision |
| **5V 2A DC Power Supply** | 1 | Power source for ESP32 and relay coils |
| **Jumper Wires & Breadboard**| - | DuPont male-to-female and male-to-male jumper leads |

> **COLLEGE DEMO SAFETY NOTE**: For laboratory and academic presentation, we strongly recommend using 5V/12V DC indicator LEDs or small lamps rather than 220V AC mains electricity. If AC mains wiring is demonstrated, it must be performed inside a certified enclosure under qualified supervision.

---

## 2. GPIO Pinout Mapping

```
+-----------------------------------------------------------+
| ESP32 Pin   | Component              | Function           |
+-------------+------------------------+--------------------+
| GPIO 23     | Relay Channel 1 IN     | Living Room Light  |
| GPIO 22     | Relay Channel 2 IN     | Bedroom Light      |
| GPIO 21     | Relay Channel 3 IN     | Kitchen Light      |
| GPIO 19     | Relay Channel 4 IN     | Bathroom Light     |
| GPIO 4      | DHT11 DATA (with pull) | Room Temperature   |
| GPIO 2      | Onboard LED            | Wi-Fi Heartbeat    |
| 5V (VIN)    | Relay VCC & Power In   | 5V DC Power        |
| GND         | Common Ground          | Shared System GND  |
+-----------------------------------------------------------+
```

---

## 3. Circuit Wiring Schematic

```
ESP32 NodeMCU-32S             4-Channel Relay Module
┌──────────────────┐          ┌──────────────────────┐
│                  │          │                      │
│        GPIO 23 ──┼──────────┼── IN1 (Living Room)  │
│        GPIO 22 ──┼──────────┼── IN2 (Bedroom)      │
│        GPIO 21 ──┼──────────┼── IN3 (Kitchen)      │
│        GPIO 19 ──┼──────────┼── IN4 (Bathroom)     │
│        5V (VIN) ─┼──────────┼── VCC                │
│             GND ─┼──────────┼── GND                │
│                  │          └──────────────────────┘
│                  │          DHT11 Temperature Sensor
│                  │          ┌──────────────────────┐
│         GPIO 4 ──┼──────────┼── DATA (Pin 2)       │
│        3.3V/5V ──┼──────────┼── VCC (Pin 1)        │
│             GND ─┼──────────┼── GND (Pin 4)        │
└──────────────────┘          └──────────────────────┘
```

---

## 4. Flashing Instructions

1. **Install Arduino IDE 2.x** or VS Code with PlatformIO.
2. **Add ESP32 Board URL**:
   - In Arduino IDE Preferences, add:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - In Board Manager, install **esp32 by Espressif Systems**.
3. **Install Libraries**:
   - Open Library Manager (`Ctrl+Shift+I`)
   - Install **Firebase-ESP-Client** by Mobizt
   - Install **DHT sensor library** by Adafruit
4. **Prepare Configuration**:
   - In `esp32/`, copy `config.example.h` to `config.h`.
   - Set your 2.4GHz Wi-Fi SSID and Password.
   - Enter your Firebase Project Host and Web API Key.
5. **Compile & Upload**:
   - Connect the ESP32 via Micro-USB / USB-C.
   - Select Board: **ESP32 Dev Module**.
   - Select the active COM port.
   - Press **Upload**.
6. **Verify Serial Monitor**:
   - Open Serial Monitor at **115200 baud**.
   - Confirm relay pin initialization to OFF state.
   - Confirm Wi-Fi connection and assigned IP address.
   - Observe simulated or live temperature output.