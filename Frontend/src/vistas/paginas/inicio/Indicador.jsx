import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Indicador(propiedades) {
    const ruta = propiedades.ruta;
    const etiqueta = propiedades.etiqueta;
    const valor = propiedades.valor;
    const detalle = propiedades.detalle;
    const alerta = propiedades.alerta;

    let claseAlerta = '';
    if (alerta) {
        claseAlerta = 'text-peligro';
    }

    return (
        <Link to={ruta} className="group flex flex-col gap-1 px-6 py-5 text-tinta no-underline transition-colors duration-150 hover:bg-stone-50">
            <span className="text-sm text-suave">{etiqueta}</span>
            <strong className={`text-[2rem] font-semibold leading-tight tracking-[-0.02em] tabular-nums ${claseAlerta}`}>
                {valor}
            </strong>
            <span className="flex items-center gap-1.5 text-sm text-suave">
                {detalle}
                <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true"
                    className="opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </span>
        </Link>
    );
}
