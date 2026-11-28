import { getCheckDigit } from 'rut.js';

export function quitarSeparadoresRut(rut) {
    return rut.replace(/[.\s-]/g, '');
}

export function rutValido(rut) {
    const limpio = quitarSeparadoresRut(rut).toUpperCase();
    if (!/^\d{7,8}[\dK]$/.test(limpio)) {
        return false;
    }

    const cuerpo = limpio.slice(0, -1);
    const digitoIngresado = limpio.slice(-1);
    if (Number(cuerpo) === 0) {
        return digitoIngresado === '0';
    }
    return getCheckDigit(cuerpo) === digitoIngresado;
}

export function formatearRut(rut) {
    const limpio = rut.replace(/[^\dkK]/g, '').toUpperCase();
    if (limpio.length < 2) return limpio;
    const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpo}-${limpio.slice(-1)}`;
}
