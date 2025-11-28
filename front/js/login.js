const loginForm = document.getElementById('loginForm');
const msgError = document.getElementById('msgError');

const API_URL = 'http://localhost:8000/login';

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });


        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.user);

            window.location.href = 'dashboard.html';
        } else {
            console.error('Error del servidor:', data.error);
            showError(data.error || 'Error de acceso');
        }

    } catch (error) {
        console.error('Error de red:', error);
        showError('Servidor no disponible');
    }
});

function showError(msg) {
    msgError.innerText = msg;
    msgError.style.display = 'block';
}