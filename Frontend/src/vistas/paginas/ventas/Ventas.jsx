// Pagina: listado de ventas presenciales y digitales
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useVentas } from '../../../controladores/useVentas.js';
import { dinero, fechaHora } from '../../../utilidades/formato.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Cargando from '../../componentes/Cargando.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';

export default function Ventas() {
    const navegar = useNavigate();
    const { ventas, filas, cargando, estado, setEstado, busqueda, setBusqueda } = useVentas();

    let contenidoVentas;
    if (cargando && ventas.length === 0) {
        contenidoVentas = <Cargando />;
    } else {
        contenidoVentas = (
            <Tabla
                filas={filas} claveFila={(venta) => venta.ID_VENTA} alClickFila={(venta) => navegar(`/ventas/${venta.ID_VENTA}`)}
                columnas={[
                    { campo: 'ID_VENTA', titulo: 'N°' },
                    {
                        campo: 'FECHA', titulo: 'Fecha',
                        render: function (venta) {
                            return fechaHora(venta.FECHA_CONFIRMACION || venta.FECHA_CREACION);
                        }
                    },
                    {
                        campo: 'CANAL_VENTA', titulo: 'Canal', render: function (venta) {
                            return <Insignia valor={venta.CANAL_VENTA} />;
                        }
                    },
                    {
                        campo: 'COMPRADOR', titulo: 'Comprador', render: function (venta) {
                            return venta.COMPRADOR || 'Mostrador';
                        }
                    },
                    {
                        campo: 'TOTAL', titulo: 'Total', alinear: 'derecha', render: function (venta) {
                            return dinero(venta.TOTAL);
                        }
                    },
                    { campo: 'METODO_PAGO', titulo: 'Pago' },
                    {
                        campo: 'ESTADO', titulo: 'Estado', render: function (venta) {
                            return <Insignia valor={venta.ESTADO} />;
                        }
                    }
                ]}
            />
        );
    }

    return (
        <section>
            <Cabecera titulo="Ventas" descripcion="Ventas presenciales y digitales (generadas desde solicitudes web).">
                <Link to="/ventas/nueva" className="btn"><Plus size={16} strokeWidth={1.75} aria-hidden="true" />Nueva venta presencial</Link>
            </Cabecera>
            <div className="mb-3 flex flex-wrap items-center gap-3">
                <input type="search" className="min-w-0 flex-1 sm:max-w-xs" placeholder="Buscar..." value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)} aria-label="Buscar" />
                <select value={estado} onChange={(evento) => setEstado(evento.target.value)} aria-label="Estado">
                    <option value="">Todos los estados</option>
                    <option value="BORRADOR">Borrador</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="ANULADA">Anulada</option>
                </select>
            </div>
            {contenidoVentas}
        </section>
    );
}
