// Controlador generico de mantenedor: carga, busqueda, edicion, guardado, eliminacion logica y reactivacion
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as mantenedoresModelo from '../modelos/mantenedoresModelo.js';
import { normalizar } from '../utilidades/formato.js';
import { useMensajes } from './MensajesContexto.jsx';

export function useCrud(opciones) {
    const recurso = opciones.recurso;
    const ids = opciones.ids;
    let filtros = opciones.filtros;
    if (filtros === undefined) {
        filtros = {};
    }
    let conInactivos = opciones.conInactivos;
    if (conInactivos === undefined) {
        conInactivos = false;
    }
    let textoEliminar = opciones.textoEliminar;
    if (textoEliminar === undefined) {
        textoEliminar = 'Desactivar';
    }
    const prepararEnvio = opciones.prepararEnvio;
    const transformarFilas = opciones.transformarFilas;
    let ordenDescendente = opciones.ordenDescendente;
    if (ordenDescendente === undefined) {
        ordenDescendente = false;
    }
    const alCargar = opciones.alCargar;
    let recargar = opciones.recargar;
    if (recargar === undefined) {
        recargar = 0;
    }

    const { avisar } = useMensajes();
    const [filas, setFilas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [verTodos, setVerTodos] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [edicion, setEdicion] = useState(null);
    const [guardando, setGuardando] = useState(false);

    let incluirTodos;
    if (conInactivos && verTodos) {
        incluirTodos = 1;
    }

    const parametros = { ...filtros, todos: incluirTodos };
    const ruta = mantenedoresModelo.rutaListar(recurso, parametros);

    const cargar = useCallback(async function () {
        setCargando(true);
        try {
            let datos = await mantenedoresModelo.listar(recurso, parametros);
            if (transformarFilas) datos = datos.map(transformarFilas);
            if (ordenDescendente) datos = [...datos].reverse();
            setFilas(datos);
            if (alCargar != null) {
                alCargar(datos);
            }
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            setCargando(false);
        }
    }, [recurso, ruta]);

    useEffect(function () { cargar(); }, [cargar, recargar]);

    const visibles = useMemo(function () {
        const consulta = normalizar(busqueda.trim());
        if (!consulta) return filas;
        const coincidencias = [];
        for (const fila of filas) {
            for (const valor of Object.values(fila)) {
                if (normalizar(valor).includes(consulta)) {
                    coincidencias.push(fila);
                    break;
                }
            }
        }
        return coincidencias;
    }, [filas, busqueda]);

    function rutaIds(fila) {
        const segmentos = [];
        for (const campo of ids) {
            segmentos.push(encodeURIComponent(fila[campo]));
        }
        return segmentos.join('/');
    }

    async function guardar(evento) {
        evento.preventDefault();
        setGuardando(true);
        try {
            let cuerpo;
            if (prepararEnvio) {
                cuerpo = prepararEnvio({ ...edicion.valores }, edicion.modo);
            } else {
                cuerpo = edicion.valores;
            }
            if (edicion.modo === 'crear') {
                const resultado = await mantenedoresModelo.crear(recurso, cuerpo);
                if (resultado?.AVISO) avisar(resultado.AVISO, 'error');
                else if (recurso === 'productos' && cuerpo.ACTIVAR_AL_GUARDAR) {
                    if (Number(resultado?.ACTIVO) === 1) avisar('Producto creado y activado');
                    else avisar('El servidor no confirmó la activación. Revisa el estado del producto en la lista.', 'error');
                } else avisar('Registro creado');
            } else {
                await mantenedoresModelo.modificar(recurso, rutaIds(edicion.original), cuerpo);
                avisar('Cambios guardados');
            }
            setEdicion(null);
            cargar();
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            setGuardando(false);
        }
    }

    async function eliminar(fila) {
        if (!window.confirm(`¿${textoEliminar} este registro?`)) return;
        try {
            await mantenedoresModelo.eliminar(recurso, rutaIds(fila));
            avisar('Listo');
            cargar();
        } catch (error) {
            avisar(error.message, 'error');
        }
    }

    async function reactivar(fila) {
        try {
            await mantenedoresModelo.reactivar(recurso, rutaIds(fila));
            avisar('Registro reactivado');
            cargar();
        } catch (error) {
            avisar(error.message, 'error');
        }
    }

    function estaInactivo(fila) {
        return conInactivos && fila.ACTIVO !== undefined && Number(fila.ACTIVO) === 0;
    }

    return {
        filas, visibles, cargando, verTodos, setVerTodos, busqueda, setBusqueda,
        edicion, setEdicion, guardando, cargar, guardar, eliminar, reactivar, rutaIds, estaInactivo
    };
}
