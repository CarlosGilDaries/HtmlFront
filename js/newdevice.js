import { getIp } from './modules/getIp.js';

document
  .getElementById('new-device-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const deviceName = document.getElementById('device_name').value;
    const ip = await getIp();
    const userAgent = navigator.userAgent;
    const user_id = localStorage.getItem('current_user_id');
    const user = localStorage.getItem('user_' + user_id);
    const userObject = JSON.parse(user);
    const deviceKey = `device_id_${userObject.id}`;
    const deviceId = localStorage.getItem(deviceKey) || generateUUID();
    localStorage.setItem(deviceKey, deviceId);

    if (!deviceName || !deviceId || !ip || !userAgent) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    try {
      const response = await fetch('http://streaming.test/api/new-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          device_name: deviceName,
          user_id: userObject.id,
          device_id: deviceId,
          ip: ip,
          user_agent: userAgent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = 'http://frontend.test';
      } else {
        alert('Error al registrar dispositivo: ' + data.message);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Hubo un error al conectar con el servidor');
    }
  });

// Función para generar un device_id único
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
