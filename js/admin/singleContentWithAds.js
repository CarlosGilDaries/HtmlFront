const urlParams = new URLSearchParams(window.location.search);
let slug = urlParams.get('slug');
const token = localStorage.getItem('auth_token');
const backendAPI = 'https://streaming.test/api/';

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch(backendAPI + `content-with-ads/${slug}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (data.success) {
            movieId = data.data.movie.id;
            ads = data.data.movie.ads;
            document.querySelector('h1').innerHTML = data.data.movie.title;
            document.getElementById('ads-table').innerHTML = generateAdsTable(ads, movieId);
            setupUnlinkButtons(token);
        }
    } catch (error) {
        console.log(error);
    }
});

function generateAdsTable(ads, movieId) {
  if (!ads || ads.length === 0) {
    return '<p>No hay anuncios vinculados a este contenido.</p>';
  }

  let tableHTML = `
        <table class="ads-table">
            <thead>
                <tr>
                    <th>Anuncio</th>
                    <th>Tipo</th>
                    <th>Tiempo Midroll</th>
                    <th>Saltable</th>
                    <th>Skip Time</th>
                    <th>Desvincular</th>
                </tr>
            </thead>
            <tbody>
    `;

  ads.forEach((ad) => {
    tableHTML += `
            <tr data-ad-id="${ad.id}">
                <td>${ad.title}</td>
                <td>${ad.pivot.type}</td>
                <td>${ad.pivot.midroll_time || '-'}</td>
                <td>${ad.pivot.skippable ? 'Sí' : 'No'}</td>
                <td>${ad.pivot.skip_time || '-'}</td>
                <td>
                    <button class="unlink-btn" 
                            data-content-id="${movieId}" 
                            data-ad-id="${ad.id}">
                        Desvincular
                    </button>
                </td>
            </tr>
        `;
  });

  tableHTML += `
            </tbody>
        </table>
    `;

  return tableHTML;
}

function setupUnlinkButtons(token) {
    document.querySelectorAll('.unlink-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const contentId = this.getAttribute('data-content-id');
            const adId = this.getAttribute('data-ad-id');
            
            if (confirm('¿Estás seguro de que deseas desvincular este anuncio?')) {
                try {
                    const response = await fetch(backendAPI + 'content-with-ads-destroy', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            content_id: contentId,
                            ad_id: adId
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Eliminar la fila de la tabla
                        document.querySelector(`tr[data-ad-id="${adId}"]`).remove();
                        alert('Anuncio desvinculado correctamente');
                        document.getElementById('ads-table').innerHTML =
                        generateAdsTable(ads, movieId);
                    } else {
                        alert('Error al desvincular: ' + (data.message || 'Error desconocido'));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión al intentar desvincular');
                }
            }
        });
    });
}

function setupUnlinkButtons() {
    document.querySelectorAll('.unlink-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const contentId = this.getAttribute('data-content-id');
            const adId = this.getAttribute('data-ad-id');
            
            if (confirm('¿Estás seguro de que deseas desvincular este anuncio?')) {
                try {
                    const response = await fetch(backendAPI + 'content-with-ads-destroy', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            content_id: contentId,
                            ad_id: adId
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Eliminar la fila de la tabla
                        document.querySelector(`tr[data-ad-id="${adId}"]`).remove();
                        alert('Anuncio desvinculado correctamente');
                    } else {
                        alert('Error al desvincular: ' + (data.message || 'Error desconocido'));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión al intentar desvincular');
                }
            }
        });
    });
}