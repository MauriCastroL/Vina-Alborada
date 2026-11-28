import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaRanking } from '../../../modelos/reportesModelo.js';
import { dinero, mesActual, numero } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { COBRE, CURSOR, Cifra, Cifras, EJE, ErrorReporte, REJILLA, Reporte, TOOLTIP, VINO, Vacio } from './partes.jsx';

export default function RankingProductos() {
    const [mes, setMes] = useState(mesActual());
    const [anio, numMes] = mes.split('-');
    const { datos, cargando, error } = useDatos(rutaRanking(anio, Number(numMes)));
    const vendidos = datos.filter((dato) => dato.UNIDADES > 0);
    const mas = datos.find((dato) => dato.CLASIFICACION === 'MAS VENDIDO');
    const menos = datos.filter((dato) => dato.CLASIFICACION === 'MENOS VENDIDO');
    const totalMonto = datos.reduce((suma, dato) => suma + dato.MONTO, 0);

    let nombreMasVendido = '—';
    if (mas) {
        nombreMasVendido = mas.PRODUCTO;
    }

    let nombresMenosVendidos = '—';
    if (menos.length) {
        nombresMenosVendidos = menos.map((producto) => producto.PRODUCTO).join(', ');
    }

    let unidadesMenosVendidas = '';
    if (menos.length) {
        unidadesMenosVendidas = `${numero(menos[0].UNIDADES)} unidades`;
    }

    let contenidoRanking;
    if (!cargando && vendidos.length === 0) {
        contenidoRanking = <Vacio texto="No hay ventas confirmadas en este mes." />;
    } else {
        contenidoRanking = (
            <div className="mb-3 w-full" style={{ height: Math.max(220, datos.length * 34) }}>
                <ResponsiveContainer>
                    <BarChart data={datos} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid horizontal={false} stroke={REJILLA} />
                        <XAxis type="number" tick={EJE} allowDecimals={false} />
                        <YAxis type="category" dataKey="PRODUCTO" width={230} tick={EJE} />
                        <Tooltip formatter={(valor) => [`${numero(valor)} unidades`, 'Vendidas']} cursor={CURSOR} {...TOOLTIP} />
                        <Bar dataKey="UNIDADES" fill={VINO} radius={[0, 3, 3, 0]} maxBarSize={20} name="Unidades">
                            {datos.map(function (dato) {
                                let colorBarra;
                                if (dato.CLASIFICACION === 'MAS VENDIDO') {
                                    colorBarra = COBRE;
                                } else {
                                    colorBarra = VINO;
                                }

                                return <Cell key={dato.CODIGO} fill={colorBarra} />;
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    function cambiarMes(evento) {
        return evento.target.value && setMes(evento.target.value);
    }

    return (
        <Reporte titulo="Productos más y menos vendidos del mes"
            pregunta="¿Qué productos rotan más y cuáles casi no se venden? Apoya la compra y el abastecimiento."
            filtros={<label className="filtro">Mes <input type="month" value={mes}
                onChange={cambiarMes} /></label>}>
            <ErrorReporte texto={error} />
            <Cifras>
                <Cifra etiqueta="Más vendido" valor={nombreMasVendido} detalle={mas && `${numero(mas.UNIDADES)} unidades`} />
                <Cifra etiqueta="Menos vendido" valor={nombresMenosVendidos}
                    detalle={unidadesMenosVendidas} />
                <Cifra etiqueta="Monto vendido" valor={dinero(totalMonto)} />
            </Cifras>
            {contenidoRanking}
            <details>
                <summary>Ver tabla</summary>
                <Tabla filas={datos} claveFila={(dato) => dato.CODIGO} porPagina={20} columnas={[
                    { campo: 'POS_MAS_VENDIDO', titulo: '#' },
                    { campo: 'PRODUCTO', titulo: 'Producto' },
                    {
                        campo: 'UNIDADES', titulo: 'Unidades', alinear: 'derecha', render: function (dato) {
                            return numero(dato.UNIDADES);
                        }
                    },
                    {
                        campo: 'MONTO', titulo: 'Monto', alinear: 'derecha', render: function (dato) {
                            return dinero(dato.MONTO);
                        }
                    },
                    {
                        campo: 'PCT_UNIDADES', titulo: '% unidades', alinear: 'derecha',
                        render: function (dato) {
                            if (dato.PCT_UNIDADES != null) {
                                return `${dato.PCT_UNIDADES}%`;
                            }
                            return '';
                        }
                    },
                    {
                        campo: 'CLASIFICACION', titulo: '', render: function (dato) {
                            return <Insignia valor={dato.CLASIFICACION} />;
                        }
                    }
                ]} />
            </details>
        </Reporte>
    );
}
