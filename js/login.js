import { getIp } from "./modules/getIp.js";

document
  .getElementById('login-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita la recarga de la página

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const ip = await getIp();
    const userAgent = navigator.userAgent;
    const device_id = localStorage.getItem('device_id_' + email);

    try {
      const response = await fetch('https://streaming.test/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'User-IP': ip,
          'User-Device-Id': device_id,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      localStorage.setItem('auth_token', data.data.auth_token);
      localStorage.setItem('user_' + data.data.user.id, JSON.stringify(data.data.user));
      localStorage.setItem('current_user_id', data.data.user.id);

      if (data.data.require_device_registration) {
            window.location.href = '/new-device.html';
            return;
          }

      if (!data.success) {
        if (data.device_limit_reached) {
          window.location.href = '/manage-devices';
        } else if (data.message === 'Credenciales incorrectas') {
          document.getElementById('error-message').textContent = 'Credenciales incorrectas';
          document.getElementById('error-message').style.display = 'block';
        }
        return;
      }

      console.log(data);
      console.log(email);
      console.log(data.data.session.device_id);
      if (data.data.user.rol == 'admin') {
        localStorage.setItem('device_id_' + data.data.user.id, data.data.session.device_id);
      }
      window.location.href = '/';

    } catch (error) {
      console.error('Error en la solicitud:', error);
      document.getElementById('error-message').textContent =
        'Credenciales incorrectas';
      document.getElementById('error-message').style.display = 'block';
    }
  });

// Función para obtener el id del email que se está logeando
function getDeviceIdByEmail(emailToCheck) {

  try {
    $device_id = localStorage.getItem('');
  } catch (error) {
    console.error(`Error leyendo el valor de ${key}:`, error);
  }
  return null; 
}