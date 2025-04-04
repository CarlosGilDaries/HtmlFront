document
  .getElementById('login-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita la recarga de la página

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const ip = await getIp();
    const device_id = localStorage.getItem('device_id') || generateUUID();
    const userAgent = navigator.userAgent;

    try {
      const response = await fetch('http://streaming.test/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Device-ID': device_id,
          'User-Agent': userAgent,
          'User-IP': ip,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      localStorage.setItem('auth_token', data.data.auth_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('device_id', device_id);

      if (!data.success) {
        if (data.device_limit_reached) {
          window.location.href = '/manage-devices.html';
        } else if (data.message === 'Credenciales incorrectas') {
          document.getElementById('error-message').textContent =
            'Credenciales incorrectas';
          document.getElementById('error-message').style.display = 'block';
        }
        return;
      }

      if (data.data.require_device_registration) {
        window.location.href = '/new-device.html';
      } else {
        window.location.href = 'http://frontend.test';
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      document.getElementById('error-message').textContent =
        'Error al conectar con el servidor';
      document.getElementById('error-message').style.display = 'block';
    }
  });

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Función para obtener la IP del cliente usando un servicio de API externo
async function getIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error al obtener IP:', error);
    return '';
  }
}
