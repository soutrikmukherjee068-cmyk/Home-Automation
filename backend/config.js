/**
 * ============================================================================
 * HOME — Backend & Integration Configuration
 * Scope: 4 Independent Lights + 1 Temperature Sensor + ESP32 Controller
 * ============================================================================
 * This file governs the connectivity state of the smart home system.
 * By default, DEMO_MODE is strictly set to TRUE to ensure zero unauthorized
 * network calls and provide a clean local testing experience.
 */

// Safe environment accessor that works across Node.js, Bun, and browser environments
const getEnv = (key, fallback) => {
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

export const AppConfig = {
  // Global Mode Switch: set to false ONLY when active Firebase instance is provisioned
  DEMO_MODE: true,

  // Application Metadata
  APP_NAME: 'HOME Smart Automation Prototype',
  VERSION: '1.0.0-prototype',
  ENVIRONMENT: 'production',

  // Telemetry simulation interval (in milliseconds)
  TELEMETRY_INTERVAL_MS: 5000,
  TIME_TICK_INTERVAL_MS: 1000,

  // Firebase Realtime Database Configuration Scaffold
  // Supply actual project credentials via environment variables during live integration
  FIREBASE: {
    apiKey: getEnv('FIREBASE_API_KEY', 'AIzaSy_DEMO_PLACEHOLDER_KEY'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN', 'smart-home-demo.firebaseapp.com'),
    databaseURL: getEnv('FIREBASE_DATABASE_URL', 'https://smart-home-demo-default-rtdb.firebaseio.com'),
    projectId: getEnv('FIREBASE_PROJECT_ID', 'smart-home-demo'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', 'smart-home-demo.appspot.com'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', '000000000000'),
    appId: getEnv('FIREBASE_APP_ID', '1:000000000000:web:0000000000000000000000')
  },

  // Database Schema Paths for ESP32 & Web Synchronization
  RTDB_PATHS: {
    ROOT: 'home',
    DEVICES: 'home/devices',
    SENSORS_TEMP: 'home/sensors/temperature',
    CONTROLLER: 'home/controller'
  },

  // Scope: Exactly 4 Lights Schema
  INITIAL_DEVICE_SCHEMA: {
    living_room_light: { command: false, state: false, room: 'Living Room' },
    bedroom_light: { command: false, state: false, room: 'Bedroom' },
    kitchen_light: { command: false, state: false, room: 'Kitchen' },
    bathroom_light: { command: false, state: false, room: 'Bathroom' }
  },

  // Scope: Single Temperature Sensor Schema
  INITIAL_SENSOR_SCHEMA: {
    temperature: {
      value: 28.5,
      unit: 'C'
    }
  },

  // ESP32 Controller Node Schema
  CONTROLLER_SCHEMA: {
    online: false,
    hardware: 'ESP32 (NodeMCU-32S)',
    relayChannels: 4
  }
};

export default AppConfig;