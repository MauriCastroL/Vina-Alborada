// Controlador de la venta presencial nueva (G2): comprador de mostrador o cliente registrado
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RUTA_CLIENTES } from '../modelos/mantenedoresModelo.js';
import * as ventasModelo from '../modelos/ventasModelo.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useVentaNueva() {
    const { avisar } = useMensajes();
    const navegar = useNavigate();
    const { datos: clientes } = useDatos(RUTA_CLIENTES);
    const [valores, setValores] = useState({ TIPO: 'MOSTRADOR', LUGAR_VENTA: 'Sala de ventas Viña La Alborada' });

    async function crear(evento) {
        evento.preventDefault();
        try {
            let idCliente = null;
            if (valores.TIPO === 'CLIENTE') {
                idCliente = valores.ID_CLIENTE;
            }

            let nombreComprador = null;
            if (valores.TIPO === 'MOSTRADOR') {
                nombreComprador = valores.NOMBRE_COMPRADOR;
            }

            const { ID_VENTA } = await ventasModelo.crear({
                ID_CLIENTE: idCliente,
                NOMBRE_COMPRADOR: nombreComprador,
                LUGAR_VENTA: valores.LUGAR_VENTA,
                OBSERVACIONES: valores.OBSERVACIONES
            });
            avisar(`Venta N° ${ID_VENTA} creada: agregue los productos`);
            navegar(`/ventas/${ID_VENTA}`);
        } catch (error) {
            avisar(error.message, 'error');
        }
    }

    return { clientes, valores, setValores, crear };
}
