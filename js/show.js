const pathParts = window.location.pathname.split('/');
const movieSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL
const api = 'http://streaming.test/api/content/' + movieSlug;
const backendURL = 'http://streaming.test';
const play = document.getElementById('play-button');
const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';
}

// Función asincrónica que maneja la solicitud
async function fetchMovieData() {
  try {
    const response = await fetch(api, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Aquí envías el token en los encabezados
      },
    });

    const data = await response.json();

    if (data.success) {
      const image = document.getElementById('content-image');
      const title = document.getElementById('content-title');
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
    console.error('Error en la solicitud: ', error);
    window.location.href = '/login';
  }
}

// Llamar a la función asincrónica
fetchMovieData();
