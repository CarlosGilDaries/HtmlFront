import { formatDuration } from '../modules/formatDuration.js';

(function () {
  async function listAds() {
    const listContent = document.getElementById('list-ads');
    const backendAPI = 'https://streaming.test/api/ads-list';
    const backendURL = 'https://streaming.test';
    const authToken = localStorage.getItem('auth_token');

    // Función para mostrar/ocultar menús de acciones
    function setupActionMenus() {
      document.querySelectorAll('.ads-button').forEach((button) => {
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
      if (slug) {
        localStorage.setItem('slug', slug);
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

        const ads = data.data;

        // Generar HTML de la tabla
          let tableHTML = `
                    <h1><i class="fas fa-eye"></i> Lista de Anuncios</h1>   
                    <div class="table-responsive">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Marca</th>
                                    <th>Tipo</th>
                                    <th>Duración</th>
                                    <th>Imagen</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

        ads.forEach((ad) => {
          let type;
          let cover;
          if (ad.type == 'application/vnd.apple.mpegurl') {
            type = 'HLS';
          } else {
            type = ad.type;
          }
          if (ad.cover == null) {
            tableHTML += ` 
                        <tr>
                            <td>${ad.id}</td>
                            <td>${ad.title}</td>
                            <td>${ad.brand}</td>
                            <td>${type}</td>
                            <td>${formatDuration(ad.duration)}</td>
                            <td><img src="${cover}" alt="${
              ad.title
            }" class="cover-image"></td>
                            <td>
                                <div class="actions-container">
                                    <button class="actions-button ads-button">Acciones</button>
                                    <div class="actions-menu">
                                        <a href="/player/ad/${
                                          ad.slug
                                        }" class="">Ver</a>
                                        <a href="#" class="action-item edit-button ad-action" data-content="edit-ad" data-slug="${
                                          ad.slug
                                        }" data-script="/js/admin/editAdsForm.js">Editar</a>
                                        <a href="#" class="action-item" data-movie-id="${
                                          ad.id
                                        }">Eliminar</a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
          } else {
            tableHTML += `
                        <tr>
                            <td>${ad.id}</td>
                            <td>${ad.title}</td>
                            <td>${ad.brand}</td>
                            <td>${type}</td>
                            <td>${formatDuration(ad.duration)}</td>
                            <td>N/A</td>
                            <td>
                                <div class="actions-container">
                                    <button class="actions-button">Acciones</button>
                                    <div class="actions-menu">
                                        <a href="/player/ad/${
                                          ad.slug
                                        }" class="">Ver</a>
                                        <a href="#" class="action-item edit-button ad-action" data-content="edit-ad" data-slug="${
                                          ad.slug
                                        }" data-script="/js/admin/editAdsForm.js">Editar</a>
                                        <a href="#" class="action-item ad-action" data-movie-id="${
                                          ad.id
                                        }">Eliminar</a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
          }
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
        document.querySelectorAll('.ad-action').forEach((btn) => {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (btn.innerHTML == 'Editar') {
              activeItemsEdit(btn);
            }
            // Aquí puedes añadir lógica para editar/eliminar
          });
        });
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
    document.addEventListener('DOMContentLoaded', listAds);
  } else {
    listAds();
  }
})();
