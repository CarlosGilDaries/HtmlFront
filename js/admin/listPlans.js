import { deleteForm } from "../modules/deleteForm.js";

(function () {
  async function listPlans() {
    const listContent = document.getElementById('list-plans');
    const backendAPI = 'https://streaming.test/api/plans';
      const backendURL = 'https://streaming.test';
      const authToken = localStorage.getItem('auth_token');
      const backendDeleteApi = 'https://streaming.test/api/delete-plan';

    // Función para mostrar/ocultar menús de acciones
    function setupActionMenus() {
      document.querySelectorAll('.plans-button').forEach((button) => {
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

      const planId = element.getAttribute('data-id');
      if (planId) {
        localStorage.setItem('plan-id', planId);
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
        document.body.appendChild(currentScript);
      }
    }

    // Función para cargar y mostrar los datos
    async function loadPlansList() {
      try {
        const response = await fetch(backendAPI);

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        const plans = data.plans;

        // Generar HTML de la tabla
          let tableHTML = `
                    <h1><i class="fas fa-eye"></i> Lista de Planes</h1>
                    <div id="delete-plan-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Plan eliminado con éxito!
                    </div>    
                    <div class="table-responsive">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Max Dispositivos</th>
                                    <th>Max Streams</th>
                                    <th>Anuncios</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

        plans.forEach((plan) => {
          let ads;

          if (plan.ads == 1) {
            ads = 'Sí';
          } else {
            ads = 'No';
            }
            
        tableHTML += ` 
                    <tr>
                        <td>${plan.id}</td>
                        <td>${plan.name}</td>
                        <td>${plan.price}</td>
                        <td>${plan.max_devices}</td>
                        <td>${plan.max_streams}</td>
                        <td>${ads}</td>
                        <td>
                            <div class="actions-container">
                                <button class="actions-button plans-button">Acciones</button>
                                <div class="actions-menu">
                                    <button class="action-item edit-button plan-action" data-content="edit-plan" data-id="${
                                        plan.id
                                    }" data-script="/js/admin/editPlanForm.js">Editar</button>
                                    <form class="plans-delete-form" data-id="${
                                        plan.id
                                    }">
                                    <input type="hidden" name="plan_id" value="${
                                        plan.id
                                    }">
                                    <button class="action-item content-action delete-btn" type="submit">Eliminar</button>
                                    </form>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
          }
        );

        tableHTML += `
                            </tbody>
                        </table>
                    </div>
                    <button class="add-plan-button" data-content="add-plan" data-script="/js/admin/addPlan.js">Añadir Plan</button>
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

        document.querySelector('.add-plan-button').addEventListener('click', function (e) {
          e.preventDefault();
          activeItemsEdit(this);
        })

        const message = document.getElementById('delete-plan-success-message');
        deleteForm(authToken, '.plans-delete-form', backendDeleteApi, message);
      } catch (error) {
        console.error('Error al cargar la lista de planes:', error);
        listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de planes: ${error.message}
                    </div>
                `;
      }
    }

    // Cargar los datos al iniciar
    loadPlansList();
  }

  // Verificar si el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', listPlans);
  } else {
    listPlans();
  }
})();
