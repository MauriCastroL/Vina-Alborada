const express = require('express');
const inventario = require('../controladores/inventarioControlador');
const ventas = require('../controladores/ventasControlador');
const solicitudes = require('../controladores/solicitudesControlador');
const autenticar = require('../middlewares/autenticacion');
const permiso = require('../middlewares/permisos');

const rutas = express.Router();
rutas.use(autenticar);

rutas.post('/movimientos/:id/aplicar', permiso('INVENTARIO'), inventario.aplicarMovimiento);

rutas.get('/ventas', permiso('VENTAS'), ventas.listar);
rutas.get('/ventas/:id/detalle', permiso('VENTAS'), ventas.detalle);
rutas.post('/ventas', permiso('VENTAS'), ventas.crear);
rutas.post('/ventas/:id/productos', permiso('VENTAS'), ventas.agregarProducto);
rutas.post('/ventas/:id/confirmar', permiso('VENTAS'), ventas.confirmar);
rutas.post('/ventas/:id/anular', permiso('VENTAS'), ventas.anular);

rutas.post('/solicitudes/:id/aceptar', permiso('SOLICITUDES'), solicitudes.aceptar);
rutas.post('/solicitudes/:id/anular', permiso('SOLICITUDES'), solicitudes.anular);

module.exports = rutas;
