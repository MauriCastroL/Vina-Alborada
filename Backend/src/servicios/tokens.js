// Tokens de sesion (JWT): creacion y verificacion
const jwt = require('jsonwebtoken');
const configuracion = require('../config/entorno');

function crearToken(usuario) {
    return jwt.sign(usuario, configuracion.jwtSecreto, { expiresIn: configuracion.jwtDuracion });
}

function verificarToken(token) {
    const datos = jwt.verify(token, configuracion.jwtSecreto);
    return { id: datos.id, correo: datos.correo, rol: datos.rol, idCliente: datos.idCliente };
}

module.exports = { crearToken, verificarToken };
