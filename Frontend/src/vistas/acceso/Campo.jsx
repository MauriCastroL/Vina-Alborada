export default function Campo(propiedades) {
    const id = propiedades.id;
    const etiqueta = propiedades.etiqueta;
    const requerido = propiedades.requerido;
    const ayuda = propiedades.ayuda;
    const children = propiedades.children;

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium">
                {etiqueta}{requerido && <span className="text-peligro" aria-hidden="true"> *</span>}
            </label>
            {children}
            {ayuda && <small className="text-xs text-suave">{ayuda}</small>}
        </div>
    );
}
