import { esPorKilo, normalizar } from './formato.js';

export function esUva(producto) {
    return esPorKilo(producto.UNIDAD_MEDIDA);
}

export function tipoDeVino(producto) {
    const texto = normalizar(
        producto.NOMBRE + ' ' + (producto.COMPOSICION || '')
    );

    if (/\brose\b/.test(texto) || texto.includes('rosado')) {
        return 'rosado';
    }

    if (texto.includes('sauvignon blanc') ||
        texto.includes('chardonnay') ||
        texto.includes('blanco') ||
        texto.includes('semillon') ||
        texto.includes('riesling') ||
        texto.includes('moscatel') ||
        texto.includes('viognier')) {
        return 'blanco';
    }

    return 'tinto';
}