import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const ALINEAR = { derecha: 'text-right tabular-nums', centro: 'text-center' };

export default function Tabla(propiedades) {
    const columnas = propiedades.columnas;
    const filas = propiedades.filas;
    const acciones = propiedades.acciones;
    let vacio = propiedades.vacio;
    if (vacio === undefined) {
        vacio = 'No hay registros';
    }
    const claveFila = propiedades.claveFila;
    const alClickFila = propiedades.alClickFila;
    let porPagina = propiedades.porPagina;
    if (porPagina === undefined) {
        porPagina = 15;
    }

    const [pagina, setPagina] = useState(0);
    const totalPaginas = Math.max(1, Math.ceil(filas.length / porPagina));

    useEffect(function () {
        if (pagina > totalPaginas - 1) setPagina(0);
    }, [filas.length, pagina, totalPaginas]);

    const visibles = filas.slice(pagina * porPagina, (pagina + 1) * porPagina);
    function alinear(columna) {
        return ALINEAR[columna.alinear] || '';
    }

    let contenidoFilas;
    if (visibles.length === 0) {
        let columnaAcciones = 0;
        if (acciones) {
            columnaAcciones = 1;
        }

        contenidoFilas = (
            <tr>
                <td colSpan={columnas.length + (columnaAcciones)} className="px-4 py-10 text-center text-suave">
                    {vacio}
                </td>
            </tr>
        );
    } else {
        contenidoFilas = visibles.map(function (fila, indice) {
            let clave;
            if (claveFila) {
                clave = claveFila(fila);
            } else {
                clave = indice;
            }

            let alPulsarFila;
            if (alClickFila) {
                alPulsarFila = function () {
                    return alClickFila(fila);
                };
            }

            let claseFila = 'hover:bg-stone-50';
            if (alClickFila) {
                claseFila = 'cursor-pointer hover:bg-vino-claro';
            }

            return (
                <tr
                    key={clave}
                    onClick={alPulsarFila}
                    className={`transition-colors duration-150 ${claseFila}`}
                >
                    {columnas.map(function (columna) {
                        let contenidoCelda;
                        if (columna.render) {
                            contenidoCelda = columna.render(fila);
                        } else {
                            contenidoCelda = fila[columna.campo];
                        }

                        return (
                            <td key={columna.campo || columna.titulo} className={`h-12 px-4 py-2.5 align-middle ${alinear(columna)}`}>
                                {contenidoCelda}
                            </td>
                        );
                    })}
                    {acciones && (
                        <td className="whitespace-nowrap px-4 py-2 text-right" onClick={(evento) => evento.stopPropagation()}>
                            {acciones(fila)}
                        </td>
                    )}
                </tr>
            );
        });
    }

    return (
        <div className="overflow-hidden rounded-lg border border-borde bg-white">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-borde bg-stone-50">
                            {columnas.map(function (columna) {
                                return (
                                    <th key={columna.campo || columna.titulo} scope="col"
                                        className={`whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-suave ${alinear(columna)}`}>
                                        {columna.titulo}
                                    </th>
                                );
                            })}
                            {acciones && (
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-suave">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody key={pagina} className="animate-difuminar divide-y divide-stone-100">
                        {contenidoFilas}
                    </tbody>
                </table>
            </div>
            {filas.length > porPagina && (
                <div className="flex items-center justify-between gap-3 border-t border-borde px-4 py-2.5 text-xs text-suave">
                    <button type="button" className="btn btn-sec btn-sm"
                        disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
                        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" /> Anterior
                    </button>
                    <span className="tabular-nums">Página {pagina + 1} de {totalPaginas} · {filas.length} registros</span>
                    <button type="button" className="btn btn-sec btn-sm"
                        disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(pagina + 1)}>
                        Siguiente <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
}
