import { logOut } from '../modules/logOut.js';
import { adminCheck } from '../modules/adminCheck.js';

const user_id = localStorage.getItem('current_user_id');
const device_id = localStorage.getItem('device_id_' + user_id);
const token = localStorage.getItem('auth_token');
const logOutButton = document.querySelector('.login-btn');

if (token == null) {
  window.location.href = '/login';
}

if (device_id == null) {
  logOut(token);
}

document.addEventListener('DOMContentLoaded', adminCheck(token));

logOutButton.addEventListener('click', function () {
    logOut(token);
})
