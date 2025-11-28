const loginForm = document.getElementById('loginForm');
const msgError = document.getElementById('msgError');
const btnDebug = document.getElementById('btnDebug');

const API_URL = 'http://localhost:8000/login';

btnDebug.addEventListener('click', () => {
    console.warn('>>> MODO DEV ACTIVADO: Llenando formulario...');
    document.getElementById('email').value = 'admin@system.com';
    document.getElementById('password').value = 'admin123';
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Evento submit detectado. Iniciando proceso...');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Credenciales a enviar:', { email, password });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('Servidor respondió con status:', response.status);

        const data = await response.json();

        if (response.ok) {
            console.log('Token recibido:', data.token);
            
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