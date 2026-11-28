import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaVentasCanal } from '../../../modelos/reportesModelo.js';
import { dinero, numero } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { CURSOR, Cifra, Cifras, EJE, ErrorReporte, PIZARRA, REJILLA, Reporte, TOOLTIP, VINO, Vacio, pesosCortos } from './partes.jsx';

export default function VentasPorCanal() {
    const [anio, setAnio] = useState(new Date().getFullYear());
    const { datos, error, cargando } = useDatos(rutaVentasCanal(anio));

    const porMes = useMemo(function () {
        const mapa = {};
        datos.forEach(function (dato) {
            mapa[dato.MES] = mapa[dato.MES] || { MES: dato.MES, PRESENCIAL: 0, DIGITAL: 0 };
            mapa[dato.MES][dato.CANAL_VENTA] = dato.MONTO_VENDIDO;
        });
        return Object.values(mapa);
    }, [datos]);

    let total = 0;
    let digital = 0;
    let confirmadas = 0;
    for (const fila of datos) {
        total += fila.MONTO_VENDIDO;
        confirmadas += fila.VENTAS_CONFIRMADAS;
        if (fila.CANAL_VENTA === 'DIGITAL') {
            digital += fila.MONTO_VENDIDO;
        }
    }

    let montoAnual;
    if (cargando) {
        montoAnual = '—';
    } else {
        montoAnual = dinero(total);
    }

    let cantidadConfirmadas;
    if (cargando) {
        cantidadConfirmadas = '—';
    } else {
        cantidadConfirmadas = numero(confirmadas);
    }

    let participacionDigital = '—';
    if (total) {
        participacionDigital = `${((100 * digital) / total).toFixed(1)}%`;
    }

    let contenidoGrafico;
    if (cargando && porMes.length === 0) {
        contenidoGrafico = <div className="esqueleto mb-3 h-[300px] w-full" role="status" aria-label="Cargando" />;
    } else if (porMes.length === 0) {
        contenidoGrafico = <Vacio texto="No hay ventas en este año." />;
    } else {
        contenidoGrafico = (
            <div className="mb-3 h-[300px] w-full">
                <ResponsiveContainer>
                    <BarChart data={porMes} margin={{ left: 10, right: 10 }}>
                        <CartesianGrid vertical={false} stroke={REJILLA} />
                        <XAxis dataKey="MES" tick={EJE} />
                        <YAxis tickFormatter={pesosCortos} tick={EJE} width={70} />
                        <Tooltip formatter={function (monto, canal) {
                            let etiquetaCanal = 'Digital';
                            if (canal === 'PRESENCIAL') {
                                etiquetaCanal = 'Presencial';
                            }

                            return [dinero(monto), etiquetaCanal];
                        }}
                            cursor={CURSOR} {...TOOLTIP} />
                        <Legend formatter={function (canal) {
                            if (canal === 'PRESENCIAL') {
                                return 'Presencial';
                            }
                            return 'Digital';
                        }} />
                        <Bar dataKey="PRESENCIAL" stackId="a" fill={VINO} stroke="#fff" strokeWidth={2} maxBarSize={48} />
                        <Bar dataKey="DIGITAL" stackId="a" fill={PIZARRA} stroke="#fff" strokeWidth={2} maxBarSize={48}
                            radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <Reporte titulo="Ventas mensuales por canal"
            pregunta="¿Cuánto se vende en sala y cuánto por el sitio web? Mide el avance del canal digital."
            filtros={<label className="filtro">Año <input type="number" value={anio} min="2020" max="2100"
                onChange={(evento) => setAnio(evento.target.value)} className="w-24" /></label>}>
            <ErrorReporte texto={error} />
            <Cifras>
                <Cifra etiqueta="Monto vendido en el año" valor={montoAnual} />
                <Cifra etiqueta="Ventas confirmadas" valor={cantidadConfirmadas} />
                <Cifra etiqueta="Participación digital" valor={participacionDigital} />
            </Cifras>
            {contenidoGrafico}
            <details>
                <summary>Ver tabla</summary>
                <Tabla filas={datos} claveFila={(dato) => `${dato.MES}-${dato.CANAL_VENTA}`} porPagina={24} columnas={[
                    { campo: 'MES', titulo: 'Mes' },
                    {
                        campo: 'CANAL_VENTA', titulo: 'Canal', render: function (dato) {
                            return <Insignia valor={dato.CANAL_VENTA} />;
                        }
                    },
                    { campo: 'VENTAS_CONFIRMADAS', titulo: 'Confirmadas', alinear: 'derecha' },
                    { campo: 'VENTAS_ANULADAS', titulo: 'Anuladas', alinear: 'derecha' },
                    {
                        campo: 'MONTO_VENDIDO', titulo: 'Monto', alinear: 'derecha', render: function (dato) {
                            return dinero(dato.MONTO_VENDIDO);
                        }
                    },
                    {
                        campo: 'TICKET_PROMEDIO', titulo: 'Ticket promedio', alinear: 'derecha', render: function (dato) {
                            return dinero(dato.TICKET_PROMEDIO);
                        }
                    },
                    {
                        campo: 'PCT_DEL_MES', titulo: '% del mes', alinear: 'derecha', render: function (dato) {
                            return `${dato.PCT_DEL_MES}%`;
                        }
                    }
                ]} />
            </details>
        </Reporte>
    );
}
