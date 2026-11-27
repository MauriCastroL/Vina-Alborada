// Rutas /api/acceso: login, registro, sesion y cambio de contraseña
const express = require('express');
const acceso = require('../controladores/accesoControlador');
const autenticar = require('../middlewares/autenticacion');

const rutas = express.Router();

rutas.post('/login', acceso.login);
rutas.post('/registro', acceso.registro);
rutas.get('/sesion', autenticar, acceso.sesion);
rutas.post('/cambiar-clave', autenticar, acceso.cambiarClave);

module.exports = rutas;
