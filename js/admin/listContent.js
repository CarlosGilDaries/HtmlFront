import { formatDuration } from '../modules/formatDuration.js';
import { deleteForm } from '../modules/deleteForm.js';

(function () {
  async function listContent() {
    const listContent = document.getElementById('list-content');
    const backendAPI = 'https://streaming.test/api/content-list';
    const backendDeleteApi = 'https://streaming.test/api/delete-content';
    const backendURL = 'https://streaming.test';
    const authToken = localStorage.getItem('auth_token');

    // Función para mostrar/ocultar menús de acciones
    function setupActionMenus() {
      document.querySelectorAll('.content-button').forEach((button) => {
        button.addEventListener('click', function (e) {
          e.stopPropagation();
          const menu = this.nextElementSibling;
          const allMenus = document.querySelectorAll('.actions-menu');

          // Cerrar otros menús abiertos
          allMenus.forEach((m) => {
            if (m !== menu) m.style.display = 'none';
          });

          // Alternar el menú actual
          menu.style.display =
            menu.style.display === 'block' ? 'none' : 'block';
        });
      });

      // Cerrar menús al hacer clic en cualquier parte del documento
      document.addEventListener('click', function () {
        document.querySelectorAll('.actions-menu').forEach((menu) => {
          menu.style.display = 'none';
        });
      });
    }

    const menuItems = document.querySelectorAll('.admin-menu li');
    const contentContainers = document.querySelectorAll('.container');
    let currentScript = null;

    function activeItemsEdit(element) {
      menuItems.forEach((item) => item.classList.remove('active'));
      element.classList.add('active');
      contentContainers.forEach((container) =>
        container.classList.add('hidden')
      );
      const contentId = element.getAttribute('data-content');
      document.getElementById(contentId).classList.remove('hidden');

      const slug = element.getAttribute('data-slug');
      const title = element.getAttribute('data-title');
      const movieId = element.getAttribute('data-id');
      if (slug) {
        localStorage.setItem('slug', slug);
      }
      if (title) {
        localStorage.setItem('title', title);
        console.log(title);
      }
      if (movieId) {
        localStorage.setItem('content_id', movieId);
      }

      const scriptUrl = element.getAttribute('data-script');
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

    // Función para cargar y mostrar los datos
    async function loadContentList() {
      try {
        const response = await fetch(backendAPI, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        const { movies, genders } = data.data;

        // Crear mapeo de géneros para búsqueda rápida
        const genderMap = {};
        genders.forEach((gender) => {
          genderMap[gender.id] = gender.name;
        });

        // Generar HTML de la tabla
        let tableHTML = `
                    <h1><i class="fas fa-eye"></i> Lista de Contenido</h1>
                    <div id="delete-content-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Contenido eliminado con éxito!
                  </div>    
                    <div class="table-responsive">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Portada</th>
                                    <th>Género</th>
                                    <th>Tipo</th>
                                    <th>PPV</th>
                                    <th>Duración</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

        movies.forEach((movie) => {
          let type;
          const cover = backendURL + movie.cover;

          if (movie.type == 'application/vnd.apple.mpegurl') {
            type = 'HLS';
          } else {
            type = movie.type;
          }

          tableHTML += `
                        <tr>
                            <td>${movie.id}</td>
                            <td>${movie.title}</td>
                            <td><img src="${cover}" alt="${
            movie.title
          }" class="cover-image"></td>
                            <td>${genderMap[movie.gender_id] || 'N/A'}</td>
                            <td>${type}</td>
                            <td>${movie.pay_per_view ? 'Sí' : 'No'}</td>
                            <td>${formatDuration(movie.duration)}</td>
                            <td>
                                <div class="actions-container">
                                    <button class="actions-button content-button">Acciones</button>
                                    <div class="actions-menu">
                                        <a href="/${
                                          movie.slug
                                        }" class="">Ver</a>
                                        <button class="action-item content-action edit-button" data-content="edit-content" data-slug="${
                                          movie.slug
                                        }" data-script="/js/admin/editContentForm.js">Editar</button>
                                        <button class="action-item content-action link-button" data-content="link-content-with-ads" data-id="${
                                          movie.id
                                        }" data-title="${movie.title}" data-script="/js/admin/linkAds.js">Anuncios</button>
                                        <form class="content-delete-form" data-id="${
                                          movie.id
                                        }">
                                        <input type="hidden" name="content_id" value="${
                                          movie.id
                                        }">
                                        <button class="action-item content-action delete-btn" data-movie-id="${
                                          movie.id
                                        }" type="submit">Eliminar</button>
                                        </form>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
        });

        tableHTML += `
                            </tbody>
                        </table>
                    </div>
                `;

        // Insertar la tabla en el DOM
        listContent.innerHTML = tableHTML;

        // Configurar los menús de acciones
        setupActionMenus();

        // Añadir event listeners para los botones de acción
        document.querySelectorAll('.edit-button').forEach((btn) => {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
              activeItemsEdit(btn);
          });
        });

        document.querySelectorAll('.link-button').forEach((btn) => {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            activeItemsEdit(btn);
          });
        });

        const message = document.getElementById('delete-content-success-message');
        deleteForm(authToken, '.content-delete-form', backendDeleteApi, message);
      } catch (error) {
        console.error('Error al cargar la lista de contenido:', error);
        listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de películas: ${error.message}
                    </div>
                `;
      }
    }

    // Cargar los datos al iniciar
    loadContentList();
  }

  // Verificar si el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', listContent);
  } else {
    listContent();
  }
})();
