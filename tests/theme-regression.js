/* Manual/browser regression assertions for assets/theme.js. */
(() => {
  const failures = [];
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  const button = document.querySelector('[data-via-theme-toggle]');

  assert(Boolean(button), 'toggle must exist');
  assert(button && !button.hasAttribute('aria-pressed'), 'action-labelled toggle must not expose aria-pressed');
  assert(button && /^Usar tema (claro|escuro)$/.test(button.getAttribute('aria-label') || ''), 'toggle must expose a PT-BR action label');

  if (button) {
    const rect = button.getBoundingClientRect();
    assert(rect.width >= 44 && rect.height >= 44, 'toggle target must be at least 44x44 CSS px');
  }

  window.VIATheme.set('dark');
  assert(document.documentElement.dataset.theme === 'dark', 'set(dark) must apply dark theme');
  assert(localStorage.getItem('via-theme') === 'dark', 'set(dark) must persist preference');
  assert(button && button.getAttribute('aria-label') === 'Usar tema claro', 'dark theme must offer light-theme action');

  window.VIATheme.reset();
  assert(localStorage.getItem('via-theme') === null, 'reset must remove explicit preference');

  if (failures.length) throw new Error(`Theme regression failures: ${failures.join('; ')}`);
  console.info('VIA theme regression: PASS');
})();
