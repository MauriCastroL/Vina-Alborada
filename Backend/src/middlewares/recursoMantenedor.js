// Mantenedores: carga la definicion del recurso de la URL y controla los permisos de lectura y escritura
const mantenedorModelo = require('../modelos/mantenedorModelo');
const permiso = require('./permisos');

function cargarRecurso(peticion, respuesta, continuar, nombre) {
    peticion.recurso = mantenedorModelo.obtenerRecurso(nombre);
    if (!peticion.recurso) {
        return respuesta.status(404).json({ error: 'MANTENEDOR NO ENCONTRADO' });
    }
    continuar();
}

function lectura(peticion, respuesta, continuar) {
    return permiso(...peticion.recurso.lectura)(peticion, respuesta, continuar);
}

function escritura(peticion, respuesta, continuar) {
    if (!peticion.recurso.modulo) {
        return respuesta.status(405).json({ error: 'ESTE RECURSO ES SOLO DE LECTURA' });
    }
    return permiso(peticion.recurso.modulo)(peticion, respuesta, continuar);
}

module.exports = { cargarRecurso, lectura, escritura };
