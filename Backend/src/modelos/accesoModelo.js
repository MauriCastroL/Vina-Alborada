// Modelo de acceso: datos de login, bitacora de intentos, modulos, registro de clientes y contraseñas
const baseDatos = require('../config/baseDatos');

const MODULOS = ['USUARIOS', 'CLIENTES', 'PRODUCTOS', 'METODOS_PAGO', 'INVENTARIO', 'VENTAS',
    'SOLICITUDES', 'REPORTES', 'MONITOREO', 'CATALOGO', 'MIS_SOLICITUDES'];

function datosLogin(correo) {
    return baseDatos.ejecutar('CEMJ_PA_LOGIN_DATOS', {
        P_CORREO: correo,
        P_ID_USUARIO: baseDatos.salidaNumero(),
        P_PASSWORD_HASH: baseDatos.salidaTexto(255),
        P_ACTIVO: baseDatos.salidaNumero(),
        P_ID_CLIENTE: baseDatos.salidaNumero(),
        P_ROL: baseDatos.salidaTexto(30),
        P_ROL_ACTIVO: baseDatos.salidaNumero()
    });
}

function registrarResultado(correo, idUsuario, exitoso) {
    let resultadoExitoso = 0;
    if (exitoso) {
        resultadoExitoso = 1;
    }

    return baseDatos.ejecutar('CEMJ_PA_LOGIN_RESULTADO',
        { P_CORREO: correo, P_ID_USUARIO: idUsuario, P_EXITOSO: resultadoExitoso });
}

function registrarIntento(correo, idUsuario, exitoso, motivo) {
    let resultadoExitoso = 0;
    if (exitoso) {
        resultadoExitoso = 1;
    }

    return baseDatos.ejecutar('CEMJ_PA_LOGIN_REGISTRAR', {
        P_CORREO: correo, P_ID_USUARIO: idUsuario,
        P_EXITOSO: resultadoExitoso, P_MOTIVO: motivo
    });
}

async function modulosDe(usuario) {
    const salidas = {};
    for (const modulo of MODULOS) {
        salidas[`P_${modulo}`] = baseDatos.salidaNumero();
    }
    const salida = await baseDatos.ejecutar('CEMJ_PA_LOGIN_MODULOS',
        { P_ID_USUARIO: usuario.id, ...salidas }, usuario);
    return MODULOS.filter(function (modulo) {
        return salida[`P_${modulo}`] === 1;
    });
}

async function puedeAcceder(usuario, modulo) {
    const puede = await baseDatos.funcion('CEMJ_FN_PUEDE_ACCEDER',
        { P_ID_USUARIO: usuario.id, P_MODULO: modulo }, usuario);
    return puede === 1;
}

function registrarCliente(cliente, passwordHash) {
    return baseDatos.ejecutar('CEMJ_PA_REGISTRAR_CLIENTE', {
        P_TIPO_CLIENTE: cliente.tipoCliente,
        P_RUT: cliente.rut,
        P_NOMBRE: cliente.nombre,
        P_APELLIDO1: cliente.apellido1,
        P_APELLIDO2: cliente.apellido2,
        P_RAZON_SOCIAL: cliente.razonSocial,
        P_TELEFONO: cliente.telefono,
        P_CORREO: cliente.correo,
        P_PASSWORD_HASH: passwordHash,
        P_ID_USUARIO: baseDatos.salidaNumero(),
        P_ID_CLIENTE: baseDatos.salidaNumero()
    });
}

function cambiarClave(usuario, passwordHashNuevo) {
    return baseDatos.ejecutar('CEMJ_PA_USUARIO_CAMBIAR_CLAVE', {
        P_ID_USUARIO: usuario.id,
        P_PASSWORD_HASH_NUEVO: passwordHashNuevo
    }, usuario);
}

module.exports = {
    datosLogin, registrarResultado, registrarIntento, modulosDe, puedeAcceder, registrarCliente, cambiarClave
};
