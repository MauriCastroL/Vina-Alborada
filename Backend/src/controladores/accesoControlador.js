// Controlador de acceso: login, registro de cliente web, datos de la sesion y cambio de contraseña
const accesoServicio = require('../servicios/accesoServicio');
const asincrono = require('../utilidades/asincrono');

const login = asincrono(async function (peticion, respuesta) {
    const { correo, clave } = peticion.body || {};
    respuesta.json(await accesoServicio.iniciarSesion(correo, clave));
});

const registro = asincrono(async function (peticion, respuesta) {
    respuesta.json(await accesoServicio.registrarCliente(peticion.body || {}));
});

const sesion = asincrono(async function (peticion, respuesta) {
    respuesta.json(await accesoServicio.datosSesion(peticion.usuario));
});

const cambiarClave = asincrono(async function (peticion, respuesta) {
    const { claveActual, claveNueva } = peticion.body || {};
    await accesoServicio.cambiarClave(peticion.usuario, claveActual, claveNueva);
    respuesta.json({ ok: true });
});

module.exports = { login, registro, sesion, cambiarClave };
