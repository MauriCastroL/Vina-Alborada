// Envuelve un controlador async para que sus errores lleguen al manejador de errores de Express
function asincrono(accion) {
    return function (peticion, respuesta, continuar) {
        return Promise.resolve(accion(peticion, respuesta, continuar)).catch(continuar);
    };
}

module.exports = asincrono;
