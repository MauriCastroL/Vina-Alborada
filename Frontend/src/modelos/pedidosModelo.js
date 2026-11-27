// Modelo de los pedidos del cliente web (sus solicitudes de compra y productos)
import { api } from './http.js';

export const RUTA_MIS_PEDIDOS = '/cliente/mis-solicitudes';

export const RUTA_METODOS_PAGO_CLIENTE = `${RUTA_MIS_PEDIDOS}/metodos-pago`;

function rutaPedido(idSolicitud) {
    return `${RUTA_MIS_PEDIDOS}/${idSolicitud}`;
}

export function rutaProductos(idSolicitud) {
    return `${rutaPedido(idSolicitud)}/productos`;
}

export function listar() {
    return api(RUTA_MIS_PEDIDOS);
}

export function crear() {
    return api(RUTA_MIS_PEDIDOS, { metodo: 'POST', cuerpo: {} });
}

export function guardarObservaciones(idSolicitud, observaciones) {
    return api(rutaPedido(idSolicitud), { metodo: 'PUT', cuerpo: { OBSERVACIONES: observaciones } });
}

export function anular(idSolicitud) {
    return api(rutaPedido(idSolicitud), { metodo: 'DELETE' });
}

export function enviar(idSolicitud, idMetodoPago, producto) {
    return api(`${rutaPedido(idSolicitud)}/enviar`, {
        metodo: 'POST',
        cuerpo: { ID_METODO_PAGO: idMetodoPago, ...producto }
    });
}

export function listarProductos(idSolicitud) {
    return api(rutaProductos(idSolicitud));
}

export function agregarProducto(idSolicitud, idProducto, cantidad) {
    return api(rutaProductos(idSolicitud), { metodo: 'POST', cuerpo: { ID_PRODUCTO: idProducto, CANTIDAD: cantidad } });
}

export function cambiarCantidad(idSolicitud, idProducto, cantidad) {
    return api(`${rutaProductos(idSolicitud)}/${idProducto}`, { metodo: 'PUT', cuerpo: { CANTIDAD: cantidad } });
}

export function quitarProducto(idSolicitud, idProducto) {
    return api(`${rutaProductos(idSolicitud)}/${idProducto}`, { metodo: 'DELETE' });
}

export async function pedidoEnPreparacion() {
    async function buscarBorradorReciente() {
        const pedidos = await listar();
        const borradores = pedidos.filter(function (pedido) {
            return pedido.ESTADO === 'BORRADOR';
        });
        borradores.sort(function (primero, segundo) {
            return segundo.ID_SOLICITUD - primero.ID_SOLICITUD;
        });
        return borradores[0];
    }

    let pedido = await buscarBorradorReciente();
    if (!pedido) {
        await crear();
        pedido = await buscarBorradorReciente();
    }
    return pedido;
}

export async function agregarAlPedido(idProducto, cantidad) {
    const pedido = await pedidoEnPreparacion();
    const lineas = await listarProductos(pedido.ID_SOLICITUD);
    const existente = lineas.find(function (linea) {
        return linea.ID_PRODUCTO === idProducto;
    });

    if (existente) {
        await cambiarCantidad(pedido.ID_SOLICITUD, idProducto, existente.CANTIDAD + cantidad);
    } else {
        await agregarProducto(pedido.ID_SOLICITUD, idProducto, cantidad);
    }

    return pedido;
}
