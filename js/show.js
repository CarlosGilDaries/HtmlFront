import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';

const pathParts = window.location.pathname.split('/');
const movieSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL
const api = 'https://streaming.test/api/';
const backendURL = 'https://streaming.test';
const play = document.getElementById('play-button');
const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';
}
const user_id = localStorage.getItem('current_user_id');
const user = localStorage.getItem('user_' + user_id);
const device_id = localStorage.getItem('device_id_' + user_id);
const ip = await getIp();
const userAgent = navigator.userAgent;

if (device_id == null) {
  logOut(token);
}

async function fetchMovieData() {
  try {
    const response = await fetch(api + 'content/' + movieSlug, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Device-ID': device_id,
        'User-Ip': ip,
        'User-Agent': userAgent,
        Authorization: `Bearer ${token}`,
        'User-Id': user_id,
      },
    });

    const userResponse = await fetch(api + 'user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const userData = await userResponse.json();

    if (userData.success && data.success) {
      let neededPlans = [];
      const actualPlan = userData.data.plan.name;
      data.data.plans.forEach(plan => {
        if (plan.name != 'Admin') {
          neededPlans.push(plan.name);
        }
      });

      if (!neededPlans.includes(actualPlan) && actualPlan != 'Admin') {
        localStorage.setItem('actual_plan', actualPlan);
        localStorage.setItem('needed_plans', neededPlans);
        window.location.href = '/manage-plans.html';
      }

      const image = document.getElementById('content-image');
      const title = document.getElementById('content-title');
      const trailer = document.getElementById('trailer');
      if (data.data.movie.trailer != null) {
        trailer.src = backendURL + data.data.movie.trailer;
      } else {
        trailer.src = '/video/background-loop.mp4';
      }
      image.src = backendURL + data.data.movie.cover;
      title.innerHTML = data.data.movie.title;
      document.title = data.data.movie.title + ' - Streaming';

      play.addEventListener('click', function () {
        window.location.href = `/player/${movieSlug}`;
      });
    } else {
      console.error('Error al consultar la API: ', data.message);
    }
  } catch (error) {
    alert('Error en la solicitud: ', error);
    console.log(error);
  }
}

fetchMovieData();
