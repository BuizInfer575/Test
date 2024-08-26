document.addEventListener('DOMContentLoaded', function() {
    const barcodeInput1 = document.getElementById('barcodeInput1');
    const barcodeInput2 = document.getElementById('barcodeInput2');
    const scannedCodesDiv = document.getElementById('scannedCodes');
    const exportButton = document.getElementById('exportButton');
    let scannedCodes = [];
    let firstCode = "";
    let inputTimeout = null;

    barcodeInput1.addEventListener("keydown", function(event) {
        if (!event.isTrusted) {
            return;
        }
        event.preventDefault();
    });

    barcodeInput2.addEventListener("keydown", function(event) {
        if (!event.isTrusted) {
            return;
        }
        event.preventDefault();
    });

    barcodeInput1.addEventListener('focusout', () => {
        barcodeInput1.focus();
    });

    barcodeInput1.addEventListener('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
            barcodeInput1.value = '';  
        }, 100);  
    });

    barcodeInput1.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const code = barcodeInput1.value.trim();
            if (code) {
                firstCode = code;
                barcodeInput1.disabled = true;  
                barcodeInput2.disabled = false; 
                barcodeInput2.focus();          
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
        }, 100);  
    });

    barcodeInput2.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const code = barcodeInput2.value.trim();
            if (code) {
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
            }
        }
    });

    async function exportToExcel() {
        const workbook = new ExcelJS.Workbook();
        const response = await fetch('plantilla.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.getWorksheet(1);
        const lastRow = worksheet.lastRow;
        let nextRow = 2;
        scannedCodes.forEach((code, index) => {
            const row = worksheet.getRow(nextRow + index);
            row.getCell(2).value = code;
            row.commit();
        });

        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, cellValue.length);
            });
            column.width = maxLength + 2;
        });

        const uint8Array = await workbook.xlsx.writeBuffer();
        const blob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nuevo_archivo.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        successModal.style.display = "flex";
    }

    closeModalButton.addEventListener('click', () => {
        successModal.style.display = "none";
        location.reload();
    });

    exportButton.addEventListener('click', exportToExcel);
});
