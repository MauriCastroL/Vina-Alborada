// Sistema de Gestion Viña La Alborada
// Ramo: Base de Datos - Seccion 2
// Profesor: Carlos Castro
// Integrantes: Mauricio Castro, Emerson Fuenzalida, José Cáceres, Cristóbal Villalobos
// Punto de entrada: conecta con Oracle y levanta la aplicacion (src/app.js)
const configuracion = require('./config/entorno');
const baseDatos = require('./config/baseDatos');
const app = require('./app');

async function iniciar() {
    try {
        await baseDatos.iniciarPool();
        await baseDatos.probarConexion();
        console.log(`Conectado a Oracle (${configuracion.db.connectString}) como ${configuracion.db.user}`);
    } catch (error) {
        console.error('No se pudo conectar a Oracle. Revise Backend/.env y que el servicio este iniciado.');
        console.error(error.message);
        process.exit(1);
    }
    app.listen(configuracion.puerto, function () {
        console.log(`Servidor listo en http://localhost:${configuracion.puerto}`);
    });
}

process.on('SIGINT', async function () {
    await baseDatos.cerrarPool();
    process.exit(0);
});

iniciar();
