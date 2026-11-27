// Controlador del listado de ventas: filtro por estado y busqueda (las mas nuevas primero)
import { useMemo, useState } from 'react';
import { rutaListar } from '../modelos/ventasModelo.js';
import { normalizar } from '../utilidades/formato.js';
import { useDatos } from './useDatos.js';

export function useVentas() {
    const [estado, setEstado] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const { datos: ventas, cargando } = useDatos(rutaListar(estado));

    const filas = useMemo(function () {
        const consulta = normalizar(busqueda.trim());
        const lista = [...ventas].reverse();
        if (!consulta) {
            return lista;
        }

        const coincidencias = [];
        for (const venta of lista) {
            for (const valor of Object.values(venta)) {
                if (normalizar(valor).includes(consulta)) {
                    coincidencias.push(venta);
                    break;
                }
            }
        }
        return coincidencias;
    }, [ventas, busqueda]);

    return { ventas, filas, cargando, estado, setEstado, busqueda, setBusqueda };
}
