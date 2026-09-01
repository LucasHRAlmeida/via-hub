(() => {
  'use strict';

  const STORAGE_KEY = 'via-theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const explicitDefault = root.dataset.themeDefault;

  function storedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  function systemTheme() {
    if (explicitDefault === 'light' || explicitDefault === 'dark') return explicitDefault;
    return media.matches ? 'dark' : 'light';
  }

  function apply(theme, persist = false) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* local-only best effort */ }
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#081A2B' : '#0C3E67');
    const button = document.querySelector('[data-via-theme-toggle]');
    if (button) {
      const isDark = theme === 'dark';
      const actionLabel = isDark ? 'Usar tema claro' : 'Usar tema escuro';
      // The accessible name describes the action, so aria-pressed would
      // incorrectly announce the opposite action as the current state.
      button.removeAttribute('aria-pressed');
      button.setAttribute('aria-label', actionLabel);
      button.title = actionLabel;
      button.textContent = isDark ? '☀︎' : '☾';
    }
  }

  function ensureToggle() {
    if (document.querySelector('[data-via-theme-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'via-theme-toggle';
    button.dataset.viaThemeToggle = '';
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next, true);
    });
    document.body.appendChild(button);
    apply(root.dataset.theme || systemTheme(), false);
  }

  apply(storedTheme() || systemTheme(), false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureToggle, { once: true });
  } else {
    ensureToggle();
  }

  const updateSystemTheme = () => {
    if (!storedTheme() && !explicitDefault) apply(systemTheme(), false);
  };

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', updateSystemTheme);
  } else if (typeof media.addListener === 'function') {
    media.addListener(updateSystemTheme);
  }

  window.addEventListener('storage', (event) => {
    try {
      if (event.storageArea !== localStorage) return;
    } catch {
      return;
    }
    if (event.key === STORAGE_KEY || event.key === null) {
      apply(event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : systemTheme(), false);
    }
  });

  window.VIATheme = Object.freeze({
    get: () => root.dataset.theme,
    set: (theme) => {
      if (theme === 'light' || theme === 'dark') apply(theme, true);
    },
    reset: () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
      apply(systemTheme(), false);
    }
  });
})();
