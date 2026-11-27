// Vista: alertas de stock (bajo el minimo y repuestos) del periodo
import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaAlertasStock } from '../../../modelos/monitoreoModelo.js';
import { fechaHora } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Barra, SelectorDias } from './partes.jsx';

export default function AlertasStock() {
    const [soloBajo, setSoloBajo] = useState(false);
    const [dias, setDias] = useState(30);
    const { datos } = useDatos(rutaAlertasStock(soloBajo, dias));
    return (
        <>
            <Barra>
                <SelectorDias valor={dias} alCambiar={setDias} />
                <label className="casilla">
                    <input type="checkbox" checked={soloBajo} onChange={(evento) => setSoloBajo(evento.target.checked)} />
                    Solo productos que hoy siguen bajo el mínimo
                </label>
            </Barra>
            <Tabla filas={datos} claveFila={(fila) => fila.ID_AUDITORIA} vacio="Sin alertas en el período" columnas={[
                {
                    campo: 'FECHA', titulo: 'Fecha', render: function (fila) {
                        return fechaHora(fila.FECHA);
                    }
                },
                {
                    campo: 'OPERACION', titulo: 'Evento', render: function (fila) {
                        return <Insignia valor={fila.OPERACION} />;
                    }
                },
                { campo: 'PRODUCTO', titulo: 'Producto' },
                { campo: 'DETALLE', titulo: 'Detalle' },
                { campo: 'STOCK_HOY', titulo: 'Stock hoy', alinear: 'derecha' },
                {
                    campo: 'SITUACION_HOY', titulo: 'Situación hoy', render: function (fila) {
                        return <Insignia valor={fila.SITUACION_HOY} />;
                    }
                }
            ]} />
        </>
    );
}
