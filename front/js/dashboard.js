const FLIGHTS_API = 'http://localhost:8001/api/flights';
const RESERVATIONS_API = 'http://localhost:8001/api/reservations';
const NAVES_API = 'http://localhost:8001/api/naves';
const USERS_API = 'http://localhost:8000/users';

const token = localStorage.getItem('token');
const role = localStorage.getItem('userRole');
const userName = localStorage.getItem('userName');

function mostrarNotificacion(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function pedirConfirmacion(mensaje, callbackAceptar) {
    const modal = document.getElementById('modalConfirm');
    const texto = document.getElementById('msgConfirm');
    const btnYes = document.getElementById('btnConfirmYes');

    texto.textContent = mensaje;
    modal.classList.remove('hidden');

    const nuevoBtn = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(nuevoBtn, btnYes);
    
    nuevoBtn.addEventListener('click', () => {
        callbackAceptar();
        cerrarConfirm();
    });
}

function cerrarConfirm() {
    document.getElementById('modalConfirm').classList.add('hidden');
}

if (!token) window.location.href = 'index.html';

document.getElementById('userInfo').textContent = `${userName} (${role})`;

if (role === 'administrador') {
    document.getElementById('adminControls').classList.remove('hidden');
} else if (role === 'gestor') {
    document.getElementById('gestorControls').classList.remove('hidden');
}

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

window.addEventListener('DOMContentLoaded', cargarVuelos);

async function cargarVuelos() {
    const contenedor = document.getElementById('flightsGrid');
    try {
        const response = await fetch(FLIGHTS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        const vuelos = await response.json();
        contenedor.innerHTML = '';

        if (vuelos.length === 0) {
            contenedor.innerHTML = '<p>No hay vuelos registrados.</p>';
            return;
        }

        vuelos.forEach(vuelo => {
            const precio = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(vuelo.price);
            const fecha = new Date(vuelo.departure).toLocaleString();
            
            const card = document.createElement('div');
            card.className = 'flight-card';
            
            let btns = '';
            if (role === 'administrador') btns = `<button class="btn-card btn-delete" onclick="eliminarVuelo(${vuelo.id})">Eliminar</button>`;
            if (role === 'gestor') btns = `<button class="btn-card btn-reserve" onclick="reservarVuelo(${vuelo.id})">Reservar</button>`;

            card.innerHTML = `
                <div class="card-header">${vuelo.origin} - ${vuelo.destination}</div>
                <div class="card-body">
                    <p><strong>Nave:</strong> ${vuelo.nave ? vuelo.nave.model : 'Sin nave'}</p>
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p class="price">${precio}</p>
                </div>
                <div class="card-actions">${btns}</div>
            `;
            contenedor.appendChild(card);
        });
    } catch (e) {
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function eliminarVuelo(id) {
    pedirConfirmacion('¿Seguro que deseas eliminar este vuelo irreversiblemente?', () => {
        mostrarNotificacion(`Solicitud de eliminación enviada (ID: ${id})`, 'success');
    });
}

async function reservarVuelo(id) {
    pedirConfirmacion('¿Confirmas que deseas crear una reserva para este vuelo?', async () => {
        try {
            const res = await fetch(RESERVATIONS_API, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ flight_id: id, user_id: 2, status: 'activa' })
            });

            if (res.ok) mostrarNotificacion('Reserva creada exitosamente', 'success');
            else mostrarNotificacion('No se pudo crear la reserva', 'error');
        } catch (e) {
            mostrarNotificacion('Error de red', 'error');
        }
    });
}

async function verReservas() {
    const modal = document.getElementById('modalReservas');
    const tbody = document.getElementById('listaReservasBody');
    modal.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        const res = await fetch(RESERVATIONS_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Sin reservas.</td></tr>';
            return;
        }

        data.forEach(r => {
            const info = r.flight ? `${r.flight.origin}-${r.flight.destination}` : 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.id}</td><td>${info}</td><td>${r.user_id}</td>
                <td class="status-${r.status}">${r.status}</td>
                <td>${r.status === 'activa' ? `<button class="btn-card btn-delete" onclick="cancelarReserva(${r.id})">Cancelar</button>` : '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        mostrarNotificacion('Error al cargar reservas', 'error');
    }
}

async function cancelarReserva(id) {
    pedirConfirmacion('¿Cancelar esta reserva?', async () => {
        try {
            const res = await fetch(`${RESERVATIONS_API}/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                mostrarNotificacion('Reserva cancelada', 'success');
                verReservas(); 
            } else {
                mostrarNotificacion('Error al cancelar', 'error');
            }
        } catch (e) {
            mostrarNotificacion('Error de red', 'error');
        }
    });
}

async function crearVuelo() {
    const modal = document.getElementById('modalVuelo');
    const select = document.getElementById('vueloNave');
    modal.classList.remove('hidden');

    try {
        const res = await fetch(NAVES_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const naves = await res.json();
        select.innerHTML = '<option value="">Seleccione nave...</option>';
        naves.forEach(n => {
            select.innerHTML += `<option value="${n.id}">${n.model} (${n.name})</option>`;
        });
    } catch (e) {
        mostrarNotificacion('Error cargando naves', 'error');
    }
}

document.getElementById('formCrearVuelo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const salida = document.getElementById('vueloSalida').value;
    const llegada = document.getElementById('vueloLlegada').value;

    if (new Date(llegada) <= new Date(salida)) {
        mostrarNotificacion('La fecha de llegada debe ser posterior a la salida', 'error');
        return;
    }

    const data = {
        origin: document.getElementById('vueloOrigen').value,
        destination: document.getElementById('vueloDestino').value,
        departure: salida,
        arrival: llegada,
        price: document.getElementById('vueloPrecio').value,
        nave_id: document.getElementById('vueloNave').value
    };

    try {
        const res = await fetch(FLIGHTS_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            mostrarNotificacion('Vuelo creado correctamente', 'success');
            cerrarModalVuelo();
            cargarVuelos();
            e.target.reset();
        } else {
            mostrarNotificacion('Error al crear vuelo', 'error');
        }
    } catch (e) {
        mostrarNotificacion('Error de conexión', 'error');
    }
});

function cerrarModalVuelo() { document.getElementById('modalVuelo').classList.add('hidden'); }
function cerrarModal() { document.getElementById('modalReservas').classList.add('hidden'); }
function gestionarUsuarios() { mostrarNotificacion('Función no implementada aún', 'error'); }

async function gestionarUsuarios() {
    const modal = document.getElementById('modalUsuarios');
    const tbody = document.getElementById('listaUsuariosBody');
    
    modal.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        const response = await fetch(USERS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await response.json();
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><strong>${u.role}</strong></td>
                <td>
                    ${u.email !== 'admin@system.com' ? `<button class="btn-card btn-delete" onclick="eliminarUsuario(${u.id})">Eliminar</button>` : '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        mostrarNotificacion('Error cargando usuarios', 'error');
    }
}

function cerrarModalUsuarios() {
    document.getElementById('modalUsuarios').classList.add('hidden');
}

document.getElementById('formCrearUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        password: document.getElementById('newUserPass').value,
        role: document.getElementById('newUserRole').value
    };

    try {
        const response = await fetch(USERS_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            mostrarNotificacion('Usuario creado', 'success');
            gestionarUsuarios();
            e.target.reset();
        } else {
            mostrarNotificacion('Error al crear usuario', 'error');
        }
    } catch (e) {
        mostrarNotificacion('Error de conexión', 'error');
    }
});

async function eliminarUsuario(id) {
    pedirConfirmacion('¿Eliminar este usuario?', async () => {
        try {
            const response = await fetch(`${USERS_API}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                mostrarNotificacion('Usuario eliminado', 'success');
                gestionarUsuarios();
            } else {
                mostrarNotificacion('No se pudo eliminar', 'error');
            }
        } catch (e) {
            mostrarNotificacion('Error de red', 'error');
        }
    });
}

async function gestionarNaves() {
    const modal = document.getElementById('modalNaves');
    const tbody = document.getElementById('listaNavesBody');
    
    modal.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="5">Cargando flota...</td></tr>';

    try {
        const res = await fetch(NAVES_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const naves = await res.json();
        tbody.innerHTML = '';

        if (naves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay naves registradas.</td></tr>';
            return;
        }

        naves.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${n.id}</td>
                <td><strong>${n.name}</strong></td>
                <td>${n.model}</td>
                <td>${n.capacity} Pasajeros</td>
                <td><button class="btn-card btn-delete" onclick="eliminarNave(${n.id})">Eliminar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        mostrarNotificacion('Error cargando naves', 'error');
    }
}

function cerrarModalNaves() {
    document.getElementById('modalNaves').classList.add('hidden');
}

document.getElementById('formCrearNave').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('newNaveName').value,
        model: document.getElementById('newNaveModel').value,
        capacity: document.getElementById('newNaveCap').value
    };

    try {
        const res = await fetch(NAVES_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            mostrarNotificacion('Nave registrada correctamente', 'success');
            gestionarNaves(); 
            e.target.reset(); 
        } else {
            mostrarNotificacion('Error al registrar nave', 'error');
        }
    } catch (e) {
        mostrarNotificacion('Error de conexión', 'error');
    }
});

async function eliminarNave(id) {
    pedirConfirmacion('¿Eliminar esta aeronave? (No debe tener vuelos activos)', async () => {
        try {
            const res = await fetch(`${NAVES_API}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                mostrarNotificacion('Nave eliminada de la flota', 'success');
                gestionarNaves();
            } else {
                mostrarNotificacion('No se pudo eliminar. Verifique que no tenga vuelos asignados.', 'error');
            }
        } catch (e) {
            mostrarNotificacion('Error de red', 'error');
        }
    });
}