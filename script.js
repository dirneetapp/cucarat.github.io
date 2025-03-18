class TimeMaster {
    constructor() {
        this.trabajadores = JSON.parse(localStorage.getItem('trabajadores')) || [];
        this.horarios = JSON.parse(localStorage.getItem('horarios')) || [];
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.cargarDatos();
        this.setupTheme();
    }

    cacheElements() {
        this.elements = {
            formTrabajador: document.getElementById('formTrabajador'),
            nombre: document.getElementById('nombre'),
            apellido: document.getElementById('apellido'),
            formHorario: document.getElementById('formHorario'),
            selectTrabajador: document.getElementById('trabajador'),
            entrada: document.getElementById('entrada'),
            salida: document.getElementById('salida'),
            listaTrabajadores: document.getElementById('listaTrabajadores'),
            listaHorarios: document.getElementById('listaHorarios'),
            informe: document.getElementById('informe'),
            contadores: {
                trabajadores: document.getElementById('contadorTrabajadores'),
                horarios: document.getElementById('contadorHorarios')
            }
        };
    }

    setupEventListeners() {
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

    // CORE FUNCTIONALITY
    registrarTrabajador() {
        const nombre = this.elements.nombre.value.trim();
        const apellido = this.elements.apellido.value.trim();

        if (!nombre || !apellido) {
            this.mostrarError('Complete todos los campos');
            return;
        }

        this.trabajadores.push({ nombre, apellido });
        this.actualizarDatos();
        this.elements.formTrabajador.reset();
    }

    registrarHorario() {
        const trabajadorIndex = this.elements.selectTrabajador.value;
        const entrada = new Date(this.elements.entrada.value);
        const salida = new Date(this.elements.salida.value);

        if (!trabajadorIndex) {
            this.mostrarError('Seleccione un trabajador');
            return;
        }

        try {
            const horas = this.calcularHoras(entrada, salida);
            
            this.horarios.push({
                trabajadorIndex,
                entrada: entrada.toISOString(),
                salida: salida.toISOString(),
                horas
            });
            
            this.actualizarDatos();
            this.elements.formHorario.reset();
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    calcularHoras(entrada, salida) {
        const diff = salida - entrada;
        if (diff < 0) throw new Error('La hora de salida debe ser posterior');
        return (diff / 3600000).toFixed(2); // Horas con 2 decimales
    }

    // DATA MANAGEMENT
    actualizarDatos() {
        localStorage.setItem('trabajadores', JSON.stringify(this.trabajadores));
        localStorage.setItem('horarios', JSON.stringify(this.horarios));
        this.cargarDatos();
    }

    cargarDatos() {
        this.cargarTrabajadores();
        this.cargarHorarios();
        this.actualizarContadores();
    }

    cargarTrabajadores() {
        this.elements.selectTrabajador.innerHTML = '<option value="">Seleccionar...</option>';
        this.trabajadores.forEach((t, i) => {
            this.elements.selectTrabajador.innerHTML += `
                <option value="${i}">${t.nombre} ${t.apellido}</option>
            `;
        });

        this.elements.listaTrabajadores.innerHTML = this.trabajadores
            .map((t, i) => `
                <li class="list-item">
                    <span>${t.nombre} ${t.apellido}</span>
                    <button class="btn-danger" onclick="app.eliminarTrabajador(${i})">🗑</button>
                </li>
            `).join('');
    }

    cargarHorarios() {
        this.elements.listaHorarios.innerHTML = this.horarios
            .map((h, i) => {
                const t = this.trabajadores[h.trabajadorIndex];
                return `
                    <div class="list-item">
                        <div>
                            <strong>${t.nombre} ${t.apellido}</strong>
                            <div class="text-sm">
                                ${new Date(h.entrada).toLocaleString()} - 
                                ${new Date(h.salida).toLocaleString()}
                            </div>
                        </div>
                        <div class="actions">
                            <button class="btn-danger" onclick="app.eliminarHorario(${i})">🗑</button>
                        </div>
                    </div>
                `;
            }).join('');
    }

    // REPORTING
    generarInforme() {
        const reportData = this.horarios.reduce((acc, h) => {
            const trabajador = this.trabajadores[h.trabajadorIndex];
            const key = `${trabajador.nombre} ${trabajador.apellido}`;
            
            if (!acc[key]) acc[key] = 0;
            acc[key] += parseFloat(h.horas);
            
            return acc;
        }, {});

        this.elements.informe.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Trabajador</th>
                        <th>Total Horas</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(reportData).map(([nombre, horas]) => `
                        <tr>
                            <td>${nombre}</td>
                            <td>${horas.toFixed(2)}h</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    exportarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text("Informe de Horarios - TimeMaster Pro", 10, 10);
        
        const headers = [["Trabajador", "Horas Trabajadas"]];
        const data = Object.entries(this.generarDatosInforme()).map(([nombre, horas]) => [
            nombre,
            `${horas.toFixed(2)}h`
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 20,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [42, 45, 67] }
        });

        doc.save('informe-horarios.pdf');
    }

    exportarExcel() {
        const data = Object.entries(this.generarDatosInforme()).map(([nombre, horas]) => ({
            Trabajador: nombre,
            'Horas Trabajadas': horas
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Informe");
        XLSX.writeFile(workbook, "informe-horarios.xlsx");
    }

    generarDatosInforme() {
        return this.horarios.reduce((acc, h) => {
            const t = this.trabajadores[h.trabajadorIndex];
            const key = `${t.nombre} ${t.apellido}`;
            acc[key] = (acc[key] || 0) + parseFloat(h.horas);
            return acc;
        }, {});
    }

    // UTILITIES
    actualizarContadores() {
        this.elements.contadores.trabajadores.textContent = this.trabajadores.length;
        this.elements.contadores.horarios.textContent = this.horarios.length;
    }

    mostrarError(mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        document.querySelector('.container').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    setupTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    eliminarTrabajador(index) {
        this.trabajadores.splice(index, 1);
        this.actualizarDatos();
    }

    eliminarHorario(index) {
        this.horarios.splice(index, 1);
        this.actualizarDatos();
    }
}

// Inicialización
const app = new TimeMaster();
window.app = app;