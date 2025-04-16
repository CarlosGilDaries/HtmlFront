import { renderContents } from '../modules/renderContents.js';
import { search } from '../modules/searchFunctionality.js';

document.addEventListener('DOMContentLoaded', async function () {
  const token = localStorage.getItem('auth_token');
  const backendAPI = 'https://streaming.test/api/';
  let allContents = []; // Todos los contenidos
  let currentContents = []; // Contenidos actualmente mostrados (filtrados o no)
  let currentSearchTerm = ''; // Término de búsqueda actual

  try {
    const response = await fetch(backendAPI + 'content');
    const data = await response.json();
    allContents = data.data;
    currentContents = [...allContents];
    const searchInput = document.getElementById('search-input');

    renderContents(currentContents, 'admin-panel');

    // Configuración correcta del event listener
    searchInput.addEventListener('input', function (e) {
      currentSearchTerm = e.target.value.toLowerCase();
      currentContents = allContents.filter((content) =>
        content.title.toLowerCase().includes(currentSearchTerm)
      );
      renderContents(currentContents, 'admin-panel');
      setupDeleteButtons();
    });

    setupDeleteButtons();
  } catch (error) {
    console.log(error);
  }

  function setupDeleteButtons() {
    document.querySelectorAll('.delete-form').forEach((form) => {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const contentId = this.dataset.id;

        if (confirm('¿Estás seguro de eliminar este contenido?')) {
          try {
            const deleteResponse = await fetch(backendAPI + 'delete-content', {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content_id: contentId }),
            });

            const deleteData = await deleteResponse.json();

              if (deleteData.success) {
                  alert('Contenido eliminado con éxito');
                  window.location.href = '/admin/delete-content.html';
              }
          } catch (error) {
            console.error('Error:', error);
          }
        }
      });
    });
  }
});
