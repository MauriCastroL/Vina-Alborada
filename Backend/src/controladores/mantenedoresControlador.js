// Controlador generico de los 10 mantenedores: listar, crear, modificar, eliminar (logico) y reactivar
const mantenedorModelo = require('../modelos/mantenedorModelo');
const servicio = require('../servicios/mantenedorServicio');
const crearProducto = require('../servicios/creacionProducto');
const validarFormatoProducto = require('../servicios/formatoProducto');
const productos = require('../modelos/mantenedores/productos');
const asincrono = require('../utilidades/asincrono');

const listar = asincrono(async function (peticion, respuesta) {
    const { params: parametros, faltante } = servicio.parametrosListar(peticion.recurso, peticion.query);
    if (faltante) {
        return respuesta.status(400).json({ error: `FALTA EL FILTRO ${faltante}` });
    }
    const filas = await mantenedorModelo.listar(peticion.recurso, parametros, peticion.usuario);
    respuesta.json(filas);
});

const crear = asincrono(async function (peticion, respuesta) {
    const recibido = peticion.body || {};
    let cuerpo;
    if (peticion.recurso === productos) {
        cuerpo = await validarFormatoProducto(recibido, peticion.usuario);
    } else {
        cuerpo = recibido;
    }
    if (peticion.recurso === productos && (Object.hasOwn(cuerpo, 'CEPAS') || Number(cuerpo.ACTIVO) === 1)) {
        return respuesta.status(201).json(await crearProducto(cuerpo, peticion.usuario));
    }
    await mantenedorModelo.crear(peticion.recurso, servicio.parametrosCrear(peticion.recurso, cuerpo, peticion.usuario), peticion.usuario);
    respuesta.status(201).json({ ok: true });
});

const modificar = asincrono(async function (peticion, respuesta) {
    const recibido = peticion.body || {};
    let cuerpo;
    if (peticion.recurso === productos) {
        cuerpo = await validarFormatoProducto(recibido, peticion.usuario, peticion.params.id);
    } else {
        cuerpo = recibido;
    }
    const parametros = servicio.parametrosModificar(peticion.recurso, peticion.params.id, peticion.params.id2, cuerpo);
    await mantenedorModelo.modificar(peticion.recurso, parametros, peticion.usuario);
    respuesta.json({ ok: true });
});

const eliminar = asincrono(async function (peticion, respuesta) {
    await mantenedorModelo.eliminar(peticion.recurso, servicio.parametrosIds(peticion.recurso, peticion.params.id, peticion.params.id2), peticion.usuario);
    respuesta.json({ ok: true });
});

const reactivar = asincrono(async function (peticion, respuesta) {
    if (!peticion.recurso.reactivar) {
        return respuesta.status(405).json({ error: 'ESTE REGISTRO NO SE PUEDE REACTIVAR' });
    }
    await mantenedorModelo.reactivar(peticion.recurso, servicio.parametrosIds(peticion.recurso, peticion.params.id, peticion.params.id2), peticion.usuario);
    respuesta.json({ ok: true });
});

module.exports = { listar, crear, modificar, eliminar, reactivar };
