import { activeItems } from "../modules/activeItems.js";

let id = localStorage.getItem('id');
const token = localStorage.getItem('auth_token');
const backendAPI = 'https://streaming.test/api/';

async function loadContentData(id) {
  try {
    const response = await fetch(backendAPI + `gender/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const gender = data.gender;
    console.log(data);

    document.getElementById('edit-gender-name').value = gender.name;
  } catch (error) {
    console.error('Error cargando género:', error);
  }
}

(function () {
  async function editGendersForm() {
    loadContentData(id);
    const menuItems = document.querySelectorAll('.admin-menu li');
    const contentContainers = document.querySelectorAll('.container');

    menuItems.forEach((item) => {
      item.addEventListener(
        'click',
        activeItems.bind(item, menuItems, contentContainers)
      );
    });

    document
      .getElementById('edit-gender-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        document.getElementById('edit-gender-loading').style.display = 'block';

        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-gender-name').value
        );

        try {
          const editResponse = await fetch(backendAPI + `edit-gender/${id}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          const data = await editResponse.json();

          if (data.success) {
            // Mostrar mensaje de éxito
            document.getElementById(
              'edit-gender-success-message'
            ).style.display = 'block';

            setTimeout(() => {
              document.getElementById(
                'edit-gender-success-message'
              ).style.display = 'none';
            }, 5000);

            console.log('Archivo editado.');
            loadContentData(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            console.log('Error al editar:', data.message);
          }
        } catch (error) {
          console.log(error);
        } finally {
          document.getElementById('edit-gender-loading').style.display = 'none';
        }
      });
  }

  // Verificar si el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', editGendersForm);
  } else {
    editGendersForm();
  }
})();
