import { AppConfig } from './config.js';
import { getFirebaseDB } from './firebase.js';
class SensorDataService {
  constructor() {
    this.telemetry = {
      temperature: 28.5,
      unit: 'C',
      sensor: 'DHT11',
      lastUpdated: new Date().toISOString()
    };
    this.listeners = new Set();
    this.simTimer = null;
  }
  start() {
    if (AppConfig.DEMO_MODE) {
      this.startSimulation();
      return;
    }
    const db = getFirebaseDB();
    if (!db) {
      console.warn('Firebase not ready. Falling back to temperature simulation.');
      this.startSimulation();
      return;
    }
    this.subscribeToFirebase();
  }
  startSimulation() {
    if (this.simTimer) clearInterval(this.simTimer);
    this.simTimer = setInterval(() => {
      const tempVariance = (Math.random() - 0.5) * 0.4;
      this.telemetry.temperature = parseFloat(
        Math.min(30.5, Math.max(26.5, this.telemetry.temperature + tempVariance)).toFixed(1)
      );
      this.telemetry.lastUpdated = new Date().toISOString();
      this.notify();
    }, AppConfig.TELEMETRY_INTERVAL_MS);
  }
  subscribeToFirebase() {
    console.info('Firebase temperature subscriber placeholder initialized.');
  }
  getTelemetry() {
    return { ...this.telemetry };
  }
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getTelemetry());
    return () => this.listeners.delete(callback);
  }
  notify() {
    const snapshot = this.getTelemetry();
    this.listeners.forEach(cb => {
      try {
        cb(snapshot);
      } catch (err) {
        console.error('Error notifying sensor subscriber:', err);
      }
    });
  }
  destroy() {
    if (this.simTimer) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
    this.listeners.clear();
  }
}
export const sensorDataService = new SensorDataService();
export default sensorDataService;
