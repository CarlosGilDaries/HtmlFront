import { logOut } from "./modules/logOut.js";

const token = localStorage.getItem('auth_token');
const button = document.querySelector('.select-plan');
const user_id = localStorage.getItem('current_user_id');
const device_id = localStorage.getItem('device_id_' + user_id);

if (token == null) {
    window.location.href = '/login';
}

if (device_id == null) {
  logOut(token);
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('https://streaming.test/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const user = data.user;

        if (user) {
          const tableBody = document
            .getElementById('user-table')
            .getElementsByTagName('tbody')[0];

          // Definir los campos que quieres mostrar
          const fieldsToDisplay = {
            id: 'ID',
            name: 'Nombre',
            email: 'Correo electrónico',
            plan: 'Plan',
            rol: 'Rol',
          };

          // Filtrar los datos para que solo se muestren los campos relevantes
          for (const [key, value] of Object.entries(user)) {
            // Excluir los campos no deseados
            if (
              !['email_verified_at', 'created_at', 'updated_at'].includes(key)
            ) {
              if (fieldsToDisplay[key]) {
                // Solo mostrar los campos que están en fieldsToDisplay
                const row = tableBody.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);

                // Asignar el nombre de la columna en español
                cell1.textContent = fieldsToDisplay[key];
                cell2.textContent = value;
              }
            }
          }
        }
      }
    })
    .catch((error) => {
      alert('Error en la solicitud: ', error);
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    });
});

document.getElementById('logout-button').addEventListener('click', async function (event) {
  event.preventDefault();

  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('No se encontró el token de autenticación');
    return;
  }

  logOut(token);
});

button.addEventListener('click', function () {
  window.location.href = '/change-plan.html';
})

