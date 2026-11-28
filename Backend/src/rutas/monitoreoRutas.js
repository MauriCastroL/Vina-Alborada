const express = require('express');
const monitoreo = require('../controladores/monitoreoControlador');
const autenticar = require('../middlewares/autenticacion');
const permiso = require('../middlewares/permisos');

const rutas = express.Router();
rutas.use(autenticar);

rutas.get('/alertas-pendientes', permiso('MONITOREO', 'INVENTARIO', 'REPORTES', 'VENTAS'), monitoreo.alertasPendientes);
rutas.get('/auditoria', permiso('MONITOREO'), monitoreo.auditoria);
rutas.get('/alertas-stock', permiso('MONITOREO'), monitoreo.alertasStock);
rutas.get('/logins', permiso('MONITOREO'), monitoreo.intentosLogin);

module.exports = rutas;
