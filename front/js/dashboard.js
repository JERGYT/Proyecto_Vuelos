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

function cerrarConfirm() { document.getElementById('modalConfirm').classList.add('hidden'); }

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
    const inputBusqueda = document.getElementById('searchInput');
    if(inputBusqueda) inputBusqueda.value = '';

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
        renderizarVuelos(vuelos);
        
    } catch (e) {
        console.error(e);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function buscarVuelos() {
    let query = document.getElementById('searchInput').value.trim();
    if(!query) return cargarVuelos();

    if (query.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const partes = query.split('/');
        query = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    try {
        const res = await fetch(`${FLIGHTS_API}/search?q=${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const vuelos = await res.json();
        renderizarVuelos(vuelos); 
    } catch (e) {
        mostrarNotificacion('Error al buscar', 'error');
    }
}

function renderizarVuelos(vuelos) {
    const contenedor = document.getElementById('flightsGrid');
    contenedor.innerHTML = '';
    
    if (vuelos.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron resultados.</p>';
        return;
    }

    vuelos.forEach(vuelo => {
        const precio = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(vuelo.price);
        const fechaObj = new Date(vuelo.departure);
        const fecha = fechaObj.toLocaleDateString('es-CO') + ' ' + fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const card = document.createElement('div');
        card.className = 'flight-card';
        
        let btns = '';

        if (role === 'administrador') {
            btns = `
                <button class="btn-card btn-reserve" 
                    onclick="abrirEditarVuelo(${vuelo.id}, '${vuelo.origin}', '${vuelo.destination}', ${vuelo.price})">
                    Editar
                </button>
                <button class="btn-card btn-delete" onclick="eliminarVuelo(${vuelo.id})">
                    Eliminar
                </button>
            `;
        }
        
        if (role === 'gestor') {
            btns = `<button class="btn-card btn-reserve" onclick="reservarVuelo(${vuelo.id})">Reservar</button>`;
        }

        card.innerHTML = `
            <div class="card-header">${vuelo.origin} - ${vuelo.destination}</div>
            <div class="card-body">
                <p><strong>Nave:</strong> ${vuelo.nave ? vuelo.nave.model : 'Sin nave asignada'}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p class="price">${precio}</p>
            </div>
            <div class="card-actions" style="display:flex; gap:5px; justify-content:end;">${btns}</div>
        `;
        contenedor.appendChild(card);
    });
}


function abrirEditarVuelo(id, origen, destino, precio) {
    document.getElementById('editId').value = id;
    document.getElementById('editType').value = 'flight';
    document.getElementById('tituloEditar').innerText = 'Editar Vuelo #' + id;
    
    const div = document.getElementById('camposEditar');
    div.innerHTML = `
        <label>Origen:</label> <input type="text" id="ed_origin" value="${origen}" class="input-sm">
        <label>Destino:</label> <input type="text" id="ed_dest" value="${destino}" class="input-sm">
        <label>Precio:</label> <input type="number" id="ed_price" value="${precio}" class="input-sm">
    `;
    document.getElementById('modalEditar').classList.remove('hidden');
}

function abrirEditarNave(id, nombre, modelo, capacidad) {
    document.getElementById('editId').value = id;
    document.getElementById('editType').value = 'nave';
    document.getElementById('tituloEditar').innerText = 'Editar Nave #' + id;

    const div = document.getElementById('camposEditar');
    div.innerHTML = `
        <label>Nombre:</label> <input type="text" id="ed_name" value="${nombre}" class="input-sm">
        <label>Modelo:</label> <input type="text" id="ed_model" value="${modelo}" class="input-sm">
        <label>Capacidad:</label> <input type="number" id="ed_cap" value="${capacidad}" class="input-sm">
    `;
    document.getElementById('modalNaves').classList.add('hidden');
    document.getElementById('modalEditar').classList.remove('hidden');
}

document.getElementById('formEditar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const type = document.getElementById('editType').value;
    let url = '', data = {};

    if (type === 'flight') {
        url = `${FLIGHTS_API}/${id}`;
        data = {
            origin: document.getElementById('ed_origin').value,
            destination: document.getElementById('ed_dest').value,
            price: document.getElementById('ed_price').value
        };
    } else if (type === 'nave') {
        url = `${NAVES_API}/${id}`;
        data = {
            name: document.getElementById('ed_name').value,
            model: document.getElementById('ed_model').value,
            capacity: document.getElementById('ed_cap').value
        };
    }

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            mostrarNotificacion('Actualización exitosa', 'success');
            cerrarModalEditar();
            if(type === 'flight') cargarVuelos();
            if(type === 'nave') gestionarNaves();
        } else {
            mostrarNotificacion('Error al actualizar', 'error');
        }
    } catch (e) {
        mostrarNotificacion('Error de conexión', 'error');
    }
});

function cerrarModalEditar() { document.getElementById('modalEditar').classList.add('hidden'); }


async function eliminarVuelo(id) {
    pedirConfirmacion('¿Eliminar vuelo REALMENTE? Se borrará de la base de datos.', async () => {
        try {
            const res = await fetch(`${FLIGHTS_API}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                mostrarNotificacion('Vuelo eliminado', 'success');
                cargarVuelos();
            } else {
                mostrarNotificacion('No se pudo eliminar', 'error');
            }
        } catch (e) { console.error(e); }
    });
}

