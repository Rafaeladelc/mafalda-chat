const STORAGE_KEY = 'mafalda-theme';

// localStorage puede fallar (modo privado, datos bloqueados): siempre con try/catch
function getSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // si no se puede guardar, el tema sigue funcionando esta sesión
  }
}

// Orden: lo que la persona eligió > lo que prefiere su sistema > claro
function preferredTheme() {
  const saved = getSavedTheme();
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const button = document.getElementById('theme-toggle');
  if (button) {
    const isDark = theme === 'dark';
    button.textContent = isDark ? '☀️' : '🌙';
    button.setAttribute(
      'aria-label',
      isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
    );
  }
}

export function initTheme() {
  applyTheme(preferredTheme());

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });
}