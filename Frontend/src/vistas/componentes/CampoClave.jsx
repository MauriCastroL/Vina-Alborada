import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function CampoClave(propiedades) {
    const { id, value, onChange, className = '', ...atributosEntrada } = propiedades;
    const [visible, setVisible] = useState(false);

    let Icono = Eye;
    let tipoEntrada = 'password';
    let etiquetaVisibilidad = 'Mostrar contraseña';
    if (visible) {
        Icono = EyeOff;
        tipoEntrada = 'text';
        etiquetaVisibilidad = 'Ocultar contraseña';
    }

    function alternarVisibilidad() {
        setVisible(function (visibleAntes) {
            return !visibleAntes;
        });
    }

    return (
        <div className="relative">
            <input id={id} type={tipoEntrada} value={value} onChange={onChange}
                className={`w-full pr-11 ${className}`} {...atributosEntrada} />
            <button type="button" onClick={alternarVisibilidad}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-suave transition-colors hover:text-vino"
                aria-label={etiquetaVisibilidad} title={etiquetaVisibilidad}
                aria-pressed={visible} disabled={atributosEntrada.disabled}>
                <Icono size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
        </div>
    );
}
