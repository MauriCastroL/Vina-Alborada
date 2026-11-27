const pedidos = require('../modelos/pedidoModelo');
const solicitudes = require('../modelos/solicitudModelo');
const { errorApp } = require('../utilidades/errores');

const operaciones = new Map();

async function serializar(id, trabajo) {
    const clave = String(id);
    const anterior = operaciones.get(clave) || Promise.resolve();
    const actual = anterior.catch(function () { }).then(trabajo);
    operaciones.set(clave, actual);
    try {
        return await actual;
    } finally {
        if (operaciones.get(clave) === actual) operaciones.delete(clave);
    }
}

async function buscar(id, idCliente, usuario) {
    const lista = await pedidos.listar(idCliente, usuario);
    const solicitud = lista.find(function (fila) {
        return String(fila.ID_SOLICITUD) === String(id);
    });
    if (!solicitud) throw errorApp(20100, 'SOLICITUD NO ENCONTRADA');
    return solicitud;
}

async function separarProducto(solicitud, linea, cantidad, usuario) {
    const anteriores = await pedidos.listar(usuario.idCliente, usuario);
    const ids = new Set(anteriores.map(function (fila) {
        return fila.ID_SOLICITUD;
    }));
    await pedidos.crear(usuario.idCliente, solicitud.OBSERVACIONES, usuario);
    const actuales = await pedidos.listar(usuario.idCliente, usuario);
    const nuevos = actuales.filter(function (fila) {
        return fila.ESTADO === 'BORRADOR' && !ids.has(fila.ID_SOLICITUD);
    });
    if (nuevos.length !== 1) throw errorApp(20308, 'NO SE PUDO IDENTIFICAR EL PEDIDO DEL PRODUCTO');

    const nuevo = nuevos[0];
    try {
        await pedidos.agregarProducto(nuevo.ID_SOLICITUD, linea.ID_PRODUCTO, cantidad, usuario);
        await pedidos.quitarProducto(solicitud.ID_SOLICITUD, linea.ID_PRODUCTO, usuario);
    } catch (error) {
        const restantes = await pedidos.listarProductos(solicitud.ID_SOLICITUD, usuario);
        if (restantes.some(function (fila) {
            return fila.ID_PRODUCTO === linea.ID_PRODUCTO;
        })) {
            await pedidos.anular(nuevo.ID_SOLICITUD, usuario);
            throw error;
        }
    }
    return nuevo;
}

async function enviar(id, datosPago, usuario) {
    const idMetodoPago = datosPago.idMetodoPago;
    const idProducto = datosPago.idProducto;
    const cantidad = datosPago.cantidad;

    function enviarConBloqueoDelPedido() {
        return serializar(id, procesarEnvio);
    }

    async function procesarEnvio() {
        let solicitud = await buscar(id, usuario.idCliente, usuario);
        const borrador = solicitud.ESTADO === 'BORRADOR';
        const pendientePago = solicitud.ESTADO === 'ACEPTADA' && solicitud.ESTADO_VENTA === 'BORRADOR';
        if (!borrador && solicitud.ESTADO !== 'PENDIENTE' && !pendientePago) {
            throw errorApp(20308, 'LA SOLICITUD NO ADMITE CAMBIOS EN EL METODO DE PAGO');
        }

        const metodos = await pedidos.listarMetodosPago(usuario);
        const metodo = metodos.find(function (fila) {
            return Number(fila.ID_METODO_PAGO) === idMetodoPago;
        });
        if (!metodo) throw errorApp(20314, 'SELECCIONE UN METODO DE PAGO ACTIVO');

        if (borrador) {
            const lineas = await pedidos.listarProductos(id, usuario);
            let linea;
            if (idProducto === undefined && lineas.length === 1) {
                linea = lineas[0];
            } else {
                linea = lineas.find(function (fila) {
                    return Number(fila.ID_PRODUCTO) === idProducto;
                });
            }
            if (!linea) throw errorApp(20309, 'SELECCIONE UN PRODUCTO DEL PEDIDO');
            const unidades = cantidad ?? Number(linea.CANTIDAD);
            if (!Number.isFinite(unidades) || unidades <= 0) {
                throw errorApp(20010, 'INGRESE UNA CANTIDAD MAYOR A CERO');
            }
            if (lineas.length > 1) {
                solicitud = await separarProducto(solicitud, linea, unidades, usuario);
            } else if (unidades !== Number(linea.CANTIDAD)) {
                await pedidos.cambiarCantidad(id, linea.ID_PRODUCTO, unidades, usuario);
            }
        }

        await solicitudes.registrarPago(solicitud.ID_SOLICITUD, idMetodoPago, usuario);
        if (borrador) await solicitudes.enviar(solicitud.ID_SOLICITUD, usuario);
    }

    return serializar('cliente:' + usuario.idCliente, enviarConBloqueoDelPedido);
}

function aceptar(id, usuario) {
    return serializar(id, function () {
        return solicitudes.resolver(id, 'ACEPTADA', usuario);
    });
}

async function anular(id, usuario, motivo) {
    return serializar(id, async function () {
        const solicitud = await buscar(id, null, usuario);
        if (solicitud.ESTADO === 'BORRADOR') {
            await pedidos.anular(id, usuario);
        } else if (solicitud.ESTADO === 'PENDIENTE') {
            let motivoRechazo = '';
            if (typeof motivo === 'string') {
                motivoRechazo = motivo.trim();
            }
            if (!motivoRechazo || motivoRechazo.length > 500) {
                throw errorApp(20010, 'Ingresa un motivo de rechazo de entre 1 y 500 caracteres.');
            }
            await solicitudes.rechazar(id, motivoRechazo, usuario);
        } else {
            throw errorApp(20311, 'Solo se pueden anular solicitudes en borrador o pendientes.');
        }
    });
}

module.exports = { enviar, aceptar, anular, serializar };
