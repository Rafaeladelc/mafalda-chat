// Rutas de la aplicación: ruta -> plantilla que se muestra
const routes = {
  '/home': { template: 'tpl-home', title: 'Mafalda · Inicio' },
  '/chat': { template: 'tpl-chat', title: 'Mafalda · Chat' },
  '/about': { template: 'tpl-about', title: 'Mafalda · About' },
};

const view = document.getElementById('view');

// Dibuja la vista que corresponde a la ruta
function render(path) {
  const route = routes[path] ?? routes['/home'];
  const template = document.getElementById(route.template);

  view.replaceChildren(template.content.cloneNode(true));
  document.title = route.title;

  // Marca el enlace de la vista activa
  document.querySelectorAll('.nav a').forEach((link) => {
    const isActive = link.getAttribute('href') === path;
    link.toggleAttribute('aria-current', isActive);
  });
}

// Cambia la URL sin recargar y dibuja la vista nueva
function navigate(path) {
  history.pushState({}, '', path);
  render(path);
}

// Clic en cualquier enlace con data-link: no recargar, navegar
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-link]');
  if (!link) return;
  event.preventDefault();
  navigate(link.getAttribute('href'));
});

// Botones atrás / adelante del navegador
window.addEventListener('popstate', () => {
  render(location.pathname);
});

// Primera vista al abrir la página
function start() {
  if (!routes[location.pathname]) {
    history.replaceState({}, '', '/home');
  }
  render(location.pathname);
}

start();