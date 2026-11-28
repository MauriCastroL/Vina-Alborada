function asincrono(accion) {
    return function (peticion, respuesta, continuar) {
        return Promise.resolve(accion(peticion, respuesta, continuar)).catch(continuar);
    };
}

module.exports = asincrono;
