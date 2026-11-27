// Modelo generico de los mantenedores (CRUD): ejecuta el procedimiento que define cada recurso
const baseDatos = require('../config/baseDatos');
const RECURSOS = require('./mantenedores');

function obtenerRecurso(nombre) {
    if (Object.prototype.hasOwnProperty.call(RECURSOS, nombre)) {
        return RECURSOS[nombre];
    }
    return null;
}

function listar(recurso, parametros, usuario) {
    return baseDatos.listar(recurso.listar, parametros, usuario);
}
function crear(recurso, parametros, usuario) {
    return baseDatos.ejecutar(recurso.crear, parametros, usuario);
}
function modificar(recurso, parametros, usuario) {
    return baseDatos.ejecutar(recurso.modificar, parametros, usuario);
}
function eliminar(recurso, parametros, usuario) {
    return baseDatos.ejecutar(recurso.eliminar, parametros, usuario);
}
function reactivar(recurso, parametros, usuario) {
    return baseDatos.ejecutar(recurso.reactivar, parametros, usuario);
}

module.exports = { obtenerRecurso, listar, crear, modificar, eliminar, reactivar };
