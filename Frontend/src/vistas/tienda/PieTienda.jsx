import { Link } from 'react-router-dom';
import { useSesion } from '../../controladores/SesionContexto.jsx';
import { irASeccion } from '../../utilidades/navegacion.js';

export default function PieTienda(propiedades) {
    const hayDestacados = propiedades.hayDestacados;
    const hayUva = propiedades.hayUva;

    const { usuario } = useSesion();
    const claseEnlace = 'enlace-linea text-sm text-inverso-suave hover:text-inverso';
    let enlaceCuenta;
    if (usuario?.rol === 'CLIENTE') {
        enlaceCuenta = <Link to="/mis-pedidos" className={claseEnlace}>Mis pedidos</Link>;
    } else if (usuario) {
        enlaceCuenta = <Link to="/inicio" className={claseEnlace}>Panel de gestión</Link>;
    } else {
        enlaceCuenta = <Link to="/login" className={claseEnlace}>Iniciar sesión</Link>;
    }

    return (
        <footer className="tema-oscuro bg-carbon text-inverso">
            <div className="mx-auto grid max-w-tienda gap-10 px-4 py-14 sm:px-8 md:grid-cols-12 lg:px-14">
                <div className="md:col-span-5">
                    <div className="flex items-center gap-3">
                        <img src="/img/logo-emblema.png" alt="" className="h-11 w-11 rounded-md bg-marfil object-contain p-0.5" />
                        <span className="font-marca text-2xl font-semibold">Viña La Alborada</span>
                    </div>
                    <p className="mt-5 max-w-sm text-sm leading-relaxed text-inverso-suave">
                        Ley N° 19.925: prohibida la venta de bebidas alcohólicas a menores de 18 años. Disfruta con moderación.
                    </p>
                </div>
                <nav aria-label="Enlaces del pie" className="md:col-span-3">
                    <ul className="flex flex-col gap-3">
                        <li><a href="#vinos" onClick={irASeccion('vinos')} className={claseEnlace}>Vinos</a></li>
                        {hayUva && <li><a href="#uva" onClick={irASeccion('uva')} className={claseEnlace}>Uva</a></li>}
                        {hayDestacados && <li><a href="#destacados" onClick={irASeccion('destacados')} className={claseEnlace}>Más vendidos</a></li>}
                        <li>
                            {enlaceCuenta}
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
}
