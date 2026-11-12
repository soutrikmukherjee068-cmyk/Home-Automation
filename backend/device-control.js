import { AppConfig } from './config.js';
import { getFirebaseDB } from './firebase.js';
class DeviceControlService {
  constructor() {
    this.devices = new Map();
    this.listeners = new Set();
    this.initDefaultDevices();
  }
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
  async sendCommand(deviceId, targetState) {
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device '${deviceId}' not found in registry.`);
    }
    const device = this.devices.get(deviceId);
    if (AppConfig.DEMO_MODE) {
      device.command = targetState;
      device.state = targetState;
      device.lastUpdated = new Date().toISOString();
      this.notifyListeners(deviceId, device);
      return { success: true, deviceId, state: targetState, mode: 'demo' };
    }
    const db = getFirebaseDB();
    if (!db) {
      throw new Error('Firebase Database client is not initialized.');
    }
    try {
      device.command = targetState;
      this.notifyListeners(deviceId, device);
      return { success: true, deviceId, state: targetState, mode: 'firebase-pending' };
    } catch (err) {
      console.error(`Failed to dispatch command for ${deviceId}:`, err);
      throw err;
    }
  }
  getDevice(deviceId) {
    return this.devices.get(deviceId) || null;
  }
  getAllDevices() {
    return Array.from(this.devices.values());
  }
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  notifyListeners(deviceId, device) {
    this.listeners.forEach(cb => {
      try {
        cb(deviceId, device);
      } catch (e) {
        console.error('Error in device change listener:', e);
      }
    });
  }
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
