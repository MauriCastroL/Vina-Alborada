// Controlador de ventas: listado, detalle, venta presencial (G2), confirmar con pago (G4) y anular (G5)
const { randomUUID } = require('node:crypto');
const ventaModelo = require('../modelos/ventaModelo');
const { errorApp } = require('../utilidades/errores');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async function (peticion, respuesta) {
    const filas = await ventaModelo.listar(peticion.query.estado, peticion.usuario);
    respuesta.json(filas);
});

const detalle = asincrono(async function (peticion, respuesta) {
    respuesta.json(await ventaModelo.detalle(peticion.params.id, peticion.usuario));
});

const crear = asincrono(async function (peticion, respuesta) {
    const idVenta = await ventaModelo.crear(peticion.body || {}, peticion.usuario);
    respuesta.status(201).json({ ID_VENTA: idVenta });
});

const agregarProducto = asincrono(async function (peticion, respuesta) {
    const cuerpo = peticion.body || {};
    await ventaModelo.agregarProducto(peticion.params.id, cuerpo.ID_PRODUCTO, cuerpo.CANTIDAD, peticion.usuario);
    respuesta.json({ ok: true });
});

const confirmar = asincrono(async function (peticion, respuesta) {
    const cuerpo = peticion.body || {};
    const ventas = await ventaModelo.listar(null, peticion.usuario);
    const venta = ventas.find(function (fila) {
        return String(fila.ID_VENTA) === String(peticion.params.id);
    });
    if (!venta) throw errorApp(20100, 'VENTA NO ENCONTRADA');
    if (venta.CANAL_VENTA === 'DIGITAL') {
        throw errorApp(20314, 'ESTA OPERACION SOLO CONFIRMA VENTAS PRESENCIALES');
    }
    const referencia = `VP-${randomUUID().toUpperCase()}`;
    await ventaModelo.confirmar(peticion.params.id, cuerpo.ID_METODO_PAGO, referencia, peticion.usuario);
    respuesta.json({ ok: true, REFERENCIA: referencia });
});

const anular = asincrono(async function (peticion, respuesta) {
    await ventaModelo.anular(peticion.params.id, (peticion.body || {}).MOTIVO, peticion.usuario);
    respuesta.json({ ok: true });
});

module.exports = { listar, detalle, crear, agregarProducto, confirmar, anular };
