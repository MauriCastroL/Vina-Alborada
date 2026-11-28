import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useSesion } from '../../controladores/SesionContexto.jsx';
import { destinoTrasEntrar } from '../../utilidades/destino.js';
import FormularioIngreso from '../acceso/FormularioIngreso.jsx';
import FormularioRegistro from '../acceso/FormularioRegistro.jsx';

export default function Login() {
    const { sesion } = useSesion();
    const [parametros] = useSearchParams();
    let pestanaInicial = 'ingreso';
    if (parametros.get('modo') === 'registro') {
        pestanaInicial = 'registro';
    }

    const [pestana, setPestana] = useState(pestanaInicial);

    if (sesion) return <Navigate to={destinoTrasEntrar(sesion.usuario, parametros.get('volver'))} replace />;

    const registro = pestana === 'registro';
    function alEntrar() { }

    let anchoFormulario = 'max-w-[420px]';
    if (registro) {
        anchoFormulario = 'max-w-[480px]';
    }

    let tituloFormulario = 'Inicia sesión';
    if (registro) {
        tituloFormulario = 'Crea tu cuenta';
    }

    let descripcionFormulario = 'Ingresa con tu correo y contraseña.';
    if (registro) {
        descripcionFormulario = 'Regístrate para hacer pedidos en la tienda en línea.';
    }

    let claseIndicador = '';
    if (registro) {
        claseIndicador = 'translate-x-full';
    }

    let formulario;
    if (registro) {
        formulario = <FormularioRegistro alEntrar={alEntrar} />;
    } else {
        formulario = <FormularioIngreso alEntrar={alEntrar} />;
    }

    return (
        <div className="min-h-screen bg-marfil lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(520px,600px)]">
            <aside aria-hidden="true" className="relative hidden overflow-hidden bg-carbon lg:block">
                <img src="/img/vinedo-alborada.webp" alt="" className="absolute inset-0 h-full w-full animate-difuminar object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/20 to-carbon/30" />
                <div className="absolute inset-x-0 bottom-0 p-12 text-inverso">
                    <p className="max-w-md font-marca text-4xl font-medium leading-tight">Vinos con carácter, desde nuestra viña.</p>
                </div>
            </aside>

            <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
                <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 self-start text-sm font-medium no-underline hover:underline">
                    <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> Volver a la tienda
                </Link>
                <div className={`mx-auto my-auto w-full py-10 ${anchoFormulario}`}>
                    <img src="/img/logo-completo.png" alt="Viña Alborada, vinos y viñedos" className="w-44" />
                    <h1 className="mt-8 block font-marca text-[2.5rem] font-medium leading-tight">
                        {tituloFormulario}
                    </h1>
                    <p className="mt-2 text-[15px] text-suave">
                        {descripcionFormulario}
                    </p>

                    <div className="relative mb-6 mt-8 flex border-b border-borde" role="tablist" aria-label="Acceso">
                        <span aria-hidden="true" className={`absolute -bottom-px left-0 h-0.5 w-1/2 bg-vino transition-transform duration-200 ease-salida ${claseIndicador}`} />
                        {[['ingreso', 'Iniciar sesión'], ['registro', 'Crear cuenta']].map(function ([valor, texto]) {
                            let clasePestana = 'text-suave hover:text-tinta';
                            if (pestana === valor) {
                                clasePestana = 'text-vino';
                            }

                            return (
                                <button key={valor} type="button" role="tab" aria-selected={pestana === valor}
                                    onClick={() => setPestana(valor)}
                                    className={`min-h-[44px] flex-1 text-sm font-medium transition-colors duration-150 ${clasePestana}`}>
                                    {texto}
                                </button>
                            );
                        })}
                    </div>

                    <div key={pestana} className="animate-aparecer">
                        {formulario}
                    </div>
                </div>
            </main>
        </div>
    );
}
