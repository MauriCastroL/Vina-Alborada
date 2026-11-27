// Controlador del registro de cliente web: datos, validaciones (RUT y contraseña) y envio
import { useState } from 'react';
import { formatearRut, rutValido } from '../utilidades/rut.js';
import { useSesion } from './SesionContexto.jsx';

const VACIO = {
    tipoCliente: 'NATURAL', nombre: '', apellido1: '', apellido2: '', razonSocial: '',
    rut: '', telefono: '', correo: '', clave: '', repetir: ''
};

export function useRegistro(alEntrar) {
    const { registrar } = useSesion();
    const [datosCliente, setDatosCliente] = useState(VACIO);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const esEmpresa = datosCliente.tipoCliente === 'EMPRESA';
    function cambiar(campo) {
        return function (evento) {
            setDatosCliente({ ...datosCliente, [campo]: evento.target.value });
        };
    }

    function elegirTipo(tipo) {
        setDatosCliente({ ...datosCliente, tipoCliente: tipo });
    }

    function formatearRutIngresado() {
        if (datosCliente.rut) {
            setDatosCliente({ ...datosCliente, rut: formatearRut(datosCliente.rut) });
        }
    }

    async function crear(evento) {
        evento.preventDefault();
        setError('');
        if (datosCliente.rut && !rutValido(datosCliente.rut)) {
            setError('El RUT ingresado no es válido.');
            return;
        }
        if (datosCliente.clave.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (datosCliente.clave !== datosCliente.repetir) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setEnviando(true);
        try {
            const { repetir, ...datos } = datosCliente;
            let rutFormateado = '';
            if (datosCliente.rut) {
                rutFormateado = formatearRut(datosCliente.rut);
            }

            await registrar({ ...datos, rut: rutFormateado });
            alEntrar();
        } catch (error) {
            setError(error.message);
            setEnviando(false);
        }
    }

    return { datosCliente, esEmpresa, cambiar, elegirTipo, formatearRutIngresado, error, enviando, crear };
}
