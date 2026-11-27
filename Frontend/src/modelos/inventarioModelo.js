// Modelo de inventario: aplicar un movimiento actualiza el stock
import { api } from './http.js';

export function aplicarMovimiento(idMovimiento) {
    return api(`/gestores/movimientos/${idMovimiento}/aplicar`, { metodo: 'POST' });
}
