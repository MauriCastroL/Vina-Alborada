const { verificarToken } = require('../servicios/tokens');

function autenticar(peticion, respuesta, continuar) {
    const cabecera = peticion.headers.authorization || '';
    let token = null;
    if (cabecera.startsWith('Bearer ')) {
        token = cabecera.slice(7);
    }
    if (!token) {
        return respuesta.status(401).json({ error: 'DEBE INICIAR SESION' });
    }
    try {
        peticion.usuario = verificarToken(token);
        continuar();
    } catch {
        respuesta.status(401).json({ error: 'LA SESION EXPIRO, INICIE SESION NUEVAMENTE' });
    }
}

module.exports = autenticar;
