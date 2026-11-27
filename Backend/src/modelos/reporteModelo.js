// Modelo de los 3 reportes (CEMJ_PA_REP_*)
const baseDatos = require('../config/baseDatos');

function rankingProductos(anio, mes, usuario) {
    return baseDatos.listar('CEMJ_PA_REP_RANKING_PRODUCTOS', { P_ANIO: anio, P_MES: mes }, usuario);
}

function ventasPorCanal(anio, usuario) {
    return baseDatos.listar('CEMJ_PA_REP_VENTAS_CANAL', { P_ANIO: anio }, usuario);
}

function stockCritico(dias, soloAlertas, usuario) {
    return baseDatos.listar('CEMJ_PA_REP_STOCK_CRITICO', { P_DIAS: dias, P_SOLO_ALERTAS: soloAlertas }, usuario);
}

module.exports = { rankingProductos, ventasPorCanal, stockCritico };
