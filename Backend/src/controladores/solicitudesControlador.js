// Controlador del gestor de solicitudes web (G3): enviar y resolver
const pagosWeb = require('../servicios/pagosWeb');
const asincrono = require('../utilidades/asincrono');

const resolver = asincrono(async (req, res) => {
    const decision = String(req.body?.DECISION ?? "").trim().toUpperCase();
    res.json(await pagosWeb.resolver(req.params.id, decision, req.usuario));
});

module.exports = { resolver };
