import { getIp } from './modules/getIp.js';

document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('current_user_id');
  const user_id = localStorage.getItem('current_user_id');
  const device_id = localStorage.getItem('device_id_' + user_id);
  
  if (!token || !userId) {
    window.location.href = '/login.html';
    return;
  }

  fetch('https://streaming.test/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data.user.plan);
        const currentPlan = data.user.plan;
        const basicPlanCard = document.getElementById('basic-plan');
        const premiumPlanCard = document.getElementById('premium-plan');

        if (currentPlan == 'sencillo') {
          basicPlanCard.classList.add('current-plan');
          basicPlanCard.querySelector('.select-plan').textContent =
            'Plan Actual';
          basicPlanCard.querySelector('.select-plan').disabled = true;
        } else {
          premiumPlanCard.classList.add('current-plan');
          premiumPlanCard.querySelector('.select-plan').textContent =
            'Plan Actual';
          premiumPlanCard.querySelector('.select-plan').disabled = true;
        }
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  // Manejar selección de plan
  document.querySelectorAll('.select-plan').forEach((button) => {
    button.addEventListener('click', function () {
      const plan = this.getAttribute('data-plan');
      changeUserPlan(plan);
    });
  });
});

async function changeUserPlan(plan) {
  const userId = localStorage.getItem('current_user_id');
  const ip = await getIp();
  const device_id = localStorage.getItem('device_id_' + userId);
  const token = localStorage.getItem('auth_token');
  const userAgent = navigator.userAgent;

  if (
    !confirm(
      `¿Estás seguro de que quieres cambiar al plan ${
        plan == 'sencillo' ? 'Sencillo' : 'Premium'
      }?`
    )
  ) {
    return;
  }

  fetch('https://streaming.test/api/cambiar-plan', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Device-Id': device_id,
      'User-Ip': ip,
      'User-Agent': userAgent,
    },
    body: JSON.stringify({ plan: plan }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data);
        alert(
          `Plan cambiado a ${
            plan === 'sencillo' ? 'Sencillo' : 'Premium'
          } con éxito`
        );

        if (plan === 'premium' && data.data.require_device_name) {
          window.location.href = '/new-device.html';
        } else {
          window.location.href = 'https://frontend.test';
        }
      } else {
        throw new Error(data.message || 'Error al cambiar de plan');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error al cambiar de plan: ' + error.message);
    });
}