async function reservarVuelo(id) {
    pedirConfirmacion('¿Crear una reserva para este vuelo?', async () => {
        try {
            const res = await fetch(RESERVATIONS_API, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ flight_id: id, user_id: 2, status: 'activa' })
            });

            if (res.ok) mostrarNotificacion('Reserva creada', 'success');
            else mostrarNotificacion('Error al reservar', 'error');
        } catch (e) {
            mostrarNotificacion('Error de red', 'error');
        }
    });
}

async function gestionarUsuarios() {
    const modal = document.getElementById('modalUsuarios');
    const tbody = document.getElementById('listaUsuariosBody');
    modal.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        const response = await fetch(USERS_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const usuarios = await response.json();
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            let acciones = '-';
            if (u.email !== 'admin@system.com') {
                acciones = `
                    <div style="display:flex; gap:5px;">
                        <button class="btn-card btn-reserve" onclick="abrirEditarUsuario(${u.id}, '${u.name}', '${u.email}', '${u.role}')">Editar</button>
                        <button class="btn-card btn-delete" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                    </div>
                `;
            }
            tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td><strong>${u.role}</strong></td><td>${acciones}</td>`;
            tbody.appendChild(tr);
        });
    } catch (e) {
        mostrarNotificacion('Error cargando usuarios', 'error');
    }
}

function abrirEditarUsuario(id, name, email, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserRole').value = role;
    document.getElementById('editUserPass').value = '';

    document.getElementById('modalUsuarios').classList.add('hidden');
    document.getElementById('modalEditarUsuario').classList.remove('hidden');
}

function cerrarModalEditarUsuario() {
    document.getElementById('modalEditarUsuario').classList.add('hidden');
    document.getElementById('modalUsuarios').classList.remove('hidden');
}

document.getElementById('formEditarUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const data = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value,
        password: document.getElementById('editUserPass').value
    };

    try {
        const response = await fetch(`${USERS_API}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            mostrarNotificacion('Usuario actualizado', 'success');
            cerrarModalEditarUsuario();
            gestionarUsuarios();
        } else {
            mostrarNotificacion('Error al actualizar', 'error');
        }
    } catch (e) { mostrarNotificacion('Error de conexión', 'error'); }
});

document.getElementById('formCrearUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        password: document.getElementById('newUserPass').value,
        role: document.getElementById('newUserRole').value
    };
    try {
        const res = await fetch(USERS_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { mostrarNotificacion('Usuario creado', 'success'); gestionarUsuarios(); e.target.reset(); }
        else mostrarNotificacion('Error al crear', 'error');
    } catch (e) { mostrarNotificacion('Error de conexión', 'error'); }
});

