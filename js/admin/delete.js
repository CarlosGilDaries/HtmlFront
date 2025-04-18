import { renderContents } from '../modules/renderContents.js';
import { setupDeleteButtons } from '../modules/deleteButtons.js';

document.addEventListener('DOMContentLoaded', async function () {
  const token = localStorage.getItem('auth_token');
  const backendAPI = 'https://streaming.test/api/';
  const success = document.getElementById('success-message');
  let allContents = []; // Todos los contenidos
  let currentContents = []; // Contenidos actualmente mostrados (filtrados o no)
  let currentSearchTerm = ''; // Término de búsqueda actual

  try {
    const response = await fetch(backendAPI + 'content');
    const data = await response.json();
    allContents = data.data;
    currentContents = [...allContents];
    const searchInput = document.getElementById('search-input');

    renderContents(currentContents, 'admin-panel', 'fas fa-trash');

    searchInput.addEventListener('input', function (e) {
      currentSearchTerm = e.target.value.toLowerCase();
      currentContents = allContents.filter((content) =>
        content.title.toLowerCase().includes(currentSearchTerm)
      );
      renderContents(currentContents, 'admin-panel', 'fas fa-trash');
      setupDeleteButtons(
        '.admin-form',
        backendAPI + 'delete-content',
        token,
        success
      );
    });

    setupDeleteButtons(
      '.admin-form',
      backendAPI + 'delete-content',
      token,
      success
    );
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.log(error);
  }
});
