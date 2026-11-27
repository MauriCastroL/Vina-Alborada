// Traduce los errores de Oracle a los estados y mensajes de la API.
function errorApp(numero, mensaje) {
    const error = new Error(`ORA-${numero}: ${mensaje}`);
    error.errorNum = numero;
    return error;
}

function leerCodigoOracle(linea, inicio) {
    const inicioNumero = inicio + 'ORA-'.length;
    let finNumero = inicioNumero;
    while (finNumero < linea.length) {
        const caracter = linea[finNumero];
        if (caracter < '0' || caracter > '9') {
            break;
        }
        finNumero++;
    }
    if (finNumero === inicioNumero || linea[finNumero] !== ':') {
        return null;
    }
    return {
        numero: Number(linea.substring(inicioNumero, finNumero)),
        mensaje: linea.substring(finNumero + 1).trimStart()
    };
}

function buscarErrorInterno(linea) {
    let inicio = linea.indexOf('ORA-');
    while (inicio !== -1) {
        const codigo = leerCodigoOracle(linea, inicio);
        // Un código interno debe estar seguido por un mensaje en la misma línea.
        if (codigo && !codigo.mensaje.includes('\r') &&
            !codigo.mensaje.includes('\u2028') && !codigo.mensaje.includes('\u2029')) {
            return { inicio, numero: codigo.numero, mensaje: codigo.mensaje };
        }
        inicio = linea.indexOf('ORA-', inicio + 'ORA-'.length);
    }
    return null;
}

function traducirError(error) {
    const numero = error.errorNum;
    const texto = String(error.message || '');
    let linea = texto.split('\n')[0];

    if (linea.startsWith('ORA-')) {
        const inicial = leerCodigoOracle(linea, 0);
        if (inicial) {
            linea = inicial.mensaje;
        }
    }

    let numeroInterno = null;
    const interno = buscarErrorInterno(linea);
    if (interno) {
        numeroInterno = interno.numero;
        if (numeroInterno >= 20000 && numeroInterno <= 20999) {
            linea = interno.mensaje;
        } else {
            linea = linea.substring(0, interno.inicio).trimEnd();
            while (linea.endsWith(':')) {
                linea = linea.substring(0, linea.length - 1).trimEnd();
            }
        }
    }

    if (numero === 1 || numeroInterno === 1) {
        return { estado: 409, mensaje: 'YA EXISTE UN REGISTRO CON ESOS DATOS' };
    }
    if (numero === 2291 || numeroInterno === 2291) {
        return { estado: 400, mensaje: 'EL REGISTRO RELACIONADO NO EXISTE' };
    }
    if (numero === 2292 || numeroInterno === 2292) {
        return { estado: 409, mensaje: 'NO SE PUEDE ELIMINAR: TIENE REGISTROS ASOCIADOS' };
    }
    if (numero >= 20000 && numero <= 20999) {
        let estado = 400;
        if (numero === 20100) {
            estado = 404;
        }
        return { estado, mensaje: linea };
    }

    const codigosConexion = ['ORA-12541', 'ORA-12514', 'ORA-01017', 'ORA-28000'];
    if (texto.startsWith('NJS-')) {
        return { estado: 503, mensaje: 'NO HAY CONEXION CON LA BASE DE DATOS' };
    }
    for (const codigo of codigosConexion) {
        if (texto.includes(codigo)) {
            return { estado: 503, mensaje: 'NO HAY CONEXION CON LA BASE DE DATOS' };
        }
    }
    return { estado: 500, mensaje: 'ERROR INTERNO DEL SERVIDOR' };
}

module.exports = { errorApp, traducirError };
