const baseDatos = require('../config/baseDatos');

function enviar(idSolicitud, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_GES_SOLIC_ENVIAR', { P_ID_SOLICITUD: idSolicitud }, usuario);
}

async function resolver(idSolicitud, decision, usuario) {
    const salida = await baseDatos.ejecutar('CEMJ_PA_GES_SOLIC_RESOLVER', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_USUARIO: usuario.id,
        P_DECISION: decision,
        P_ID_VENTA: baseDatos.salidaNumero()
    }, usuario);
    return salida.P_ID_VENTA;
}

function registrarPago(idSolicitud, idMetodoPago, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_PAGO_SOLICITUD_REGISTRAR', {
        P_ID_SOLICITUD: idSolicitud, P_ID_METODO_PAGO: idMetodoPago
    }, usuario);
}

function rechazar(idSolicitud, motivo, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_SOLICITUD_RECHAZAR', {
        P_ID_SOLICITUD: idSolicitud, P_ID_USUARIO: usuario.id, P_MOTIVO_RECHAZO: motivo
    }, usuario);
}

module.exports = { enviar, resolver, registrarPago, rechazar };
