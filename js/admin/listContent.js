(function () {
  async function listContent() {
    const listContent = document.getElementById('list-content');
    const backendAPI = 'https://streaming.test/api/content-list';
    const backendURL = 'https://streaming.test';
    const authToken = localStorage.getItem('auth_token');

    // Función para formatear la duración
    function formatDuration(duration) {
      if (!duration) return 'N/A';
      const [hours, minutes, seconds] = duration.split(':');
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    // Función para mostrar/ocultar menús de acciones
    function setupActionMenus() {
      document.querySelectorAll('.actions-button').forEach((button) => {
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
                                    <button class="actions-button">Acciones</button>
                                    <div class="actions-menu">
                                        <a href="/${
                                          movie.slug
                                        }" class="action-item">Ver</a>
                                        <a href="#" class="action-item" data-movie-id="${
                                          movie.id
                                        }">Editar</a>
                                        <a href="#" class="action-item" data-movie-id="${
                                          movie.id
                                        }">Eliminar</a>
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
        document
          .querySelectorAll('.action-item[data-movie-id]')
          .forEach((btn) => {
            btn.addEventListener('click', function (e) {
              e.preventDefault();
              const movieId = this.getAttribute('data-movie-id');
              const action = this.textContent.toLowerCase();
              console.log(`${action} película ID: ${movieId}`);
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
    document.addEventListener('DOMContentLoaded', listContent);
  } else {
    listContent();
  }
})();
