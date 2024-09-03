const barcodeInput1 = document.getElementById('barcodeInput1');
const barcodeInput2 = document.getElementById('barcodeInput2');
const scannedCodesDiv = document.getElementById('scannedCodes');
let scannedCodes = [];
let firstCode = "";
let inputTimeout = null;

function validarPatron1(codigo) {
    const patron = /^[A-Z0-9]+ [A-Z0-9]+$/;; // Incluye guiones y letras minúsculas
    return patron.test(codigo);
}

function validarPatron2(codigo) {
    const patron = /^[A-Z0-9]+ [0-9]+$/;; // Incluye guiones y letras minúsculas
    return patron.test(codigo);
}

function procesarInput(inputElement, validarPatron, siguienteInput) {
    clearTimeout(inputTimeout);  // Evitar múltiples mensajes
    inputTimeout = setTimeout(() => {
        const code = inputElement.value.trim();
        if (validarPatron(code)) {
            if (inputElement === barcodeInput1) {
                firstCode = code.split(' ')[0];
                barcodeInput1.disabled = true;
                barcodeInput2.disabled = false;
                barcodeInput2.focus();
            } else if (inputElement === barcodeInput2) {
                const secondCode = code.split(' ')[0];
                if (firstCode === secondCode) {
                    toastr.success('Los códigos coinciden');
                    scannedCodes.push(secondCode);
                    const codeElement = document.createElement('p');
                    codeElement.textContent = secondCode;
                    scannedCodesDiv.appendChild(codeElement);
                } else {
                    toastr.error('Los códigos no coinciden');
                }
                barcodeInput1.disabled = false;
                barcodeInput2.disabled = true;
                barcodeInput1.value = '';
                barcodeInput2.value = '';
                barcodeInput1.focus();
            }
            inputElement.value = '';
        } else {
            toastr.error('El código no cumple con el patrón requerido');
            inputElement.value = '';
            if (inputElement === barcodeInput2) {
                barcodeInput1.disabled = false;
                barcodeInput2.disabled = true;
                barcodeInput1.focus();
            }
        }
    }, 500);
}

barcodeInput1.addEventListener('input', () => procesarInput(barcodeInput1, validarPatron1, barcodeInput2));
barcodeInput2.addEventListener('input', () => procesarInput(barcodeInput2, validarPatron2, barcodeInput1));

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

closeModalButton.addEventListener('click', () => {
    successModal.style.display = "none";
    location.reload();
});

exportButton.addEventListener('click', exportToExcel);
