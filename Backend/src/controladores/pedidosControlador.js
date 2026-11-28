const pedidoModelo = require('../modelos/pedidoModelo');
const pagosWeb = require('../servicios/pagosWeb');
const asincrono = require('../utilidades/asincrono');
const { errorApp } = require('../utilidades/errores');

const listar = asincrono(async function (peticion, respuesta) {
    const filas = await pedidoModelo.listar(peticion.usuario.idCliente, peticion.usuario);
    respuesta.json(filas);
});

const listarMetodosPago = asincrono(async function (peticion, respuesta) {
    respuesta.json(await pedidoModelo.listarMetodosPago(peticion.usuario));
});

const crear = asincrono(async function (peticion, respuesta) {
    await pagosWeb.serializar('cliente:' + peticion.usuario.idCliente, function () {
        return pedidoModelo.crear(peticion.usuario.idCliente, peticion.body?.OBSERVACIONES, peticion.usuario);
    });
    respuesta.status(201).json({ ok: true });
});

const modificar = asincrono(async function (peticion, respuesta) {
    await pedidoModelo.modificar(peticion.params.id, peticion.usuario.idCliente, (peticion.body || {}).OBSERVACIONES, peticion.usuario);
    respuesta.json({ ok: true });
});

const anular = asincrono(async function (peticion, respuesta) {
    await pagosWeb.serializar(peticion.params.id, function () {
        return pedidoModelo.anular(peticion.params.id, peticion.usuario);
    });
    respuesta.json({ ok: true });
});

const listarProductos = asincrono(async function (peticion, respuesta) {
    respuesta.json(await pedidoModelo.listarProductos(peticion.params.id, peticion.usuario));
});

const agregarProducto = asincrono(async function (peticion, respuesta) {
    const cuerpo = peticion.body || {};
    await pagosWeb.serializar(peticion.params.id, function () {
        return pedidoModelo.agregarProducto(peticion.params.id, cuerpo.ID_PRODUCTO, cuerpo.CANTIDAD, peticion.usuario);
    });
    respuesta.status(201).json({ ok: true });
});

const cambiarCantidad = asincrono(async function (peticion, respuesta) {
    const cantidad = peticion.body?.CANTIDAD;
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw errorApp(20010, 'INGRESE UNA CANTIDAD MAYOR A CERO');
    }
    await pagosWeb.serializar(peticion.params.id, function () {
        return pedidoModelo.cambiarCantidad(peticion.params.id, peticion.params.idProducto, cantidad, peticion.usuario);
    });
    respuesta.json({ ok: true });
});

const quitarProducto = asincrono(async function (peticion, respuesta) {
    await pagosWeb.serializar(peticion.params.id, function () {
        return pedidoModelo.quitarProducto(peticion.params.id, peticion.params.idProducto, peticion.usuario);
    });
    respuesta.json({ ok: true });
});

const enviar = asincrono(async function (peticion, respuesta) {
    const idMetodoPago = peticion.body?.ID_METODO_PAGO;
    if (!Number.isSafeInteger(idMetodoPago) || idMetodoPago <= 0) {
        throw errorApp(20314, 'SELECCIONE UN METODO DE PAGO ACTIVO');
    }
    await pagosWeb.enviar(peticion.params.id, {
        idMetodoPago,
        idProducto: peticion.body.ID_PRODUCTO,
        cantidad: peticion.body.CANTIDAD
    }, peticion.usuario);
    respuesta.json({ ok: true });
});

module.exports = { listar, listarMetodosPago, crear, modificar, anular, listarProductos, agregarProducto, cambiarCantidad, quitarProducto, enviar };
