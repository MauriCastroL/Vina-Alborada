// Respuestas de error: ruta de la API inexistente y errores lanzados por los controladores
const { traducirError } = require('../utilidades/errores');

function rutaNoEncontrada(peticion, respuesta) {
    respuesta.status(404).json({ error: 'RUTA NO ENCONTRADA' });
}

function manejarError(error, peticion, respuesta, continuar) {
    const { estado, mensaje } = traducirError(error);
    if (estado >= 500) {
        console.error(`[${new Date().toISOString()}] ${peticion.method} ${peticion.originalUrl}`, error);
    }
    respuesta.status(estado).json({ error: mensaje });
}

module.exports = { rutaNoEncontrada, manejarError };
