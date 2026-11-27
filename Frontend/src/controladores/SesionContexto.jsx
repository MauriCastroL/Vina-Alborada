// Controlador de sesion: usuario, modulos permitidos, login, registro y cierre de sesion
import { createContext, useContext, useEffect, useState } from 'react';
import * as accesoModelo from '../modelos/accesoModelo.js';
import { borrarSesion, guardarSesion, leerSesion } from '../modelos/almacenSesion.js';

const ContextoSesion = createContext(null);

export function ProveedorSesion(opciones) {
    const children = opciones.children;

    const [sesion, setSesion] = useState(leerSesion);

    useEffect(function () {
        if (!sesion) return;
        accesoModelo.obtenerSesion()
            .then(function (datos) {
                const nueva = { ...leerSesion(), ...datos };
                guardarSesion(nueva);
                setSesion(nueva);
            })
            .catch(function () { });
    }, []);

    async function iniciar(correo, clave) {
        const datos = await accesoModelo.iniciarSesion(correo, clave);
        guardarSesion(datos);
        setSesion(datos);
        return datos;
    }

    async function registrar(datos) {
        const respuesta = await accesoModelo.registrar(datos);
        guardarSesion(respuesta);
        setSesion(respuesta);
        return respuesta;
    }

    function cerrar() {
        borrarSesion();
        setSesion(null);
    }

    const modulos = sesion?.modulos || [];
    const valor = {
        sesion,
        usuario: sesion?.usuario || null,
        modulos,
        tiene: function (modulo) {
            return modulos.includes(modulo);
        },
        iniciar,
        registrar,
        cerrar
    };
    return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion() {
    return useContext(ContextoSesion);
}
