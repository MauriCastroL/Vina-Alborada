// La selección se guarda fuera de Oracle hasta registrar el pago con el procedimiento existente.
const { randomUUID } = require('node:crypto');
const { mkdir, readFile, rename, unlink, writeFile } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const pedidos = require('../modelos/pedidoModelo');
const solicitudes = require('../modelos/solicitudModelo');
const ventas = require('../modelos/ventaModelo');
const { errorApp } = require('../utilidades/errores');

const directorio = resolve(process.env.PAGOS_WEB_DIR || join(__dirname, '..', '..', '.pagos-web'));
const operaciones = new Map();

function ruta(solicitud) {
    const clave = [solicitud.ID_SOLICITUD, solicitud.NUMERO_FOLIO, solicitud.ID_CLIENTE,
        new Date(solicitud.FECHA_CREACION).getTime()].join('-');
    return join(directorio, clave + '.json');
}

async function leer(solicitud) {
    try {
        return JSON.parse(await readFile(ruta(solicitud), 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}

async function guardar(solicitud, pago) {
    await mkdir(directorio, { recursive: true, mode: 0o700 });
    const destino = ruta(solicitud);
    const temporal = destino + '.' + randomUUID() + '.tmp';
    try {
        await writeFile(temporal, JSON.stringify(pago), { flag: 'wx', mode: 0o600 });
        await rename(temporal, destino);
    } finally {
        await unlink(temporal).catch((error) => {
            if (error.code !== 'ENOENT') throw error;
        });
    }
}

async function serializar(id, trabajo) {
    const clave = String(id);
    const anterior = operaciones.get(clave) || Promise.resolve();
    const actual = anterior.catch(() => {}).then(trabajo);
    operaciones.set(clave, actual);
    try {
        return await actual;
    } finally {
        if (operaciones.get(clave) === actual) operaciones.delete(clave);
    }
}

async function buscar(id, idCliente, usuario) {
    const lista = await pedidos.listar(idCliente, usuario);
    const solicitud = lista.find((fila) => String(fila.ID_SOLICITUD) === String(id));
    if (!solicitud) throw errorApp(20100, 'SOLICITUD NO ENCONTRADA');
    return solicitud;
}

async function separarProducto(solicitud, linea, cantidad, usuario) {
    const anteriores = await pedidos.listar(usuario.idCliente, usuario);
    const ids = new Set(anteriores.map((fila) => fila.ID_SOLICITUD));
    await pedidos.crear(usuario.idCliente, solicitud.OBSERVACIONES, usuario);
    const actuales = await pedidos.listar(usuario.idCliente, usuario);
    const nuevos = actuales.filter((fila) => fila.ESTADO === 'BORRADOR' && !ids.has(fila.ID_SOLICITUD));
    if (nuevos.length !== 1) throw errorApp(20308, 'NO SE PUDO IDENTIFICAR EL PEDIDO DEL PRODUCTO');

    const nuevo = nuevos[0];
    try {
        await pedidos.agregarProducto(nuevo.ID_SOLICITUD, linea.ID_PRODUCTO, cantidad, usuario);
        await pedidos.quitarProducto(solicitud.ID_SOLICITUD, linea.ID_PRODUCTO, usuario);
    } catch (error) {
        // Una respuesta perdida al quitar la línea no debe eliminar la única copia del producto.
        const restantes = await pedidos.listarProductos(solicitud.ID_SOLICITUD, usuario);
        if (restantes.some((fila) => fila.ID_PRODUCTO === linea.ID_PRODUCTO)) {
            await pedidos.anular(nuevo.ID_SOLICITUD, usuario);
            throw error;
        }
    }
    return nuevo;
}

async function enviar(id, { idMetodoPago, idProducto, cantidad }, usuario) {
    return serializar('cliente:' + usuario.idCliente, () => serializar(id, async () => {
        let solicitud = await buscar(id, usuario.idCliente, usuario);
        const borrador = solicitud.ESTADO === 'BORRADOR';
        const pendientePago = solicitud.ESTADO === 'ACEPTADA' && solicitud.ESTADO_VENTA === 'BORRADOR';
        if (!borrador && solicitud.ESTADO !== 'PENDIENTE' && !pendientePago) {
            throw errorApp(20308, 'LA SOLICITUD NO ADMITE CAMBIOS EN EL METODO DE PAGO');
        }

        const metodos = await pedidos.listarMetodosPago(usuario);
        const metodo = metodos.find((fila) => Number(fila.ID_METODO_PAGO) === idMetodoPago);
        if (!metodo) throw errorApp(20314, 'SELECCIONE UN METODO DE PAGO ACTIVO');

        if (borrador) {
            const lineas = await pedidos.listarProductos(id, usuario);
            const linea = idProducto === undefined && lineas.length === 1
                ? lineas[0]
                : lineas.find((fila) => Number(fila.ID_PRODUCTO) === idProducto);
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

        const anterior = await leer(solicitud);
        await guardar(solicitud, {
            ID_METODO_PAGO: idMetodoPago,
            METODO_PAGO: metodo.NOMBRE,
            ID_TRANSACCION: anterior?.ID_TRANSACCION || randomUUID()
        });
        if (borrador) await solicitudes.enviar(solicitud.ID_SOLICITUD, usuario);
    }));
}

async function registrar(solicitud, idVenta, pago, usuario) {
    try {
        await ventas.confirmar(idVenta, pago.ID_METODO_PAGO, pago.ID_TRANSACCION, usuario);
    } catch (error) {
        // Si se perdió la respuesta tras confirmar, el estado existente permite reconocer el pago.
        const actual = await buscar(solicitud.ID_SOLICITUD, null, usuario);
        if (!['CONFIRMADA', 'ANULADA'].includes(actual.ESTADO_VENTA)) throw error;
    }
    return { ID_VENTA: idVenta, ID_TRANSACCION: pago.ID_TRANSACCION };
}

async function resolver(id, decision, usuario) {
    return serializar(id, async () => {
        if (decision !== 'ACEPTADA') {
            return { ID_VENTA: await solicitudes.resolver(id, decision, usuario) };
        }

        const solicitud = await buscar(id, null, usuario);
        const pago = await leer(solicitud);
        if (!pago) throw errorApp(20314, 'EL CLIENTE DEBE SELECCIONAR EL METODO DE PAGO');

        if (solicitud.ESTADO === 'ACEPTADA' && ['CONFIRMADA', 'ANULADA'].includes(solicitud.ESTADO_VENTA)) {
            return { ID_VENTA: solicitud.ID_VENTA, ID_TRANSACCION: pago.ID_TRANSACCION };
        }

        const metodos = await pedidos.listarMetodosPago(usuario);
        if (!metodos.some((metodo) => Number(metodo.ID_METODO_PAGO) === pago.ID_METODO_PAGO)) {
            throw errorApp(20314, 'EL CLIENTE DEBE ELEGIR OTRO METODO DE PAGO ACTIVO');
        }

        const idVenta = solicitud.ESTADO === 'ACEPTADA' && solicitud.ESTADO_VENTA === 'BORRADOR'
            ? solicitud.ID_VENTA
            : await solicitudes.resolver(id, decision, usuario);
        return registrar(solicitud, idVenta, pago, usuario);
    });
}

async function mostrar(solicitud) {
    if (solicitud.ESTADO === 'BORRADOR') return solicitud;
    const pago = await leer(solicitud);
    if (!pago) return solicitud;
    return {
        ...solicitud,
        ID_METODO_PAGO: pago.ID_METODO_PAGO,
        METODO_PAGO: pago.METODO_PAGO,
        ID_TRANSACCION: ['CONFIRMADA', 'ANULADA'].includes(solicitud.ESTADO_VENTA) ? pago.ID_TRANSACCION : null
    };
}

async function mostrarVentas(filas, usuario) {
    if (!filas.some((venta) => venta.CANAL_VENTA === 'DIGITAL')) return filas;
    const solicitudesPorVenta = new Map((await pedidos.listar(null, usuario)).map((fila) => [fila.ID_VENTA, fila]));
    return Promise.all(filas.map(async (venta) => {
        const solicitud = solicitudesPorVenta.get(venta.ID_VENTA);
        if (!solicitud) return venta;
        const datos = await mostrar(solicitud);
        return { ...venta, METODO_PAGO: venta.METODO_PAGO || datos.METODO_PAGO, ID_TRANSACCION: datos.ID_TRANSACCION };
    }));
}

module.exports = { enviar, resolver, mostrar, mostrarVentas, serializar };
