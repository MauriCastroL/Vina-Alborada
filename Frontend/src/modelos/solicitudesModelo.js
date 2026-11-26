import { api } from './http.js';

export const aceptar = (idSolicitud) =>
    api(`/gestores/solicitudes/${idSolicitud}/aceptar`, { metodo: 'POST' });

export const anular = (idSolicitud) =>
    api(`/gestores/solicitudes/${idSolicitud}/anular`, { metodo: 'POST' });
