import { dinero, esPorKilo, nombrePropio } from '../../utilidades/formato.js';
import ImagenProducto from './ImagenProducto.jsx';

export default function Destacado(propiedades) {
    const producto = propiedades.producto;
    const posicion = propiedades.posicion;
    const alAgregar = propiedades.alAgregar;
    const agregando = propiedades.agregando;

    const porKilo = esPorKilo(producto.UNIDAD_MEDIDA);
    const disponible = producto.DISPONIBILIDAD === 'DISPONIBLE';
    let claseImagen = 'h-[80%]';
    if (porKilo) {
        claseImagen = 'h-[52%] w-[80%]';
    }

    let descripcionProducto;
    if (producto.COMPOSICION) {
        descripcionProducto = nombrePropio(producto.COMPOSICION);
    } else {
        descripcionProducto = nombrePropio(producto.CATEGORIA);
    }

    let unidad = 'botella';
    if (porKilo) {
        unidad = 'kg';
    }

    let contenidoBoton;
    if (agregando) {
        contenidoBoton = <><span className="giro" aria-hidden="true" /> Agregando</>;
    } else {
        contenidoBoton = 'Agotado';
        if (disponible) {
            contenidoBoton = 'Agregar';
        }
    }

    return (
        <article className="group flex flex-col">
            <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-sm bg-carbon-elevado">
                <span aria-hidden="true" className="absolute left-1/2 top-[18%] aspect-square w-[78%] -translate-x-1/2 rounded-full
                    bg-[radial-gradient(circle_at_50%_40%,#3a2a22_0%,#2a211c_55%,transparent_72%)]" />
                <span aria-hidden="true" className="absolute left-5 top-4 font-marca text-xl text-bronce tabular-nums">
                    {String(posicion).padStart(2, '0')}
                </span>
                <ImagenProducto producto={producto} className={`relative mb-[8%] transition-transform duration-300 ease-salida group-hover:-translate-y-1
                    ${claseImagen}`} />
            </div>
            <div className="mt-5 flex flex-1 flex-col">
                <h3 className="font-marca text-2xl font-medium leading-snug text-inverso">{producto.NOMBRE}</h3>
                <p className="mt-1 text-sm text-inverso-suave">
                    {descripcionProducto}
                    {porKilo && ' · venta por kilo'}
                </p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                    <strong className="text-lg font-semibold tabular-nums text-inverso">
                        {dinero(producto.PRECIO_ACTUAL)}
                        <span className="text-sm font-normal text-inverso-suave"> / {unidad}</span>
                    </strong>
                    <button type="button" onClick={alAgregar} disabled={!disponible || agregando}
                        className="btn btn-contorno-claro min-h-[44px]">
                        {contenidoBoton}
                    </button>
                </div>
            </div>
        </article>
    );
}
