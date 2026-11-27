// Controlador del resumen del panel: ventas del mes, solicitudes pendientes, stock bajo y pedidos del cliente
import { RUTA_MIS_PEDIDOS } from '../modelos/pedidosModelo.js';
import { RUTA_PRODUCTOS, RUTA_SOLICITUDES } from '../modelos/mantenedoresModelo.js';
import { RUTA_ALERTAS_PENDIENTES } from '../modelos/monitoreoModelo.js';
import { rutaListar } from '../modelos/ventasModelo.js';
import { mesActual } from '../utilidades/formato.js';
import { useDatos } from './useDatos.js';
import { useSesion } from './SesionContexto.jsx';

const NOMBRE_MES = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });

export function useInicio() {
    const { usuario, tiene } = useSesion();
    const esPersonal = !tiene('CATALOGO');
    const veStock = tiene('INVENTARIO') || tiene('PRODUCTOS');
    const { datos: ventas } = useDatos(rutaListar('CONFIRMADA'), { activo: tiene('VENTAS') });
    const { datos: solicitudes } = useDatos(RUTA_SOLICITUDES, { activo: tiene('SOLICITUDES') });
    const { datos: alertas } = useDatos(RUTA_ALERTAS_PENDIENTES,
        { activo: ['MONITOREO', 'INVENTARIO', 'REPORTES', 'VENTAS'].some(tiene) });
    const { datos: productos } = useDatos(RUTA_PRODUCTOS, { activo: veStock });
    const { datos: pedidos } = useDatos(RUTA_MIS_PEDIDOS, { activo: tiene('MIS_SOLICITUDES') });

    const mes = mesActual();
    const nombreMes = NOMBRE_MES.format(new Date(`${mes}-15T12:00:00`));
    const delMes = ventas.filter(function (venta) {
        return (venta.FECHA_CONFIRMACION || '').startsWith(mes);
    });
    const pendientes = solicitudes.filter(function (solicitud) {
        return solicitud.ESTADO === 'PENDIENTE';
    });
    pendientes.sort(function (primera, segunda) {
        const fechaPrimera = String(primera.FECHA_CREACION);
        const fechaSegunda = String(segunda.FECHA_CREACION);
        return fechaSegunda.localeCompare(fechaPrimera);
    });

    const bajoMinimo = productos.filter(function (producto) {
        const activo = Number(producto.ACTIVO) === 1;
        return activo && producto.STOCK_ACTUAL < producto.STOCK_MINIMO;
    });
    bajoMinimo.sort(function (primero, segundo) {
        const diferenciaPrimero = primero.STOCK_ACTUAL - primero.STOCK_MINIMO;
        const diferenciaSegundo = segundo.STOCK_ACTUAL - segundo.STOCK_MINIMO;
        return diferenciaPrimero - diferenciaSegundo;
    });

    let montoDelMes = 0;
    for (const venta of delMes) {
        montoDelMes += venta.TOTAL;
    }

    return {
        usuario, tiene, esPersonal, veStock, alertas, pedidos, nombreMes,
        ventasDelMes: delMes, montoDelMes, pendientes, bajoMinimo
    };
}
