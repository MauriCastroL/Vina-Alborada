const baseDatos = require('../config/baseDatos');
const asincrono = require('../utilidades/asincrono');

const estado = asincrono(async function (peticion, respuesta) {
    await baseDatos.probarConexion();
    respuesta.json({ ok: true, baseDeDatos: 'conectada' });
});

module.exports = { estado };
