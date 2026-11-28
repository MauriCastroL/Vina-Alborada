import { nombreCliente, nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import { colActivo } from './columnas.jsx';

function esNatural(valor) {
    return valor.TIPO_CLIENTE !== 'EMPRESA';
}

export default function Clientes() {
    function prepararCliente(valor) {
        if (esNatural(valor)) {
            return { ...valor, RAZON_SOCIAL: null };
        }
        return { ...valor, NOMBRE: null, APELLIDO1: null, APELLIDO2: null };
    }

    return (
        <CrudPagina
            titulo="Clientes"
            descripcion="Personas y empresas que compran en la viña."
            recurso="clientes" reactivable ids={['ID_CLIENTE']} conInactivos textoCrear="Nuevo cliente"
            valoresIniciales={{ TIPO_CLIENTE: 'NATURAL' }}
            columnas={[
                {
                    campo: 'TIPO_CLIENTE', titulo: 'Tipo', render: function (fila) {
                        return nombrePropio(fila.TIPO_CLIENTE);
                    }
                },
                { campo: 'RUT', titulo: 'RUT' },
                { campo: 'NOMBRE', titulo: 'Nombre / Razón social', render: nombreCliente },
                { campo: 'TELEFONO', titulo: 'Teléfono' },
                {
                    campo: 'CORREO', titulo: 'Correo', render: function (fila) {
                        return fila.CORREO?.toLowerCase();
                    }
                },
                colActivo
            ]}
            campos={[
                {
                    nombre: 'TIPO_CLIENTE', etiqueta: 'Tipo de cliente', tipo: 'select', requerido: true,
                    opciones: [{ valor: 'NATURAL', texto: 'Persona natural' }, { valor: 'EMPRESA', texto: 'Empresa' }]
                },
                { nombre: 'RUT', etiqueta: 'RUT', placeholder: '12.345.678-9' },
                { nombre: 'NOMBRE', etiqueta: 'Nombre', requerido: true, visible: esNatural },
                { nombre: 'APELLIDO1', etiqueta: 'Primer apellido', requerido: true, visible: esNatural },
                { nombre: 'APELLIDO2', etiqueta: 'Segundo apellido', requerido: true, visible: esNatural },
                {
                    nombre: 'RAZON_SOCIAL', etiqueta: 'Razón social', requerido: true, ancho: 'completo',
                    visible: function (valor) {
                        return !esNatural(valor);
                    }
                },
                { nombre: 'TELEFONO', etiqueta: 'Teléfono' },
                { nombre: 'CORREO', etiqueta: 'Correo', tipo: 'email' }
            ]}
            prepararEnvio={prepararCliente}
        />
    );
}
