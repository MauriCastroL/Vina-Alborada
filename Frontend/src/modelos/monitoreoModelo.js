// Modelo de monitoreo (rutas de lectura con sus filtros)
import { consulta } from './http.js';

export const RUTA_ALERTAS_PENDIENTES = '/monitoreo/alertas-pendientes';
export function rutaAuditoria(tabla, dias) {
    return `/monitoreo/auditoria${consulta({ tabla, dias })}`;
}
export function rutaAlertasStock(soloBajoMinimo, dias) {
    let indicadorBajoMinimo = 0;
    if (soloBajoMinimo) {
        indicadorBajoMinimo = 1;
    }

    return `/monitoreo/alertas-stock${consulta({ soloBajoMinimo: indicadorBajoMinimo, dias })}`;
}
export function rutaLogins(soloFallidos, dias) {
    let indicadorFallidos = 0;
    if (soloFallidos) {
        indicadorFallidos = 1;
    }

    return `/monitoreo/logins${consulta({ soloFallidos: indicadorFallidos, dias })}`;
}
