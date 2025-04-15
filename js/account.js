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
        const user = data.data.user;

        if (user.rol == 'admin') {
          button.innerHTML = 'Panel de Admin';
        }

        if (user) {
          const tableBody = document
            .getElementById('user-table')
            .getElementsByTagName('tbody')[0];

          // Definir los campos que quieres mostrar
          const fieldsToDisplay = {
            name: 'Nombre',
            surnames: 'Apellidos',
            email: 'Email',
            address: 'Dirección',
            city: 'Ciudad',
            country: 'País',
            dni: 'DNI/NIF',
            gender: 'Sexo',
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

          const plan = data.data.plan;
          const planRow = document.createElement('tr');
          const planKey = document.createElement('td');
          planKey.innerHTML = 'Plan';
          const planValue = document.createElement('td');
          planValue.innerHTML = plan.name;
          tableBody.appendChild(planRow);
          planRow.appendChild(planKey);
          planRow.appendChild(planValue);
        }

        button.addEventListener('click', function () {
          if (user.rol == 'admin') {
            window.location.href = '/admin/admin-panel.html';
          } else {
            window.location.href = '/plans.html';
          } 
        });
      }
    })
  .catch((error) => {
    console.log(error);
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

