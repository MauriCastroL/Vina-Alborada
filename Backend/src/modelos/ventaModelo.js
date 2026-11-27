// Modelo de ventas: venta presencial (G2), confirmacion con pago (G4) y anulacion (G5)
const baseDatos = require('../config/baseDatos');

function listar(estado, usuario) {
    return baseDatos.listar('CEMJ_PA_GES_VENTA_LISTAR', { P_ESTADO: estado || null }, usuario);
}

function detalle(idVenta, usuario) {
    return baseDatos.listar('CEMJ_PA_GES_VENTA_DETALLE', { P_ID_VENTA: idVenta }, usuario);
}

async function crear(datos, usuario) {
    const salida = await baseDatos.ejecutar('CEMJ_PA_GES_VENTA_CREAR', {
        P_ID_USUARIO: usuario.id,
        P_ID_CLIENTE: datos.ID_CLIENTE,
        P_NOMBRE_COMPRADOR: datos.NOMBRE_COMPRADOR,
        P_LUGAR_VENTA: datos.LUGAR_VENTA,
        P_OBSERVACIONES: datos.OBSERVACIONES,
        P_ID_VENTA: baseDatos.salidaNumero()
    }, usuario);
    return salida.P_ID_VENTA;
}

function agregarProducto(idVenta, idProducto, cantidad, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_GES_VENTA_AGREGAR', {
        P_ID_VENTA: idVenta,
        P_ID_PRODUCTO: idProducto,
        P_CANTIDAD: cantidad
    }, usuario);
}

function confirmar(idVenta, idMetodoPago, referencia, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_GES_VENTA_CONFIRMAR', {
        P_ID_VENTA: idVenta,
        P_ID_USUARIO: usuario.id,
        P_ID_METODO_PAGO: idMetodoPago,
        P_REFERENCIA: referencia
    }, usuario);
}

function anular(idVenta, motivo, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_GES_VENTA_ANULAR', {
        P_ID_VENTA: idVenta,
        P_ID_USUARIO: usuario.id,
        P_MOTIVO: motivo
    }, usuario);
}

module.exports = { listar, detalle, crear, agregarProducto, confirmar, anular };
