const numeros = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 12
});

export function mensajeValidacion(campo) {
    const estado = campo.validity;
    const tipo = campo.type;
    const minimo = campo.min;
    const maximo = campo.max;
    const incremento = campo.step;
    const longitudMinima = campo.minLength;
    const longitudMaxima = campo.maxLength;

    if (estado.badInput) {
        return 'Ingresa un número válido.';
    }

    if (estado.valueMissing) {
        if (tipo === 'select-one' || tipo === 'radio') {
            return 'Selecciona una opción.';
        }

        return 'Completa este campo.';
    }

    if (estado.rangeUnderflow) {
        return 'Ingresa un valor mayor o igual a ' +
            numeros.format(Number(minimo)) + '.';
    }

    if (estado.rangeOverflow) {
        return 'Ingresa un valor menor o igual a ' +
            numeros.format(Number(maximo)) + '.';
    }

    if (estado.stepMismatch) {
        if (incremento === '1' || (!incremento && tipo === 'number')) {
            return 'Ingresa un número entero.';
        }

        return 'Ingresa un valor con el incremento indicado.';
    }

    if (estado.typeMismatch) {
        if (tipo === 'email') {
            return 'Ingresa un correo electrónico válido.';
        }

        return 'Ingresa una dirección web válida.';
    }

    if (estado.tooShort) {
        return 'Ingresa al menos ' + longitudMinima + ' caracteres.';
    }

    if (estado.tooLong) {
        return 'Ingresa como máximo ' + longitudMaxima + ' caracteres.';
    }

    if (estado.patternMismatch) {
        return 'Usa el formato indicado para este campo.';
    }

    return 'Revisa el valor de este campo.';
}

export function etiquetaValidacion(campo) {
    const nombre = campo.getAttribute('aria-label');

    if (nombre) {
        return nombre.trim();
    }

    if (campo.labels && campo.labels.length > 0) {
        const etiqueta = campo.labels[0];
        const fragmentos = [];
        for (const nodo of etiqueta.childNodes) {
            if (nodo.nodeType === Node.TEXT_NODE) {
                fragmentos.push(nodo.textContent);
            }
        }

        const texto = fragmentos.join(' ');
        if (texto) {
            return texto.trim();
        }
    }

    const marcador = campo.getAttribute('placeholder');

    if (marcador) {
        return marcador.trim();
    }

    return '';
}