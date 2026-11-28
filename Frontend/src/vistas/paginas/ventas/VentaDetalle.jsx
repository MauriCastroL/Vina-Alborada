import { Link, useParams } from 'react-router-dom';
import { useVentaDetalle } from '../../../controladores/useVentaDetalle.js';
import { dinero, fechaHora } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Cargando from '../../componentes/Cargando.jsx';
import Formulario from '../../componentes/Formulario.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Dato, PanelAccion, Volver } from './partes.jsx';
import BuscadorProducto from './BuscadorProducto.jsx';

export default function VentaDetalle() {
    const { id } = useParams();
    const gestionVenta = useVentaDetalle(id);
    const { venta } = gestionVenta;

    if (gestionVenta.cargando && !venta) return <Cargando />;
    if (!venta) {
        return (
            <section>
                <Volver />
                <h1>Venta no encontrada</h1>
            </section>
        );
    }

    const seleccionado = gestionVenta.activos.find((producto) => String(producto.ID_PRODUCTO) === String(gestionVenta.agregar.ID_PRODUCTO));

    let textoConfirmar;
    if ((venta.ESTADO === 'BORRADOR' && venta.CANAL_VENTA === 'PRESENCIAL')) {
        if (gestionVenta.confirmando) {
            textoConfirmar = 'Confirmando…';
        } else {
            textoConfirmar = 'Confirmar venta';
        }
    }

    function buscarProducto(BUSCAR_PRODUCTO) {
        return gestionVenta.setAgregar(function (anterior) {
            return {
                ...anterior, BUSCAR_PRODUCTO, ID_PRODUCTO: undefined
            };
        });
    }

    function seleccionarProducto(producto) {
        return gestionVenta.setAgregar(function (anterior) {
            return {
                ...anterior, ID_PRODUCTO: producto.ID_PRODUCTO
            };
        });
    }

    return (
        <section>
            <Volver />
            <Cabecera
                titulo={<>Venta N° {venta.ID_VENTA} <Insignia valor={venta.ESTADO} /> <Insignia valor={venta.CANAL_VENTA} /></>}
                descripcion={<>
                    {venta.COMPRADOR || 'Comprador de mostrador'}
                    {venta.FOLIO_SOLICITUD && ` · Solicitud web folio ${venta.FOLIO_SOLICITUD}`}
                    {venta.LUGAR_VENTA && ` · ${venta.LUGAR_VENTA}`}
                </>}>
                <div className="text-3xl font-semibold tabular-nums text-vino">{dinero(gestionVenta.total)}</div>
            </Cabecera>

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-borde bg-white p-5 md:grid-cols-4">
                <Dato etiqueta="Creada">{fechaHora(venta.FECHA_CREACION)}</Dato>
                <Dato etiqueta="Confirmada">{fechaHora(venta.FECHA_CONFIRMACION) || '—'}</Dato>
                <Dato etiqueta="Método de pago">{venta.METODO_PAGO || '—'}</Dato>
                {venta.ID_TRANSACCION && (
                    <Dato etiqueta="ID de transacción" ancho><span className="break-all">{venta.ID_TRANSACCION}</span></Dato>
                )}
                {gestionVenta.referencia && (
                    <Dato etiqueta="Referencia de pago" ancho><span className="break-all">{gestionVenta.referencia}</span></Dato>
                )}
                <Dato etiqueta="Vendedor">{venta.VENDEDOR?.toLowerCase()}</Dato>
                {venta.ESTADO === 'ANULADA' && (
                    <Dato etiqueta="Anulada" ancho>{fechaHora(venta.FECHA_ANULACION)} · {venta.MOTIVO_ANULACION}</Dato>
                )}
            </div>

            <h2 className="mb-3">Productos</h2>
            <Tabla
                filas={gestionVenta.lineas} claveFila={(linea) => linea.ID_PRODUCTO} vacio="Aún no hay productos en esta venta"
                columnas={[
                    { campo: 'CODIGO', titulo: 'Código' },
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha' },
                    {
                        campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha', render: function (linea) {
                            return dinero(linea.PRECIO_UNITARIO);
                        }
                    },
                    {
                        campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: function (linea) {
                            return dinero(linea.SUBTOTAL);
                        }
                    }
                ]}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                {venta.ESTADO === 'BORRADOR' && venta.CANAL_VENTA === 'PRESENCIAL' && (
                    <PanelAccion titulo="Agregar producto" ayuda="Se usa el precio vigente y se valida el stock disponible."
                        onSubmit={gestionVenta.agregarProducto}>
                        <BuscadorProducto productos={gestionVenta.activos} consulta={gestionVenta.agregar.BUSCAR_PRODUCTO ?? ''}
                            seleccionado={seleccionado}
                            alBuscar={buscarProducto}
                            alSeleccionar={seleccionarProducto} />
                        <Formulario valores={gestionVenta.agregar} alCambiar={gestionVenta.setAgregar} campos={[
                            { nombre: 'CANTIDAD', etiqueta: 'Cantidad', tipo: 'number', requerido: true, min: 1 }
                        ]} />
                        <button type="submit" className="btn self-start" disabled={!seleccionado}>Agregar</button>
                    </PanelAccion>
                )}

                {venta.ESTADO === 'BORRADOR' && venta.CANAL_VENTA === 'PRESENCIAL' && (
                    <PanelAccion titulo="Confirmar venta y registrar pago"
                        ayuda={`Descuenta el stock y registra el pago por el total (${dinero(gestionVenta.total)}).`}
                        onSubmit={gestionVenta.confirmar}>
                        <Formulario valores={gestionVenta.pago} alCambiar={gestionVenta.setPago} campos={[
                            {
                                nombre: 'ID_METODO_PAGO', etiqueta: 'Método de pago', tipo: 'select', requerido: true,
                                opciones: gestionVenta.metodos.map(function (metodo) {
                                    return { valor: metodo.ID_METODO_PAGO, texto: metodo.NOMBRE };
                                })
                            }
                        ]} />
                        <button type="submit" className="btn self-start" disabled={gestionVenta.confirmando || gestionVenta.lineas.length === 0}>
                            {textoConfirmar}
                        </button>
                    </PanelAccion>
                )}

                {venta.ESTADO === 'BORRADOR' && venta.CANAL_VENTA === 'DIGITAL' && (
                    <Link to="/solicitudes" className="btn btn-sec justify-self-start">Consultar solicitudes web</Link>
                )}

                {venta.ESTADO === 'CONFIRMADA' && (
                    <PanelAccion titulo="Anular venta" ayuda="Genera movimientos de reversión y devuelve el stock."
                        onSubmit={gestionVenta.anular}>
                        <label htmlFor="motivo" className="text-sm font-semibold">Motivo</label>
                        <textarea id="motivo" rows={3} value={gestionVenta.motivo} onChange={(evento) => gestionVenta.setMotivo(evento.target.value)} required />
                        <button type="submit" className="btn btn-peligro self-start">Anular venta</button>
                    </PanelAccion>
                )}
            </div>
        </section>
    );
}
