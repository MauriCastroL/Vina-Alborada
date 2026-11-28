import { useRef, useState } from 'react';
import * as pedidosModelo from '../modelos/pedidosModelo.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';

export function usePedido(pedido, alCambiar) {
    const { avisar } = useMensajes();

    const id = pedido.ID_SOLICITUD;

    const { datos: lineas, recargar } = useDatos(pedidosModelo.rutaProductos(id));

    const editable = pedido.ESTADO === 'BORRADOR';

    const necesitaMetodo = pedido.ESTADO === 'PENDIENTE' || (pedido.ESTADO === 'ACEPTADA' && pedido.ESTADO_VENTA === 'BORRADOR');

    const { datos: metodos, cargando: cargandoMetodos, error: errorMetodos } = useDatos(pedidosModelo.RUTA_METODOS_PAGO_CLIENTE, { activo: editable || necesitaMetodo });

    const [selecciones, setSelecciones] = useState({});

    const [cantidades, setCantidades] = useState({});

    const [edicionObservaciones, setObservaciones] = useState(null);

    const observacionesGuardadas = pedido.OBSERVACIONES ?? '';

    const observaciones = edicionObservaciones ?? observacionesGuardadas;

    const [ocupado, setOcupado] = useState(false);

    const operacion = useRef(false);

    function cantidadDe(linea) {
        return cantidades[linea.ID_PRODUCTO] ?? String(linea.CANTIDAD);
    }

    function cantidadValida(linea) {
        const cantidad = Number(cantidadDe(linea));
        return Number.isFinite(cantidad) && cantidad > 0;
    }

    function subtotalDe(linea) {
        if (editable && cantidadValida(linea)) {
            return Number(cantidadDe(linea)) * Number(linea.PRECIO_UNITARIO);
        }
        return Number(linea.SUBTOTAL);
    }

    let total = 0;
    for (const linea of lineas) {
        total += subtotalDe(linea);
    }

    function metodoDe(idProducto = 'pedido') {
        const seleccion = selecciones[idProducto];
        if (seleccion != null) {
            return seleccion;
        }
        if (editable) {
            return '';
        }
        return String(pedido.ID_METODO_PAGO ?? '');
    }

    function metodoValido(idProducto) {
        const idMetodo = metodoDe(idProducto);
        return metodos.some(function (metodo) {
            return String(metodo.ID_METODO_PAGO) === idMetodo;
        });
    }
    function setMetodo(idProducto, valor) {
        return setSelecciones(function (previo) {
            return { ...previo, [idProducto]: valor };
        });
    }

    async function llamar(accion, mensaje) {
        if (operacion.current) return;
        operacion.current = true;
        setOcupado(true);
        try {
            await accion();
            avisar(mensaje);
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            try {
                await Promise.all([recargar(), alCambiar()]);
            } finally {
                operacion.current = false;
                setOcupado(false);
            }
        }
    }

    function guardarObservaciones() {
        return llamar(async function () {
            await pedidosModelo.guardarObservaciones(id, observaciones);
            setObservaciones(null);
        }, 'Observaciones guardadas');
    }

    function guardarCantidad(linea) {
        if (!cantidadValida(linea)) return;
        return llamar(async function () {
            await pedidosModelo.cambiarCantidad(id, linea.ID_PRODUCTO, Number(cantidadDe(linea)));
            setCantidades(function (anteriores) {
                const actualizadas = { ...anteriores };
                delete actualizadas[linea.ID_PRODUCTO];

                return actualizadas;
            });
        }, 'Cantidad actualizada');
    }

    function enviarProducto(linea) {
        if (!cantidadValida(linea) || !metodoValido(linea.ID_PRODUCTO)) return;
        return llamar(function () {
            return pedidosModelo.enviar(id, Number(metodoDe(linea.ID_PRODUCTO)), {
                ID_PRODUCTO: linea.ID_PRODUCTO,
                CANTIDAD: Number(cantidadDe(linea))
            });
        }, 'Producto enviado a la viña');
    }

    function guardarMetodo(evento) {
        evento.preventDefault();
        if (!metodoValido()) return;
        return llamar(async function () {
            await pedidosModelo.enviar(id, Number(metodoDe()));
            setSelecciones(function (anteriores) {
                const actualizadas = { ...anteriores };
                delete actualizadas['pedido'];

                return actualizadas;
            });
        }, 'Método de pago guardado');
    }

    return {
        lineas, editable, total, necesitaMetodo, metodos, cargandoMetodos, errorMetodos, ocupado,
        cantidadDe, cantidadValida, subtotalDe, metodoDe, metodoValido, setMetodo,
        cambiarCantidad: function (linea, valor) {
            return setCantidades(function (previo) {
                return { ...previo, [linea.ID_PRODUCTO]: valor };
            });
        },
        observaciones, setObservaciones, guardarObservaciones,
        observacionesModificadas: observaciones !== observacionesGuardadas,
        guardarCantidad, enviarProducto, guardarMetodo,
        quitar: function (linea) {
            return llamar(function () {
                return pedidosModelo.quitarProducto(id, linea.ID_PRODUCTO);
            }, 'Producto quitado');
        },
        anular: function () {
            return window.confirm('¿Anular este pedido?') && llamar(function () {
                return pedidosModelo.anular(id);
            }, 'Pedido anulado');
        }
    };
}
