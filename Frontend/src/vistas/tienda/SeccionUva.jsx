// Vista: seccion "Uva a granel" (solo si hay al menos una variedad activa)
import GrillaProductos from './GrillaProductos.jsx';

export default function SeccionUva(propiedades) {
    const hayUva = propiedades.hayUva;
    const uvas = propiedades.uvas;
    const orden = propiedades.orden;
    const opcionesGrilla = propiedades.opcionesGrilla;

    if (!hayUva) return null;
    let contenidoUvas;
    if (uvas.length === 0) {
        contenidoUvas = <p className="py-8 text-center text-suave">No hay uva que coincida con la búsqueda.</p>;
    } else {
        contenidoUvas = <GrillaProductos productos={uvas} clave={orden} {...opcionesGrilla} fondo="bg-marfil group-hover:bg-white" />;
    }

    return (
        <section id="uva" aria-labelledby="titulo-uva" className="scroll-mt-16 border-t border-borde bg-[#efe9df]">
            <div className="mx-auto max-w-tienda px-4 py-20 sm:px-8 lg:px-14 lg:py-24">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <h2 id="titulo-uva" className="font-marca text-4xl font-medium tracking-[-0.005em] lg:text-5xl">Uva a granel</h2>
                    <p className="max-w-sm text-sm text-suave">Venta por kilo. Indica los kilos que necesitas antes de agregar.</p>
                </div>
                {contenidoUvas}
            </div>
        </section>
    );
}
