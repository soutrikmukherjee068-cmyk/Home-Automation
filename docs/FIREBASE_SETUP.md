# Firebase Realtime Database Provisioning Guide
## Scope: 4 Lights + 1 Temperature Sensor + ESP32 Controller

This document outlines the step-by-step procedure for configuring Google Firebase Realtime Database for the **HOME** college prototype.

---

## 1. Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter `smart-home-automation` (or your preferred name).
3. Disable Google Analytics (not required for prototype RTDB).
4. Click **Create Project** and await provisioning.

---

## 2. Register Web Application

1. On project overview, click the **Web icon (`</>`)** to register a web app.
2. Enter an app nickname: `smart-home-web`.
3. Do not check Firebase Hosting (Vercel is used as our primary host).
4. Copy the generated `firebaseConfig` object containing:
   - `apiKey`
   - `authDomain`
   - `databaseURL`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

---

## 3. Provision Realtime Database

1. In the Firebase console left sidebar, navigate to **Build** → **Realtime Database**.
2. Click **Create Database**.
3. Select a location close to your physical location (e.g., `us-central1` or `asia-southeast1`).
4. Select **Start in locked mode** and click **Enable**.

---

## 4. Database Security Rules

Replace the default database rules with the following least-privilege security policy:

```json
{
  "rules": {
    "home": {
      "devices": {
        ".read": true,
        "$lightId": {
          "command": {
            ".write": true
          },
          "state": {
            ".write": true
          }
        }
      },
      "sensors": {
        "temperature": {
          ".read": true,
          ".write": true
        }
      },
      "controller": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

*Note: For a secure deployment with authentication, replace `true` with `auth != null`.*

---

## 5. Seed Initial Database Structure

Import or manually insert the following JSON structure into your Realtime Database root:

```json
{
  "home": {
    "devices": {
      "living_room_light": {
        "command": false,
        "state": false
      },
      "bedroom_light": {
        "command": false,
        "state": false
      },
      "kitchen_light": {
        "command": false,
        "state": false
      },
      "bathroom_light": {
        "command": false,
        "state": false
      }
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

---

## 6. Frontend Configuration

In `backend/config.js` or via `.env`, configure credentials and mode:

```javascript
export const AppConfig = {
  DEMO_MODE: false, // Set to false when ready for active RTDB communication
  FIREBASE: {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
  }
};
```