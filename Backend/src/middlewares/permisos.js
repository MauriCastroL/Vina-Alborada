const accesoModelo = require('../modelos/accesoModelo');
const asincrono = require('../utilidades/asincrono');

function permiso(...modulos) {
    return asincrono(async function (peticion, respuesta, continuar) {
        for (const modulo of modulos) {
            if (await accesoModelo.puedeAcceder(peticion.usuario, modulo)) {
                return continuar();
            }
        }
        respuesta.status(403).json({ error: 'NO TIENE PERMISO PARA ESTE MODULO' });
    });
}

module.exports = permiso;
