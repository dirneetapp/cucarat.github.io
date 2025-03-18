// Inicialización
let workers = JSON.parse(localStorage.getItem('workers')) || [];
let timeRecords = JSON.parse(localStorage.getItem('timeRecords')) || [];
let company = JSON.parse(localStorage.getItem('company')) || { 
    name: 'Sin empresa configurada', 
    cif: '', 
    center: '', 
    ccc: '' 
};

document.addEventListener('DOMContentLoaded', () => {
    updateCompanyInfo();
    updateWorkersList();
    updateWorkerSelect();
    updateTimeRecords();
});

// Configuración Empresa
document.getElementById('companyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    company = {
        name: document.getElementById('companyName').value,
        cif: document.getElementById('companyCif').value,
        center: document.getElementById('companyCenter').value,
        ccc: document.getElementById('companyCcc').value
    };
    localStorage.setItem('company', JSON.stringify(company));
    updateCompanyInfo();
    e.target.reset();
});

function updateCompanyInfo() {
    const info = `${company.name} | C.I.F./N.I.F.: ${company.cif} | Centro: ${company.center} | C.C.C.: ${company.ccc}`;
    document.getElementById('companyInfo').textContent = info;
}

// Gestión de Trabajadores
document.getElementById('workerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const worker = {
        id: Date.now(),
        name: document.getElementById('workerName').value,
        nif: document.getElementById('workerNif').value,
        affiliation: document.getElementById('workerAffiliation').value,
        monthYear: document.getElementById('workerMonthYear').value
    };
    workers.push(worker);
    localStorage.setItem('workers', JSON.stringify(workers));
    updateWorkersList();
    updateWorkerSelect();
    e.target.reset();
});

