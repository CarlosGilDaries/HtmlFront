document.addEventListener('DOMContentLoaded', function () {
  const backendAPI = 'https://streaming.test/api/';
  
  // Mostrar nombre de archivos seleccionados
  if (document.getElementById('cover')) {
    document.getElementById('cover').addEventListener('change', function (e) {
      const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
      document.getElementById('cover-name').textContent = fileName;
      document.getElementById('cover-label-text').textContent = fileName;
    });
  }

  document.getElementById('content').addEventListener('change', function (e) {
    const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
    document.getElementById('content-name').textContent = fileName;
    document.getElementById('content-label-text').textContent = fileName;
  });

  document.getElementById('m3u8').addEventListener('change', function (e) {
    const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
    document.getElementById('m3u8-name').textContent = fileName;
    document.getElementById('m3u8-label-text').textContent = fileName;
  });

  document.getElementById('ts1').addEventListener('change', function (e) {
    const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
    document.getElementById('ts1-name').textContent = fileName;
    document.getElementById('ts1-label-text').textContent = fileName;
  });

  document.getElementById('ts2').addEventListener('change', function (e) {
    const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
    document.getElementById('ts2-name').textContent = fileName;
    document.getElementById('ts2-label-text').textContent = fileName;
  });

  document.getElementById('ts3').addEventListener('change', function (e) {
    const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
    document.getElementById('ts3-name').textContent = fileName;
    document.getElementById('ts3-label-text').textContent = fileName;
  });

  // Mostrar/ocultar campos según tipo de contenido
  document.getElementById('type').addEventListener('change', function () {
    const type = this.value;
    const singleContent = document.getElementById('single-content');
    const hlsContent = document.getElementById('hls-content');

    if (type === 'application/vnd.apple.mpegurl') {
      singleContent.classList.add('hidden');
      hlsContent.classList.remove('hidden');
      document.getElementById('content').required = false;
      document.getElementById('m3u8').required = true;
    } else {
      singleContent.classList.remove('hidden');
      hlsContent.classList.add('hidden');
      document.getElementById('content').required = true;
      document.getElementById('m3u8').required = false;
    }
  });

  // Manejar envío del formulario
  document
    .getElementById('content-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Resetear mensajes de error
      document
        .querySelectorAll('.error-message')
        .forEach((el) => (el.textContent = ''));
      document.getElementById('success-message').style.display = 'none';

      // Mostrar loader
      document.getElementById('loading').style.display = 'block';

      // Obtener token de autenticación
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        window.location.href = '/login';
        return;
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('brand', document.getElementById('brand').value);
      formData.append('type', document.getElementById('type').value);
      if (document.getElementById('cover')) {
        formData.append('cover', document.getElementById('cover').files[0]);
      }

      const type = document.getElementById('type').value;
      if (type === 'application/vnd.apple.mpegurl') {
        formData.append('m3u8', document.getElementById('m3u8').files[0]);
        formData.append('ts1', document.getElementById('ts1').files[0]);
        formData.append('ts2', document.getElementById('ts2').files[0]);
        formData.append('ts3', document.getElementById('ts3').files[0]);
      } else {
        formData.append('content', document.getElementById('content').files[0]);
      }

      try {
        const response = await fetch(backendAPI + '/add-ad', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al subir el anuncio');
        }

        // Mostrar mensaje de éxito
        document.getElementById('success-message').style.display = 'block';
        document.getElementById(
          'success-message'
        ).textContent = `${data.message} - ${data.data.ad.title}`;

        // Resetear formulario
        document.getElementById('content-form').reset();
        document
          .querySelectorAll('.file-name')
          .forEach((el) => (el.textContent = ''));
        document.querySelectorAll('.file-input-label span').forEach((el) => {
          el.textContent = 'Seleccionar archivo...';
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    });
});
