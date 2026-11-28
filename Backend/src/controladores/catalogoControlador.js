const catalogoModelo = require('../modelos/catalogoModelo');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async function (peticion, respuesta) {
    respuesta.json(await catalogoModelo.listar());
});

const masVendidos = asincrono(async function (peticion, respuesta) {
    respuesta.json(await catalogoModelo.masVendidos(30, 3));
});

module.exports = { listar, masVendidos };
