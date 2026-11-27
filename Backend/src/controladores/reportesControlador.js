// Controlador de los 3 reportes: lee los filtros de la consulta y aplica sus valores por defecto
const reporteModelo = require('../modelos/reporteModelo');
const asincrono = require('../utilidades/asincrono');

const rankingProductos = asincrono(async function (peticion, respuesta) {
    respuesta.json(await reporteModelo.rankingProductos(peticion.query.anio || null, peticion.query.mes || null, peticion.usuario));
});

const ventasPorCanal = asincrono(async function (peticion, respuesta) {
    respuesta.json(await reporteModelo.ventasPorCanal(peticion.query.anio || null, peticion.usuario));
});

const stockCritico = asincrono(async function (peticion, respuesta) {
    let soloAlertas = 0;
    if (peticion.query.soloAlertas === '1') {
        soloAlertas = 1;
    }

    respuesta.json(await reporteModelo.stockCritico(peticion.query.dias || 30, soloAlertas, peticion.usuario));
});

module.exports = { rankingProductos, ventasPorCanal, stockCritico };
