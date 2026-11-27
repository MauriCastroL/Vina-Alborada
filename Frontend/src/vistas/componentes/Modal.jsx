import { X } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ANCHOS = { chico: 'max-w-md', normal: 'max-w-2xl', grande: 'max-w-4xl' };
const DURACION_SALIDA = 160;

export default function Modal(propiedades) {
    const titulo = propiedades.titulo;
    const abierto = propiedades.abierto;
    const alCerrar = propiedades.alCerrar;
    const children = propiedades.children;
    let ancho = propiedades.ancho;
    if (ancho === undefined) {
        ancho = 'normal';
    }

    const [montado, setMontado] = useState(abierto);
    const ultimo = useRef({ titulo, children });
    const caja = useRef(null);
    const cerrarConEscape = useEffectEvent(function () {
        return alCerrar();
    });
    if (abierto) ultimo.current = { titulo, children };

    useEffect(function () {
        if (abierto) {
            setMontado(true);
            return undefined;
        }
        const temporizador = setTimeout(function () {
            return setMontado(false);
        }, DURACION_SALIDA);
        return function () {
            return clearTimeout(temporizador);
        };
    }, [abierto]);

    useEffect(function () {
        if (!abierto) return undefined;
        const anterior = document.activeElement;
        function tecla(evento) {
            return evento.key === 'Escape' && cerrarConEscape();
        }
        window.addEventListener('keydown', tecla);
        document.body.style.overflow = 'hidden';
        const foco = requestAnimationFrame(function () {
            if (caja.current && !caja.current.contains(document.activeElement)) caja.current.focus();
        });
        return function () {
            cancelAnimationFrame(foco);
            window.removeEventListener('keydown', tecla);
            document.body.style.overflow = '';
            if (anterior && typeof anterior.focus === 'function') anterior.focus();
        };
    }, [abierto]);

    if (!montado && !abierto) return null;
    const saliendo = !abierto;
    let claseFondo = 'animate-difuminar';
    if (saliendo) {
        claseFondo = 'opacity-0';
    }

    let alPulsarFondo;
    if (saliendo) {
        alPulsarFondo = undefined;
    } else {
        alPulsarFondo = alCerrar;
    }

    let claseVentana = 'animate-escalar';
    if (saliendo) {
        claseVentana = 'translate-y-1 scale-[.98] opacity-0';
    }

    return createPortal(
        <div className={`fixed inset-0 z-50 overflow-y-auto bg-carbon/50 transition-opacity duration-150 ${claseFondo}`}
            onMouseDown={alPulsarFondo}>
            <div className="flex min-h-full items-center justify-center px-4 py-8">
                <div ref={caja} tabIndex={-1}
                    className={`w-full rounded-lg bg-white shadow-[0_24px_48px_-12px_rgba(20,18,16,0.35)] outline-none transition-[opacity,transform] duration-150 ${ANCHOS[ancho]}
                        ${claseVentana}`}
                    role="dialog" aria-modal="true" aria-label={ultimo.current.titulo} onMouseDown={(evento) => evento.stopPropagation()}>
                    <div className="flex items-center justify-between gap-4 border-b border-borde py-3 pl-6 pr-3">
                        <h2>{ultimo.current.titulo}</h2>
                        <button type="button" onClick={alCerrar} aria-label="Cerrar"
                            className="grid h-10 w-10 place-items-center rounded-md text-suave transition-colors hover:bg-stone-100 hover:text-tinta">
                            <X size={20} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                    </div>
                    <div className="p-6">{ultimo.current.children}</div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export function Pie(propiedades) {
    const children = propiedades.children;

    return <div className="mt-6 flex flex-wrap justify-end gap-2">{children}</div>;
}
