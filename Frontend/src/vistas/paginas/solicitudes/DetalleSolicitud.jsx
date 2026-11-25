import { Link } from 'react-router-dom';
import { useGestorSolicitud } from '../../../controladores/useGestorSolicitud.js';
import { dinero } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Modal from '../../componentes/Modal.jsx';

function Contenido({ solicitud, alCerrar, alCambiar }) {
    const gestor = useGestorSolicitud(solicitud, { alCambiar, alCerrar });
    const anulable = ['BORRADOR', 'PENDIENTE'].includes(solicitud.ESTADO);

    return (
        <Modal titulo={`Solicitud folio ${solicitud.NUMERO_FOLIO}`} abierto alCerrar={alCerrar} ancho="grande">
            <p className="mb-3 text-sm text-suave">
                {solicitud.CLIENTE} · <Insignia valor={solicitud.ESTADO} /> · Total {dinero(solicitud.TOTAL)}
                {solicitud.METODO_PAGO && <><br />Método de pago: {solicitud.METODO_PAGO}</>}
                {solicitud.ID_TRANSACCION && <><br />ID de transacción: {solicitud.ID_TRANSACCION}</>}
                {solicitud.OBSERVACIONES && <><br />Observaciones: {solicitud.OBSERVACIONES}</>}
            </p>
            <CrudPagina
                embebido recurso="detalle-solicitud" ids={['ID_PRODUCTO']} soloLectura
                filtros={{ idSolicitud: solicitud.ID_SOLICITUD }} porPagina={8}
                columnas={[
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha' },
                    { campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha', render: (f) => dinero(f.PRECIO_UNITARIO) },
                    { campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: (f) => dinero(f.SUBTOTAL) }
                ]}
            />
            <div className="mt-5 flex flex-wrap justify-end gap-2">
                {anulable && (
                    <button type="button" className="btn btn-peligro" onClick={gestor.anular} disabled={gestor.procesando}>
                        {gestor.procesando ? 'Anulando…' : 'Anular solicitud'}
                    </button>
                )}
                {solicitud.ID_VENTA && (
                    <Link className="btn btn-sec" to={`/ventas/${solicitud.ID_VENTA}`}>
                        Ver venta N° {solicitud.ID_VENTA}
                    </Link>
                )}
            </div>
        </Modal>
    );
}

export default function DetalleSolicitud({ solicitud, alCerrar, alCambiar }) {
    if (!solicitud) return null;
    return <Contenido solicitud={solicitud} alCerrar={alCerrar} alCambiar={alCambiar} />;
}
