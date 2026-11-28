import TarjetaProducto from './TarjetaProducto.jsx';

export default function GrillaProductos(propiedades) {
    const productos = propiedades.productos;
    const clave = propiedades.clave;
    const cantidades = propiedades.cantidades;
    const agregando = propiedades.agregando;
    const alComprar = propiedades.alComprar;
    const alCambiarCantidad = propiedades.alCambiarCantidad;
    const fondo = propiedades.fondo;

    return (
        <div key={clave} className="escalonado grid grid-cols-1 gap-x-8 gap-y-14 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map(function (producto) {
                return (
                    <TarjetaProducto key={producto.ID_PRODUCTO} producto={producto} fondo={fondo}
                        cantidad={cantidades[producto.ID_PRODUCTO] ?? 1}
                        alCambiarCantidad={alCambiarCantidad(producto.ID_PRODUCTO)}
                        agregando={agregando === producto.ID_PRODUCTO}
                        alAgregar={() => alComprar(producto)} />
                );
            })}
        </div>
    );
}
