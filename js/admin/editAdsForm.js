const urlParams = new URLSearchParams(window.location.search);
let slug = localStorage.getItem('slug');
const token = localStorage.getItem('auth_token');
const backendAPI = 'https://streaming.test/api/';

async function loadContentData(slug) {
  try {
    const response = await fetch(backendAPI + `ad/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
      const ad = data.data;
      console.log(ad);
    
      document.getElementById('edit-ad-title').value = ad.title;
      document.getElementById('edit-ad-brand').value = ad.brand;
      
  } catch (error) {
    console.error('Error cargando anuncio:', error);
  }
}

(function () {
  async function editAdsForm() {
    loadContentData(slug);

    document
      .getElementById('edit-ad-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        document.getElementById('loading').style.display = 'block';

        const formData = new FormData();
        formData.append('title', document.getElementById('edit-ad-title').value);
        formData.append('brand', document.getElementById('edit-ad-brand').value);

        try {
          const editResponse = await fetch(backendAPI + `update-ad/${slug}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          const data = await editResponse.json();

          if (data.success) {
            // Mostrar mensaje de éxito
            document.getElementById('edit-ad-success-message').style.display =
              'block';

            setTimeout(() => {
              document.getElementById('edit-ad-success-message').style.display =
                'none';
            }, 5000);

            if (data.new_slug && data.new_slug !== slug) {
              slug = data.new_slug;
            }
            console.log('Archivo editado.');
            loadContentData(slug);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            console.log('Error al editar:', data.message);
          }
        } catch (error) {
          console.log(error);
        } finally {
          document.getElementById('edit-ad-loading').style.display = 'none';
        }
      });
  }

  // Verificar si el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', editAdsForm);
  } else {
    editAdsForm();
  }
})();
