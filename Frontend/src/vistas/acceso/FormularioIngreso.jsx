import { useIngreso } from '../../controladores/useIngreso.js';
import CampoClave from '../componentes/CampoClave.jsx';
import AlertaError from './AlertaError.jsx';
import Campo from './Campo.jsx';

export default function FormularioIngreso(propiedades) {
    const alEntrar = propiedades.alEntrar;

    const formulario = useIngreso(alEntrar);

    let contenidoBoton = 'Ingresar';
    if (formulario.enviando) {
        contenidoBoton = <><span className="giro" aria-hidden="true" /> Ingresando...</>;
    }

    return (
        <form onSubmit={formulario.entrar} className="flex flex-col gap-4">
            <Campo id="correo" etiqueta="Correo">
                <input id="correo" type="email" value={formulario.correo} onChange={(evento) => formulario.setCorreo(evento.target.value)}
                    required autoComplete="username" autoFocus />
            </Campo>
            <Campo id="clave" etiqueta="Contraseña">
                <CampoClave id="clave" value={formulario.clave} onChange={(evento) => formulario.setClave(evento.target.value)}
                    required autoComplete="current-password" />
            </Campo>

            <AlertaError texto={formulario.error} />

            <button type="submit" className="btn mt-1 min-h-[48px] w-full text-[15px]" disabled={formulario.enviando}>
                {contenidoBoton}
            </button>
            <p className="text-center text-xs text-suave">
                Tras 5 intentos fallidos la cuenta se bloquea por 15 minutos.
            </p>
        </form>
    );
}
