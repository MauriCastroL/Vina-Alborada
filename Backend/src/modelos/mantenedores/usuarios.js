module.exports = {
    modulo: 'USUARIOS',
    lectura: [
        'USUARIOS'
    ],
    listar: 'CEMJ_PA_USUARIO_LISTAR',
    conInactivos: true,
    ids: [
        'ID_USUARIO'
    ],
    crear: 'CEMJ_PA_USUARIO_CREAR',
    modificar: 'CEMJ_PA_USUARIO_MODIFICAR',
    eliminar: 'CEMJ_PA_USUARIO_ELIMINAR',
    campos: [
        'ID_ROL',
        'ID_CLIENTE',
        'CORREO',
        'PASSWORD_HASH',
        'ACTIVO'
    ],
    claveAHash: true
};
