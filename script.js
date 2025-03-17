// script.js
class TimeTrackPro {
    constructor() {
        this.trabajadores = JSON.parse(localStorage.getItem('trabajadores')) || [];
        this.horarios = JSON.parse(localStorage.getItem('horarios')) || [];
        this.init();
    }

    init() {
        this.initEventListeners();
        this.cargarDatos();
        this.setupTheme();
        this.actualizarContadores();
    }

    initEventListeners() {
        document.getElementById('formTrabajador').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarTrabajador();
        });

        document.getElementById('formHorario').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarHorario();
        });

        document.getElementById('generarInforme').addEventListener('click', () => this.generarInforme());
        document.getElementById('exportarPDF').addEventListener('click', () => this.exportarPDF());
        document.getElementById('exportarExcel').addEventListener('click', () => this.exportarExcel());
    }

    registrarTrabajador() {
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        
        if (!nombre || !apellido) {
            this.mostrarError('Por favor complete todos los campos');
            return;
        }

        this.trabajadores.push({ nombre, apellido });
        this.guardarDatos();
        this.cargarTrabajadores();
        document.getElementById('formTrabajador').reset();
    }

    registrarHorario() {
        const trabajadorIndex = document.getElementById('trabajador').value;
        const entrada = document.getElementById('entrada').value;
        const salida = document.getElementById('salida').value;

        if (!trabajadorIndex) {
            this.mostrarError('Seleccione un trabajador');
            return;
        }

        try {
            const horas = TimeTrackPro.calcularHoras(entrada, salida);
            this.horarios.push({
                trabajadorIndex,
                entrada: new Date(entrada).toISOString(),
                salida: new Date(salida).toISOString()
            });
            this.guardarDatos();
            this.cargarHorarios();
            document.getElementById('formHorario').reset();
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    generarInforme() {
        const informeDiv = document.getElementById('informe');
        informeDiv.innerHTML = '';
        
        if (this.horarios.length === 0) {
            informeDiv.innerHTML = '<p class="no-data">No hay registros para mostrar</p>';
            return;
        }

        const tabla = document.createElement('table');
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Horas</th>
                </tr>
            </thead>
            <tbody>
                ${this.generarFilasInforme()}
            </tbody>
        `;
        informeDiv.appendChild(tabla);
    }

    generarFilasInforme() {
        const horasPorTrabajador = {};
        
        return this.horarios.map(horario => {
            const trabajador = this.trabajadores[horario.trabajadorIndex];
            const entradaDate = new Date(horario.entrada);
            const salidaDate = new Date(horario.salida);
            const horas = TimeTrackPro.calcularHoras(entradaDate, salidaDate);
            
            horasPorTrabajador[trabajador.nombre] = 
                (horasPorTrabajador[trabajador.nombre] || 0) + parseFloat(horas);

            return `
                <tr>
                    <td>${trabajador.nombre} ${trabajador.apellido}</td>
                    <td>${entradaDate.toLocaleDateString()}</td>
                    <td>${entradaDate.toLocaleTimeString()}</td>
                    <td>${salidaDate.toLocaleTimeString()}</td>
                    <td>${horas}h</td>
                </tr>
            `;
        }).join('') + this.generarTotales(horasPorTrabajador);
    }

    // Resto de métodos mejorados...
    // (Mantener estructura similar con mejor manejo de errores)
}

// Inicialización
const app = new TimeTrackPro();
window.toggleTheme = () => app.toggleTheme();