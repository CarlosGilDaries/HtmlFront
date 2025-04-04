const userCookie = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('auth_token');
if (token == null) {
    window.location.href = '/login';
}

if (userCookie) {
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
  for (const [key, value] of Object.entries(userCookie)) {
    // Excluir los campos no deseados
    if (!['email_verified_at', 'created_at', 'updated_at'].includes(key)) {
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


document
  .getElementById('logout-button')
  .addEventListener('click', async function (event) {
    event.preventDefault();

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return;
    }

    try {
      const response = await fetch('http://streaming.test/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        window.location.href = 'http://frontend.test';
      } else {
        console.error('Error al cerrar sesión:', data.message);
      }
    } catch (error) {
      console.error('Error en la solicitud de logout:', error);
    }
  });
