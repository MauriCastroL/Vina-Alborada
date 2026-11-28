const accesoModelo = require('../modelos/accesoModelo');
const { errorApp } = require('../utilidades/errores');
const { validarClave, hashClave, verificarClave } = require('./claves');
const { crearToken } = require('./tokens');

function normalizarCorreo(correo) {
    return String(correo || '').trim().toUpperCase();
}

async function iniciarSesion(correoIngresado, clave) {
    const correo = normalizarCorreo(correoIngresado);
    if (!correo || !clave) {
        throw errorApp(20500, 'DEBE INGRESAR CORREO Y CONTRASENA');
    }

    const datos = await accesoModelo.datosLogin(correo);

    if (!datos.P_ID_USUARIO || !verificarClave(clave, datos.P_PASSWORD_HASH)) {
        await accesoModelo.registrarResultado(correo, datos.P_ID_USUARIO, false);
        throw errorApp(20502, 'CORREO O CONTRASENA INCORRECTOS');
    }

    if (datos.P_ACTIVO !== 1 || datos.P_ROL_ACTIVO !== 1) {
        await accesoModelo.registrarIntento(correo, datos.P_ID_USUARIO, false, 'USUARIO INACTIVO');
        throw errorApp(20503, 'USUARIO INACTIVO, CONTACTE AL ADMINISTRADOR');
    }

    await accesoModelo.registrarResultado(correo, datos.P_ID_USUARIO, true);

    const usuario = {
        id: datos.P_ID_USUARIO,
        correo,
        rol: datos.P_ROL,
        idCliente: datos.P_ID_CLIENTE
    };
    const modulos = await accesoModelo.modulosDe(usuario);
    return { token: crearToken(usuario), usuario, modulos };
}

async function registrarCliente(datosCliente) {
    validarClave(datosCliente.clave);
    const esEmpresa = String(datosCliente.tipoCliente).toUpperCase() === 'EMPRESA';
    const registro = {
        tipoCliente: 'NATURAL',
        rut: datosCliente.rut,
        nombre: null,
        apellido1: null,
        apellido2: null,
        razonSocial: null,
        telefono: datosCliente.telefono,
        correo: datosCliente.correo
    };

    if (esEmpresa) {
        registro.tipoCliente = 'EMPRESA';
        registro.razonSocial = datosCliente.razonSocial;
    } else {
        registro.nombre = datosCliente.nombre;
        registro.apellido1 = datosCliente.apellido1;
        registro.apellido2 = datosCliente.apellido2;
    }

    await accesoModelo.registrarCliente(registro, hashClave(datosCliente.clave));
    return iniciarSesion(datosCliente.correo, datosCliente.clave);
}

async function datosSesion(usuario) {
    return { usuario, modulos: await accesoModelo.modulosDe(usuario) };
}

async function cambiarClave(usuario, claveActual, claveNueva) {
    validarClave(claveNueva, 20504);
    const datos = await accesoModelo.datosLogin(usuario.correo);
    if (datos.P_ID_USUARIO !== usuario.id || !verificarClave(claveActual, datos.P_PASSWORD_HASH)) {
        throw errorApp(20505, 'LA CONTRASENA ACTUAL NO ES CORRECTA');
    }
    await accesoModelo.cambiarClave(usuario, hashClave(claveNueva));
}

module.exports = { iniciarSesion, registrarCliente, datosSesion, cambiarClave };
