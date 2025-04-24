import { getIp } from './modules/getIp.js';
import { generateUUID } from './modules/generateId.js';

document
  .getElementById('register-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const surnames = document.getElementById('surnames').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const country = document.getElementById('country').value;
    const birthday = document.getElementById('birthday').value;
    const dni = document.getElementById('dni').value;
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const password_confirmation = document.getElementById(
      'password_confirmation'
    ).value;
    const ip = await getIp();
      const userAgent = navigator.userAgent;
      const device_id = generateUUID();

    try {
      const response = await fetch('https://streaming.test/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'User-IP': ip,
          'User-Device-Id': device_id,
        },
        body: JSON.stringify({
          name,
          surnames,
          email,
          address,
          city,
          country,
          birthday,
          dni,
          gender,
          password,
          password_confirmation,
        }),
      });

      const data = await response.json();

      localStorage.setItem('auth_token', data.data.auth_token);
      localStorage.setItem(
        'user_' + data.data.user.id,
        JSON.stringify(data.data.user)
      );
        localStorage.setItem('current_user_id', data.data.user.id);
        localStorage.setItem('device_id_' + data.data.user.email, device_id);

      if (data.data.require_device_registration) {
        window.location.href = '/new-device.html';
        return;
      }

      window.location.href = '/plans.html';
    } catch (error) {
      console.error('Error en la solicitud:', error);
      document.getElementById('error-message').textContent =
        'Credenciales incorrectas';
      document.getElementById('error-message').style.display = 'block';
    }
  });
