const express = require('express');
const reportes = require('../controladores/reportesControlador');
const autenticar = require('../middlewares/autenticacion');
const permiso = require('../middlewares/permisos');

const rutas = express.Router();
rutas.use(autenticar, permiso('REPORTES'));

rutas.get('/ranking-productos', reportes.rankingProductos);
rutas.get('/ventas-canal', reportes.ventasPorCanal);
rutas.get('/stock-critico', reportes.stockCritico);

module.exports = rutas;
