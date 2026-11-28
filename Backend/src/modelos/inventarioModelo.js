const baseDatos = require('../config/baseDatos');

function aplicarMovimiento(idMovimiento, usuario) {
    return baseDatos.ejecutar('CEMJ_PA_GES_MOV_APLICAR', {
        P_ID_MOVIMIENTO: idMovimiento,
        P_ID_USUARIO: usuario.id
    }, usuario);
}

module.exports = { aplicarMovimiento };
