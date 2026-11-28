import { Search } from 'lucide-react';

const ORDENES = {
    vendidos: 'Más vendidos primero',
    menorPrecio: 'Precio: menor a mayor',
    mayorPrecio: 'Precio: mayor a menor',
    nombre: 'Nombre (A-Z)'
};

export default function BarraCatalogo(propiedades) {
    const busqueda = propiedades.busqueda;
    const alBuscar = propiedades.alBuscar;
    const orden = propiedades.orden;
    const alOrdenar = propiedades.alOrdenar;
    const resultados = propiedades.resultados;
    const hayUva = propiedades.hayUva;

    let descripcionCatalogo;
    const textoBuscado = busqueda.trim();
    if (textoBuscado) {
        let sufijoResultados = 's';
        if (resultados === 1) {
            sufijoResultados = '';
        }

        descripcionCatalogo = `${resultados} resultado${sufijoResultados} para «${textoBuscado}»`;
    } else {
        descripcionCatalogo = 'Vinos embotellados.';
        if (hayUva) {
            descripcionCatalogo = 'Vinos embotellados y uva a granel por kilo.';
        }
    }

    let marcadorBusqueda = 'Buscar vino o cepa';
    if (hayUva) {
        marcadorBusqueda = 'Buscar vino, uva o cepa';
    }

    return (
        <div className="mb-10 flex flex-col gap-4 border-y border-borde py-4 lg:flex-row lg:items-center">
            <p className="text-sm text-suave">
                {descripcionCatalogo}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
                <label className="relative sm:w-72">
                    <span className="sr-only">Buscar por nombre o cepa</span>
                    <Search size={18} strokeWidth={1.75} aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave" />
                    <input type="search" placeholder={marcadorBusqueda} value={busqueda}
                        onChange={(evento) => alBuscar(evento.target.value)} className="w-full !pl-10" />
                </label>
                <label className="flex items-center gap-2 text-sm text-suave">
                    <span className="shrink-0">Ordenar</span>
                    <select value={orden} onChange={(evento) => alOrdenar(evento.target.value)} className="flex-1 sm:flex-none">
                        {Object.entries(ORDENES).map(function ([valor, texto]) {
                            return <option key={valor} value={valor}>{texto}</option>;
                        })}
                    </select>
                </label>
            </div>
        </div>
    );
}
