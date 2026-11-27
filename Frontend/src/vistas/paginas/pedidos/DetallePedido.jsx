import { Link } from 'react-router-dom';
import { usePedido } from '../../../controladores/usePedido.js';
import { cantidadConUnidad, dinero, esPorKilo, unidadCorta } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import { Pie } from '../../componentes/Modal.jsx';
import Tabla from '../../componentes/Tabla.jsx';

const EXPLICACION = {
    BORRADOR: 'Elige un método de pago y envía cada producto cuando esté listo.',
    PENDIENTE: 'Enviado a la viña.',
    ACEPTADA: 'Aceptado por la viña: tu compra fue registrada.',
    RECHAZADA: 'La viña cerró esta solicitud.'
};

function SelectorPago(propiedades) {
    const id = propiedades.id;
    const etiqueta = propiedades.etiqueta;
    const metodos = propiedades.metodos;
    const valor = propiedades.valor;
    const alCambiar = propiedades.alCambiar;
    const deshabilitado = propiedades.deshabilitado;

    return (
        <select id={id} aria-label={etiqueta} value={valor} disabled={deshabilitado || metodos.length === 0}
            onChange={(evento) => alCambiar(evento.target.value)}>
            <option value="">Selecciona un método</option>
            {metodos.map(function (metodo) {
                return <option key={metodo.ID_METODO_PAGO} value={metodo.ID_METODO_PAGO}>{metodo.NOMBRE}</option>;
            })}
        </select>
    );
}

