import { api } from './http.js';

export function aceptar(idSolicitud) {
    return api(`/gestores/solicitudes/${idSolicitud}/aceptar`, { metodo: 'POST' });
}

export function anular(idSolicitud, motivo) {
    return api(`/gestores/solicitudes/${idSolicitud}/anular`, { metodo: 'POST', cuerpo: { MOTIVO: motivo } });
}
