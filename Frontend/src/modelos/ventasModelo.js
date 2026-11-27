// Modelo de ventas: listado, detalle, venta presencial, agregar productos, confirmar y anular
import { api, consulta } from './http.js';

export function rutaListar(estado) {
    return `/gestores/ventas${consulta({ estado })}`;
}
export const RUTA_TODAS = '/gestores/ventas';
export function rutaDetalle(idVenta) {
    return `/gestores/ventas/${idVenta}/detalle`;
}

export function crear(datos) {
    return api('/gestores/ventas', { metodo: 'POST', cuerpo: datos });
}

function accion(idVenta, nombre, cuerpo) {
    return api(`/gestores/ventas/${idVenta}/${nombre}`, { metodo: 'POST', cuerpo });
}
export function agregarProducto(idVenta, cuerpo) {
    return accion(idVenta, 'productos', cuerpo);
}
export function confirmar(idVenta, cuerpo) {
    return accion(idVenta, 'confirmar', cuerpo);
}
export function anular(idVenta, cuerpo) {
    return accion(idVenta, 'anular', cuerpo);
}
