// Logica de los mantenedores: arma los parametros P_* de cada procedimiento segun la definicion del recurso
const { validarClave, hashClave } = require('./claves');

function prepararCuerpo(recurso, cuerpo, creando) {
    if (!recurso.claveAHash) {
        return cuerpo;
    }
    const clave = cuerpo.CLAVE;
    if (creando || clave) {
        validarClave(clave);
    }
    let claveCifrada = null;
    if (clave) {
        claveCifrada = hashClave(clave);
    }

    const preparado = { ...cuerpo };
    delete preparado.CLAVE;
    preparado.PASSWORD_HASH = claveCifrada;
    return preparado;
}

function agregarParametros(parametros, cuerpo, campos) {
    for (const campo of campos) {
        parametros[`P_${campo}`] = cuerpo[campo];
    }
}

function parametrosIds(recurso, id, id2) {
    const valores = [id, id2];
    const parametros = {};
    for (let indice = 0; indice < recurso.ids.length; indice++) {
        const campo = recurso.ids[indice];
        parametros[`P_${campo}`] = valores[indice];
    }
    return parametros;
}

// Devuelve { params } o { faltante } si falta un filtro obligatorio en la consulta
function parametrosListar(recurso, consulta) {
    const parametros = {};
    if (recurso.conInactivos) {
        let soloActivos = 1;
        if (consulta.todos === '1') {
            soloActivos = 0;
        }

        parametros.P_SOLO_ACTIVOS = soloActivos;
    }
    for (const [param, nombre] of Object.entries(recurso.filtros || {})) {
        if (consulta[nombre] === undefined) {
            return { faltante: nombre };
        }
        parametros[param] = consulta[nombre];
    }
    return { params: parametros };
}

function parametrosCrear(recurso, cuerpoRecibido, usuario) {
    const cuerpo = prepararCuerpo(recurso, cuerpoRecibido, true);
    const parametros = {};
    if (recurso.ids.length > 1) {
        agregarParametros(parametros, cuerpo, recurso.ids);
    }
    agregarParametros(parametros, cuerpo, recurso.campos);
    agregarParametros(parametros, cuerpo, recurso.soloAlCrear || []);
    if (recurso.usuarioAlCrear) {
        parametros[recurso.usuarioAlCrear] = usuario.id;
    }
    return parametros;
}

function parametrosModificar(recurso, id, id2, cuerpoRecibido) {
    const parametros = parametrosIds(recurso, id, id2);
    const cuerpo = prepararCuerpo(recurso, cuerpoRecibido, false);
    agregarParametros(parametros, cuerpo, recurso.campos);
    return parametros;
}

module.exports = { parametrosListar, parametrosCrear, parametrosModificar, parametrosIds };
