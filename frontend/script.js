(function () {
  'use strict';
  const STORAGE_KEYS = {
    LIGHTS: 'home_lights_data_v1',
    THEME: 'home_ui_theme_v1',
    HISTORY: 'home_activity_history_v1',
    TEMP: 'home_sensor_temp_v1'
  };
  const DEFAULT_LIGHTS = [
    {
      id: 'living_room_light',
      name: 'Living Room Light',
      room: 'Living Room',
      icon: 'lightbulb',
      state: false
    },
    {
      id: 'bedroom_light',
      name: 'Bedroom Light',
      room: 'Bedroom',
      icon: 'lightbulb',
      state: false
    },
    {
      id: 'kitchen_light',
      name: 'Kitchen Light',
      room: 'Kitchen',
      icon: 'lightbulb',
      state: false
    },
    {
      id: 'bathroom_light',
      name: 'Bathroom Light',
      room: 'Bathroom',
      icon: 'lightbulb',
      state: false
    }
  ];
  const AppState = {
    lights: [],
    history: [],
    temperature: 28.5,
    theme: 'light',
    lastSyncTime: null
  };
  function loadFromStorage(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn('Storage read failed for', key, e);
      return fallback;
    }
  }
  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage write failed for', key, e);
    }
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
  function initClock() {
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');
    const greetingEl = document.getElementById('greetingText');
    function update() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      if (timeEl) {
        timeEl.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
      }
      if (greetingEl) {
        if (hours < 12) {
          greetingEl.textContent = 'Good Morning';
        } else if (hours < 17) {
          greetingEl.textContent = 'Good Afternoon';
        } else if (hours < 21) {
          greetingEl.textContent = 'Good Evening';
        } else {
          greetingEl.textContent = 'Good Night';
        }
      }
    }
    update();
    setInterval(update, 1000);
  }
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
      });
    }
    const lightChoice = document.getElementById('themeChoiceLight');
    const darkChoice = document.getElementById('themeChoiceDark');
    if (lightChoice && darkChoice) {
      lightChoice.addEventListener('click', () => applyTheme('light'));
      darkChoice.addEventListener('click', () => applyTheme('dark'));
    }
  }
  function applyTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    }
    const lightChoice = document.getElementById('themeChoiceLight');
    const darkChoice = document.getElementById('themeChoiceDark');
    if (lightChoice && darkChoice) {
      lightChoice.classList.toggle('active', theme === 'light');
      darkChoice.classList.toggle('active', theme === 'dark');
    }
    refreshIcons();
  }
  function logActivity(message) {
    const entry = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    AppState.history.unshift(entry);
    if (AppState.history.length > 40) {
      AppState.history.pop();
    }
    saveToStorage(STORAGE_KEYS.HISTORY, AppState.history);
    renderActivityFeed();
  }
  function renderActivityFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    if (AppState.history.length === 0) {
      feed.innerHTML = '<li class="empty-feed">No recorded events yet</li>';
      return;
    }
    feed.innerHTML = AppState.history
      .map(
        item => `
        <li class="activity-item">
          <span class="activity-msg">${escapeHtml(item.message)}</span>
          <time class="activity-time">${escapeHtml(item.timestamp)}</time>
        </li>
      `
      )
      .join('');
  }
  function clearHistory() {
    AppState.history = [];
    saveToStorage(STORAGE_KEYS.HISTORY, AppState.history);
    renderActivityFeed();
    showToast('Activity log cleared');
  }
  function updateDashboardMetrics() {
    const total = AppState.lights.length;
    const active = AppState.lights.filter(l => l.state).length;
    const totalEl = document.getElementById('statTotalLights');
    const activeEl = document.getElementById('statActiveLights');
    const tempOverviewEl = document.getElementById('statOverviewTemp');
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (tempOverviewEl) tempOverviewEl.textContent = `${AppState.temperature.toFixed(1)}°C`;
  }
  function initLights() {
    const stored = loadFromStorage(STORAGE_KEYS.LIGHTS, null);
    if (stored && Array.isArray(stored) && stored.length === 4) {
      AppState.lights = stored;
    } else {
      AppState.lights = JSON.parse(JSON.stringify(DEFAULT_LIGHTS));
      saveToStorage(STORAGE_KEYS.LIGHTS, AppState.lights);
    }
    renderLights();
    updateDashboardMetrics();
  }
  function renderLights() {
    const grid = document.getElementById('deviceGrid');
    const countBadge = document.getElementById('visibleDeviceCount');
    if (!grid) return;
    if (countBadge) {
      countBadge.textContent = `${AppState.lights.length} Lights`;
    }
    grid.innerHTML = AppState.lights
      .map(light => {
        const isOn = !!light.state;
        return `
        <article class="device-card ${isOn ? 'is-on' : ''}" data-device-id="${light.id}" aria-label="${escapeHtml(light.name)}">
          <div class="card-top">
            <div class="device-icon-box" aria-hidden="true">
              <i data-lucide="lightbulb"></i>
            </div>
            <label class="toggle-switch" for="toggle-${light.id}">
              <input
                type="checkbox"
                id="toggle-${light.id}"
                data-device-id="${light.id}"
                role="switch"
                aria-checked="${isOn}"
                aria-label="Toggle ${escapeHtml(light.name)}"
                ${isOn ? 'checked' : ''}
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="card-bottom">
            <span class="device-room">${escapeHtml(light.room)}</span>
            <h4 class="device-name">${escapeHtml(light.name)}</h4>
            <span class="device-state-text" id="status-text-${light.id}">${isOn ? 'ON • Relay Active' : 'OFF • Standby'}</span>
          </div>
        </article>
      `;
      })
      .join('');
    grid.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', handleLightToggle);
    });
    refreshIcons();
  }
  function handleLightToggle(e) {
    const lightId = e.target.getAttribute('data-device-id');
    const newState = e.target.checked;
    setLightState(lightId, newState);
  }
  function setLightState(lightId, newState) {
    const target = AppState.lights.find(l => l.id === lightId);
    if (!target) return;
    target.state = newState;
    saveToStorage(STORAGE_KEYS.LIGHTS, AppState.lights);
    const card = document.querySelector(`.device-card[data-device-id="${lightId}"]`);
    if (card) {
      card.classList.toggle('is-on', newState);
      const input = card.querySelector(`input[data-device-id="${lightId}"]`);
      if (input && input.checked !== newState) {
        input.checked = newState;
      }
      input?.setAttribute('aria-checked', String(newState));
      const statusText = document.getElementById(`status-text-${lightId}`);
      if (statusText) {
        statusText.textContent = newState ? 'ON • Relay Active' : 'OFF • Standby';
      }
    }
    updateDashboardMetrics();
    const actionLabel = newState ? 'turned ON' : 'turned OFF';
    logActivity(`${target.name} ${actionLabel}`);
    const syncTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const lastSyncEl = document.getElementById('esp32LastSync');
    if (lastSyncEl) {
      lastSyncEl.textContent = `${syncTimeStr} (Simulated)`;
    }
    showToast(`${target.name} ${actionLabel}`);
  }
  function initTemperature() {
    const savedTemp = loadFromStorage(STORAGE_KEYS.TEMP, 28.5);
    AppState.temperature = typeof savedTemp === 'number' ? savedTemp : 28.5;
    const tempEl = document.getElementById('sensorTemp');
    const updatedEl = document.getElementById('sensorLastUpdated');
    const overviewTempEl = document.getElementById('statOverviewTemp');
    function renderTempDisplay() {
      const formatted = `${AppState.temperature.toFixed(1)}°C`;
      if (tempEl) tempEl.textContent = formatted;
      if (overviewTempEl) overviewTempEl.textContent = formatted;
      if (updatedEl) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        updatedEl.textContent = `Telemetry synced at ${timeStr}`;
      }
    }
    renderTempDisplay();
    setInterval(() => {
      const driftDelta = (Math.random() - 0.5) * 0.3;
      AppState.temperature = Math.min(30.5, Math.max(27.0, AppState.temperature + driftDelta));
      saveToStorage(STORAGE_KEYS.TEMP, AppState.temperature);
      renderTempDisplay();
    }, 5000);
  }
  function initSettings() {
    const settingsBtn = document.getElementById('settingsToggleBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const doneSettingsBtn = document.getElementById('doneSettingsBtn');
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    const clearStorageBtn = document.getElementById('clearStorageBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const openSettings = () => settingsModal?.removeAttribute('hidden');
    const closeSettings = () => settingsModal?.setAttribute('hidden', '');
    settingsBtn?.addEventListener('click', openSettings);
    closeSettingsBtn?.addEventListener('click', closeSettings);
    doneSettingsBtn?.addEventListener('click', closeSettings);
    settingsModal?.addEventListener('click', e => {
      if (e.target === settingsModal) closeSettings();
    });
    resetDemoBtn?.addEventListener('click', () => {
      AppState.lights = DEFAULT_LIGHTS.map(l => ({ ...l, state: false }));
      saveToStorage(STORAGE_KEYS.LIGHTS, AppState.lights);
      renderLights();
      updateDashboardMetrics();
      logActivity('All lights switched OFF (Reset)');
      showToast('All lights switched OFF');
      closeSettings();
    });
    clearStorageBtn?.addEventListener('click', () => {
      localStorage.clear();
      AppState.lights = JSON.parse(JSON.stringify(DEFAULT_LIGHTS));
      AppState.history = [];
      AppState.temperature = 28.5;
      renderLights();
      renderActivityFeed();
      updateDashboardMetrics();
      showToast('Local cache wiped');
      closeSettings();
    });
    clearHistoryBtn?.addEventListener('click', clearHistory);
  }
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 2200);
  }
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  // 15. BOOTSTRAP APPLICATION
  document.addEventListener('DOMContentLoaded', () => {
    AppState.history = loadFromStorage(STORAGE_KEYS.HISTORY, [
      {
        id: 'init_1',
        message: 'System online • College Prototype Demo Mode active',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
    initClock();
    initTheme();
    initLights();
    initTemperature();
    initSettings();
    renderActivityFeed();
    refreshIcons();
  });
})();
