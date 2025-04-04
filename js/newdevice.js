document
  .getElementById('new-device-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const deviceName = document.getElementById('device_name').value;
    const deviceId = localStorage.getItem('device_id');
    const ip = await getIp();
    const userAgent = navigator.userAgent;
    let user = localStorage.getItem('user');
    let userObject = JSON.parse(user);

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
