const baseDatos = require('../config/baseDatos');

async function esDelCliente(idSolicitud, idCliente, usuario) {
    const es = await baseDatos.funcion('CEMJ_FN_SOLICITUD_DEL_CLIENTE', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_CLIENTE: idCliente
    }, usuario);
    return es === 1;
}

function listar(idCliente, usuario) {
    return baseDatos.listar('CEMJ_PA_SOLICITUD_LISTAR', { P_ID_CLIENTE: idCliente }, usuario);
}

function listarMetodosPago(usuario) {
    return baseDatos.listar('CEMJ_PA_METODO_PAGO_LISTAR', { P_SOLO_ACTIVOS: 1 }, usuario);
}

function crear(idCliente, observaciones, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_SOLICITUD_CREAR', { P_ID_CLIENTE: idCliente, P_OBSERVACIONES: observaciones }, usuario);
}

function modificar(idSolicitud, idCliente, observaciones, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_SOLICITUD_MODIFICAR', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_CLIENTE: idCliente,
        P_OBSERVACIONES: observaciones
    }, usuario);
}

function anular(idSolicitud, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_SOLICITUD_ELIMINAR', { P_ID_SOLICITUD: idSolicitud }, usuario);
}

function listarProductos(idSolicitud, usuario) {
    return baseDatos.listar('CEMJ_PA_DET_SOLIC_LISTAR', { P_ID_SOLICITUD: idSolicitud }, usuario);
}

function agregarProducto(idSolicitud, idProducto, cantidad, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_DET_SOLIC_CREAR', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_PRODUCTO: idProducto,
        P_CANTIDAD: cantidad
    }, usuario);
}

function cambiarCantidad(idSolicitud, idProducto, cantidad, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_DET_SOLIC_MODIFICAR', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_PRODUCTO: idProducto,
        P_CANTIDAD: cantidad
    }, usuario);
}

function quitarProducto(idSolicitud, idProducto, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_DET_SOLIC_ELIMINAR', {
        P_ID_SOLICITUD: idSolicitud,
        P_ID_PRODUCTO: idProducto
    }, usuario);
}

module.exports = {
    esDelCliente, listar, listarMetodosPago, crear, modificar, anular, listarProductos, agregarProducto, cambiarCantidad, quitarProducto
};
