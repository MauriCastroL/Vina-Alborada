// Controlador de la revision de una solicitud web (G3): enviar, aceptar (genera venta) o rechazar
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as solicitudesModelo from '../modelos/solicitudesModelo.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useGestorSolicitud(solicitud, { alCambiar, alCerrar }) {
    const { avisar } = useMensajes();
    const navegar = useNavigate();
    const [procesando, setProcesando] = useState(false);

    async function ejecutar(operacion, mensaje) {
        setProcesando(true);
        try {
            const r = await operacion();
            avisar(mensaje);
            alCambiar();
            alCerrar();
            if (r?.ID_VENTA) {
                navegar(`/ventas/${r.ID_VENTA}`);
            }
        } catch (err) {
            avisar(err.message, 'error');
            alCambiar();
            alCerrar();
        } finally {
            setProcesando(false);
        }
    }

    return {
        procesando,
        rechazar: () => ejecutar(() => solicitudesModelo.resolver(solicitud.ID_SOLICITUD, 'RECHAZADA'), 'Solicitud rechazada'),
        aceptar: () => ejecutar(() => solicitudesModelo.resolver(solicitud.ID_SOLICITUD, 'ACEPTADA'), 'Solicitud aceptada y pago registrado')
    };
}
