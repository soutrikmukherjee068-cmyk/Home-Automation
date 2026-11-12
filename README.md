# HOME — Smart Home Automation Dashboard (College Prototype)

A minimalist, high-performance Smart Home Automation prototype dashboard designed for a polytechnic diploma college demonstration. Built with pure vanilla web standards (HTML5, CSS3, ES6+ JavaScript, Lucide Icons).

Engineered for seamless integration with an **ESP32 microcontroller** and **4-Channel Relay Module** via **Google Firebase Realtime Database**.

---

## 1. Project Overview & Prototype Scope

**HOME** delivers a streamlined control plane for household lighting and room temperature monitoring. Inspired by the clean, functional aesthetics of Apple Home and Linear, it eliminates unnecessary visual clutter, neon glows, and heavy JavaScript frameworks in favor of a fast, accessible, and lightweight static application.

### Prototype Scope

- **4 Independently Controlled Lights**:
  1. Living Room Light
  2. Bedroom Light
  3. Kitchen Light
  4. Bathroom Light
- **1 Dedicated Temperature Sensor**: Room Temperature (°C) with realistic simulated telemetry drift (DHT11 or DS18B20 hardware target).
- **1 ESP32 Microcontroller Controller Section**: Reports hardware target (NodeMCU-32S), connection status, communication mode, and last sync time.
- **Dynamic Dashboard Summary**:
  - Total Lights: 4
  - Active Lights: dynamically calculated (0–4)
  - Room Temperature: current sensor reading (°C)
- **Activity Log**: Real-time chronological logging of all light state changes with timestamps and clear capability.
- **Persistent Demo State**: Light states are persisted in `localStorage` and restored across page refreshes.
- **Adaptive Theming**: Native Light and Dark themes adhering to modern aesthetic design tokens, with system theme auto-detection.
- **Fully Responsive**: Verified for 360px, 390px, 430px mobile, 768px tablet, 1024px laptop, and 1440px+ desktop.

---

## 2. Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla ES6+ JavaScript
- **Icons**: Lucide Icons (with offline SVG fallbacks in `frontend/assets/icons/`)
- **Backend Architecture**: Google Firebase Realtime Database & Firebase Authentication
- **Firmware Scaffold**: C++ / Arduino for ESP32 (NodeMCU-32S) with 4-channel relay logic
- **Deployment**: Vercel Static Hosting (`frontend/`)
- **Version Control**: Git / GitHub

> **Zero Framework Overhead**: Built intentionally without React, Next.js, Vue, Angular, or TypeScript to ensure ultra-fast loading times, minimal maintenance footprint, and straightforward hosting on any static web server.

---

## 3. Repository Structure

```
smart-home-automation/
│
├── frontend/
│   ├── index.html              # Core application markup (4 lights + temp + ESP32)
│   ├── style.css               # Design system, themes & responsive layouts
│   ├── script.js               # Event handling, independent light toggles & simulation
│   └── assets/
│       ├── logo.svg            # Minimalist vector identity
│       └── icons/              # Offline SVG icon assets
│
├── backend/
│   ├── config.js               # Application configuration & DEMO_MODE toggle
│   ├── device-control.js       # 4-Light command dispatcher & state tracking
│   ├── sensor-data.js          # Single temperature telemetry service
│   └── firebase.js             # Firebase Client SDK integration scaffold
│
├── esp32/
│   ├── main.ino                # Arduino C++ firmware (4 relays, 1 DHT11, Wi-Fi watchdog)
│   └── config.example.h        # Credential & GPIO mapping template
│
├── docs/
│   ├── ARCHITECTURE.md         # System design, data flow & decoupled state patterns
│   ├── FIREBASE_SETUP.md       # Step-by-step database provisioning & rules
│   └── ESP32_INTEGRATION.md    # Pinouts, schematic guide & flashing instructions
│
├── .gitignore                  # Git exclusions for secrets and artifacts
├── .env.example                # Template for environment credentials
├── vercel.json                 # Static routing & build config for Vercel
└── README.md                   # Project documentation
```

---

## 4. How to Run Locally

Because the frontend is built entirely on vanilla web standards, it can be executed instantly without installing massive npm dependencies:

### Option A: Using Python built-in server
```bash
# Navigate to the frontend directory
cd frontend

# Start a local static HTTP server
python -m http.server 3000
```
Open your browser to `http://localhost:3000`.

### Option B: Using Node.js / npx
```bash
npx serve frontend
```

### Option C: Direct Browser Opening
You can directly open `frontend/index.html` in Chrome, Edge, Safari, or Firefox.

---

## 5. Demo Mode vs. Hardware Mode

The application launches by default in **DEMO MODE**:
- **Simulated Hardware**: Light switches update their visual and stored state immediately without requiring physical hardware.
- **Telemetry Simulation**: Room temperature floats around 28.5°C with realistic subtle environmental variance every 5 seconds.
- **Zero Network Errors**: No unauthorized API calls are made to Firebase until credentials are supplied.
- **Reset Capability**: The Settings modal allows resetting all lights to OFF or wiping the local cache.

To transition to active hardware mode:
1. Follow [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) to create your Firebase RTDB.
2. Follow [docs/ESP32_INTEGRATION.md](docs/ESP32_INTEGRATION.md) to wire the 4-channel relay module and DHT11.
3. In `backend/config.js`, set `DEMO_MODE: false` and supply your Firebase project keys.

---

## 6. Hardware Scope (ESP32)

| Component | Quantity | Pinout / Notes |
| :--- | :--- | :--- |
| **ESP32 NodeMCU-32S** | 1 | 30-pin microcontroller with Wi-Fi |
| **4-Channel Relay Board** | 1 | Active LOW (GPIO 23, 22, 21, 19) |
| **DHT11 Temp Sensor** | 1 | Data on GPIO 4 |
| **Indicator Lamps / LEDs** | 4 | 5V/12V DC test bulbs for academic safety |

---

## 7. Known Limitations

- **Phase 1 Status**: Real Firebase Realtime Database network connection and physical hardware actuation are prepared via architecture scaffolds and firmware code (`esp32/main.ino`), with client demo simulation active.
- **Sensors**: Scoped specifically to 1 temperature sensor; additional environmental sensors (motion, humidity, lux) are intentionally excluded to keep the project clean and focused for a college diploma demonstration.