const pathParts = window.location.pathname.split('/');
const movieSlug = pathParts[pathParts.length - 1];

const api = `http://streaming.test/api/content/${movieSlug}`;
const backendURL = 'http://streaming.test';
const player = videojs('my-video');
const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';
}

fetch(api, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      const videoUrl = backendURL + data.data.movie.url;
      document.title = data.data.movie.title;

      if (data.data.movie.type === 'audio/mp3') {
        const playerElement = document.querySelector('.video-js');
        playerElement.style.backgroundImage = `url('${
          backendURL + data.data.movie.cover
        }')`;
        playerElement.style.backgroundSize = 'cover';
        playerElement.style.backgroundPosition = 'center';
      }

      player.src({
        src: videoUrl,
        type: data.data.movie.type,
      });

      player.play();
    } else {
      console.error('Error al obtener el video:', data.message);
    }
  })
  .catch((error) => {
    console.error('Error en la solicitud: ', error);
    window.location.href = '/login';
  });



document.addEventListener('keydown', function (event) {
  if (
    event.key === 'F12' ||
    (event.ctrlKey &&
      event.shiftKey &&
      (event.key === 'I' || event.key === 'J')) ||
    (event.ctrlKey && event.key === 'U')
  ) {
    event.preventDefault();
  }
});
