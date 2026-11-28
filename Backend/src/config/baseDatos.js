const oracledb = require('oracledb');
const configuracion = require('./entorno');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let grupoConexiones;

async function iniciarPool() {
    grupoConexiones = await oracledb.createPool({
        ...configuracion.db,
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1
    });
}

async function cerrarPool() {
    if (grupoConexiones) {
        await grupoConexiones.close(5);
    }
}

function salidaNumero() {
    return { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };
}
function salidaTexto(largo = 200) {
    return { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: largo };
}
function salidaCursor() {
    return { dir: oracledb.BIND_OUT, type: oracledb.CURSOR };
}

function esSalida(valor) {
    return valor !== null && typeof valor === 'object' && valor.dir !== undefined;
}

function armarLlamada(parametros) {
    const vinculos = {};
    const argumentos = [];
    for (const [nombre, valor] of Object.entries(parametros)) {
        argumentos.push(`${nombre} => :${nombre}`);
        if (esSalida(valor)) {
            vinculos[nombre] = valor;
        } else {
            let valorParametro;
            if (valor === undefined || valor === '') {
                valorParametro = null;
            } else {
                valorParametro = valor;
            }

            vinculos[nombre] = { val: valorParametro };
        }
    }
    return { binds: vinculos, argumentos: argumentos.join(', ') };
}

async function conConexion(usuario, trabajo) {
    const conexion = await grupoConexiones.getConnection();
    try {
        let identificadorCliente = '';
        if (usuario) {
            identificadorCliente = String(usuario.id);
        }

        conexion.clientId = identificadorCliente;
        return await trabajo(conexion);
    } finally {
        await conexion.close();
    }
}

async function ejecutar(procedimiento, parametros = {}, usuario = null) {
    return conConexion(usuario, async function (conexion) {
        const { binds: vinculos, argumentos } = armarLlamada(parametros);
        const resultado = await conexion.execute(
            `BEGIN ${procedimiento}(${argumentos}); END;`, vinculos);
        return resultado.outBinds || {};
    });
}

async function listar(procedimiento, parametros = {}, usuario = null) {
    return conConexion(usuario, async function (conexion) {
        const { binds: vinculos, argumentos } = armarLlamada({ P_CURSOR: salidaCursor(), ...parametros });
        const resultado = await conexion.execute(
            `BEGIN ${procedimiento}(${argumentos}); END;`, vinculos);
        const cursor = resultado.outBinds.P_CURSOR;
        try {
            return await cursor.getRows();
        } finally {
            await cursor.close();
        }
    });
}

async function funcion(nombre, parametros = {}, usuario = null) {
    return conConexion(usuario, async function (conexion) {
        const { binds: vinculos, argumentos } = armarLlamada(parametros);
        vinculos.RESULTADO = salidaNumero();
        const resultado = await conexion.execute(
            `BEGIN :RESULTADO := ${nombre}(${argumentos}); END;`, vinculos);
        return resultado.outBinds.RESULTADO;
    });
}

async function probarConexion() {
    return conConexion(null, function (conexion) {
        return conexion.ping();
    });
}

module.exports = {
    iniciarPool, cerrarPool, ejecutar, listar, funcion, probarConexion,
    salidaNumero, salidaTexto
};