function updateWorkersList() {
    const list = document.getElementById('workersList');
    list.innerHTML = workers.map(worker => `
        <div class="worker-item">
            <span>${worker.name} | N.I.F.: ${worker.nif} | Afiliación: ${worker.affiliation} | ${worker.monthYear}</span>
            <div class="button-group">
                <button class="btn btn-secondary" onclick="editWorker(${worker.id})">Editar</button>
                <button class="btn btn-secondary" onclick="deleteWorker(${worker.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function editWorker(id) {
    const worker = workers.find(w => w.id === id);
    if (!worker) return;

    const name = prompt('Nombre del trabajador:', worker.name);
    const nif = prompt('N.I.F.:', worker.nif);
    const affiliation = prompt('Nº Afiliación:', worker.affiliation);
    const monthYear = prompt('Mes y Año (YYYY-MM):', worker.monthYear);

    if (name && nif && affiliation && monthYear) {
        worker.name = name;
        worker.nif = nif;
        worker.affiliation = affiliation;
        worker.monthYear = monthYear;
        localStorage.setItem('workers', JSON.stringify(workers));
        updateWorkersList();
        updateWorkerSelect();
    } else {
        alert('Todos los campos son obligatorios. No se guardaron los cambios.');
    }
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
    const date = document.getElementById('recordDate').value;
    const morningEntry = document.getElementById('morningEntry').value || '';
    const morningExit = document.getElementById('morningExit').value || '';
    const afternoonEntry = document.getElementById('afternoonEntry').value || '';
    const afternoonExit = document.getElementById('afternoonExit').value || '';

    const hasMorning = morningEntry && morningExit;
    const hasAfternoon = afternoonEntry && afternoonExit;
    if (!hasMorning && !hasAfternoon) {
        alert('Debes completar al menos un turno (mañana o tarde) con entrada y salida.');
        return;
    }

    if (hasMorning && morningEntry >= morningExit) {
        alert('La salida de la mañana debe ser posterior a la entrada.');
        return;
    }
    if (hasAfternoon && afternoonEntry >= afternoonExit) {
        alert('La salida de la tarde debe ser posterior a la entrada.');
        return;
    }

    const record = {
        id: Date.now(),
        workerId,
        date,
        morningEntry,
        morningExit,
        afternoonEntry,
        afternoonExit
    };

    timeRecords.push(record);
    localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
    updateTimeRecords();
    e.target.reset();
});

function updateWorkerSelect() {
    const select = document.getElementById('workerSelect');
    select.innerHTML = '<option value="">Selecciona trabajador</option>' + 
        workers.map(w => `<option value="${w.id}">${w.name} (${w.nif})</option>`).join('');
}

function updateTimeRecords() {
    const records = document.getElementById('timeRecords');
    records.innerHTML = timeRecords.map(record => {
        const worker = workers.find(w => w.id === record.workerId);
        const date = record.date;
        const morning = record.morningEntry && record.morningExit ? 
            `Mañana: ${record.morningEntry} - ${record.morningExit}` : '';
        const afternoon = record.afternoonEntry && record.afternoonExit ? 
            `Tarde: ${record.afternoonEntry} - ${record.afternoonExit}` : '';
        const displayText = [morning, afternoon].filter(Boolean).join(' | ');
        
        return `
            <div class="time-item">
                <span>${worker?.name || 'Trabajador eliminado'} - ${date} - ${displayText || 'Sin horario'}</span>
                <div>
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

// Informe Mensual
document.getElementById('generateReport').addEventListener('click', generateReport);

function generateReport() {
    const reportContainer = document.getElementById('reportContainer');
    // Obtener la fecha actual (18 de marzo de 2025 según tus instrucciones)
    const currentDate = new Date('2025-03-18'); // Fecha fija basada en tus instrucciones
    const day = currentDate.getDate();
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const formattedDate = `${day} de ${month} de ${year}`;

    let html = `
        <h3>Listado Resumen Mensual del Registro de Jornada</h3>
        <div class="header-info">
            <div>
                <strong>Empresa:</strong> ${company.name}<br>
                <strong>C.I.F./N.I.F.:</strong> ${company.cif}<br>
                <strong>Centro de Trabajo:</strong> ${company.center}<br>
                <strong>C.C.C.:</strong> ${company.ccc}
            </div>
            <div>
                <strong>Trabajador:</strong> {workerName}<br>
                <strong>N.I.F.:</strong> {workerNif}<br>
                <strong>Nº Afiliación:</strong> {workerAffiliation}<br>
                <strong>Mes y Año:</strong> {workerMonthYear}
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th rowspan="2">DÍA</th>
                    <th colspan="3">MAÑANAS</th>
                    <th colspan="3">TARDES</th>
                    <th rowspan="2">FIRMA DEL TRABAJADOR</th>
                </tr>
                <tr>
                    <th>ENTRADA</th>
                    <th>SALIDA</th>
                    <th>SALIDA</th>
                    <th>ENTRADA</th>
                    <th>SALIDA</th>
                    <th>SALIDA</th>
                </tr>
            </thead>
            <tbody>`;

    const daysInMonth = 31;
    const totals = { hours: 0 };
    workers.forEach(worker => {
        const workerRecords = timeRecords.filter(r => r.workerId === worker.id);
        for (let day = 1; day <= daysInMonth; day++) {
            const record = workerRecords.find(r => new Date(r.date).getDate() === day);
            const morningEntry = record?.morningEntry || '';
            const morningExit = record?.morningExit || '';
            const afternoonEntry = record?.afternoonEntry || '';
            const afternoonExit = record?.afternoonExit || '';
            
            if (record) {
                if (morningEntry && morningExit) {
                    const [mEntryH, mEntryM] = morningEntry.split(':').map(Number);
                    const [mExitH, mExitM] = morningExit.split(':').map(Number);
                    totals.hours += (mExitH * 60 + mExitM - (mEntryH * 60 + mEntryM)) / 60;
                }
                if (afternoonEntry && afternoonExit) {
                    const [aEntryH, aEntryM] = afternoonEntry.split(':').map(Number);
                    const [aExitH, aExitM] = afternoonExit.split(':').map(Number);
                    totals.hours += (aExitH * 60 + aExitM - (aEntryH * 60 + aEntryM)) / 60;
                }
            }

            html = html.replace('{workerName}', worker.name)
                       .replace('{workerNif}', worker.nif)
                       .replace('{workerAffiliation}', worker.affiliation)
                       .replace('{workerMonthYear}', worker.monthYear);
            html += `
                <tr>
                    <td>${day}</td>
                    <td>${morningEntry}</td>
                    <td>${morningExit}</td>
                    <td></td>
                    <td>${afternoonEntry}</td>
                    <td>${afternoonExit}</td>
                    <td></td>
                    <td></td>
                </tr>`;
        }
    });

    html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td>TOTAL</td>
                    <td colspan="6">HRAS. ${totals.hours.toFixed(2)}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
        <div class="signature">
            <span>Firma de la empresa: ___________________________</span>
            <span>Firma del trabajador: ___________________________</span>
        </div>
        <p>En ${company.center}, a ${formattedDate}</p>
        <button class="btn btn-secondary" onclick="printReport()">Imprimir</button>`;
    
    reportContainer.innerHTML = html;
    return html;
}

// Función para imprimir el informe
function printReport() {
    const reportContent = document.getElementById('reportContainer').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Imprimir Informe</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; text-align: center; margin: 0; padding: 0; }
                h3 { margin-bottom: 0.2rem; font-size: 1rem; }
                .header-info { display: flex; justify-content: space-between; margin-bottom: 0.2rem; font-size: 0.6rem; }
                table { width: 100%; border-collapse: collapse; margin: 0 auto; font-size: 0.65rem; max-width: 1000px; }
                th, td { padding: 0.1rem; border: 1px solid #ddd; text-align: center; }
                th { background: #2c3e50; color: white; font-weight: 600; }
                .total-row { background: #ecf0f1; font-weight: bold; }
                .signature { margin-top: 0.2rem; display: flex; justify-content: space-between; font-style: italic; font-size: 0.6rem; max-width: 1000px; margin-left: auto; margin-right: auto; }
                p { margin-top: 0.2rem; font-size: 0.6rem; }
                button { display: none; }
                @page { size: A4; margin: 5mm; }
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Exportación PDF
document.getElementById('exportPDF').addEventListener('click', () => {
    const element = document.getElementById('reportContainer');
    if (!element.innerHTML) {
        alert('Por favor, genera el informe primero.');
        return;
    }
    const printButton = element.querySelector('button');
    if (printButton) printButton.style.display = 'none';
    
    const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `informe_${company.name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
    };
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        pdf.setPage(1);
        if (printButton) printButton.style.display = 'block';
    }).save();
});

