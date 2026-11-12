const getEnv = (key, fallback) => {
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};
export const AppConfig = {
  DEMO_MODE: true,
  APP_NAME: 'HOME Smart Automation Prototype',
  VERSION: '1.0.0-prototype',
  ENVIRONMENT: 'production',
  TELEMETRY_INTERVAL_MS: 5000,
  TIME_TICK_INTERVAL_MS: 1000,
  FIREBASE: {
    apiKey: getEnv('FIREBASE_API_KEY', 'AIzaSy_DEMO_PLACEHOLDER_KEY'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN', 'smart-home-demo.firebaseapp.com'),
    databaseURL: getEnv('FIREBASE_DATABASE_URL', 'https://smart-home-demo-default-rtdb.firebaseio.com'),
    projectId: getEnv('FIREBASE_PROJECT_ID', 'smart-home-demo'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', 'smart-home-demo.appspot.com'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', '000000000000'),
    appId: getEnv('FIREBASE_APP_ID', '1:000000000000:web:0000000000000000000000')
  },
  RTDB_PATHS: {
    ROOT: 'home',
    DEVICES: 'home/devices',
    SENSORS_TEMP: 'home/sensors/temperature',
    CONTROLLER: 'home/controller'
  },
  INITIAL_DEVICE_SCHEMA: {
    living_room_light: { command: false, state: false, room: 'Living Room' },
    bedroom_light: { command: false, state: false, room: 'Bedroom' },
    kitchen_light: { command: false, state: false, room: 'Kitchen' },
    bathroom_light: { command: false, state: false, room: 'Bathroom' }
  },
  INITIAL_SENSOR_SCHEMA: {
    temperature: {
      value: 28.5,
      unit: 'C'
    }
  },
  CONTROLLER_SCHEMA: {
    online: false,
    hardware: 'ESP32 (NodeMCU-32S)',
    relayChannels: 4
  }
};
export default AppConfig;
