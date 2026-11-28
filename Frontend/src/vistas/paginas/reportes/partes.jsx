export const VINO = '#65283b';
export const PIZARRA = '#315c75';
export const COBRE = '#78562f';
export const REJILLA = '#ece8e1';
export const CURSOR = { fill: '#f4ecee' };
export const EJE = { fontSize: 12, fill: '#665f57' };
export const TOOLTIP = { contentStyle: { borderRadius: 6, borderColor: '#ded9d0', fontSize: 13 }, labelStyle: { color: '#26221f', fontWeight: 600 } };
export const BARRA = { radius: [3, 3, 0, 0], maxBarSize: 32 };

export function pesosCortos(valor) {
    if (valor >= 1e6) {
        return `$${(valor / 1e6).toFixed(1)} M`;
    }
    if (valor >= 1e3) {
        return `$${Math.round(valor / 1e3)} mil`;
    }
    return `$${valor}`;
}

export function Reporte(propiedades) {
    const titulo = propiedades.titulo;
    const pregunta = propiedades.pregunta;
    const filtros = propiedades.filtros;
    const children = propiedades.children;

    return (
        <article className="mb-6 rounded-lg border border-borde bg-white p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2>{titulo}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-suave">{pregunta}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">{filtros}</div>
            </div>
            {children}
        </article>
    );
}

export function Cifras(propiedades) {
    const children = propiedades.children;

    return <div className="mb-5 grid gap-y-4 border-y border-stone-100 py-4 sm:grid-cols-2 sm:divide-x sm:divide-stone-100 lg:grid-cols-3">{children}</div>;
}

export function Cifra(propiedades) {
    const etiqueta = propiedades.etiqueta;
    const valor = propiedades.valor;
    const detalle = propiedades.detalle;

    return (
        <div className="flex min-w-0 flex-col gap-1 sm:px-5 sm:first:pl-0">
            <span className="text-sm text-suave">{etiqueta}</span>
            <strong className="text-2xl font-semibold leading-tight tracking-[-0.015em] tabular-nums">{valor}</strong>
            {detalle && <small className="text-sm text-suave">{detalle}</small>}
        </div>
    );
}

export function ErrorReporte(propiedades) {
    const texto = propiedades.texto;

    if (texto) {
        return <p className="mb-3 text-sm font-medium text-peligro">{texto}</p>;
    }
    return null;
}
export function Vacio(propiedades) {
    const texto = propiedades.texto;

    return <p className="py-6 text-center text-sm text-suave">{texto}</p>;
}
