// Modelo del catalogo publico: productos a la venta y los mas vendidos
const baseDatos = require('../config/baseDatos');

function listar() {
    return baseDatos.listar('CEMJ_PA_CATALOGO_LISTAR', {});
}

function masVendidos(dias = 30, top = 3) {
    return baseDatos.listar('CEMJ_PA_REP_MAS_VENDIDOS', { P_DIAS: dias, P_TOP: top });
}

module.exports = { listar, masVendidos };
