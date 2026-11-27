const pagosWeb = require('../servicios/pagosWeb');
const asincrono = require('../utilidades/asincrono');

const aceptar = asincrono(async function (peticion, respuesta) {
    const idVenta = await pagosWeb.aceptar(peticion.params.id, peticion.usuario);
    respuesta.json({ ok: true, idVenta });
});

const anular = asincrono(async function (peticion, respuesta) {
    await pagosWeb.anular(peticion.params.id, peticion.usuario, peticion.body?.MOTIVO);
    respuesta.json({ ok: true });
});

module.exports = { aceptar, anular };
