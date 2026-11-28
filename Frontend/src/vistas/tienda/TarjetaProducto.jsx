import { cantidadConUnidad, dinero, esPorKilo, nombrePropio } from '../../utilidades/formato.js';
import Cantidad from './Cantidad.jsx';
import ImagenProducto from './ImagenProducto.jsx';

export default function TarjetaProducto(propiedades) {
    const producto = propiedades.producto;
    const cantidad = propiedades.cantidad;
    const alCambiarCantidad = propiedades.alCambiarCantidad;
    const alAgregar = propiedades.alAgregar;
    const agregando = propiedades.agregando;
    let fondo = propiedades.fondo;
    if (fondo === undefined) {
        fondo = 'bg-[#ece6dc] group-hover:bg-[#e6dfd3]';
    }

    const disponible = producto.DISPONIBILIDAD === 'DISPONIBLE';
    const porKilo = esPorKilo(producto.UNIDAD_MEDIDA);
    const detalle = [nombrePropio(producto.CATEGORIA), producto.FORMATO, producto.ANADA].filter(Boolean).join(' · ');
    let tamanoImagen = 'h-[80%]';
    let unidad = 'botella';
    if (porKilo) {
        tamanoImagen = 'h-[52%] w-[82%]';
        unidad = 'kg';
    }

    let claseDisponibilidadImagen = 'opacity-60 grayscale-[.4]';
    let claseDisponibilidad = 'text-peligro';
    let clasePunto = 'bg-peligro';
    let textoDisponibilidad = 'Agotado';
    if (disponible) {
        claseDisponibilidadImagen = '';
        claseDisponibilidad = 'text-exito';
        clasePunto = 'bg-exito';
        textoDisponibilidad = 'Disponible';
    }

    let contenidoBoton = 'Agregar';
    if (agregando) {
        contenidoBoton = <><span className="giro" aria-hidden="true" /> Agregando</>;
    }

    return (
        <article className="group flex flex-col">
            <div className={`flex aspect-[4/5] items-end justify-center overflow-hidden rounded-sm transition-colors duration-200 ${fondo}`}>
                <ImagenProducto producto={producto} className={`mb-[7%] transition-transform duration-300 ease-salida group-hover:-translate-y-1
                    ${tamanoImagen} ${claseDisponibilidadImagen}`} />
            </div>
            <div className="mt-4 flex flex-1 flex-col">
                <h3 className="font-marca text-[1.375rem] font-semibold leading-snug">{producto.NOMBRE}</h3>
                <p className="mt-0.5 text-[13px] text-suave">{detalle}</p>
                {producto.COMPOSICION && <p className="mt-2 text-sm font-medium text-vino">{nombrePropio(producto.COMPOSICION)}</p>}
                {producto.DESCRIPCION && <p className="mt-1.5 line-clamp-2 text-sm text-suave">{producto.DESCRIPCION}</p>}
                <div className="mt-auto pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                        <strong className="text-lg font-semibold tabular-nums">
                            {dinero(producto.PRECIO_ACTUAL)}
                            <span className="text-sm font-normal text-suave"> / {unidad}</span>
                        </strong>
                        <span className={`inline-flex items-center gap-1.5 text-xs ${claseDisponibilidad}`}>
                            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${clasePunto}`} />
                            {textoDisponibilidad}
                        </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Cantidad valor={cantidad} porKilo={porKilo} nombre={producto.NOMBRE} deshabilitado={!disponible}
                            alCambiar={alCambiarCantidad} />
                        <button type="button" className="btn min-h-[44px] flex-1" disabled={!disponible || agregando} onClick={alAgregar}>
                            {contenidoBoton}
                        </button>
                    </div>
                    <p className="mt-2 h-4 text-right text-xs tabular-nums text-suave" aria-live="polite">
                        {Number(cantidad) > 1 && disponible && (
                            <>{cantidadConUnidad(cantidad, producto.UNIDAD_MEDIDA)} = <strong className="font-medium text-tinta">{dinero(cantidad * producto.PRECIO_ACTUAL)}</strong></>
                        )}
                    </p>
                </div>
            </div>
        </article>
    );
}
