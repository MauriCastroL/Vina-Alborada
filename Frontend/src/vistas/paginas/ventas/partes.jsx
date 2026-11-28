import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Volver() {
    return (
        <p className="mb-3 text-sm"><Link to="/ventas" className="inline-flex min-h-[36px] items-center gap-1.5 no-underline hover:underline"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />Volver a ventas</Link></p>
    );
}

export function Dato(propiedades) {
    const etiqueta = propiedades.etiqueta;
    const children = propiedades.children;
    const ancho = propiedades.ancho;

    let claseAncho = '';
    if (ancho) {
        claseAncho = 'col-span-full text-red-700';
    }

    return (
        <div className={claseAncho}>
            <span className="block text-xs font-medium uppercase tracking-wide text-suave">{etiqueta}</span>
            <span className="text-sm">{children}</span>
        </div>
    );
}

export function PanelAccion(propiedades) {
    const titulo = propiedades.titulo;
    const ayuda = propiedades.ayuda;
    const onSubmit = propiedades.onSubmit;
    const children = propiedades.children;

    return (
        <form className="tarjeta flex flex-col gap-3" onSubmit={onSubmit}>
            <div>
                <h3>{titulo}</h3>
                <p className="mt-0.5 text-xs text-suave">{ayuda}</p>
            </div>
            {children}
        </form>
    );
}
