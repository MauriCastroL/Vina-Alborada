import { useState } from 'react';
import { useDatos } from '../../../controladores/useDatos.js';
import { rutaLogins } from '../../../modelos/monitoreoModelo.js';
import { fechaHora } from '../../../utilidades/formato.js';
import Insignia from '../../componentes/Insignia.jsx';
import Tabla from '../../componentes/Tabla.jsx';
import { Barra, SelectorDias } from './partes.jsx';

export default function IntentosLogin() {
    const [soloFallidos, setSoloFallidos] = useState(false);
    const [dias, setDias] = useState(7);
    const { datos } = useDatos(rutaLogins(soloFallidos, dias));
    return (
        <>
            <Barra>
                <SelectorDias valor={dias} alCambiar={setDias} />
                <label className="casilla">
                    <input type="checkbox" checked={soloFallidos} onChange={(evento) => setSoloFallidos(evento.target.checked)} />
                    Solo intentos fallidos
                </label>
            </Barra>
            <Tabla filas={datos} claveFila={(fila) => fila.ID_AUDITORIA} vacio="Sin intentos en el período" columnas={[
                {
                    campo: 'FECHA', titulo: 'Fecha', render: function (fila) {
                        return fechaHora(fila.FECHA);
                    }
                },
                {
                    campo: 'CORREO', titulo: 'Correo', render: function (fila) {
                        return fila.CORREO?.toLowerCase();
                    }
                },
                {
                    campo: 'EXITOSO', titulo: 'Exitoso', render: function (fila) {
                        let textoExitoso = 'No';
                        if (fila.EXITOSO === 'SI') {
                            textoExitoso = 'Sí';
                        }

                        return <Insignia valor={fila.EXITOSO} texto={textoExitoso} />;
                    }
                },
                { campo: 'MOTIVO', titulo: 'Motivo' },
                { campo: 'EQUIPO', titulo: 'Equipo' }
            ]} />
        </>
    );
}
