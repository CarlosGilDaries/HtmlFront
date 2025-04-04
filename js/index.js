const api = 'http://streaming.test/api/content';
let backendURL = 'http://streaming.test';

fetch(api)
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      const audio = document.getElementById('audio-content');
      const video = document.getElementById('video-content');

      getAudioContent(data, audio);
      getVideoContent(data, video);

      addScrollFunctionality(audio);
      addScrollFunctionality(video);
    } else {
      console.error('Error al consultar la API: ', data.message);
    }
  })
  .catch((error) => console.error('Error en la solicitud: ', error));

function getAudioContent(data, node) {
  const audios = new Set();

  data.data.forEach((element) => {
    if (element.type == 'audio/mp3') {
      audios.add(element);
    }
  });

  audios.forEach((audio) => {
    const article = document.createElement('article');
    article.classList.add('content');

    const link = document.createElement('a');
    link.href = `/${audio.slug}`;

    const img = document.createElement('img');
    img.src = backendURL + audio.cover;

    link.append(img);
    article.append(link);
    node.append(article);
  });

  return audios;
}

function getVideoContent(data, node) {
  const videos = new Set();

  data.data.forEach((element) => {
    if (element.type != 'audio/mp3') {
      videos.add(element);
    }
  });

  videos.forEach((video) => {
    const article = document.createElement('article');
    article.classList.add('content');

    const link = document.createElement('a');
    link.href = `/${video.slug}`;

    const img = document.createElement('img');
    img.src = backendURL + video.cover;

    link.append(img);
    article.append(link);
    node.append(article);
  });

  return videos;
}

document.addEventListener('DOMContentLoaded', function () {
  const menu = document.querySelector('.menu');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 0) {
      console.log('scroll');
      // Si se ha hecho scroll hacia abajo
      menu.classList.add('scrolled');
    } else {
      menu.classList.remove('scrolled');
    }
  });
});

// Función para agregar funcionalidad de desplazamiento con flechas
function addScrollFunctionality(container) {
  const wrapper = container.parentElement;
  const leftArrow = wrapper.querySelector('.scroll-left');
  const rightArrow = wrapper.querySelector('.scroll-right');

  function updateArrows() {
    leftArrow.classList.toggle('hidden', container.scrollLeft <= 0);
    rightArrow.classList.toggle('hidden', container.scrollLeft + container.clientWidth >= container.scrollWidth);
  }

  leftArrow.addEventListener('click', () => {
    container.scrollBy({ left: -450, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    container.scrollBy({ left: 450, behavior: 'smooth' });
  });

  container.addEventListener('scroll', updateArrows);
  window.addEventListener('resize', updateArrows);

  updateArrows(); // Inicializa el estado de las flechas
}

// Verificar si hay un token de autenticación
document.addEventListener('DOMContentLoaded', async function () {
  const userIcon = document.querySelector('.user');
  const navRight = document.querySelector('.right-nav');

  const token = localStorage.getItem('auth_token');

  if (!token) {
    if (userIcon) userIcon.remove();

    const loginButton = document.createElement('li');
    loginButton.innerHTML = `<a href="/login"><button class="login-btn">Iniciar sesión</button></a>`;
    navRight.appendChild(loginButton);
  }
});
