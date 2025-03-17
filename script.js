class TimeTrackPro {
    constructor() {
        this.trabajadores = JSON.parse(localStorage.getItem('trabajadores')) || [];
        this.horarios = JSON.parse(localStorage.getItem('horarios')) || [];
        this.initEventListeners();
        this.cargarDatos();
        this.setupTheme();
    }

    initEventListeners() {
        document.getElementById('formTrabajador').addEventListener('submit', (e) => this.registrarTrabajador(e));
        document.getElementById('formHorario').addEventListener('submit', (e) => this.registrarHorario(e));
        document.getElementById('generarInforme').addEventListener('click', () => this.generarInforme());
        document.getElementById('exportarPDF').addEventListener('click', () => this.exportarPDF());
        document.getElementById('exportarExcel').addEventListener('click', () => this.exportarExcel());
    }

    cargarDatos() {
        this.cargarTrabajadores();
        this.cargarHorarios();
    }

    cargarTrabajadores() {
        const select = document.getElementById('trabajador');
        const lista = document.getElementById('listaTrabajadores');
        
        select.innerHTML = '<option value="">Seleccionar trabajador...</option>';
        lista.innerHTML = '';

        this.trabajadores.forEach((trabajador, index) => {
            // Select options
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${trabajador.nombre} ${trabajador.apellido}`;
            select.appendChild(option);

            // List items
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="employee-info">
                    <span>${trabajador.nombre} ${trabajador.apellido}</span>
                    <button class="btn-danger" onclick="app.eliminarTrabajador(${index})">🗑 Eliminar</button>
                </div>
            `;
            lista.appendChild(li);
        });
    }

    cargarHorarios() {
        const lista = document.getElementById('listaHorarios');
        lista.innerHTML = '';

        this.horarios.forEach((horario, index) => {
            const trabajador = this.trabajadores[horario.trabajadorIndex];
            const div = document.createElement('div');
            div.className = 'horario-item';
            div.innerHTML = `
                <div class="time-entry">
                    <span class="employee">${trabajador.nombre} ${trabajador.apellido}</span>
                    <div class="time-details">
                        <span>⬇ ${this.formatearFecha(horario.entrada)}</span>
                        <span>⬆ ${this.formatearFecha(horario.salida)}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-secondary" onclick="app.editarHorario(${index})">✏ Editar</button>
                    <button class="btn-danger" onclick="app.eliminarHorario(${index})">🗑 Eliminar</button>
                </div>
            `;
            lista.appendChild(div);
        });
    }

    // Métodos restantes (registrarTrabajador, registrarHorario, generarInforme, etc.)
    // ... (Implementación similar a versión anterior pero con mejor estructuración)
    // ... Incluir validaciones mejoradas y manejo de errores

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Métodos estáticos para cálculo de horas y formateo
    static calcularHoras(entrada, salida) {
        const diff = new Date(salida) - new Date(entrada);
        if (diff < 0) throw new Error('La hora de salida debe ser posterior a la entrada');
        return (diff / 3.6e6).toFixed(2); // Horas con 2 decimales
    }

    static formatearFecha(fecha) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(fecha).toLocaleString('es-ES', options);
    }
}

// Inicialización de la aplicación
const app = new TimeTrackPro();
window.toggleTheme = () => app.toggleTheme();