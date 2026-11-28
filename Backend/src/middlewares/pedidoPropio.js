const pedidoModelo = require('../modelos/pedidoModelo');
const asincrono = require('../utilidades/asincrono');

const pedidoPropio = asincrono(async function (peticion, respuesta, continuar) {
    if (!(await pedidoModelo.esDelCliente(peticion.params.id, peticion.usuario.idCliente, peticion.usuario))) {
        return respuesta.status(404).json({ error: 'SOLICITUD NO ENCONTRADA' });
    }
    continuar();
});

module.exports = pedidoPropio;
