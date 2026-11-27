import { Link } from 'react-router-dom';

export function PanelLista(propiedades) {
    const titulo = propiedades.titulo;
    const enlace = propiedades.enlace;
    const textoEnlace = propiedades.textoEnlace;
    const children = propiedades.children;

    return (
        <section className="flex min-w-0 flex-col rounded-lg border border-borde bg-white">
            <div className="flex min-h-[56px] items-center justify-between gap-3 border-b border-borde px-5">
                <h2 className="text-base">{titulo}</h2>
                {enlace && <Link to={enlace} className="text-sm font-medium no-underline hover:underline">{textoEnlace}</Link>}
            </div>
            {children}
        </section>
    );
}

export function ListaVacia(propiedades) {
    const texto = propiedades.texto;

    return <p className="px-5 py-8 text-center text-sm text-suave">{texto}</p>;
}
