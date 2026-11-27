// Vista: composicion de cepas de un producto (debe sumar 100% para activarlo)
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CEPAS } from '../../../modelos/mantenedoresModelo.js';
import { nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Modal from '../../componentes/Modal.jsx';

export default function ComposicionCepas(propiedades) {
    const producto = propiedades.producto;
    const alCerrar = propiedades.alCerrar;

    const { datos: cepas } = useDatos(RUTA_CEPAS);
    const [total, setTotal] = useState(0);
    if (!producto) return null;

    let claseTotal = 'font-semibold text-red-700';
    if (total === 100) {
        claseTotal = 'font-semibold text-emerald-700';
    }

    function actualizarTotal(filas) {
        return setTotal(filas.reduce((suma, fila) => suma + Number(fila.PORCENTAJE), 0));
    }

    return (
        <Modal titulo={`Cepas de ${producto.NOMBRE}`} abierto={!!producto} alCerrar={alCerrar} ancho="grande">
            <p className="mb-3 text-sm text-suave">
                La composición debe sumar 100% para poder activar el producto.
                Total actual: <strong className={claseTotal}>{total}%</strong>
            </p>
            <CrudPagina
                embebido recurso="productos-cepas" ids={['ID_PRODUCTO', 'ID_CEPA']}
                filtros={{ idProducto: producto.ID_PRODUCTO }}
                transformarFilas={(fila) => ({ ...fila, ID_PRODUCTO: producto.ID_PRODUCTO })}
                alCargar={actualizarTotal}
                valoresIniciales={{ ID_PRODUCTO: producto.ID_PRODUCTO }}
                textoCrear="Agregar cepa" textoEliminar="Quitar" porPagina={10}
                columnas={[
                    {
                        campo: 'CEPA', titulo: 'Cepa', render: function (fila) {
                            return nombrePropio(fila.CEPA);
                        }
                    },
                    {
                        campo: 'PORCENTAJE', titulo: 'Porcentaje', alinear: 'derecha', render: function (fila) {
                            return `${fila.PORCENTAJE}%`;
                        }
                    }
                ]}
                campos={[
                    {
                        nombre: 'ID_CEPA', etiqueta: 'Cepa', tipo: 'select', requerido: true,
                        deshabilitado: function (valor, modo) {
                            return modo === 'editar';
                        },
                        opciones: cepas.map(function (cepa) {
                            return { valor: cepa.ID_CEPA, texto: nombrePropio(cepa.NOMBRE) };
                        })
                    },
                    { nombre: 'PORCENTAJE', etiqueta: 'Porcentaje (%)', tipo: 'number', requerido: true, min: 1, max: 100 }
                ]}
            />
        </Modal>
    );
}
