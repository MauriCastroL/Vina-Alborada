const pesos = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
});

const numeros = new Intl.NumberFormat('es-CL');

export function dinero(valor) {
    if (valor == null || valor === '') {
        return '';
    }

    return pesos.format(valor);
}

export function numero(valor) {
    if (valor == null || valor === '') {
        return '';
    }

    return numeros.format(valor);
}


export function fecha(valor) {
    if (!valor) {
        return '';
    }

    return new Date(valor).toLocaleDateString('es-CL');
}

export function fechaHora(valor) {
    if (!valor) {
        return '';
    }

    return new Date(valor).toLocaleString('es-CL', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
}

export function nombrePropio(texto) {
    if (!texto) {
        return '';
    }

    return texto.toLowerCase().replace(
        /(^|[\s(-])(\S)/g,
        function (coincidencia, separador, letra) {
            return separador + letra.toUpperCase();
        }
    );
}

export function normalizar(texto) {
    if (texto == null) {
        return '';
    }

    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export function nombreCliente(cliente) {
    if (!cliente) {
        return '';
    }

    if (cliente.TIPO_CLIENTE === 'EMPRESA') {
        return cliente.RAZON_SOCIAL;
    }

    const nombres = [
        cliente.NOMBRE,
        cliente.APELLIDO1,
        cliente.APELLIDO2
    ];

    return nombres.filter(Boolean).join(' ');
}

export function mesActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    let mes = hoy.getMonth() + 1;

    if (mes < 10) {
        mes = '0' + mes;
    }

    return anio + '-' + mes;
}

export function esPorKilo(unidad) {
    if (!unidad) {
        return false;
    }

    return String(unidad).toUpperCase() === 'KG';
}

export function unidadCorta(unidad, cantidad = 1) {
    if (esPorKilo(unidad)) {
        return 'kg';
    }

    if (Number(cantidad) === 1) {
        return 'botella';
    }

    return 'botellas';
}

export function cantidadConUnidad(cantidad, unidad) {
    return numero(cantidad) + ' ' + unidadCorta(unidad, cantidad);
}