import { getIp } from './modules/getIp.js';
import { generateUUID } from './modules/generateId.js';

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
    const deviceKey = `device_id_${userObject.email}`;
    const deviceId = localStorage.getItem(deviceKey) || generateUUID();
    localStorage.setItem(deviceKey, deviceId);

    try {
      const response = await fetch('https://streaming.test/api/new-device', {
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

      const userResponse = await fetch('https://streaming.test/api/user', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      const userData = await userResponse.json();

      if (data.success) {
        if (userData.data.plan == null) {
          window.location.href = '/plans.html';
        } else {
          window.location.href = 'https://frontend.test';
        }
      } 
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  });
