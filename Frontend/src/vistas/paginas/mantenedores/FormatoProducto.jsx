import { esPorKilo } from '../../../utilidades/formato.js';

export function formatoProducto(valores, categoria) {
    const porPeso = esPorKilo(categoria?.UNIDAD_MEDIDA);
    let unidades = [];
    if (porPeso) {
        unidades = ['g', 'kg', 'T'];
    } else if (categoria) {
        unidades = ['ml', 'l'];
    }
    const formato = /^(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg|t)$/i.exec(String(valores.FORMATO ?? '').trim());
    const anterior = unidades.find((unidad) => unidad.toLowerCase() === formato?.[2].toLowerCase());
    const medida = categoria?.UNIDAD_MEDIDA;
    let borrador = null;
    if (valores.FORMATO_EDICION?.medida === medida) {
        borrador = valores.FORMATO_EDICION;
    }
    const seleccion = borrador?.unidad ?? anterior;
    let cantidadAnterior = '';
    if (anterior) {
        cantidadAnterior = formato[1].replace(',', '.');
    }

    let unidad = '';
    if (unidades.includes(seleccion)) {
        unidad = seleccion;
    }

    return {
        porPeso,
        unidades,
        cantidad: borrador?.cantidad ?? cantidadAnterior,
        unidad: unidad
    };
}

export default function FormatoProducto(propiedades) {
    const valores = propiedades.valores;
    const categoria = propiedades.categoria;
    const alCambiar = propiedades.alCambiar;

    const formato = formatoProducto(valores, categoria);
    const cantidad = formato.cantidad;
    const unidad = formato.unidad;
    let etiquetaCantidad = 'Cantidad';
    let ejemplo;
    if (categoria) {
        if (formato.porPeso) {
            etiquetaCantidad = 'Peso';
            ejemplo = '1';
        } else {
            etiquetaCantidad = 'Volumen por botella';
            ejemplo = '750';
        }
    }

    function cambiar(cambios) {
        alCambiar({
            ...valores,
            FORMATO_EDICION: { medida: categoria.UNIDAD_MEDIDA, cantidad, unidad, ...cambios }
        });
    }

    return (
        <fieldset className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3" disabled={!categoria}>
            <legend className="mb-2 text-sm font-semibold">Formato del producto</legend>
            <label className="flex flex-col gap-1 text-sm font-medium">
                {etiquetaCantidad}
                <input type="number" min="0" step="any" required value={cantidad}
                    placeholder={ejemplo}
                    onChange={(evento) => cambiar({ cantidad: evento.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
                Unidad
                <select required value={unidad}
                    onChange={(evento) => cambiar({ unidad: evento.target.value })}>
                    <option value="">Selecciona una unidad</option>
                    {formato.unidades.map(function (opcion) {
                        return <option key={opcion} value={opcion}>{opcion}</option>;
                    })}
                </select>
            </label>
        </fieldset>
    );
}