async function eliminarUsuario(id) {
    pedirConfirmacion('¿Eliminar usuario?', async () => {
        try {
            const res = await fetch(`${USERS_API}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { mostrarNotificacion('Eliminado', 'success'); gestionarUsuarios(); }
            else mostrarNotificacion('Error', 'error');
        } catch (e) { mostrarNotificacion('Error de red', 'error'); }
    });
}
function cerrarModalUsuarios() { document.getElementById('modalUsuarios').classList.add('hidden'); }


async function gestionarNaves() {
    const modal = document.getElementById('modalNaves');
    const tbody = document.getElementById('listaNavesBody');
    modal.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        const res = await fetch(NAVES_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const naves = await res.json();
        tbody.innerHTML = '';
        naves.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${n.id}</td><td><strong>${n.name}</strong></td><td>${n.model}</td><td>${n.capacity}</td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button class="btn-card btn-reserve" onclick="abrirEditarNave(${n.id}, '${n.name}', '${n.model}', ${n.capacity})">Editar</button>
                        <button class="btn-card btn-delete" onclick="eliminarNave(${n.id})">Eliminar</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { mostrarNotificacion('Error cargando naves', 'error'); }
}

function cerrarModalNaves() { document.getElementById('modalNaves').classList.add('hidden'); }

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
        if (res.ok) { mostrarNotificacion('Nave creada', 'success'); gestionarNaves(); e.target.reset(); }
        else mostrarNotificacion('Error (¿Duplicado?)', 'error');
    } catch (e) { mostrarNotificacion('Error de conexión', 'error'); }
});

async function eliminarNave(id) {
    pedirConfirmacion('¿Eliminar nave?', async () => {
        try {
            const res = await fetch(`${NAVES_API}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { mostrarNotificacion('Eliminada', 'success'); gestionarNaves(); }
            else mostrarNotificacion('No se pudo eliminar', 'error');
        } catch (e) { mostrarNotificacion('Error de red', 'error'); }
    });
}

async function verReservas() {
    const modal = document.getElementById('modalReservas');
    const tbody = document.getElementById('listaReservasBody');
    const inputFiltro = document.getElementById('filterUserId');
    
    const userId = inputFiltro ? inputFiltro.value.trim() : '';

    modal.classList.remove('hidden');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        let url = RESERVATIONS_API;
        if (userId) {
            url += `?user_id=${userId}`;
        }

        const res = await fetch(url, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        const data = await res.json();
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No se encontraron reservas.</td></tr>';
            return;
        }

        data.forEach(r => {
            const info = r.flight ? `${r.flight.origin}-${r.flight.destination}` : 'Vuelo Eliminado';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.id}</td>
                <td>${info}</td>
                <td style="text-align:center;"><strong>${r.user_id}</strong></td>
                <td class="status-${r.status}">${r.status}</td>
                <td>
                    ${r.status === 'activa' ? `<button class="btn-card btn-delete" onclick="cancelarReserva(${r.id})">Cancelar</button>` : '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        mostrarNotificacion('Error cargando reservas', 'error');
    }
}

function limpiarFiltroReservas() {
    document.getElementById('filterUserId').value = '';
    verReservas();
}

function cerrarModal() { document.getElementById('modalReservas').classList.add('hidden'); }
async function cancelarReserva(id) {
    pedirConfirmacion('¿Cancelar reserva?', async () => {
        try {
            const res = await fetch(`${RESERVATIONS_API}/${id}/cancel`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { mostrarNotificacion('Cancelada', 'success'); verReservas(); }
            else mostrarNotificacion('Error', 'error');
        } catch (e) { mostrarNotificacion('Error', 'error'); }
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
        naves.forEach(n => select.innerHTML += `<option value="${n.id}">${n.model} (${n.name})</option>`);
    } catch (e) { mostrarNotificacion('Error naves', 'error'); }
}
function cerrarModalVuelo() { document.getElementById('modalVuelo').classList.add('hidden'); }
document.getElementById('formCrearVuelo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const salida = document.getElementById('vueloSalida').value;
    const llegada = document.getElementById('vueloLlegada').value;
    if (new Date(llegada) <= new Date(salida)) { mostrarNotificacion('Fecha llegada inválida', 'error'); return; }
    const data = {
        origin: document.getElementById('vueloOrigen').value,
        destination: document.getElementById('vueloDestino').value,
        departure: salida,
        arrival: llegada,
        price: document.getElementById('vueloPrecio').value,
        nave_id: document.getElementById('vueloNave').value
    };
    try {
        const res = await fetch(FLIGHTS_API, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) { mostrarNotificacion('Creado', 'success'); cerrarModalVuelo(); cargarVuelos(); e.target.reset(); }
        else mostrarNotificacion('Error', 'error');
    } catch (e) { mostrarNotificacion('Error', 'error'); }
});