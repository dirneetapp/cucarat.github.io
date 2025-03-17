// script.js (Versión Corregida y Completa)
class TimeTrackPro {
    constructor() {
        this.trabajadores = JSON.parse(localStorage.getItem('trabajadores')) || [];
        this.horarios = JSON.parse(localStorage.getItem('horarios')) || [];
        this.init();
    }

    init() {
        this.initElements();
        this.initEventListeners();
        this.cargarDatos();
        this.setupTheme();
        this.actualizarContadores();
    }

    initElements() {
        this.elements = {
            formTrabajador: document.getElementById('formTrabajador'),
            formHorario: document.getElementById('formHorario'),
            selectTrabajador: document.getElementById('trabajador'),
            listaTrabajadores: document.getElementById('listaTrabajadores'),
            listaHorarios: document.getElementById('listaHorarios'),
            contadorTrabajadores: document.getElementById('contadorTrabajadores'),
            contadorHorarios: document.getElementById('contadorHorarios'),
            informe: document.getElementById('informe'),
            entrada: document.getElementById('entrada'),
            salida: document.getElementById('salida')
        };
    }

    initEventListeners() {
        this.elements.formTrabajador.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarTrabajador();
        });

        this.elements.formHorario.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarHorario();
        });

        document.getElementById('generarInforme').addEventListener('click', () => this.generarInforme());
        document.getElementById('exportarPDF').addEventListener('click', () => this.exportarPDF());
        document.getElementById('exportarExcel').addEventListener('click', () => this.exportarExcel());
    }

    // Método corregido para registrar trabajadores
    registrarTrabajador() {
        const nombre = this.elements.formTrabajador.nombre.value.trim();
        const apellido = this.elements.formTrabajador.apellido.value.trim();
        
        if (!nombre || !apellido) {
            this.mostrarError('Debe completar todos los campos');
            return;
        }

        this.trabajadores.push({ nombre, apellido });
        this.guardarDatos();
        this.cargarTrabajadores();
        this.elements.formTrabajador.reset();
    }

    // Método corregido para registrar horarios
    registrarHorario() {
        const trabajadorIndex = this.elements.selectTrabajador.value;
        const entrada = this.elements.entrada.value;
        const salida = this.elements.salida.value;

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
            this.elements.formHorario.reset();
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    // Método completo para generar informes
    generarInforme() {
        this.elements.informe.innerHTML = '';
        
        if (this.horarios.length === 0) {
            this.elements.informe.innerHTML = '<p class="no-data">No hay registros para mostrar</p>';
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
        this.elements.informe.appendChild(tabla);
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

    generarTotales(horasPorTrabajador) {
        return Object.entries(horasPorTrabajador).map(([nombre, total]) => `
            <tr class="total-row">
                <td colspan="4">Total ${nombre}</td>
                <td>${total.toFixed(2)}h</td>
            </tr>
        `).join('');
    }

    // Método completo para exportar PDF
    exportarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text("Informe de Horarios - TimeTrack Pro", 10, 10);
        
        const headers = [["Nombre", "Fecha", "Entrada", "Salida", "Horas"]];
        const data = this.horarios.map(horario => {
            const trabajador = this.trabajadores[horario.trabajadorIndex];
            const entrada = new Date(horario.entrada);
            const salida = new Date(horario.salida);
            
            return [
                `${trabajador.nombre} ${trabajador.apellido}`,
                entrada.toLocaleDateString(),
                entrada.toLocaleTimeString(),
                salida.toLocaleTimeString(),
                TimeTrackPro.calcularHoras(entrada, salida) + 'h'
            ];
        });
        
        doc.autoTable({
            head: headers,
            body: data,
            startY: 20
        });
        
        doc.save('informe-horarios.pdf');
    }

    // Método completo para exportar Excel
    exportarExcel() {
        const data = this.horarios.map(horario => {
            const trabajador = this.trabajadores[horario.trabajadorIndex];
            const entrada = new Date(horario.entrada);
            const salida = new Date(horario.salida);
            
            return {
                'Nombre Completo': `${trabajador.nombre} ${trabajador.apellido}`,
                'Fecha': entrada.toLocaleDateString(),
                'Entrada': entrada.toLocaleTimeString(),
                'Salida': salida.toLocaleTimeString(),
                'Horas Trabajadas': TimeTrackPro.calcularHoras(entrada, salida)
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Horarios");
        XLSX.writeFile(workbook, "informe-horarios.xlsx");
    }

    static calcularHoras(entrada, salida) {
        const diff = new Date(salida) - new Date(entrada);
        if (diff < 0) throw new Error('La hora de salida debe ser posterior a la entrada');
        return (diff / 3.6e6).toFixed(2); // Conversión a horas
    }

    // Resto de métodos auxiliares...
    // [Mantener implementaciones anteriores para cargar datos, temas, etc.]
}

// Inicialización final
const app = new TimeTrackPro();
window.app = app; // Hacer accesible para el botón de tema