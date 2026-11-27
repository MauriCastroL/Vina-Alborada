import { useId, useRef } from 'react';
import { dinero, normalizar } from '../../../utilidades/formato.js';

export default function BuscadorProducto(propiedades) {
    const productos = propiedades.productos;
    const consulta = propiedades.consulta;
    const seleccionado = propiedades.seleccionado;
    const alBuscar = propiedades.alBuscar;
    const alSeleccionar = propiedades.alSeleccionar;

    const id = useId();
    const entrada = useRef(null);
    const terminos = normalizar(consulta.trim()).split(/\s+/).filter(Boolean);
    let resultados;
    if (terminos.length && !seleccionado) {
        resultados = productos.filter(function (producto) {
            const texto = normalizar([producto.CODIGO, producto.NOMBRE, producto.CATEGORIA, producto.FORMATO].join(' '));
            return terminos.every(function (termino) {
                return texto.includes(termino);
            });
        });
    } else {
        resultados = [];
    }

    function seleccionar(producto) {
        alSeleccionar(producto);
        entrada.current?.focus();
    }

    let valorBusqueda;
    if (seleccionado) {
        valorBusqueda = seleccionado.NOMBRE;
    } else {
        valorBusqueda = consulta;
    }

    let contenidoResultados;
    if ((!seleccionado && terminos.length > 0)) {
        if (resultados.length) {
            contenidoResultados = (
                <ul aria-label="Productos encontrados" className="max-h-60 divide-y divide-borde overflow-y-auto rounded-md border border-borde bg-white">
                    {resultados.map(function (producto) {
                        return (
                            <li key={producto.ID_PRODUCTO}>
                                <button type="button" onClick={() => seleccionar(producto)}
                                    className="flex w-full flex-wrap justify-between gap-x-4 gap-y-1 px-3 py-2 text-left text-sm hover:bg-vino-claro focus-visible:bg-vino-claro">
                                    <span className="min-w-0">
                                        <span className="block font-semibold">{producto.NOMBRE}</span>
                                        <span className="text-xs text-suave">
                                            {[producto.CODIGO, producto.FORMATO].filter(Boolean).join(' · ')}
                                        </span>
                                    </span>
                                    <span className="text-right">
                                        <span className="block font-medium">{dinero(producto.PRECIO_ACTUAL)}</span>
                                        <span className="text-xs text-suave">Stock {producto.STOCK_ACTUAL}</span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            );
        } else {
            contenidoResultados = <p role="status" className="text-sm text-suave">No se encontraron productos.</p>;
        }
    }

    function seleccionarConEnter(evento) {
        if (evento.key !== 'Enter' || evento.nativeEvent.isComposing) return;
        evento.preventDefault();
        if (resultados.length === 1) seleccionar(resultados[0]);
    }

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium">Buscar producto</label>
            <input id={id} ref={entrada} type="search" autoComplete="off" className="w-full"
                placeholder="Nombre, código, categoría o formato"
                value={valorBusqueda}
                onChange={(evento) => alBuscar(evento.target.value)}
                onKeyDown={seleccionarConEnter} />
            {seleccionado && (
                <p role="status" className="text-sm text-suave">
                    Seleccionado · {seleccionado.CODIGO} · {dinero(seleccionado.PRECIO_ACTUAL)} · Stock {seleccionado.STOCK_ACTUAL}
                </p>
            )}
            {!seleccionado && terminos.length > 0 && (contenidoResultados)}
        </div>
    );
}
