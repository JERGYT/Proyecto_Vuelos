const FLIGHTS_API = 'http://localhost:8001/api/flights';
const RESERVATIONS_API = 'http://localhost:8001/api/reservations';

const token = localStorage.getItem('token');
const role = localStorage.getItem('userRole');
const userName = localStorage.getItem('userName');

if (!token) {
    window.location.href = 'index.html';
}

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
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
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
            
            let actionButtons = '';
            if (role === 'administrador') {
                actionButtons = `<button class="btn-card btn-delete" onclick="eliminarVuelo(${vuelo.id})">Eliminar</button>`;
            } else if (role === 'gestor') {
                actionButtons = `<button class="btn-card btn-reserve" onclick="reservarVuelo(${vuelo.id})">Reservar</button>`;
            }

            card.innerHTML = `
                <div class="card-header">
                    ${vuelo.origin} - ${vuelo.destination}
                </div>
                <div class="card-body">
                    <p><strong>Nave:</strong> ${vuelo.nave ? vuelo.nave.model : 'No asignada'}</p>
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p class="price">Precio: ${precio}</p>
                </div>
                <div class="card-actions">
                    ${actionButtons}
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="error-msg">Error de conexión.</p>';
    }
}
async function verReservas() {
    const modal = document.getElementById('modalReservas');
    const tbody = document.getElementById('listaReservasBody');
    
    modal.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        const response = await fetch(RESERVATIONS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reservas = await response.json();
        tbody.innerHTML = '';

        if (reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay reservas.</td></tr>';
            return;
        }

        reservas.forEach(r => {
            const vueloInfo = r.flight ? `${r.flight.origin}-${r.flight.destination}` : 'Eliminado';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.id}</td>
                <td>${vueloInfo}</td>
                <td>${r.user_id}</td>
                <td class="status-${r.status}">${r.status}</td>
                <td>${r.status === 'activa' ? `<button class="btn-card btn-delete" onclick="cancelarReserva(${r.id})">Cancelar</button>` : '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="error-msg">Error de conexión.</td></tr>';
    }
}

function cerrarModal() {
    document.getElementById('modalReservas').classList.add('hidden');
}

async function cancelarReserva(id) {
    if(!confirm('¿Cancelar reserva?')) return;
    try {
        const res = await fetch(`${RESERVATIONS_API}/${id}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) { alert('Cancelada'); verReservas(); }
    } catch(e) { console.error(e); }
}

async function reservarVuelo(id) {
    if(!confirm('¿Reservar vuelo?')) return;
    try {
        const res = await fetch(RESERVATIONS_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ flight_id: id, user_id: 2, status: 'activa' })
        });
        if(res.ok) alert('Reserva creada');
    } catch(e) { console.error(e); }
}

function eliminarVuelo(id) {
    if(confirm('¿Eliminar vuelo? (Simulado)')) alert('Eliminando ID: ' + id);
}
function crearVuelo() { alert('Crear vuelo (Pendiente)'); }
function gestionarUsuarios() { alert('Gestión usuarios (Pendiente)'); }