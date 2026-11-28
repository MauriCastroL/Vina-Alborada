const inventarioModelo = require('../modelos/inventarioModelo');
const asincrono = require('../utilidades/asincrono');

const aplicarMovimiento = asincrono(async function (peticion, respuesta) {
    await inventarioModelo.aplicarMovimiento(peticion.params.id, peticion.usuario);
    respuesta.json({ ok: true });
});

module.exports = { aplicarMovimiento };
