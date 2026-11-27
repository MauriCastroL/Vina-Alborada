import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../controladores/SesionContexto.jsx';

export function Protegida(propiedades) {
    const children = propiedades.children;

    const { sesion } = useSesion();
    const { pathname } = useLocation();
    if (sesion) {
        return children;
    }
    return <Navigate to={`/login?volver=${encodeURIComponent(pathname)}`} replace />;
}

export function ConModulo(propiedades) {
    const modulo = propiedades.modulo;
    const children = propiedades.children;

    const { tiene } = useSesion();
    if (!tiene(modulo)) {
        return (
            <section>
                <h1>Sin acceso</h1>
                <p className="text-sm text-suave">Tu perfil no tiene permiso para este módulo.</p>
            </section>
        );
    }
    return children;
}
