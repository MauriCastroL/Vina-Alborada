import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RUTA_ALERTAS_PENDIENTES } from '../modelos/monitoreoModelo.js';
import { tituloDe } from '../rutas/menu.js';
import { useDatos } from './useDatos.js';
import { useSesion } from './SesionContexto.jsx';

export function usePanel() {
    const { usuario, tiene, cerrar } = useSesion();
    const navegar = useNavigate();
    const { pathname } = useLocation();
    const [cambiandoClave, setCambiandoClave] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const veAlertas = ['MONITOREO', 'INVENTARIO', 'REPORTES', 'VENTAS'].some(tiene);
    const { datos: alertas } = useDatos(RUTA_ALERTAS_PENDIENTES, { activo: veAlertas });

    useEffect(function () {
        if (!menuAbierto) return undefined;
        function tecla(evento) {
            return evento.key === 'Escape' && setMenuAbierto(false);
        }
        window.addEventListener('keydown', tecla);
        return function () {
            return window.removeEventListener('keydown', tecla);
        };
    }, [menuAbierto]);

    function salir() {
        cerrar();
        navegar('/');
    }

    return {
        usuario, tiene, pathname, migas: tituloDe(pathname), veAlertas, alertas,
        menuAbierto, setMenuAbierto, cambiandoClave, setCambiandoClave, salir
    };
}
