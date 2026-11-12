import { AppConfig } from './config.js';
let firebaseApp = null;
let realtimeDb = null;
let authClient = null;
export function isFirebaseConfigValid(config = AppConfig.FIREBASE) {
  if (!config) return false;
  const isKeyPlaceholder = !config.apiKey || config.apiKey.includes('DEMO_PLACEHOLDER');
  const isUrlPlaceholder = !config.databaseURL || config.databaseURL.includes('demo');
  return !isKeyPlaceholder && !isUrlPlaceholder;
}
export function initializeFirebaseClient(customConfig = null) {
  const config = customConfig || AppConfig.FIREBASE;
  if (AppConfig.DEMO_MODE) {
    console.info('[Firebase] Application is operating in DEMO_MODE. Network connection skipped.');
    return null;
  }
  if (!isFirebaseConfigValid(config)) {
    console.warn('[Firebase] Configuration is missing or contains placeholder values. Connection halted.');
    return null;
  }
  try {
    console.info('[Firebase] Ready for Phase 2 Modular SDK integration.');
    return null;
  } catch (error) {
    console.error('[Firebase] Initialization error encountered:', error);
    return null;
  }
}
export function getFirebaseDB() {
  return realtimeDb;
}
export function getFirebaseAuth() {
  return authClient;
}
export default {
  initializeFirebaseClient,
  isFirebaseConfigValid,
  getFirebaseDB,
  getFirebaseAuth
};
