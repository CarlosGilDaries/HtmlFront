import { logOut } from '../modules/logOut.js';
import { adminCheck } from '../modules/adminCheck.js';

const user_id = localStorage.getItem('current_user_id');
const device_id = localStorage.getItem('device_id_' + user_id);
const token = localStorage.getItem('auth_token');
const logOutButton = document.querySelector('.login-btn');

if (token == null) {
  window.location.href = '/login';
}

if (device_id == null) {
  logOut(token);
}

document.addEventListener('DOMContentLoaded', adminCheck(token));

logOutButton.addEventListener('click', function () {
    logOut(token);
})

document.addEventListener('DOMContentLoaded', function () {
  const menuItems = document.querySelectorAll('.admin-menu li');
  const contentContainers = document.querySelectorAll('.container');

  // Variable para mantener referencia al script cargado actualmente
  let currentScript = null;

  function activeItems() {
    menuItems.forEach((item) => item.classList.remove('active'));
    this.classList.add('active');
    contentContainers.forEach((container) => container.classList.add('hidden'));
    const contentId = this.getAttribute('data-content');
    document.getElementById(contentId).classList.remove('hidden');

    const slug = this.getAttribute('data-slug');
    if (slug) {
      localStorage.setItem('slug', slug);
    }

    const scriptUrl = this.getAttribute('data-script');
    // Limpiar el script anterior si existe
    if (currentScript) {
      currentScript.remove();
      currentScript = null;
    }
    // Cargar el nuevo script si está especificado
    if (scriptUrl) {
      currentScript = document.createElement('script');
      currentScript.src = scriptUrl;
      currentScript.type = 'module';
      document.body.appendChild(currentScript);
    }
  }

  menuItems.forEach((item) => {
    item.addEventListener('click', activeItems);
  });


  // Activar el primer item del menú por defecto
  document.querySelector('.admin-menu li[data-content="add-content"]').click();
})
