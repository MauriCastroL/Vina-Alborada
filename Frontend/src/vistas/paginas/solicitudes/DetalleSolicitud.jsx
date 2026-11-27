import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGestorSolicitud } from '../../../controladores/useGestorSolicitud.js';
import { dinero } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Modal from '../../componentes/Modal.jsx';

function Contenido(propiedades) {
    const solicitud = propiedades.solicitud;
    const alCerrar = propiedades.alCerrar;
    const alCambiar = propiedades.alCambiar;

    const gestor = useGestorSolicitud(solicitud, { alCambiar, alCerrar });
    const [rechazando, setRechazando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const pendiente = solicitud.ESTADO === 'PENDIENTE';
    const ocupado = Boolean(gestor.accionEnCurso);

    let accionesSolicitud;
    if (rechazando) {
        let textoRechazar = 'Confirmar rechazo';
        if (ocupado) {
            textoRechazar = 'Rechazando…';
        }

        function enviarRechazo(evento) {
            evento.preventDefault();
            if (motivo.trim() && !ocupado) gestor.rechazar(motivo.trim());
        }

        accionesSolicitud = (
            <form className="mt-5" onSubmit={enviarRechazo}>
                <div className="flex flex-col gap-1">
                    <label htmlFor="motivo-rechazo" className="text-sm font-semibold">Motivo de rechazo (obligatorio)</label>
                    <textarea id="motivo-rechazo" rows={3} required maxLength={500} disabled={ocupado}
                        value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <button type="button" className="btn btn-sec" disabled={ocupado} onClick={() => setRechazando(false)}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-peligro" disabled={ocupado || !motivo.trim()}>
                        {textoRechazar}
                    </button>
                </div>
            </form>
        );
    } else {
        let textoAceptar;
        if ((pendiente)) {
            if (gestor.accionEnCurso === 'aceptar') {
                textoAceptar = 'Aceptando…';
            } else {
                textoAceptar = 'Aceptar solicitud';
            }
        }

        let textoAnular;
        if ((solicitud.ESTADO === 'BORRADOR')) {
            if (gestor.accionEnCurso === 'anular') {
                textoAnular = 'Anulando…';
            } else {
                textoAnular = 'Anular solicitud';
            }
        }

        accionesSolicitud = (
            <div className="mt-5 flex flex-wrap justify-end gap-2">
                {pendiente && (
                    <button type="button" className="btn btn-exito" onClick={gestor.aceptar} disabled={ocupado}>
                        {textoAceptar}
                    </button>
                )}
                {pendiente && (
                    <button type="button" className="btn btn-peligro" onClick={() => setRechazando(true)} disabled={ocupado}>
                        Rechazar solicitud
                    </button>
                )}
                {solicitud.ESTADO === 'BORRADOR' && (
                    <button type="button" className="btn btn-peligro" onClick={gestor.anular} disabled={ocupado}>
                        {textoAnular}
                    </button>
                )}
                {solicitud.ID_VENTA && (
                    <Link className="btn btn-sec" to={`/ventas/${solicitud.ID_VENTA}`}>
                        Ver venta N° {solicitud.ID_VENTA}
                    </Link>
                )}
            </div>
        );
    }

    return (
        <Modal titulo={`Solicitud folio ${solicitud.NUMERO_FOLIO}`} abierto alCerrar={alCerrar} ancho="grande">
            <p className="mb-3 text-sm text-suave">
                {solicitud.CLIENTE} · <Insignia valor={solicitud.ESTADO} /> · Total {dinero(solicitud.TOTAL)}
                {solicitud.METODO_PAGO && <><br />Método de pago: {solicitud.METODO_PAGO}</>}
                {solicitud.ID_TRANSACCION && <><br />ID de transacción: {solicitud.ID_TRANSACCION}</>}
                {solicitud.OBSERVACIONES && <><br />Observaciones: {solicitud.OBSERVACIONES}</>}
                {solicitud.MOTIVO_RECHAZO && <><br />Motivo de rechazo: {solicitud.MOTIVO_RECHAZO}</>}
            </p>
            <CrudPagina
                embebido recurso="detalle-solicitud" ids={['ID_PRODUCTO']} soloLectura
                filtros={{ idSolicitud: solicitud.ID_SOLICITUD }} porPagina={8}
                columnas={[
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha' },
                    {
                        campo: 'PRECIO_UNITARIO', titulo: 'Precio', alinear: 'derecha', render: function (fila) {
                            return dinero(fila.PRECIO_UNITARIO);
                        }
                    },
                    {
                        campo: 'SUBTOTAL', titulo: 'Subtotal', alinear: 'derecha', render: function (fila) {
                            return dinero(fila.SUBTOTAL);
                        }
                    }
                ]}
            />
            {accionesSolicitud}
        </Modal>
    );
}

export default function DetalleSolicitud(propiedades) {
    const solicitud = propiedades.solicitud;
    const alCerrar = propiedades.alCerrar;
    const alCambiar = propiedades.alCambiar;

    if (!solicitud) return null;
    return <Contenido solicitud={solicitud} alCerrar={alCerrar} alCambiar={alCambiar} />;
}
