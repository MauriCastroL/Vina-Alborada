// Rutas /api/cliente: catalogo publico y pedidos del cliente web (requieren sesion de cliente)
const express = require('express');
const catalogo = require('../controladores/catalogoControlador');
const pedidos = require('../controladores/pedidosControlador');
const autenticar = require('../middlewares/autenticacion');
const permiso = require('../middlewares/permisos');
const pedidoPropio = require('../middlewares/pedidoPropio');

const rutas = express.Router();

rutas.get('/catalogo', catalogo.listar);
rutas.get('/mas-vendidos', catalogo.masVendidos);

rutas.use(autenticar);

const misSolicitudes = express.Router();
misSolicitudes.use(permiso('MIS_SOLICITUDES'));
misSolicitudes.get('/', pedidos.listar);
misSolicitudes.get('/metodos-pago', pedidos.listarMetodosPago);
misSolicitudes.post('/', pedidos.crear);
misSolicitudes.put('/:id', pedidoPropio, pedidos.modificar);
misSolicitudes.delete('/:id', pedidoPropio, pedidos.anular);
misSolicitudes.get('/:id/productos', pedidoPropio, pedidos.listarProductos);
misSolicitudes.post('/:id/productos', pedidoPropio, pedidos.agregarProducto);
misSolicitudes.put('/:id/productos/:idProducto', pedidoPropio, pedidos.cambiarCantidad);
misSolicitudes.delete('/:id/productos/:idProducto', pedidoPropio, pedidos.quitarProducto);
misSolicitudes.post('/:id/enviar', pedidoPropio, pedidos.enviar);

rutas.use('/mis-solicitudes', misSolicitudes);

module.exports = rutas;
