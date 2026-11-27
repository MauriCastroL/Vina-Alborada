import { CircleAlert, CircleCheck, X } from 'lucide-react';

const ESTILOS = {
    exito: { color: 'text-exito', Icono: CircleCheck },
    error: { color: 'text-peligro', Icono: CircleAlert }
};

export default function Avisos(propiedades) {
    const mensajes = propiedades.mensajes;
    const alQuitar = propiedades.alQuitar;

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2"
            role="status" aria-live="polite">
            {mensajes.map(function (mensaje) {
                const { color, Icono } = ESTILOS[mensaje.tipo];
                let claseAnimacion = 'animate-entrar-derecha';
                if (mensaje.saliendo) {
                    claseAnimacion = 'animate-salir-derecha';
                }

                return (
                    <div key={mensaje.id}
                        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-borde bg-white py-3 pl-3.5 pr-2
                            text-sm text-tinta shadow-[0_8px_24px_-8px_rgba(38,34,31,0.25)]
                            ${claseAnimacion}`}>
                        <Icono size={18} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
                        <span className="flex-1 leading-snug">
                            {mensaje.tipo === 'error' && <span className="sr-only">Error: </span>}{mensaje.texto}
                        </span>
                        <button type="button" onClick={() => alQuitar(mensaje.id)} aria-label="Cerrar aviso"
                            className="-my-1 grid h-8 w-8 shrink-0 place-items-center rounded text-suave transition-colors hover:bg-stone-100 hover:text-tinta">
                            <X size={16} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
