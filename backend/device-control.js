/**
 * ============================================================================
 * HOME — Device Control System Abstraction
 * ============================================================================
 * Manages device commands, hardware acknowledgments, and state synchronization.
 * Designed to cleanly bridge simulated local state with Firebase Realtime Database
 * without coupling UI logic directly to network protocols.
 */

import { AppConfig } from './config.js';
import { getFirebaseDB } from './firebase.js';

class DeviceControlService {
  constructor() {
    this.devices = new Map();
    this.listeners = new Set();
    this.initDefaultDevices();
  }

  /**
   * Initializes baseline device states.
   */
  initDefaultDevices() {
    Object.entries(AppConfig.INITIAL_DEVICE_SCHEMA).forEach(([id, schema]) => {
      this.devices.set(id, {
        id,
        command: schema.command,
        state: schema.state,
        online: schema.online,
        room: schema.room,
        lastUpdated: new Date().toISOString()
      });
    });
  }

  /**
   * Dispatches a user command to toggle or set a device state.
   *
   * ARCHITECTURAL PATTERN:
   * 1. In demo mode: 'command' and 'state' update immediately.
   * 2. In Firebase mode: 'command' is pushed to `home/devices/{id}/command`.
   *    The hardware ESP32 reads 'command', drives the relay, and writes back
   *    to `home/devices/{id}/state` upon physical confirmation.
   *
   * @param {string} deviceId - Target appliance identifier
   * @param {boolean} targetState - Desired state (true = ON, false = OFF)
   * @returns {Promise<{success: boolean, deviceId: string, state: boolean}>}
   */
  async sendCommand(deviceId, targetState) {
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device '${deviceId}' not found in registry.`);
    }

    const device = this.devices.get(deviceId);

    if (AppConfig.DEMO_MODE) {
      // Simulated immediate acknowledgment
      device.command = targetState;
      device.state = targetState;
      device.lastUpdated = new Date().toISOString();
      this.notifyListeners(deviceId, device);
      return { success: true, deviceId, state: targetState, mode: 'demo' };
    }

    // Planned Firebase RTDB Synchronization (Phase 2)
    const db = getFirebaseDB();
    if (!db) {
      throw new Error('Firebase Database client is not initialized.');
    }

    try {
      /*
        Example Firebase v9/v10 Modular SDK invocation:
        import { ref, update } from 'firebase/database';
        await update(ref(db, `${AppConfig.RTDB_PATHS.DEVICES}/${deviceId}`), {
          command: targetState,
          timestamp: Date.now()
        });
      */
      device.command = targetState;
      this.notifyListeners(deviceId, device);
      return { success: true, deviceId, state: targetState, mode: 'firebase-pending' };
    } catch (err) {
      console.error(`Failed to dispatch command for ${deviceId}:`, err);
      throw err;
    }
  }

  /**
   * Retrieves the current snapshot of a device.
   * @param {string} deviceId
   */
  getDevice(deviceId) {
    return this.devices.get(deviceId) || null;
  }

  /**
   * Retrieves all registered devices.
   * @returns {Array<Object>}
   */
  getAllDevices() {
    return Array.from(this.devices.values());
  }

  /**
   * Subscribes a callback to device state updates.
   * @param {Function} callback - Signature: (deviceId, updatedDevice) => void
   * @returns {Function} Unsubscribe handle
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifies registered listeners of a state modification.
   */
  notifyListeners(deviceId, device) {
    this.listeners.forEach(cb => {
      try {
        cb(deviceId, device);
      } catch (e) {
        console.error('Error in device change listener:', e);
      }
    });
  }

  /**
   * Simulates hardware acknowledgment for testing edge cases.
   * @param {string} deviceId
   * @param {boolean} confirmedState
   */
  simulateHardwareAck(deviceId, confirmedState) {
    if (this.devices.has(deviceId)) {
      const dev = this.devices.get(deviceId);
      dev.state = confirmedState;
      this.notifyListeners(deviceId, dev);
    }
  }
}

export const deviceControlService = new DeviceControlService();
export default deviceControlService;
