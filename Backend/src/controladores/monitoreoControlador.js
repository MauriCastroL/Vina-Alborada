// Controlador de monitoreo: alertas pendientes, auditoria, alertas de stock e intentos de inicio de sesion
const monitoreoModelo = require('../modelos/monitoreoModelo');
const asincrono = require('../utilidades/asincrono');

const alertasPendientes = asincrono(async function (peticion, respuesta) {
    respuesta.json({ cantidad: await monitoreoModelo.alertasPendientes(peticion.usuario) });
});

const auditoria = asincrono(async function (peticion, respuesta) {
    respuesta.json(await monitoreoModelo.auditoria(peticion.query.tabla || null, peticion.query.dias || 7, peticion.usuario));
});

const alertasStock = asincrono(async function (peticion, respuesta) {
    let soloBajoMinimo = 0;
    if (peticion.query.soloBajoMinimo === '1') {
        soloBajoMinimo = 1;
    }

    respuesta.json(await monitoreoModelo.alertasStock(soloBajoMinimo, peticion.query.dias || 30, peticion.usuario));
});

const intentosLogin = asincrono(async function (peticion, respuesta) {
    let soloFallidos = 0;
    if (peticion.query.soloFallidos === '1') {
        soloFallidos = 1;
    }

    respuesta.json(await monitoreoModelo.intentosLogin(soloFallidos, peticion.query.dias || 7, peticion.usuario));
});

module.exports = { alertasPendientes, auditoria, alertasStock, intentosLogin };
