import CampoClave from './CampoClave.jsx';

export default function Formulario(propiedades) {
    const campos = propiedades.campos;
    const valores = propiedades.valores;
    const alCambiar = propiedades.alCambiar;
    const modo = propiedades.modo;

    const camposVisibles = campos.filter((campo) => !campo.visible || campo.visible(valores, modo));

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {camposVisibles.map(function (campo) {
                const valor = valores[campo.nombre] ?? '';
                function cambiar(nuevoValor) {
                    return alCambiar({ ...valores, [campo.nombre]: nuevoValor });
                }
                function cambiarTexto(evento) {
                    cambiar(evento.target.value);
                }

                let deshabilitado = false;
                if (campo.deshabilitado) {
                    deshabilitado = campo.deshabilitado(valores, modo);
                }
                let requerido = campo.requerido;
                if (typeof requerido === 'function') {
                    requerido = campo.requerido(valores, modo);
                }
                const id = `campo-${campo.nombre}`;
                let control;

                if (campo.tipo === 'select') {
                    control = (
                        <select id={id} value={valor} onChange={cambiarTexto}
                            disabled={deshabilitado} required={requerido}>
                            <option value="">{campo.placeholder || 'Seleccione...'}</option>
                            {(campo.opciones || []).map(function (opcion) {
                                return (
                                    <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>
                                );
                            })}
                        </select>
                    );
                } else if (campo.tipo === 'textarea') {
                    control = (
                        <textarea id={id} value={valor} rows={3} onChange={cambiarTexto}
                            disabled={deshabilitado} required={requerido} placeholder={campo.placeholder} />
                    );
                } else if (campo.tipo === 'checkbox') {
                    function cambiarCasilla(evento) {
                        let valorCasilla = 0;
                        if (evento.target.checked) {
                            valorCasilla = 1;
                        }

                        return cambiar(valorCasilla);
                    }

                    control = (
                        <label className="casilla py-2">
                            <input id={id} type="checkbox" checked={Number(valor) === 1}
                                onChange={cambiarCasilla} disabled={deshabilitado} />
                            {campo.textoCasilla || 'Sí'}
                        </label>
                    );
                } else if (campo.tipo === 'password') {
                    control = (
                        <CampoClave id={id} value={valor} onChange={cambiarTexto}
                            disabled={deshabilitado} required={requerido} placeholder={campo.placeholder}
                            autoComplete={campo.autocompletar || 'off'} />
                    );
                } else {
                    let alPresionarTecla;
                    if (campo.tipo === 'search') {
                        alPresionarTecla = function (evento) {
                            if (evento.key === 'Enter') evento.preventDefault();
                        };
                    }

                    control = (
                        <input id={id} type={campo.tipo || 'text'} value={valor}
                            onChange={cambiarTexto} disabled={deshabilitado}
                            required={requerido} placeholder={campo.placeholder}
                            onKeyDown={alPresionarTecla}
                            min={campo.min} max={campo.max} step={campo.paso} autoComplete={campo.autocompletar || 'off'} />
                    );
                }

                let claseAncho = '';
                if (campo.ancho === 'completo') {
                    claseAncho = 'sm:col-span-2';
                }

                return (
                    <div key={campo.nombre} className={`flex flex-col gap-1 ${claseAncho}`}>
                        <label htmlFor={id} className="text-sm font-medium">
                            {campo.etiqueta}{requerido && <span className="text-peligro" aria-hidden="true"> *</span>}
                        </label>
                        {control}
                        {campo.ayuda && <small className="text-xs text-suave">{campo.ayuda}</small>}
                    </div>
                );
            })}
        </div>
    );
}
