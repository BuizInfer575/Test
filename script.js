const barcodeInput1 = document.getElementById('barcodeInput1');
const barcodeInput2 = document.getElementById('barcodeInput2');
const scannedCodesDiv = document.getElementById('scannedCodes');
const exportButton = document.getElementById('exportButton');
let scannedCodes = [];
let firstCode = "";
let inputTimeout = null;

function validarPatron1(codigo) {
    const patron = /^[A-Z0-9]+ [A-Z0-9]+$/;
    return patron.test(codigo);
}

function validarPatron2(codigo) {
    const patron = /^[A-Z0-9]+$/;
    return patron.test(codigo);
}

barcodeInput1.addEventListener('focusout', () => {
    barcodeInput1.focus();
});

barcodeInput1.addEventListener('input', () => {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
        barcodeInput1.value = '';  
    }, 250);  // Mostrar el texto por medio segundo
});

barcodeInput1.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const code = barcodeInput1.value.trim();
        if (validarPatron1(code)) {
            firstCode = code.split(' ')[0];  // Guardar la parte antes del espacio
            barcodeInput1.disabled = true;  
            barcodeInput2.disabled = false; 
            barcodeInput2.focus();          
            barcodeInput1.value = '';       
        } else {
            toastr.error('El código no cumple con el patrón requerido');
            barcodeInput1.value = ''; 
        }
    }
});

barcodeInput2.addEventListener('focusout', () => {
    barcodeInput2.focus();
});

barcodeInput2.addEventListener('input', () => {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
        barcodeInput2.value = '';  
    }, 250);  // Mostrar el texto por medio segundo
});

barcodeInput2.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const code = barcodeInput2.value.trim();
        if (validarPatron2(code)) {
            if (firstCode === code) {
                toastr.success('Los códigos coinciden');
                scannedCodes.push(firstCode); 
                const codeElement = document.createElement('p');
                codeElement.textContent = firstCode;
                scannedCodesDiv.appendChild(codeElement);
            } else {
                toastr.error('Los códigos no coinciden');
            }

            barcodeInput1.disabled = false;
            barcodeInput2.disabled = true;
            barcodeInput1.value = '';
            barcodeInput2.value = '';
            barcodeInput1.focus();
        } else {
            toastr.error('El código no cumple con el patrón requerido');
            barcodeInput2.value = ''; 
            barcodeInput1.disabled = false;
            barcodeInput2.disabled = true;
            barcodeInput1.focus();
        }
    }
});

// Función para exportar los códigos a un archivo Excel utilizando ExcelJS en el navegador
async function exportToExcel() {
    const workbook = new ExcelJS.Workbook();

    // Cargar la plantilla existente desde un archivo local (necesitarás un servidor para pruebas locales)
    const response = await fetch('plantilla.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet(1);  // Asume que quieres trabajar con la primera hoja

    // Encontrar la última fila con datos
    const lastRow = worksheet.lastRow;
    let nextRow = 2; //B2

    // Añadir datos a las filas subsiguientes
    scannedCodes.forEach((code, index) => {
        const row = worksheet.getRow(nextRow + index);
        row.getCell(2).value = code;  // Coloca el código en la columna B
        row.commit();
    });

    // Ajustar el ancho de las columnas según el contenido de la primera fila
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value ? cell.value.toString() : "";
            maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = maxLength + 2; // Agrega un pequeño margen
    });

    // Crear un archivo de descarga en el navegador
    const uint8Array = await workbook.xlsx.writeBuffer();
    const blob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crear un enlace de descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nuevo_archivo.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Mostrar el modal después de guardar el archivo
    successModal.style.display = "flex";
}

// Cerrar el modal y recargar la página
closeModalButton.addEventListener('click', () => {
    successModal.style.display = "none";
    location.reload();
});

exportButton.addEventListener('click', exportToExcel);
