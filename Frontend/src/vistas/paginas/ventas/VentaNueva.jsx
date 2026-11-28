import { useVentaNueva } from '../../../controladores/useVentaNueva.js';
import { nombreCliente, normalizar } from '../../../utilidades/formato.js';
import { quitarSeparadoresRut } from '../../../utilidades/rut.js';
import Cabecera from '../../componentes/Cabecera.jsx';
import Formulario from '../../componentes/Formulario.jsx';
import { Pie } from '../../componentes/Modal.jsx';
import { Volver } from './partes.jsx';

export default function VentaNueva() {
    const { clientes, valores, setValores, crear } = useVentaNueva();

    const consulta = normalizar(valores.BUSCAR_CLIENTE?.trim());
    const rutBuscado = quitarSeparadoresRut(consulta);
    const clientesFiltrados = clientes.filter(function (cliente) {
        const rut = quitarSeparadoresRut(normalizar(cliente.RUT));
        return normalizar(nombreCliente(cliente)).includes(consulta) ||
            normalizar(cliente.CORREO).includes(consulta) ||
            Boolean(rutBuscado && rut.includes(rutBuscado));
    });
    const seleccionado = clientes.find((cliente) => String(cliente.ID_CLIENTE) === String(valores.ID_CLIENTE));
    let opcionesClientes;
    if (seleccionado && !clientesFiltrados.includes(seleccionado)) {
        opcionesClientes = [seleccionado, ...clientesFiltrados];
    } else {
        opcionesClientes = clientesFiltrados;
    }

    let ayudaBusqueda;
    if (consulta && clientesFiltrados.length === 0) {
        ayudaBusqueda = 'No hay clientes que coincidan con la búsqueda.';
    }

    const campos = [
        {
            nombre: 'TIPO', etiqueta: 'Comprador', tipo: 'select', requerido: true,
            opciones: [{ valor: 'MOSTRADOR', texto: 'Sin registro (mostrador)' }, { valor: 'CLIENTE', texto: 'Cliente registrado' }]
        },
        {
            nombre: 'BUSCAR_CLIENTE', etiqueta: 'Buscar cliente', tipo: 'search', ancho: 'completo',
            placeholder: 'RUT, correo o nombre', visible: function (datosFormulario) {
                return datosFormulario.TIPO === 'CLIENTE';
            }
        },
        {
            nombre: 'ID_CLIENTE', etiqueta: 'Cliente', tipo: 'select', requerido: true,
            visible: function (datosFormulario) {
                return datosFormulario.TIPO === 'CLIENTE';
            },
            ayuda: ayudaBusqueda,
            opciones: opcionesClientes.map(function (cliente) {
                return {
                    valor: cliente.ID_CLIENTE,
                    texto: [nombreCliente(cliente), cliente.RUT, cliente.CORREO?.toLowerCase()].filter(Boolean).join(' · ')
                };
            })
        },
        {
            nombre: 'NOMBRE_COMPRADOR', etiqueta: 'Nombre del comprador (opcional)',
            visible: function (datosFormulario) {
                return datosFormulario.TIPO === 'MOSTRADOR';
            }
        },
        { nombre: 'LUGAR_VENTA', etiqueta: 'Lugar de venta', requerido: true, ancho: 'completo' },
        { nombre: 'OBSERVACIONES', etiqueta: 'Observaciones', tipo: 'textarea', ancho: 'completo' }
    ];

    return (
        <section className="max-w-2xl">
            <Volver />
            <Cabecera titulo="Nueva venta presencial" />
            <form className="tarjeta" onSubmit={crear}>
                <Formulario campos={campos} valores={valores} alCambiar={setValores} />
                <Pie>
                    <button type="submit" className="btn">Crear venta y agregar productos</button>
                </Pie>
            </form>
        </section>
    );
}
