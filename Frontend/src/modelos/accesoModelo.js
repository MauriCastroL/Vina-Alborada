import { api } from './http.js';

export function iniciarSesion(correo, clave) {
    return api('/acceso/login', { metodo: 'POST', cuerpo: { correo, clave } });
}

export function registrar(datos) {
    return api('/acceso/registro', { metodo: 'POST', cuerpo: datos });
}

export function obtenerSesion() {
    return api('/acceso/sesion');
}

export function cambiarClave(claveActual, claveNueva) {
    return api('/acceso/cambiar-clave', { metodo: 'POST', cuerpo: { claveActual, claveNueva } });
}
