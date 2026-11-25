import { useState } from 'react';
import * as solicitudesModelo from '../modelos/solicitudesModelo.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useGestorSolicitud(solicitud, { alCambiar, alCerrar }) {
    const { avisar } = useMensajes();
    const [procesando, setProcesando] = useState(false);

    async function anular() {
        if (!window.confirm(`¿Anular la solicitud folio ${solicitud.NUMERO_FOLIO}?`)) return;

        setProcesando(true);
        try {
            await solicitudesModelo.anular(solicitud.ID_SOLICITUD);
            avisar('Solicitud anulada');
            alCambiar();
            alCerrar();
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            setProcesando(false);
        }
    }

    return { procesando, anular };
}
