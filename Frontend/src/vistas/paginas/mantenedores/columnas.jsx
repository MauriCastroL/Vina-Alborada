// Columnas compartidas por los mantenedores
import { InsigniaActivo } from '../../componentes/Insignia.jsx';

export const colActivo = {
    campo: 'ACTIVO', titulo: 'Estado', render: function (fila) {
        return <InsigniaActivo valor={fila.ACTIVO} />;
    }
};
