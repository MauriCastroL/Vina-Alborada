import { useRegistro } from '../../controladores/useRegistro.js';
import CampoClave from '../componentes/CampoClave.jsx';
import AlertaError from './AlertaError.jsx';
import Campo from './Campo.jsx';

export default function FormularioRegistro(propiedades) {
    const alEntrar = propiedades.alEntrar;

    const { datosCliente, esEmpresa, cambiar, elegirTipo, formatearRutIngresado, error, enviando, crear } = useRegistro(alEntrar);

    let claseIndicador = '';
    if (esEmpresa) {
        claseIndicador = 'translate-x-[calc(100%+4px)]';
    }

    let camposIdentidad;
    if (esEmpresa) {
        camposIdentidad = (
            <div className="animate-aparecer"><Campo id="razonSocial" etiqueta="Razón social" requerido>
                <input id="razonSocial" value={datosCliente.razonSocial} onChange={cambiar('razonSocial')}
                    required maxLength={150} autoComplete="organization" />
            </Campo></div>
        );
    } else {
        camposIdentidad = (
            <div className="flex animate-aparecer flex-col gap-4">
                <Campo id="nombre" etiqueta="Nombre" requerido>
                    <input id="nombre" value={datosCliente.nombre} onChange={cambiar('nombre')}
                        required maxLength={100} autoComplete="given-name" autoFocus />
                </Campo>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Campo id="apellido1" etiqueta="Apellido paterno" requerido>
                        <input id="apellido1" value={datosCliente.apellido1} onChange={cambiar('apellido1')}
                            required maxLength={100} autoComplete="family-name" />
                    </Campo>
                    <Campo id="apellido2" etiqueta="Apellido materno" requerido>
                        <input id="apellido2" value={datosCliente.apellido2} onChange={cambiar('apellido2')}
                            required maxLength={100} />
                    </Campo>
                </div>
            </div>
        );
    }

    let ayudaRut = 'Opcional';
    if (esEmpresa) {
        ayudaRut = null;
    }

    let contenidoBoton = 'Crear cuenta';
    if (enviando) {
        contenidoBoton = <><span className="giro" aria-hidden="true" /> Creando cuenta...</>;
    }

    return (
        <form onSubmit={crear} className="flex flex-col gap-4">
            <div className="relative grid grid-cols-2 gap-1 rounded-md border border-borde bg-stone-100 p-1 text-sm" role="radiogroup" aria-label="Tipo de cliente">
                <span aria-hidden="true" className={`absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded bg-white shadow-[0_1px_2px_rgba(38,34,31,0.1)] transition-transform duration-200 ease-salida ${claseIndicador}`} />
                {[['NATURAL', 'Persona'], ['EMPRESA', 'Empresa']].map(function ([valor, texto]) {
                    let claseTipo = 'text-suave hover:text-tinta';
                    if (datosCliente.tipoCliente === valor) {
                        claseTipo = 'text-vino';
                    }

                    return (
                        <button key={valor} type="button" role="radio" aria-checked={datosCliente.tipoCliente === valor}
                            onClick={() => elegirTipo(valor)}
                            className={`relative z-10 min-h-[38px] rounded font-medium transition-colors duration-150 ${claseTipo}`}>
                            {texto}
                        </button>
                    );
                })}
            </div>

            {camposIdentidad}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo id="rut" etiqueta="RUT" requerido={esEmpresa} ayuda={ayudaRut}>
                    <input id="rut" value={datosCliente.rut} onChange={cambiar('rut')} onBlur={formatearRutIngresado}
                        required={esEmpresa} maxLength={12} placeholder="12.345.678-9" />
                </Campo>
                <Campo id="telefono" etiqueta="Teléfono" ayuda="Opcional">
                    <input id="telefono" type="tel" value={datosCliente.telefono} onChange={cambiar('telefono')}
                        maxLength={20} placeholder="+56 9 1234 5678" autoComplete="tel" />
                </Campo>
            </div>

            <Campo id="correoRegistro" etiqueta="Correo" requerido ayuda="Lo usarás para iniciar sesión">
                <input id="correoRegistro" type="email" value={datosCliente.correo} onChange={cambiar('correo')}
                    required maxLength={150} autoComplete="email" />
            </Campo>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo id="claveRegistro" etiqueta="Contraseña" requerido ayuda="Mínimo 6 caracteres">
                    <CampoClave id="claveRegistro" value={datosCliente.clave} onChange={cambiar('clave')}
                        required minLength={6} autoComplete="new-password" />
                </Campo>
                <Campo id="repetir" etiqueta="Repetir contraseña" requerido>
                    <CampoClave id="repetir" value={datosCliente.repetir} onChange={cambiar('repetir')}
                        required autoComplete="new-password" />
                </Campo>
            </div>

            <AlertaError texto={error} />

            <button type="submit" className="btn mt-1 min-h-[48px] w-full text-[15px]" disabled={enviando}>
                {contenidoBoton}
            </button>
        </form>
    );
}
