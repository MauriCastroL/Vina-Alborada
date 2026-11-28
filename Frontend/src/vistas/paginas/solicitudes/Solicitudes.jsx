import { useState } from 'react';
import { dinero, fechaHora } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import DetalleSolicitud from './DetalleSolicitud.jsx';

export default function Solicitudes() {
    const [abierta, setAbierta] = useState(null);
    const [recargar, setRecargar] = useState(0);

    function mostrarAccionSolicitud(fila) {
        return (
            <button type="button" className="btn btn-sec btn-sm" onClick={() => setAbierta(fila)}>
                Ver detalle
            </button>
        );
    }

    function recargarSolicitudes() {
        return setRecargar(function (version) {
            return version + 1;
        });
    }

    return (
        <>
            <CrudPagina
                titulo="Solicitudes web"
                descripcion="Consulta las solicitudes de los clientes, acepta o rechaza las pendientes y anula borradores."
                recurso="solicitudes" ids={['ID_SOLICITUD']} ordenDescendente recargar={recargar} soloLectura
                columnas={[
                    { campo: 'NUMERO_FOLIO', titulo: 'Folio' },
                    { campo: 'CLIENTE', titulo: 'Cliente' },
                    {
                        campo: 'FECHA_CREACION', titulo: 'Creada', render: function (fila) {
                            return fechaHora(fila.FECHA_CREACION);
                        }
                    },
                    {
                        campo: 'TOTAL', titulo: 'Total', alinear: 'derecha', render: function (fila) {
                            return dinero(fila.TOTAL);
                        }
                    },
                    {
                        campo: 'ESTADO', titulo: 'Estado', render: function (fila) {
                            return <Insignia valor={fila.ESTADO} />;
                        }
                    },
                    {
                        campo: 'ID_VENTA', titulo: 'Venta', render: function (fila) {
                            if (fila.ID_VENTA) {
                                return `N° ${fila.ID_VENTA}`;
                            }
                            return '';
                        }
                    }
                ]}
                accionesExtra={mostrarAccionSolicitud}
            />
            <DetalleSolicitud solicitud={abierta} alCerrar={() => setAbierta(null)}
                alCambiar={recargarSolicitudes} />
        </>
    );
}