// Exportación Excel
document.getElementById('exportExcel').addEventListener('click', () => {
    const data = [['DÍA', 'MAÑANA ENTRADA', 'MAÑANA SALIDA', 'TARDE ENTRADA', 'TARDE SALIDA']];
    workers.forEach(worker => {
        const workerRecords = timeRecords.filter(r => r.workerId === worker.id);
        for (let day = 1; day <= 31; day++) {
            const record = workerRecords.find(r => new Date(r.date).getDate() === day);
            data.push([
                day,
                record?.morningEntry || '',
                record?.morningExit || '',
                record?.afternoonEntry || '',
                record?.afternoonExit || ''
            ]);
        }
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Informe');
    XLSX.writeFile(wb, `informe_${company.name}.xlsx`);
});

// Envío por Email con PDF
document.getElementById('emailReport').addEventListener('click', () => {
    const reportHtml = generateReport();
    if (!reportHtml) {
        alert('No hay datos para generar el informe.');
        return;
    }

    const element = document.getElementById('reportContainer');
    const printButton = element.querySelector('button');
    if (printButton) printButton.style.display = 'none';

    const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `informe_${company.name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
    };
    
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        pdf.setPage(1);
        if (printButton) printButton.style.display = 'block';
    }).save().then(() => {
        const subject = encodeURIComponent(`Informe Mensual - ${company.name}`);
        const body = encodeURIComponent(`
            Informe Mensual de Horarios - ${company.name}
            C.I.F./N.I.F.: ${company.cif}
            Centro: ${company.center}
            C.C.C.: ${company.ccc}
            
            Se ha generado un PDF con el informe. Por favor, adjúntalo manualmente desde tu cliente de correo.
            
            ${reportHtml.replace(/<[^>]+>/g, (tag) => {
                if (tag.includes('table')) return '\n\n';
                if (tag.includes('tr')) return '\n';
                if (tag.includes('td')) return '\t';
                return '';
            })}
        `);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        alert('El PDF se ha descargado. Por favor, adjúntalo manualmente al email que se abrirá.');
    }).catch(err => {
        console.error('Error al generar PDF:', err);
        alert('Error al generar el PDF. Intenta de nuevo.');
        if (printButton) printButton.style.display = 'block';
    });
});

// Funciones auxiliares
function formatDateTime(date) {
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}