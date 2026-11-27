// Controlador de la tienda: catalogo, destacados, busqueda, orden, cantidades y compra (con o sin sesion)
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RUTA_CATALOGO, RUTA_MAS_VENDIDOS } from '../modelos/catalogoModelo.js';
import { guardarPendiente, leerPendiente } from '../modelos/compraPendiente.js';
import { agregarAlPedido } from '../modelos/pedidosModelo.js';
import { cantidadConUnidad, normalizar } from '../utilidades/formato.js';
import { esUva } from '../utilidades/productos.js';
import { useDatos } from './useDatos.js';
import { useMensajes } from './MensajesContexto.jsx';
import { useSesion } from './SesionContexto.jsx';

const COMPARADORES = {
    menorPrecio: function (primero, segundo) {
        return primero.PRECIO_ACTUAL - segundo.PRECIO_ACTUAL;
    },
    mayorPrecio: function (primero, segundo) {
        return segundo.PRECIO_ACTUAL - primero.PRECIO_ACTUAL;
    },
    nombre: function (primero, segundo) {
        return primero.NOMBRE.localeCompare(segundo.NOMBRE, 'es');
    }
};

export function useTienda() {
    const { usuario } = useSesion();
    const { avisar } = useMensajes();
    const navegar = useNavigate();

    const { datos: productos, cargando, error } = useDatos(RUTA_CATALOGO);
    const { datos: masVendidos } = useDatos(RUTA_MAS_VENDIDOS);
    const [orden, setOrden] = useState('vendidos');

    const [cantidades, setCantidades] = useState({});
    const [agregando, setAgregando] = useState(null);
    const [pidiendoSesion, setPidiendoSesion] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    const esCliente = usuario?.rol === 'CLIENTE';

    const hayUva = useMemo(function () {
        return productos.some(esUva);
    }, [productos]);
    const puesto = useMemo(function () {
        return Object.fromEntries(masVendidos.map(function (venta) {
            return [venta.ID_PRODUCTO, venta.POSICION];
        }));
    }, [masVendidos]);
    const destacados = useMemo(function () {
        const lista = [];
        for (const venta of masVendidos) {
            const producto = productos.find(function (fila) {
                return fila.ID_PRODUCTO === venta.ID_PRODUCTO;
            });
            if (producto) {
                lista.push({ producto, posicion: venta.POSICION });
            }
        }
        return lista;
    }, [masVendidos, productos]);
    const visibles = useMemo(function () {
        const consulta = normalizar(busqueda.trim());
        const lista = productos.filter(function (producto) {
            if (!consulta) {
                return true;
            }
            const texto = normalizar(`${producto.NOMBRE} ${producto.COMPOSICION} ${producto.DESCRIPCION}`);
            return texto.includes(consulta);
        });
        const comparar = COMPARADORES[orden] || (function (primero, segundo) {
            return (puesto[primero.ID_PRODUCTO] || 99) - (puesto[segundo.ID_PRODUCTO] || 99);
        });
        return lista.sort(comparar);
    }, [productos, busqueda, orden, puesto]);

    const vinos = visibles.filter(function (producto) {
        return !esUva(producto);
    });
    const uvas = visibles.filter(esUva);

    async function agregar(producto, cantidad) {
        setAgregando(producto.ID_PRODUCTO);
        try {
            const pedido = await agregarAlPedido(producto.ID_PRODUCTO, cantidad);
            avisar(`${producto.NOMBRE} (${cantidadConUnidad(cantidad, producto.UNIDAD_MEDIDA)}) agregado a tu pedido, folio ${pedido.NUMERO_FOLIO}`);
        } catch (error) {
            avisar(error.message, 'error');
        } finally {
            setAgregando(null);
        }
    }

    function quiereComprar(producto) {
        const cantidad = Math.max(1, Number(cantidades[producto.ID_PRODUCTO] || 1));
        if (!usuario) {
            guardarPendiente({ id: producto.ID_PRODUCTO, nombre: producto.NOMBRE, cantidad });
            setPidiendoSesion({ ...producto, cantidad });
            return;
        }
        if (!esCliente) {
            avisar('Las compras web son para clientes. Ingresa con una cuenta de cliente.', 'error');
            return;
        }
        agregar(producto, cantidad);
    }

    useEffect(function () {
        const pendiente = leerPendiente();

        if (!pendiente || !usuario || productos.length === 0) return;

        guardarPendiente(null);

        const producto = productos.find(function (fila) {
            return fila.ID_PRODUCTO === pendiente.id;
        });

        if (esCliente && producto) agregar(producto, pendiente.cantidad);

    }, [usuario, productos]);

    function cambiarCantidad(idProducto) {
        return function (valor) {
            let cantidad;
            if (valor === '') {
                cantidad = '';
            } else {
                cantidad = Math.max(1, Number(valor) || 1);
            }
            setCantidades(function (anteriores) {
                return { ...anteriores, [idProducto]: cantidad };
            });
        };
    }

    function cancelarCompra() {
        setPidiendoSesion(null);
        guardarPendiente(null);
    }
    function irAlAcceso(modo) {
        let parametroRegistro = '';
        if (modo === 'registro') {
            parametroRegistro = 'modo=registro&';
        }

        return navegar(`/login?${parametroRegistro}volver=/`);
    }

    return {
        productos, cargando, error, esCliente, hayUva, destacados, visibles, vinos, uvas,
        orden, setOrden, busqueda, setBusqueda, cantidades, agregando, pidiendoSesion,
        quiereComprar, cambiarCantidad, cancelarCompra, irAlAcceso
    };
}
