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
      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute('aria-label', isDark ? 'Usar tema claro' : 'Usar tema escuro');
      button.title = isDark ? 'Usar tema claro' : 'Usar tema escuro';
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

  media.addEventListener?.('change', () => {
    if (!storedTheme() && !explicitDefault) apply(systemTheme(), false);
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
      apply(event.newValue, false);
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
