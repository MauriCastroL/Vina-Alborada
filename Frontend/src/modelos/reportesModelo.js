import { consulta } from './http.js';

export function rutaRanking(anio, mes) {
    return `/reportes/ranking-productos${consulta({ anio, mes })}`;
}
export function rutaVentasCanal(anio) {
    return `/reportes/ventas-canal${consulta({ anio })}`;
}
export function rutaStockCritico(dias, soloAlertas) {
    let indicadorAlertas = 0;
    if (soloAlertas) {
        indicadorAlertas = 1;
    }

    return `/reportes/stock-critico${consulta({ dias, soloAlertas: indicadorAlertas })}`;
}
