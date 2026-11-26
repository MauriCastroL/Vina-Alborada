import { useState } from 'react';
import * as solicitudesModelo from '../modelos/solicitudesModelo.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useGestorSolicitud(solicitud, { alCambiar, alCerrar }) {
    const { avisar } = useMensajes();
    const [accionEnCurso, setAccionEnCurso] = useState(null);

    async function ejecutar(accion, mensaje) {
        setAccionEnCurso(accion);
        try {
            await solicitudesModelo[accion](solicitud.ID_SOLICITUD);
            avisar(mensaje);
            alCambiar();
            alCerrar();
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            setAccionEnCurso(null);
        }
    }

    function aceptar() {
        return ejecutar('aceptar', 'Solicitud aceptada');
    }

    function anular() {
        if (!window.confirm(`¿Anular la solicitud folio ${solicitud.NUMERO_FOLIO}?`)) return;
        return ejecutar('anular', 'Solicitud anulada');
    }

    return { accionEnCurso, aceptar, anular };
}
