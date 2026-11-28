const express = require('express');
const mantenedores = require('../controladores/mantenedoresControlador');
const autenticar = require('../middlewares/autenticacion');
const { cargarRecurso, lectura, escritura } = require('../middlewares/recursoMantenedor');

const rutas = express.Router();
rutas.use(autenticar);
rutas.param('recurso', cargarRecurso);

rutas.get('/:recurso', lectura, mantenedores.listar);
rutas.post('/:recurso', escritura, mantenedores.crear);
rutas.put('/:recurso/:id{/:id2}', escritura, mantenedores.modificar);
rutas.delete('/:recurso/:id{/:id2}', escritura, mantenedores.eliminar);
rutas.patch('/:recurso/:id/reactivar', escritura, mantenedores.reactivar);

module.exports = rutas;
