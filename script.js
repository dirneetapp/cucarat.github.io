// Inicialización
let workers = JSON.parse(localStorage.getItem('workers')) || [];
let timeRecords = JSON.parse(localStorage.getItem('timeRecords')) || [];
let company = JSON.parse(localStorage.getItem('company')) || { name: 'Sin empresa configurada' };

document.addEventListener('DOMContentLoaded', () => {
    updateCompanyInfo();
    updateWorkersList();
    updateTimeRecords();
    updateWorkerSelect();
});

// Configuración Empresa
document.getElementById('companyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    company.name = document.getElementById('companyName').value;
    localStorage.setItem('company', JSON.stringify(company));
    updateCompanyInfo();
    e.target.reset();
});

function updateCompanyInfo() {
    document.getElementById('companyInfo').textContent = company.name;
}

// Gestión de Trabajadores
document.getElementById('workerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('workerName').value;
    workers.push({ id: Date.now(), name });
    localStorage.setItem('workers', JSON.stringify(workers));
    updateWorkersList();
    updateWorkerSelect();
    e.target.reset();
});

function updateWorkersList() {
    const list = document.getElementById('workersList');
    list.innerHTML = workers.map(worker => `
        <div class="worker-item">
            <span>${worker.name}</span>
            <button class="btn btn-secondary" onclick="deleteWorker(${worker.id})">Eliminar</button>
        </div>
    `).join('');
}

function deleteWorker(id) {
    workers = workers.filter(w => w.id !== id);
    timeRecords = timeRecords.filter(r => r.workerId !== id);
    localStorage.setItem('workers', JSON.stringify(workers));
    localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
    updateWorkersList();
    updateWorkerSelect();
    updateTimeRecords();
}

// Registro de Horarios
document.getElementById('timeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const workerId = parseInt(document.getElementById('workerSelect').value);
    const entryTime = new Date(document.getElementById('entryTime').value);
    const exitTime = new Date(document.getElementById('exitTime').value);
    
    if (exitTime <= entryTime) {
        alert('La hora de salida debe ser posterior a la de entrada');
        return;
    }

    timeRecords.push({
        id: Date.now(),
        workerId,
        entryTime: entryTime.toISOString(),
        exitTime: exitTime.toISOString()
    });
    
    localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
    updateTimeRecords();
    e.target.reset();
});

function updateWorkerSelect() {
    const select = document.getElementById('workerSelect');
    select.innerHTML = '<option value="">Selecciona trabajador</option>' + 
        workers.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
}

function updateTimeRecords() {
    const records = document.getElementById('timeRecords');
    records.innerHTML = timeRecords.map(record => {
        const worker = workers.find(w => w.id === record.workerId);
        const entry = formatDateTime(new Date(record.entryTime));
        const exit = formatDateTime(new Date(record.exitTime));
        return `
            <div class="time-item">
                <span>${worker?.name || 'Trabajador eliminado'} - Entrada: ${entry} - Salida: ${exit}</span>
                <div>
                    <button class="btn btn-secondary" onclick="editTimeRecord(${record.id})">Editar</button>
                    <button class="btn btn-secondary" onclick="deleteTimeRecord(${record.id})">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteTimeRecord(id) {
    timeRecords = timeRecords.filter(r => r.id !== id);
    localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
    updateTimeRecords();
}

function editTimeRecord(id) {
    const record = timeRecords.find(r => r.id === id);
    if (record) {
        const entry = prompt('Nueva hora de entrada (dd/mm/yyyy hh:mm)', formatDateTime(new Date(record.entryTime)));
        const exit = prompt('Nueva hora de salida (dd/mm/yyyy hh:mm)', formatDateTime(new Date(record.exitTime)));
        
        if (entry && exit) {
            record.entryTime = parseDateTime(entry).toISOString();
            record.exitTime = parseDateTime(exit).toISOString();
            localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
            updateTimeRecords();
        }
    }
}

// Informe Semanal
document.getElementById('generateReport').addEventListener('click', generateReport);

function generateReport() {
    const reportContainer = document.getElementById('reportContainer');
    let html = `<h3>Informe Semanal - ${company.name}</h3>
        <table>
            <tr>
                <th>Trabajador</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Horas</th>
            </tr>`;
    
    const totals = {};
    timeRecords.forEach(record => {
        const worker = workers.find(w => w.id === record.workerId);
        const entry = new Date(record.entryTime);
        const exit = new Date(record.exitTime);
        const hours = (exit - entry) / (1000 * 60 * 60);
        const workerName = worker?.name || 'Trabajador eliminado';
        
        html += `<tr>
            <td>${workerName}</td>
            <td>${formatDateTime(entry)}</td>
            <td>${formatDateTime(exit)}</td>
            <td>${hours.toFixed(2)}</td>
        </tr>`;
        
        totals[workerName] = (totals[workerName] || 0) + hours;
    });
    
    for (const [worker, total] of Object.entries(totals)) {
        html += `<tr class="total-row">
            <td colspan="3">Total ${worker}</td>
            <td>${total.toFixed(2)}</td>
        </tr>`;
    }
    
    html += '</table>';
    reportContainer.innerHTML = html;
    return html;
}

// Exportación
document.getElementById('exportPDF').addEventListener('click', () => {
    const element = document.getElementById('reportContainer');
    html2pdf()
        .set({ filename: `informe_${company.name}.pdf` })
        .from(element)
        .save();
});

document.getElementById('exportExcel').addEventListener('click', () => {
    const data = [['Trabajador', 'Entrada', 'Salida', 'Horas']];
    timeRecords.forEach(record => {
        const worker = workers.find(w => w.id === record.workerId);
        data.push([
            worker?.name || 'Trabajador eliminado',
            formatDateTime(new Date(record.entryTime)),
            formatDateTime(new Date(record.exitTime)),
            (((new Date(record.exitTime) - new Date(record.entryTime)) / (1000 * 60 * 60)).toFixed(2))
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Informe');
    XLSX.writeFile(wb, `informe_${company.name}.xlsx`);
});

document.getElementById('emailReport').addEventListener('click', () => {
    generateReport();
    const reportHtml = document.getElementById('reportContainer').innerHTML;
    const subject = encodeURIComponent(`Informe Semanal - ${company.name}`);
    const body = encodeURIComponent(`
        Informe Semanal de Horarios - ${company.name}
        
        ${reportHtml.replace(/<[^>]+>/g, (tag) => {
            if (tag.includes('table')) return '\n\n';
            if (tag.includes('tr')) return '\n';
            if (tag.includes('td')) return '\t';
            return '';
        })}
    `);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

// Funciones auxiliares
function formatDateTime(date) {
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateTime(str) {
    const [date, time] = str.split(' ');
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
}