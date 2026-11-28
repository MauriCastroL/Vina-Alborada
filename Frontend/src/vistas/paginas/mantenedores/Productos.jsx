import { useState } from 'react';
import { useMensajes } from '../../../controladores/MensajesContexto.jsx';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CATEGORIAS, RUTA_CEPAS, modificar } from '../../../modelos/mantenedoresModelo.js';
import { dinero, esPorKilo, nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import { colActivo } from './columnas.jsx';
import ComposicionCepas from './ComposicionCepas.jsx';
import CepasProductoNuevo from './CepasProductoNuevo.jsx';
import FormatoProducto, { formatoProducto } from './FormatoProducto.jsx';

export default function Productos() {
    const { avisar } = useMensajes();
    const { datos: categorias } = useDatos(RUTA_CATEGORIAS);
    const { datos: cepas, cargando: cargandoCepas, error: errorCepas } = useDatos(RUTA_CEPAS);
    function categoriaDe(valores) {
        return categorias.find((fila) => String(fila.ID_CATEGORIA) === String(valores.ID_CATEGORIA));
    }
    const anadaMaxima = Number(new Intl.DateTimeFormat('es-CL', { year: 'numeric', timeZone: 'America/Santiago' }).format(new Date()));
    function cepasDe(valores) {
        if (esPorKilo(categoriaDe(valores)?.UNIDAD_MEDIDA)) {
            return [{ ID_CEPA: valores.CEPAS[0]?.ID_CEPA ?? '', PORCENTAJE: 100 }];
        }
        return valores.CEPAS;
    }
    const [conCepas, setConCepas] = useState(null);
    const [recargar, setRecargar] = useState(0);
    const [activando, setActivando] = useState(null);

    async function activar(fila, cargar) {
        setActivando(fila.ID_PRODUCTO);
        try {
            await modificar('productos', fila.ID_PRODUCTO, { ...fila, ACTIVO: 1 });
            await cargar();
            avisar('Producto activado');
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            setActivando(null);
        }
    }

    function prepararProducto(valores, modo) {
        const formatoIngresado = formatoProducto(valores, categoriaDe(valores));
        const cantidad = formatoIngresado.cantidad;
        const unidad = formatoIngresado.unidad;
        const formato = `${cantidad} ${unidad}`;
        if (!unidad || !/^\d+(?:\.\d+)?$/.test(cantidad) || Number(cantidad) <= 0 || formato.length > 50) {
            throw new Error('Ingresa una cantidad mayor a cero y selecciona una unidad del formato.');
        }

        const { FORMATO_EDICION, ...datos } = valores;
        if (modo === 'crear') {
            return { ...datos, FORMATO: formato, ACTIVO: 0, ACTIVAR_AL_GUARDAR: true, CODIGO: valores.CODIGO.trim(), CEPAS: cepasDe(valores) };
        }
        return { ...datos, FORMATO: formato };
    }

    function mostrarCamposExtra(valor, modo, alCambiar) {
        return (
            <>
                <FormatoProducto valores={valor} categoria={categoriaDe(valor)} alCambiar={alCambiar} />
                {modo === 'crear' && (
                    <CepasProductoNuevo cepas={cepas} cargando={cargandoCepas} error={errorCepas}
                        unaSola={esPorKilo(categoriaDe(valor)?.UNIDAD_MEDIDA)} composicion={cepasDe(valor)} alCambiar={(CEPAS) => alCambiar({ ...valor, CEPAS })} />
                )}
            </>
        );
    }

    function camposProducto(valor, modo) {
        return [
            { nombre: 'CODIGO', etiqueta: 'Código', requerido: true, placeholder: 'VT-CAR-RES-2022' },
            {
                nombre: 'ID_CATEGORIA', etiqueta: 'Categoría', tipo: 'select', requerido: true,
                opciones: categorias.map(function (categoria) {
                    return { valor: categoria.ID_CATEGORIA, texto: nombrePropio(categoria.NOMBRE) };
                })
            },
            { nombre: 'NOMBRE', etiqueta: 'Nombre', requerido: true, ancho: 'completo' },
            { nombre: 'ANADA', etiqueta: 'Añada', tipo: 'number', min: 1900, max: anadaMaxima },
            { nombre: 'PRECIO_ACTUAL', etiqueta: 'Precio (CLP)', tipo: 'number', requerido: true, min: 1 },
            {
                nombre: 'STOCK_MINIMO', etiqueta: 'Stock mínimo', tipo: 'number', min: 0,
                visible: function () {
                    return modo === 'crear';
                }
            },
            {
                nombre: 'ACTIVO', etiqueta: 'Activo (a la venta)', tipo: 'checkbox', visible: function () {
                    return modo === 'editar';
                },
                ayuda: 'La composición debe sumar 100% para activar el producto.'
            },
            { nombre: 'DESCRIPCION', etiqueta: 'Descripción', tipo: 'textarea', ancho: 'completo' }
        ];
    }

    function mostrarAccionesProducto(fila, cargar) {
        let textoActivar;
        if ((Number(fila.ACTIVO) === 0)) {
            if (activando === fila.ID_PRODUCTO) {
                textoActivar = 'Activando...';
            } else {
                textoActivar = 'Activar';
            }
        }

        return (
            <>
                {Number(fila.ACTIVO) === 0 && (
                    <button type="button" className="btn btn-exito btn-sm" disabled={activando !== null}
                        onClick={() => activar(fila, cargar)}>
                        {textoActivar}
                    </button>
                )}
                <button type="button" className="btn btn-sec btn-sm" onClick={() => setConCepas(fila)}>
                    Cepas
                </button>
            </>
        );
    }

    function cerrarComposicion() {
        setConCepas(null); setRecargar(function (version) {
            return version + 1;
        });
    }

    return (
        <>
            <CrudPagina
                titulo="Productos"
                descripcion="Crea vinos y uva a granel con su composición de cepas."
                recurso="productos" ids={['ID_PRODUCTO']} textoCrear="Nuevo producto" recargar={recargar}
                textoGuardarCreacion="Guardar y activar"
                valoresIniciales={{ STOCK_MINIMO: 0, CEPAS: [{ ID_CEPA: '', PORCENTAJE: 100 }] }}
                prepararEnvio={prepararProducto}
                camposExtra={mostrarCamposExtra}
                columnas={[
                    { campo: 'CODIGO', titulo: 'Código' },
                    { campo: 'NOMBRE', titulo: 'Nombre' },
                    {
                        campo: 'CATEGORIA', titulo: 'Categoría', render: function (fila) {
                            return nombrePropio(fila.CATEGORIA);
                        }
                    },
                    {
                        campo: 'PRECIO_ACTUAL', titulo: 'Precio', alinear: 'derecha', render: function (fila) {
                            return dinero(fila.PRECIO_ACTUAL);
                        }
                    },
                    {
                        campo: 'STOCK_ACTUAL', titulo: 'Stock / mínimo', alinear: 'derecha',
                        render: function (fila) {
                            let claseStock = '';
                            if (fila.STOCK_ACTUAL < fila.STOCK_MINIMO) {
                                claseStock = 'font-semibold text-red-700';
                            }

                            return (
                                <span className={claseStock}>
                                    {fila.STOCK_ACTUAL} / {fila.STOCK_MINIMO}
                                </span>
                            );
                        }
                    },
                    colActivo
                ]}
                campos={camposProducto}
                accionesExtra={mostrarAccionesProducto}
            />
            <ComposicionCepas producto={conCepas} alCerrar={cerrarComposicion} />
        </>
    );
}
