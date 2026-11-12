/**
 * ============================================================================
 * HOME — Sensor Telemetry Service
 * Scope: Exactly 1 Temperature Sensor (DHT11 / DS18B20)
 * ============================================================================
 * Manages temperature sensor telemetry.
 * In Demo Mode, generates realistic simulated values with natural drift.
 * In Phase 2, binds directly to Firebase Realtime Database live listeners at
 * `home/sensors/temperature`.
 */

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

  /**
   * Initializes sensor subscriptions or simulated telemetry ticks.
   */
  start() {
    if (AppConfig.DEMO_MODE) {
      this.startSimulation();
      return;
    }

    // Planned Firebase RTDB Listener (Phase 2)
    const db = getFirebaseDB();
    if (!db) {
      console.warn('Firebase not ready. Falling back to temperature simulation.');
      this.startSimulation();
      return;
    }

    this.subscribeToFirebase();
  }

  /**
   * Starts local temperature simulation with physical thermal drift.
   */
  startSimulation() {
    if (this.simTimer) clearInterval(this.simTimer);

    this.simTimer = setInterval(() => {
      // Natural thermal variance (-0.2°C to +0.2°C, bounded 26.5°C – 30.5°C)
      const tempVariance = (Math.random() - 0.5) * 0.4;
      this.telemetry.temperature = parseFloat(
        Math.min(30.5, Math.max(26.5, this.telemetry.temperature + tempVariance)).toFixed(1)
      );

      this.telemetry.lastUpdated = new Date().toISOString();
      this.notify();
    }, AppConfig.TELEMETRY_INTERVAL_MS);
  }

  /**
   * Planned Firebase Realtime Database Telemetry Hook (Phase 2).
   */
  subscribeToFirebase() {
    /*
      Example Firebase modular subscriber:
      import { ref, onValue } from 'firebase/database';
      const tempRef = ref(db, AppConfig.RTDB_PATHS.SENSORS_TEMP);
      onValue(tempRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data.value === 'number') {
          this.telemetry.temperature = data.value;
          this.telemetry.unit = data.unit || 'C';
          this.telemetry.lastUpdated = new Date().toISOString();
          this.notify();
        }
      });
    */
    console.info('Firebase temperature subscriber placeholder initialized.');
  }

  /**
   * Retrieves the current snapshot of temperature telemetry.
   */
  getTelemetry() {
    return { ...this.telemetry };
  }

  /**
   * Subscribes a listener to temperature updates.
   * @param {Function} callback - Signature: (telemetry) => void
   * @returns {Function} Unsubscribe handle
   */
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getTelemetry());
    return () => this.listeners.delete(callback);
  }

  /**
   * Dispatches updates to all active subscribers.
   */
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

  /**
   * Stops simulation timer and cleans up subscribers.
   */
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