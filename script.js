const barcodeInput1 = document.getElementById('barcodeInput1');
const barcodeInput2 = document.getElementById('barcodeInput2');
let firstCode = "";

function validarPatron1(codigo) {
    const patron = /^[A-Z0-9]+[ -]?[A-Z0-9]+$/i; // Actualizado para incluir guiones y letras minúsculas
    return patron.test(codigo);
}

function validarPatron2(codigo) {
    const patron = /^[A-Z0-9]+$/i; // Actualizado para incluir guiones y letras minúsculas
    return patron.test(codigo);
}

function procesarInput(inputElement, validarPatron, siguienteInput) {
    setTimeout(() => {
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
                    alert('Los códigos coinciden');
                } else {
                    alert('Los códigos no coinciden');
                }
                barcodeInput1.disabled = false;
                barcodeInput2.disabled = true;
                barcodeInput1.focus();
            }
            inputElement.value = '';
        } else {
            alert('El código no cumple con el patrón requerido');
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
