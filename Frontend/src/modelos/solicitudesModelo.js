import { api } from './http.js';

export const anular = (idSolicitud) =>
    api(`/gestores/solicitudes/${idSolicitud}/anular`, { metodo: 'POST' });
