import { useEffect, useState } from 'react';

export function useEncabezadoTienda() {
    const [solido, setSolido] = useState(false);
    const [abierto, setAbierto] = useState(false);

    useEffect(function () {
        function alDesplazar() {
            return setSolido(window.scrollY > 24);
        }
        alDesplazar();
        window.addEventListener('scroll', alDesplazar, { passive: true });
        return function () {
            return window.removeEventListener('scroll', alDesplazar);
        };
    }, []);

    useEffect(function () {
        if (!abierto) return undefined;
        function tecla(evento) {
            return evento.key === 'Escape' && setAbierto(false);
        }
        window.addEventListener('keydown', tecla);
        document.body.style.overflow = 'hidden';
        return function () {
            window.removeEventListener('keydown', tecla);
            document.body.style.overflow = '';
        };
    }, [abierto]);

    return { solido, abierto, setAbierto };
}
