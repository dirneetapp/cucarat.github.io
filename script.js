document.addEventListener("DOMContentLoaded", () => {
    const formTrabajador = document.getElementById("formTrabajador");
    const formHorario = document.getElementById("formHorario");
    const selectTrabajador = document.getElementById("trabajador");
    const listaTrabajadores = document.getElementById("listaTrabajadores");
    const listaHorarios = document.getElementById("listaHorarios");
    const informeDiv = document.getElementById("informe");
    const generarInformeBtn = document.getElementById("generarInforme");
    const exportarPDFBtn = document.getElementById("exportarPDF");
    const exportarExcelBtn = document.getElementById("exportarExcel");

    let trabajadores = JSON.parse(localStorage.getItem("trabajadores")) || [];
    let horarios = JSON.parse(localStorage.getItem("horarios")) || [];

    // Función para calcular horas trabajadas
    function calcularHoras(entrada, salida) {
        const diff = new Date(salida) - new Date(entrada);
        return (diff / (1000 * 60 * 60)).toFixed(2);
    }

    // Cargar trabajadores en select y lista
    function cargarTrabajadores() {
        selectTrabajador.innerHTML = '<option value="">Seleccione trabajador</option>';
        listaTrabajadores.innerHTML = "";
        
        trabajadores.forEach((trabajador, index) => {
            // Cargar en select
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${trabajador.nombre} ${trabajador.apellido}`;
            selectTrabajador.appendChild(option);
            
            // Cargar en lista
            const li = document.createElement("li");
            li.innerHTML = `
                ${trabajador.nombre} ${trabajador.apellido}
                <button onclick="eliminarTrabajador(${index})">Eliminar</button>
            `;
            listaTrabajadores.appendChild(li);
        });
    }

    // Cargar horarios registrados
    function cargarHorarios() {
        listaHorarios.innerHTML = "";
        horarios.forEach((horario, index) => {
            const trabajador = trabajadores[horario.trabajadorIndex];
            const div = document.createElement("div");
            div.className = "horario-item";
            div.innerHTML = `
                <span>${trabajador.nombre} ${trabajador.apellido} - 
                Entrada: ${horario.entrada} - Salida: ${horario.salida}</span>
                <div>
                    <button class="editar" onclick="editarHorario(${index})">Editar</button>
                    <button class="eliminar" onclick="eliminarHorario(${index})">Eliminar</button>
                </div>
            `;
            listaHorarios.appendChild(div);
        });
    }

    // Generar informe en tabla
    function generarInforme() {
        informeDiv.innerHTML = "";
        const tabla = document.createElement("table");
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Horas</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = tabla.querySelector("tbody");
        const totales = {};

        horarios.forEach(horario => {
            const trabajador = trabajadores[horario.trabajadorIndex];
            const nombre = `${trabajador.nombre} ${trabajador.apellido}`;
            const horas = calcularHoras(horario.entrada, horario.salida);
            
            // Sumar horas por trabajador
            totales[nombre] = (totales[nombre] || 0) + parseFloat(horas);

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${nombre}</td>
                <td>${horario.entrada}</td>
                <td>${horario.salida}</td>
                <td>${horas}h</td>
            `;
            tbody.appendChild(fila);
        });

        // Añadir totales
        Object.entries(totales).forEach(([nombre, total]) => {
            const filaTotal = document.createElement("tr");
            filaTotal.className = "total-row";
            filaTotal.innerHTML = `
                <td colspan="3">Total ${nombre}</td>
                <td>${total.toFixed(2)}h</td>
            `;
            tbody.appendChild(filaTotal);
        });

        informeDiv.appendChild(tabla);
    }

    // Event Listeners
    formTrabajador.addEventListener("submit", e => {
        e.preventDefault();
        trabajadores.push({
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value
        });
        localStorage.setItem("trabajadores", JSON.stringify(trabajadores));
        cargarTrabajadores();
        formTrabajador.reset();
    });

    formHorario.addEventListener("submit", e => {
        e.preventDefault();
        const entrada = document.getElementById("entrada").value;
        const salida = document.getElementById("salida").value;
        
        horarios.push({
            trabajadorIndex: document.getElementById("trabajador").value,
            entrada: new Date(entrada).toLocaleString(),
            salida: new Date(salida).toLocaleString()
        });
        
        localStorage.setItem("horarios", JSON.stringify(horarios));
        cargarHorarios();
        formHorario.reset();
    });

    generarInformeBtn.addEventListener("click", generarInforme);

    // Funciones globales
    window.eliminarTrabajador = index => {
        trabajadores.splice(index, 1);
        localStorage.setItem("trabajadores", JSON.stringify(trabajadores));
        cargarTrabajadores();
    };

    window.eliminarHorario = index => {
        horarios.splice(index, 1);
        localStorage.setItem("horarios", JSON.stringify(horarios));
        cargarHorarios();
    };

    window.editarHorario = index => {
        const horario = horarios[index];
        document.getElementById("trabajador").value = horario.trabajadorIndex;
        document.getElementById("entrada").value = new Date(horario.entrada).toISOString().slice(0,16);
        document.getElementById("salida").value = new Date(horario.salida).toISOString().slice(0,16);
        eliminarHorario(index);
    };

    // Inicialización
    cargarTrabajadores();
    cargarHorarios();
});