const baseDatos = require('../config/baseDatos');

function alertasPendientes(usuario) {
    return baseDatos.funcion('CEMJ_FN_ALERTAS_PENDIENTES', {}, usuario);
}

function auditoria(tabla, dias, usuario) {
    return baseDatos.listar('CEMJ_PA_AUDITORIA_LISTAR', { P_NOMBRE_TABLA: tabla, P_DIAS: dias }, usuario);
}

function alertasStock(soloBajoMinimo, dias, usuario) {
    return baseDatos.listar('CEMJ_PA_ALERTA_STOCK_LISTAR', { P_SOLO_BAJO_MINIMO: soloBajoMinimo, P_DIAS: dias }, usuario);
}

function intentosLogin(soloFallidos, dias, usuario) {
    return baseDatos.listar('CEMJ_PA_LOGIN_INTENTO_LISTAR', { P_SOLO_FALLIDOS: soloFallidos, P_DIAS: dias }, usuario);
}

module.exports = { alertasPendientes, auditoria, alertasStock, intentosLogin };
