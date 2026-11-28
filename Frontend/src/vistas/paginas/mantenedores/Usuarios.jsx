import { useDatos } from '../../../controladores/useDatos.js';
import { RUTA_CLIENTES, RUTA_ROLES } from '../../../modelos/mantenedoresModelo.js';
import { fecha, nombreCliente, nombrePropio } from '../../../utilidades/formato.js';
import CrudPagina from '../../componentes/CrudPagina.jsx';
import Insignia from '../../componentes/Insignia.jsx';
import { colActivo } from './columnas.jsx';

export default function Usuarios() {
    const { datos: roles } = useDatos(RUTA_ROLES);
    const { datos: clientes } = useDatos(RUTA_CLIENTES);
    function nombreRol(id) {
        return roles.find((rol) => String(rol.ID_ROL) === String(id))?.NOMBRE;
    }
    function esCliente(valores) {
        return nombreRol(valores.ID_ROL) === 'CLIENTE';
    }
    function clientePorId(id) {
        return clientes.find((cliente) => cliente.ID_CLIENTE === id);
    }

    function camposUsuario(valor, modo) {
        let etiquetaClave = 'Nueva contraseña';
        if (modo === 'crear') {
            etiquetaClave = 'Contraseña';
        }

        let ayudaClave = 'Déjela vacía para mantener la actual';
        if (modo === 'crear') {
            ayudaClave = 'Mínimo 6 caracteres';
        }

        return [
            { nombre: 'CORREO', etiqueta: 'Correo', tipo: 'email', requerido: true, ancho: 'completo' },
            {
                nombre: 'ID_ROL', etiqueta: 'Perfil', tipo: 'select', requerido: true,
                opciones: roles.map(function (rol) {
                    return { valor: rol.ID_ROL, texto: nombrePropio(rol.NOMBRE) };
                })
            },
            {
                nombre: 'ID_CLIENTE', etiqueta: 'Cliente asociado', tipo: 'select', requerido: true,
                visible: esCliente,
                opciones: clientes.map(function (cliente) {
                    return { valor: cliente.ID_CLIENTE, texto: nombreCliente(cliente) };
                })
            },
            {
                nombre: 'CLAVE', etiqueta: etiquetaClave,
                tipo: 'password', requerido: modo === 'crear', autocompletar: 'new-password',
                ayuda: ayudaClave
            },
            { nombre: 'ACTIVO', etiqueta: 'Activo', tipo: 'checkbox' }
        ];
    }

    function prepararUsuario(valores) {
        let idCliente = null;
        if (esCliente(valores)) {
            idCliente = valores.ID_CLIENTE;
        }

        return ({
            ...valores,
            ID_CLIENTE: idCliente,
            CLAVE: valores.CLAVE || null
        });
    }

    return (
        <CrudPagina
            titulo="Usuarios"
            descripcion="Cuentas de acceso. La contraseña se guarda cifrada (hash) en la base de datos."
            recurso="usuarios" ids={['ID_USUARIO']} conInactivos textoCrear="Nuevo usuario"
            valoresIniciales={{ ACTIVO: 1 }}
            columnas={[
                {
                    campo: 'CORREO', titulo: 'Correo', render: function (fila) {
                        return fila.CORREO.toLowerCase();
                    }
                },
                {
                    campo: 'ROL', titulo: 'Perfil', render: function (fila) {
                        return <Insignia valor={fila.ROL} />;
                    }
                },
                {
                    campo: 'ID_CLIENTE', titulo: 'Cliente asociado',
                    render: function (fila) {
                        return nombreCliente(clientePorId(fila.ID_CLIENTE));
                    }
                },
                {
                    campo: 'FECHA_REGISTRO', titulo: 'Registro', render: function (fila) {
                        return fecha(fila.FECHA_REGISTRO);
                    }
                },
                colActivo
            ]}
            campos={camposUsuario}
            prepararEnvio={prepararUsuario}
        />
    );
}
