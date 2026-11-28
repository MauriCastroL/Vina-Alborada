import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaAuditoria } from '../../../modelos/monitoreoModelo.js';
import { fechaHora } from '../../../utilidades/formato.js';
import Cargando from '../../componentes/Cargando.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Barra, SelectorDias } from './partes.jsx';

const TABLAS = ['USUARIO', 'CLIENTE', 'PRODUCTO', 'VENTA', 'PAGO', 'MOVIMIENTO_INVENTARIO', 'INVENTARIO', 'LOGIN'];

export default function Auditoria() {
    const [tabla, setTabla] = useState('');
    const [dias, setDias] = useState(7);
    const { datos, cargando } = useDatos(rutaAuditoria(tabla, dias));
    let contenidoAuditoria;
    if (cargando && datos.length === 0) {
        contenidoAuditoria = <Cargando />;
    } else {
        contenidoAuditoria = (
            <Tabla filas={datos} claveFila={(fila) => fila.ID_AUDITORIA} vacio="Sin registros en el período" columnas={[
                {
                    campo: 'FECHA', titulo: 'Fecha', render: function (fila) {
                        return fechaHora(fila.FECHA);
                    }
                },
                {
                    campo: 'USUARIO_APP', titulo: 'Usuario', render: function (fila) {
                        return fila.USUARIO_APP?.toLowerCase();
                    }
                },
                { campo: 'TABLA', titulo: 'Tabla' },
                {
                    campo: 'OPERACION', titulo: 'Operación', render: function (fila) {
                        return <Insignia valor={fila.OPERACION} />;
                    }
                },
                { campo: 'ID_REGISTRO', titulo: 'Registro' },
                { campo: 'DETALLE', titulo: 'Detalle' }
            ]} />
        );
    }

    return (
        <>
            <Barra>
                <label className="filtro">Tabla <select value={tabla} onChange={(evento) => setTabla(evento.target.value)}>
                    <option value="">Todas</option>
                    {TABLAS.map(function (opcionTabla) {
                        return <option key={opcionTabla} value={opcionTabla}>{opcionTabla}</option>;
                    })}
                </select></label>
                <SelectorDias valor={dias} alCambiar={setDias} />
            </Barra>
            {contenidoAuditoria}
        </>
    );
}
