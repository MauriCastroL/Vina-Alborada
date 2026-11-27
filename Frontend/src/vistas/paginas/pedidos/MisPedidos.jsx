// Pagina: pedidos del cliente web (pedido actual + historial)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_MIS_PEDIDOS } from '../../../modelos/pedidosModelo.js';
import { dinero, fechaHora } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Cargando from '../../componentes/Cargando.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import DetallePedido from './DetallePedido.jsx';

export default function MisPedidos() {
    const { datos: pedidos, cargando, recargar } = useDatos(RUTA_MIS_PEDIDOS);
    const [elegido, setElegido] = useState(null);
    const lista = [...pedidos].reverse();
    const borradores = lista.filter((pedido) => pedido.ESTADO === 'BORRADOR');
    const historial = lista.filter((pedido) => pedido.ESTADO !== 'BORRADOR');
    const actual = historial.find((pedido) => pedido.ID_SOLICITUD === elegido);

    let contenidoPedidos;
    if (cargando && pedidos.length === 0) {
        contenidoPedidos = <Cargando />;
    } else {
        contenidoPedidos = (
            <Tabla
                filas={historial} claveFila={(pedido) => pedido.ID_SOLICITUD} alClickFila={(pedido) => setElegido(pedido.ID_SOLICITUD)}
                vacio="Aún no tienes pedidos enviados"
                columnas={[
                    { campo: 'NUMERO_FOLIO', titulo: 'Folio' },
                    {
                        campo: 'FECHA_CREACION', titulo: 'Fecha', render: function (pedido) {
                            return fechaHora(pedido.FECHA_CREACION);
                        }
                    },
                    {
                        campo: 'TOTAL', titulo: 'Total', alinear: 'derecha', render: function (pedido) {
                            return dinero(pedido.TOTAL);
                        }
                    },
                    {
                        campo: 'ESTADO', titulo: 'Estado', render: function (pedido) {
                            return <Insignia valor={pedido.ESTADO} />;
                        }
                    }
                ]}
            />
        );
    }

    return (
        <section>
            <Cabecera titulo="Mis pedidos" descripcion="Tus solicitudes de compra a la viña.">
                <Link to="/" className="btn">Ir a la tienda</Link>
            </Cabecera>
            <div className="grid gap-4">
                {borradores.map(function (pedido) {
                    return <DetallePedido key={pedido.ID_SOLICITUD} pedido={pedido} alCambiar={recargar} />;
                })}
                {actual && <DetallePedido key={actual.ID_SOLICITUD} pedido={actual} alCambiar={recargar} />}
            </div>
            <h2 className="mb-3 mt-8">Historial</h2>
            {contenidoPedidos}
        </section>
    );
}