export default function DetallePedido(propiedades) {
    const pedido = propiedades.pedido;
    const alCambiar = propiedades.alCambiar;

    const gestionPedido = usePedido(pedido, alCambiar);
    const idMetodo = `pedido-${pedido.ID_SOLICITUD}-metodo`;
    function selector(linea) {
        let idSelector;
        if (linea) {
            idSelector = `${idMetodo}-${linea.ID_PRODUCTO}`;
        } else {
            idSelector = idMetodo;
        }

        let etiquetaSelector = 'Método de pago';
        if (linea) {
            etiquetaSelector = `Método de pago para ${linea.NOMBRE}`;
        }

        return (
            <SelectorPago id={idSelector}
                etiqueta={etiquetaSelector}
                metodos={gestionPedido.metodos} valor={gestionPedido.metodoDe(linea?.ID_PRODUCTO)}
                deshabilitado={gestionPedido.cargandoMetodos || gestionPedido.ocupado}
                alCambiar={(valor) => gestionPedido.setMetodo(linea?.ID_PRODUCTO ?? 'pedido', valor)} />
        );
    }

    let textoEstado;
    if (pedido.ESTADO === 'ACEPTADA' && pedido.ESTADO_VENTA === 'BORRADOR') {
        textoEstado = 'Aceptado por la viña. El registro del pago está pendiente.';
    } else {
        textoEstado = EXPLICACION[pedido.ESTADO];
    }

    let observaciones;
    if (gestionPedido.editable) {
        function enviarObservaciones(evento) {
            evento.preventDefault();
            gestionPedido.guardarObservaciones();
        }

        observaciones = (
            <form className="mb-4 grid gap-2" onSubmit={enviarObservaciones}>
                <label htmlFor={`observaciones-${pedido.ID_SOLICITUD}`}>Observaciones</label>
                <textarea id={`observaciones-${pedido.ID_SOLICITUD}`} maxLength={500}
                    value={gestionPedido.observaciones} onChange={(evento) => gestionPedido.setObservaciones(evento.target.value)} disabled={gestionPedido.ocupado} />
                <button type="submit" className="btn btn-sec justify-self-start"
                    disabled={gestionPedido.ocupado || !gestionPedido.observacionesModificadas}>Guardar observaciones</button>
            </form>
        );
    } else {
        observaciones = pedido.OBSERVACIONES && (
            <p className="mb-4 whitespace-pre-wrap">Observaciones: {pedido.OBSERVACIONES}</p>
        );
    }

    let columnasPago;
    if (gestionPedido.editable) {
        columnasPago = [{ titulo: 'Método de pago', render: selector }];
    } else {
        columnasPago = [];
    }

    let accionesProductos;
    if (gestionPedido.editable) {
        accionesProductos = function (linea) {
            return (
                <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-peligro btn-sm" disabled={gestionPedido.ocupado} onClick={() => gestionPedido.quitar(linea)}>
                        Quitar
                    </button>
                    <button type="button" className="btn btn-sm"
                        disabled={gestionPedido.ocupado || gestionPedido.cargandoMetodos || !gestionPedido.cantidadValida(linea) || !gestionPedido.metodoValido(linea.ID_PRODUCTO)}
                        onClick={() => gestionPedido.enviarProducto(linea)}>
                        Enviar producto
                    </button>
                </div>
            );
        };
    }

    return (
        <div className="tarjeta">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex flex-wrap items-center gap-2">Pedido folio {pedido.NUMERO_FOLIO} <Insignia valor={pedido.ESTADO} /></h2>
                    <p className="mt-1 text-sm text-suave">
                        {textoEstado}
                    </p>
                    {pedido.MOTIVO_RECHAZO && <p className="text-sm">Motivo de rechazo: {pedido.MOTIVO_RECHAZO}</p>}
                    {pedido.METODO_PAGO && <p className="text-sm">Método de pago: {pedido.METODO_PAGO}</p>}
                    {pedido.ID_TRANSACCION && <p className="break-all text-sm">ID de transacción: {pedido.ID_TRANSACCION}</p>}
                </div>
                <div className="text-2xl font-semibold tabular-nums text-vino">{dinero(gestionPedido.total)}</div>
            </div>
            {observaciones}
            <Tabla
                filas={gestionPedido.lineas} claveFila={(linea) => linea.ID_PRODUCTO} porPagina={20}
                vacio={<>Tu pedido está vacío. <Link to="/">Ir a la tienda</Link></>}
                columnas={[
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    {
                        campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha',
                        render: function (linea) {
                            let unidad = 'botella';
                            if (esPorKilo(linea.UNIDAD_MEDIDA)) {
                                unidad = 'kg';
                            }

                            return <>{dinero(linea.PRECIO_UNITARIO)}<span className="text-xs text-suave"> / {unidad}</span></>;
                        }
                    },
                    {
                        campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha',
                        render: function (linea) {
                            if (gestionPedido.editable) {
                                return (
                                    <span className="inline-flex items-center gap-1.5">
                                        <input type="number" min="0" step="any" value={gestionPedido.cantidadDe(linea)} className="w-20 text-right"
                                            aria-label={`Cantidad de ${linea.NOMBRE}`} aria-invalid={!gestionPedido.cantidadValida(linea)}
                                            disabled={gestionPedido.ocupado} onChange={(evento) => gestionPedido.cambiarCantidad(linea, evento.target.value)} />
                                        <span className="w-14 text-left text-xs text-suave">{unidadCorta(linea.UNIDAD_MEDIDA, gestionPedido.cantidadDe(linea))}</span>
                                        {Number(gestionPedido.cantidadDe(linea)) !== Number(linea.CANTIDAD) && (
                                            <button type="button" className="btn btn-sec btn-sm"
                                                disabled={!gestionPedido.cantidadValida(linea) || gestionPedido.ocupado} onClick={() => gestionPedido.guardarCantidad(linea)}>
                                                Guardar cantidad
                                            </button>
                                        )}
                                    </span>
                                );
                            }
                            return cantidadConUnidad(linea.CANTIDAD, linea.UNIDAD_MEDIDA);
                        }
                    },
                    {
                        campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: function (linea) {
                            return dinero(gestionPedido.subtotalDe(linea));
                        }
                    },
                    ...columnasPago
                ]}
                acciones={accionesProductos}
            />
            {(gestionPedido.editable || gestionPedido.necesitaMetodo) && gestionPedido.errorMetodos && (
                <p role="alert" className="mt-2 text-sm text-peligro">{gestionPedido.errorMetodos}</p>
            )}
            {(gestionPedido.editable || gestionPedido.necesitaMetodo) && !gestionPedido.cargandoMetodos && !gestionPedido.errorMetodos && gestionPedido.metodos.length === 0 && (
                <p className="mt-2 text-sm text-suave">No hay métodos de pago disponibles.</p>
            )}
            {gestionPedido.editable && (
                <Pie>
                    <button type="button" className="btn btn-sec" onClick={gestionPedido.anular} disabled={gestionPedido.ocupado}>
                        Anular pedido
                    </button>
                </Pie>
            )}
            {gestionPedido.necesitaMetodo && (
                <form className="mt-4" onSubmit={gestionPedido.guardarMetodo}>
                    <div className="flex max-w-sm flex-col gap-1">
                        <label htmlFor={idMetodo} className="text-sm font-medium">Método de pago</label>
                        {selector()}
                    </div>
                    <Pie>
                        <button type="submit" className="btn" disabled={gestionPedido.ocupado || gestionPedido.cargandoMetodos ||
                            !gestionPedido.metodoValido() || gestionPedido.metodoDe() === String(pedido.ID_METODO_PAGO)}>
                            Guardar método de pago
                        </button>
                    </Pie>
                </form>
            )}
        </div>
    );
}
