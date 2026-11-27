import { useInicio } from '../../../controladores/useInicio.js';
import { dinero, fechaHora, nombrePropio, numero } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Indicador from './Indicador.jsx';
import { ListaVacia, PanelLista } from './PanelLista.jsx';

export default function Inicio() {
    const resumen = useInicio();
    const { tiene, alertas, pendientes, bajoMinimo } = resumen;

    const indicadores = [];
    const veSolicitudes = tiene('SOLICITUDES');
    if (tiene('VENTAS')) {
        const cantidadVentas = resumen.ventasDelMes.length;
        let sufijo = 's';
        if (cantidadVentas === 1) {
            sufijo = '';
        }
        indicadores.push(
            <Indicador key="v" ruta="/ventas" etiqueta={`Ventas confirmadas · ${resumen.nombreMes}`}
                valor={dinero(resumen.montoDelMes)}
                detalle={`${numero(cantidadVentas)} venta${sufijo}`} />
        );
    }
    if (veSolicitudes) {
        let detalle = 'Sin solicitudes por revisar';
        if (pendientes.length > 0) {
            detalle = 'Por revisar';
        }
        indicadores.push(
            <Indicador key="s" ruta="/solicitudes" etiqueta="Solicitudes web pendientes"
                valor={numero(pendientes.length)} detalle={detalle} />
        );
    }
    if (alertas && alertas.cantidad !== undefined) {
        let rutaAlertas = '/inventario';
        if (tiene('REPORTES')) {
            rutaAlertas = '/reportes';
        }
        let detalle = 'Stock sobre el mínimo';
        if (alertas.cantidad) {
            detalle = 'Requieren reposición';
        }
        indicadores.push(
            <Indicador key="a" ruta={rutaAlertas} etiqueta="Productos bajo el stock mínimo"
                valor={numero(alertas.cantidad)} alerta={alertas.cantidad > 0} detalle={detalle} />
        );
    }
    if (tiene('MIS_SOLICITUDES')) {
        let enRevision = 0;
        for (const pedido of resumen.pedidos) {
            if (pedido.ESTADO === 'PENDIENTE') {
                enRevision++;
            }
        }
        indicadores.push(
            <Indicador key="p" ruta="/mis-pedidos" etiqueta="Mis pedidos"
                valor={numero(resumen.pedidos.length)} detalle={`${enRevision} en revisión`} />
        );
    }

    let tituloResumen = 'Mi cuenta';
    let descripcionResumen = 'Revisa tus pedidos o vuelve a la tienda para agregar productos.';
    if (resumen.esPersonal) {
        tituloResumen = 'Resumen de operaciones';
        descripcionResumen = `${nombrePropio(resumen.usuario?.rol)} · ${resumen.usuario?.correo?.toLowerCase() || ''}`;
    }

    let claseIndicadores = '';
    if (indicadores.length >= 3) {
        claseIndicadores = 'sm:grid-cols-3';
    } else if (indicadores.length === 2) {
        claseIndicadores = 'sm:grid-cols-2';
    }

    let listaSolicitudes;
    if (veSolicitudes) {
        if (pendientes.length === 0) {
            listaSolicitudes = <ListaVacia texto="No hay solicitudes pendientes." />;
        } else {
            listaSolicitudes = (
                <ul className="divide-y divide-stone-100">
                    {pendientes.slice(0, 5).map(function (solicitud) {
                        return (
                            <li key={solicitud.ID_SOLICITUD} className="flex min-h-[56px] items-center gap-4 px-5 py-2.5 text-sm">
                                <span className="w-16 shrink-0 tabular-nums text-suave">N° {solicitud.NUMERO_FOLIO}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium">{solicitud.CLIENTE}</span>
                                    <span className="block text-xs text-suave">{fechaHora(solicitud.FECHA_CREACION)}</span>
                                </span>
                                <span className="tabular-nums">{dinero(solicitud.TOTAL)}</span>
                            </li>
                        );
                    })}
                </ul>
            );
        }
    }

    let rutaStock = '/productos';
    let textoEnlaceStock = 'Ver productos';
    let listaStock;
    if (resumen.veStock) {
        if (tiene('INVENTARIO')) {
            rutaStock = '/inventario';
            textoEnlaceStock = 'Ver inventario';
        }
        if (bajoMinimo.length === 0) {
            listaStock = <ListaVacia texto="Todos los productos activos están sobre su mínimo." />;
        } else {
            listaStock = (
                <ul className="divide-y divide-stone-100">
                    {bajoMinimo.slice(0, 5).map(function (producto) {
                        let estadoStock = 'BAJO MINIMO';
                        if (producto.STOCK_ACTUAL <= 0) {
                            estadoStock = 'SIN STOCK';
                        }

                        return (
                            <li key={producto.ID_PRODUCTO} className="flex min-h-[56px] flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-sm">
                                <span className="min-w-0 flex-1 truncate font-medium">{producto.NOMBRE}</span>
                                <span className="tabular-nums text-suave">
                                    <strong className="font-semibold text-peligro">{numero(producto.STOCK_ACTUAL)}</strong> de {numero(producto.STOCK_MINIMO)} mín.
                                </span>
                                <Insignia valor={estadoStock} />
                            </li>
                        );
                    })}
                </ul>
            );
        }
    }

    return (
        <section>
            <Cabecera
                titulo={tituloResumen}
                descripcion={descripcionResumen}
            />

            {indicadores.length > 0 && (
                <div className={`grid divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-white sm:divide-y-0 sm:divide-x
                        ${claseIndicadores}`}>
                    {indicadores}
                </div>
            )}

            {(veSolicitudes || resumen.veStock) && (
                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {veSolicitudes && (
                        <PanelLista titulo="Solicitudes web pendientes" enlace="/solicitudes" textoEnlace="Ver solicitudes">
                            {listaSolicitudes}
                        </PanelLista>
                    )}
                    {resumen.veStock && (
                        <PanelLista titulo="Productos bajo el stock mínimo" enlace={rutaStock}
                            textoEnlace={textoEnlaceStock}>
                            {listaStock}
                        </PanelLista>
                    )}
                </div>
            )}
        </section>
    );
}
