export function activeItems(menuItems, contentContainers) {
  menuItems.forEach((item) => item.classList.remove('active'));
  let scripts = document.querySelectorAll('.panel-scripts');
  this.classList.add('active');
  contentContainers.forEach((container) => container.classList.add('hidden'));
  const contentId = this.getAttribute('data-content');
  document.getElementById(contentId).classList.remove('hidden');

  const dataSlug = this.getAttribute('data-slug');
  const dataId = this.getAttribute('data-id');
  if (dataSlug) {
    localStorage.setItem('slug', dataSlug);
  }
  if (dataId) {
    localStorage.setItem('id', dataId);
  }

  const scriptUrl = this.getAttribute('data-script');

  // Limpiar scripts viejos
  scripts.forEach((script) => {
    script.remove();
  });

  // Cargar el nuevo script si está especificado
  if (scriptUrl) {
    let currentScript = document.createElement('script');
    currentScript.src = scriptUrl;
    currentScript.type = 'module';
    currentScript.classList.add('panel-scripts');
    document.body.appendChild(currentScript);
  }
}