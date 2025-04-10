const token = localStorage.getItem('auth_token');
const user_id = localStorage.getItem('current_user_id');
const device_id = localStorage.getItem('device_id_' + user_id);
const apiActiveStreams = 'https://streaming.test/api/check-active-streams';
const apiKeepAlive = 'https://streaming.test/api/keep-alive';

async function initStream() {
    try {
        const response = await fetch(apiActiveStreams, {
            method: 'POST', 
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Device-Id': device_id,
            },
        });

        const data = await response.json();

        if (data.stream_limit_reached) {
            window.location.href = '/stream-limit';
            return;
        }

        if (data.success) {
            console.log(data.message);
        }

        startKeepAliveInterval();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al comprobar streams: ' + error.message);
        window.location.href = '/index.html';
    }
}

let keepAliveInterval;

function startKeepAliveInterval() {
    keepAlive(apiKeepAlive, token, device_id);
    
    keepAliveInterval = setInterval(() => {
        keepAlive(apiKeepAlive, token, device_id);
    }, 30000);
}

async function keepAlive(api, token, device_id) {
    try {
        const response = await fetch(api, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Device-Id': device_id,
            },
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error al actualizar stream');
        } else {
            console.log(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

initStream();

