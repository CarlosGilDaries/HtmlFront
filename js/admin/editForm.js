const urlParams = new URLSearchParams(window.location.search);
let slug = urlParams.get('slug');
const token = localStorage.getItem('auth_token');
const backendAPI = 'https://streaming.test/api/';

async function loadContentData(slug) {
  try {
    const response = await fetch(backendAPI + `content/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const content = data.data.movie;
    let currentPlansId = [];
    content.plans.forEach((plan) => {
      currentPlansId.push(plan.id);
    });

    document.getElementById('title').value = content.title;
    CKEDITOR.instances.tagline.setData(content.tagline);
    CKEDITOR.instances.overview.setData(content.overview);

    checkboxPlans = document.querySelectorAll('.plan-checkbox');
    checkboxPlans.forEach((chbox) => {
      chbox.checked = currentPlansId.includes(Number(chbox.value));
    });

    document.getElementById('gender_id').value = content.gender_id;
    document.getElementById('pay_per_view').checked = content.pay_per_view == 1;
    document.getElementById('pay_per_view_price').value =
      content.pay_per_view_price;
    document.getElementById('start_time').value = content.start_time;
    document.getElementById('end_time').value = content.end_time;
  } catch (error) {
    console.error('Error cargando contenido:', error);
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const plansContainer = document.getElementById('plans-container');
    let plansContainerTextContent = '';
    const response = await fetch(backendAPI + 'plans');
    const data = await response.json();
    const plans = data.plans;

    plans.forEach((plan) => {
      plansContainerTextContent += `
                                    <label class="checkbox-container">
                                      <input type="checkbox" name="plans[${plan.id}][id]" value="${plan.id}" id="plan-${plan.id}" class="plan-checkbox">
                                      <span class="checkmark"></span>
                                        <p>${plan.name}</p>
                                    </label>
                                    `;
    });
    plansContainer.innerHTML = plansContainerTextContent;

    // Mostrar nombre de archivos seleccionados
    const setupFileInput = (inputId, nameId, labelId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('change', function (e) {
          const fileName =
            e.target.files[0]?.name || 'Ningún archivo seleccionado';
          if (nameId) document.getElementById(nameId).textContent = fileName;
          if (labelId) document.getElementById(labelId).textContent = fileName;
        });
      }
    };
    setupFileInput('cover', 'cover-name', 'cover-label-text');
    setupFileInput('trailer', 'trailer-name', 'trailer-label-text');
    
  } catch (error) {
    console.log(error);
  }

  loadContentData(slug);
  document
    .getElementById('pay_per_view')
    .addEventListener('change', function () {
      const payPerViewFields = document.getElementById('pay_per_view_fields');
      if (this.checked) {
        payPerViewFields.classList.remove('hidden');
      } else {
        payPerViewFields.classList.add('hidden');
        document.getElementById('pay_per_view_price').value = '';
      }
    });
  
  document
    .getElementById('content-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      document.getElementById('loading').style.display = 'block';

      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('gender_id', document.getElementById('gender_id').value);
      formData.append('tagline', CKEDITOR.instances.tagline.getData());
      formData.append('overview', CKEDITOR.instances.overview.getData());
      formData.append(
        'pay_per_view',
        document.getElementById('pay_per_view').checked ? '1' : '0'
      );

      if (document.getElementById('pay_per_view').value) {
        formData.append(
          'pay_per_view_price',
          document.getElementById('pay_per_view_price').value
        );
      }

      if (document.getElementById('start_time').value) {
        formData.append(
          'start_time',
          document.getElementById('start_time').value
        );
      }

      if (document.getElementById('end_time').value) {
        formData.append('end_time', document.getElementById('end_time').value);
      }

      const coverInput = document.getElementById('cover');
      if (coverInput && coverInput.files.length > 0) {
        formData.append('cover', coverInput.files[0]);
      } else {
        formData.append('cover', ''); // Envía un valor vacío si no hay archivo
      }

      if (
        document.getElementById('trailer') &&
        document.getElementById('trailer').files[0]
      ) {
        formData.append('trailer', document.getElementById('trailer').files[0]);
      }

      const checkboxes = document.querySelectorAll('.plan-checkbox');
      let atLeastOneChecked = false;

      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          formData.append('plans[]', checkbox.value);
          atLeastOneChecked = true;
        }
      });

      if (!atLeastOneChecked) {
        document.getElementById('loading').style.display = 'none';
        alert('Selecciona al menos un plan');
        return;
      }

      try {
        const editResponse = await fetch(
          backendAPI + `update-content/${slug}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const data = await editResponse.json();

        if (data.success) {
          // Mostrar mensaje de éxito
          document.getElementById('success-message').style.display = 'block';

          setTimeout(() => {
            document.getElementById('success-message').style.display = 'none';
          }, 5000);

          if (data.new_slug && data.new_slug !== slug) {
            const newUrl = window.location.pathname + '?slug=' + data.new_slug;
            window.history.pushState({ path: newUrl }, '', newUrl);
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
        document.getElementById('loading').style.display = 'none';
      }
    });
});

