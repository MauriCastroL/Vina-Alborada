const path = require('path');
const fs = require('fs');
const express = require('express');

const carpetaWeb = path.join(__dirname, '..', '..', '..', 'Frontend', 'dist');

function montarAplicacionWeb(app) {
    if (!fs.existsSync(carpetaWeb)) {
        return false;
    }
    app.use(express.static(carpetaWeb));
    app.get('/{*ruta}', function (peticion, respuesta) {
        return respuesta.sendFile(path.join(carpetaWeb, 'index.html'));
    });
    return true;
}

module.exports = { montarAplicacionWeb };
