// Controlador del detalle de venta: datos, productos, agregar, confirmar con pago (G4) y anular (G5)
import { useState } from 'react';
import { RUTA_METODOS_PAGO, RUTA_PRODUCTOS } from '../modelos/mantenedoresModelo.js';
import * as ventasModelo from '../modelos/ventasModelo.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useVentaDetalle(id) {
    const { avisar } = useMensajes();

    const { datos: ventas, cargando, recargar: recargarVentas } = useDatos(ventasModelo.RUTA_TODAS);
    const { datos: lineas, recargar: recargarLineas } = useDatos(ventasModelo.rutaDetalle(id));
    const { datos: productos, recargar: recargarProductos } = useDatos(RUTA_PRODUCTOS);
    const { datos: metodos } = useDatos(RUTA_METODOS_PAGO);

    const [agregar, setAgregar] = useState({ CANTIDAD: 1 });
    const [pago, setPago] = useState({});
    const [motivo, setMotivo] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    const [confirmacion, setConfirmacion] = useState(null);

    const venta = ventas.find(function (filaVenta) {
        return String(filaVenta.ID_VENTA) === String(id);
    });
    let total = 0;
    for (const linea of lineas) {
        total += linea.SUBTOTAL;
    }
    const activos = productos.filter(function (producto) {
        return Number(producto.ACTIVO) === 1;
    });

    function recargarTodo() {
        recargarVentas();
        recargarLineas();
        recargarProductos();
    }

    async function ejecutar(operacion, mensaje) {
        try {
            await operacion();
            avisar(mensaje);
            recargarTodo();
            return true;
        } catch (error) {
            avisar(error.message, 'error');
            return false;
        }
    }

    async function agregarProducto(evento) {
        evento.preventDefault();
        const { ID_PRODUCTO, CANTIDAD } = agregar;

        if (!activos.some(function (producto) {
            return String(producto.ID_PRODUCTO) === String(ID_PRODUCTO);
        })) return;

        if (await ejecutar(function () {
            return ventasModelo.agregarProducto(id, { ID_PRODUCTO, CANTIDAD });
        }, 'Producto agregado')) {
            setAgregar({ CANTIDAD: 1, BUSCAR_PRODUCTO: agregar.BUSCAR_PRODUCTO });
        }
    }

    async function confirmar(evento) {
        evento.preventDefault();

        if (confirmando) return;

        setConfirmando(true);

        try {
            await ejecutar(async function () {
                const resultado = await ventasModelo.confirmar(id, { ID_METODO_PAGO: pago.ID_METODO_PAGO });
                setConfirmacion({ id, referencia: resultado?.REFERENCIA });
            }, 'Venta confirmada: stock descontado y pago registrado');
        } finally {
            setConfirmando(false);
        }
    }

    function anular(evento) {
        evento.preventDefault();

        if (window.confirm('¿Anular la venta? Se devolverá el stock de sus productos.')) {
            ejecutar(function () {
                return ventasModelo.anular(id, { MOTIVO: motivo });
            }, 'Venta anulada: stock devuelto');
        }
    }

    let referencia;
    if (confirmacion?.id === id) {
        referencia = confirmacion.referencia;
    }

    return {
        venta, cargando, lineas, total, activos, metodos, confirmando,
        referencia: referencia,
        agregar, setAgregar, pago, setPago, motivo, setMotivo, agregarProducto, confirmar, anular
    };
}
