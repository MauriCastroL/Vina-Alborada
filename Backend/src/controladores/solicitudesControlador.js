const pagosWeb = require('../servicios/pagosWeb');
const asincrono = require('../utilidades/asincrono');

const anular = asincrono(async (req, res) => {
    await pagosWeb.anular(req.params.id, req.usuario);
    res.json({ ok: true });
});

module.exports = { anular };
