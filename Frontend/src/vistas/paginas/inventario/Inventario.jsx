import { useInventario } from '../../../controladores/useInventario.js';
import { fechaHora, nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';

const TIPOS = {
    ENTRADA: 'Entrada', AJUSTE_POSITIVO: 'Ajuste positivo', AJUSTE_NEGATIVO: 'Ajuste negativo',
    SALIDA_VENTA: 'Salida por venta', REVERSION_VENTA: 'Reversión de venta'
};

export default function Inventario() {
    const { productos, activos, recargar, aplicar } = useInventario();

    function mostrarAccionesMovimiento(fila, recargarMovimientos) {
        return fila.ESTADO === 'BORRADOR' && (
            <button type="button" className="btn btn-sm" onClick={() => aplicar(fila, recargarMovimientos)}>
                Aplicar
            </button>
        );
    }

    return (
        <section>
            <div className="mb-5">
                <div>
                    <h1>Inventario</h1>
                    <p className="mt-1 max-w-3xl text-sm text-suave">
                        Los movimientos se registran en borrador y al <strong>aplicarlos</strong> actualizan el stock
                        (gestor G1). Las ventas generan sus propias salidas.
                    </p>
                </div>
            </div>

            <h2 className="mb-3">Stock actual</h2>
            <Tabla
                porPagina={10}
                columnas={[
                    { campo: 'CODIGO', titulo: 'Código' },
                    { campo: 'NOMBRE', titulo: 'Producto' },
                    {
                        campo: 'CATEGORIA', titulo: 'Categoría', render: function (fila) {
                            return nombrePropio(fila.CATEGORIA);
                        }
                    },
                    { campo: 'STOCK_ACTUAL', titulo: 'Stock', alinear: 'derecha' },
                    { campo: 'STOCK_MINIMO', titulo: 'Mínimo', alinear: 'derecha' },
                    {
                        campo: 'ESTADO', titulo: 'Situación',
                        render: function (fila) {
                            let estadoStock = 'OK';
                            if (fila.STOCK_ACTUAL < fila.STOCK_MINIMO) {
                                estadoStock = 'BAJO MINIMO';
                            }

                            return <Insignia valor={estadoStock} />;
                        }
                    }
                ]}
                filas={activos}
                claveFila={(fila) => fila.ID_PRODUCTO}
            />

            <h2 className="mb-3 mt-8">Movimientos</h2>
            <CrudPagina
                embebido recurso="movimientos" ids={['ID_MOVIMIENTO']} ordenDescendente
                textoCrear="Nuevo movimiento" textoEliminar="Anular" recargar={recargar}
                puedeEditar={(fila) => fila.ESTADO === 'BORRADOR'}
                puedeEliminar={(fila) => fila.ESTADO === 'BORRADOR'}
                valoresIniciales={{ TIPO_MOVIMIENTO: 'ENTRADA' }}
                columnas={[
                    { campo: 'NUMERO_FOLIO', titulo: 'Folio' },
                    {
                        campo: 'FECHA_CREACION', titulo: 'Fecha', render: function (fila) {
                            return fechaHora(fila.FECHA_CREACION);
                        }
                    },
                    { campo: 'PRODUCTO', titulo: 'Producto' },
                    {
                        campo: 'TIPO_MOVIMIENTO', titulo: 'Tipo', render: function (fila) {
                            return TIPOS[fila.TIPO_MOVIMIENTO];
                        }
                    },
                    { campo: 'CANTIDAD', titulo: 'Cantidad', alinear: 'derecha' },
                    {
                        campo: 'ESTADO', titulo: 'Estado', render: function (fila) {
                            return <Insignia valor={fila.ESTADO} />;
                        }
                    },
                    { campo: 'MOTIVO', titulo: 'Motivo' },
                    {
                        campo: 'USUARIO', titulo: 'Usuario', render: function (fila) {
                            return fila.USUARIO?.toLowerCase();
                        }
                    }
                ]}
                campos={[
                    {
                        nombre: 'ID_PRODUCTO', etiqueta: 'Producto', tipo: 'select', requerido: true, ancho: 'completo',
                        opciones: productos.map(function (producto) {
                            return { valor: producto.ID_PRODUCTO, texto: `${producto.CODIGO} · ${producto.NOMBRE}` };
                        })
                    },
                    {
                        nombre: 'TIPO_MOVIMIENTO', etiqueta: 'Tipo', tipo: 'select', requerido: true,
                        opciones: ['ENTRADA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'].map(function (tipo) {
                            return { valor: tipo, texto: TIPOS[tipo] };
                        })
                    },
                    { nombre: 'CANTIDAD', etiqueta: 'Cantidad', tipo: 'number', requerido: true, min: 1 },
                    {
                        nombre: 'MOTIVO', etiqueta: 'Motivo', tipo: 'textarea', ancho: 'completo',
                        requerido: function (valor) {
                            return valor.TIPO_MOVIMIENTO !== 'ENTRADA';
                        },
                        ayuda: 'Obligatorio para los ajustes'
                    }
                ]}
                accionesExtra={mostrarAccionesMovimiento}
            />
        </section>
    );
}
