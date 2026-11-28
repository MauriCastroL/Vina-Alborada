import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { etiquetaValidacion, mensajeValidacion } from '../utilidades/validacionFormulario.js';
import Avisos from '../vistas/componentes/Avisos.jsx';

const ContextoMensajes = createContext({ avisar: function () { } });
const SALIDA = 180;

export function ProveedorMensajes(opciones) {
    const children = opciones.children;

    const [mensajes, setMensajes] = useState([]);

    const quitar = useCallback(function (id) {
        setMensajes(function (anteriores) {
            return anteriores.map(function (elemento) {
                if (elemento.id === id) {
                    return { ...elemento, saliendo: true };
                }
                return elemento;
            });
        });
        setTimeout(function () {
            return setMensajes(function (anteriores) {
                return anteriores.filter(function (elemento) {
                    return elemento.id !== id;
                });
            });
        }, SALIDA);
    }, []);

    const avisar = useCallback(function (texto, tipo = 'exito') {
        const id = Date.now() + Math.random();
        let duracion = 3500;
        if (tipo === 'error') {
            duracion = 7000;
        }
        setMensajes(function (anteriores) {
            return [...anteriores, { id, texto, tipo }];
        });
        setTimeout(function () {
            return quitar(id);
        }, duracion);
    }, [quitar]);

    useEffect(function () {
        let pendiente = false;
        function mostrarValidacion(evento) {
            const campo = evento.target;
            if (!campo.form || !campo.validity) return;
            evento.preventDefault();
            if (pendiente) return;
            pendiente = true;
            queueMicrotask(function () {
                pendiente = false;
                if (!campo.isConnected) return;
                campo.focus();
                const etiqueta = etiquetaValidacion(campo);
                const mensaje = mensajeValidacion(campo);
                let mensajeCompleto;
                if (etiqueta) {
                    mensajeCompleto = `${etiqueta}. ${mensaje}`;
                } else {
                    mensajeCompleto = mensaje;
                }

                avisar(mensajeCompleto, 'error');
            });
        }
        document.addEventListener('invalid', mostrarValidacion, true);
        return function () {
            return document.removeEventListener('invalid', mostrarValidacion, true);
        };
    }, [avisar]);

    return (
        <ContextoMensajes.Provider value={{ avisar }}>
            {children}
            <Avisos mensajes={mensajes} alQuitar={quitar} />
        </ContextoMensajes.Provider>
    );
}

export function useMensajes() {
    return useContext(ContextoMensajes);
}
