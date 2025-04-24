import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';
import { loadAds } from './modules/loadAds.js';
import { initAdPlayer } from './modules/adPlayer.js';

const pathParts = window.location.pathname.split('/');
const movieSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL
const apiShow = 'https://streaming.test/api/content/' + movieSlug;
const apiAds = 'https://streaming.test/api/ads/';
const backendURL = 'https://streaming.test';

const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';
}

const user_id = localStorage.getItem('current_user_id');
const userJson = localStorage.getItem('user_' + user_id);
const user = JSON.parse(userJson);
const email = user.email;
const device_id = localStorage.getItem('device_id_' + email);
const ip = await getIp();
const userAgent = navigator.userAgent;

if (device_id == null) {
  logOut(token);
}

fetch(apiShow, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'User-Device-ID': device_id,
    'User-Ip': ip,
    'User-Agent': userAgent,
    Authorization: `Bearer ${token}`,
    'User-Id': user_id,
  },
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      // Si no hay anuncios vinculados
      if (data.data.ads_count == 0) {
        const player = videojs('my-video');
        const videoUrl = backendURL + data.data.movie.url;
        document.title = data.data.movie.title;

        if (data.data.movie.type === 'audio/mp3') {
          const playerElement = document.querySelector('.video-js');
          playerElement.style.backgroundImage = `url('${backendURL + data.data.movie.cover
            }')`;
          playerElement.style.backgroundSize = 'cover';
          playerElement.style.backgroundPosition = 'center';
        }

        player.src({
          src: videoUrl,
          type: data.data.movie.type,
        });

        player.play();

        // Si hay anuncios vinculados
      } else {
        const player = videojs("my-video", {}, async function () {
          let playedMidrolls = new Set(); // Almacena los midrolls ya reproducidos
          let pendingMidrolls = []; // Almacena los midrolls que aún deben reproducirse
          let isPlayingMidroll = false; // Indica si se está reproduciendo un midroll
          let savedTime = 0; // Variable para guardar el tiempo antes del midroll

          const { movie, ads } = await loadAds(movieSlug, apiAds, token);
          const movieUrl = movie.url;
          const movieType = movie.type;

          await initAdPlayer(player, movieUrl, backendURL, movieType, ads);
        });
      }
    } else {
      console.error('Error al obtener el video:', data.message);
    }
  })
  .catch((error) => {
    console.error('Error en la solicitud: ', error);
  });

document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
})

document.addEventListener('keydown', function (event) {
  if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) || (event.ctrlKey && event.key === 'U')) {
    event.preventDefault();
  }
});
