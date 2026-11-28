import { useCallback, useEffect, useState } from 'react';
import { api } from '../modelos/http.js';

export function useDatos(ruta, opciones = {}) {
    let activo = opciones.activo;
    if (activo === undefined) {
        activo = true;
    }

    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const recargar = useCallback(async function () {
        if (!activo || !ruta) {
            setCargando(false);
            return;
        }
        setCargando(true);
        try {
            setDatos(await api(ruta));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, [ruta, activo]);

    useEffect(function () { recargar(); }, [recargar]);

    return { datos, cargando, error, recargar };
}
