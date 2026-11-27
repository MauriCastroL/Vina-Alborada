// Cliente HTTP de la API: agrega el token, interpreta errores y cierra la sesion si expiro
import { borrarSesion, leerSesion } from './almacenSesion.js';

export function consulta(parametros = {}) {
    const parametrosUrl = new URLSearchParams();
    for (const [clave, valor] of Object.entries(parametros)) {
        if (valor !== undefined && valor !== null && valor !== '') {
            parametrosUrl.append(clave, valor);
        }
    }
    const texto = parametrosUrl.toString();
    if (texto) {
        return `?${texto}`;
    }
    return '';
}

export async function api(ruta, opciones = {}) {
    let metodo = opciones.metodo;
    if (metodo === undefined) {
        metodo = 'GET';
    }
    const cuerpo = opciones.cuerpo;

    const sesion = leerSesion();
    const cabeceras = { 'Content-Type': 'application/json' };
    if (sesion && sesion.token) {
        cabeceras.Authorization = `Bearer ${sesion.token}`;
    }

    let cuerpoSolicitud;
    if (cuerpo !== undefined) {
        cuerpoSolicitud = JSON.stringify(cuerpo);
    }

    const respuesta = await fetch(`/api${ruta}`, {
        method: metodo,
        headers: cabeceras,
        body: cuerpoSolicitud
    });

    const texto = await respuesta.text();
    let datos = null;
    if (texto) {
        try {
            datos = JSON.parse(texto);
        } catch {
            datos = null;
        }
    }

    if (respuesta.status === 401 && sesion && !ruta.startsWith('/acceso/login')) {
        borrarSesion();
        window.location.assign('/login');
    }
    if (!respuesta.ok) {
        throw new Error(datos?.error || `ERROR ${respuesta.status}`);
    }
    return datos;
}
