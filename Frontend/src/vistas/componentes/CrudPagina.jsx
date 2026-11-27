import { Plus } from 'lucide-react';
import { useCrud } from '../../controladores/useCrud.js';
import Cabecera from './Cabecera.jsx';
import Cargando from './Cargando.jsx';
import Formulario from './Formulario.jsx';
import Modal, { Pie } from './Modal.jsx';
import Tabla from './Tabla.jsx';

export default function CrudPagina(propiedades) {
    const titulo = propiedades.titulo;
    const descripcion = propiedades.descripcion;
    const recurso = propiedades.recurso;
    const columnas = propiedades.columnas;
    const campos = propiedades.campos;
    const ids = propiedades.ids;
    let filtros = propiedades.filtros;
    if (filtros === undefined) {
        filtros = {};
    }
    const conInactivos = propiedades.conInactivos;
    const reactivable = propiedades.reactivable;
    const soloLectura = propiedades.soloLectura;
    function permitirAccion() {
        return true;
    }

    let puedeEditar = propiedades.puedeEditar;
    if (puedeEditar === undefined) {
        puedeEditar = permitirAccion;
    }
    let puedeEliminar = propiedades.puedeEliminar;
    if (puedeEliminar === undefined) {
        puedeEliminar = permitirAccion;
    }
    let textoEliminar = propiedades.textoEliminar;
    if (textoEliminar === undefined) {
        textoEliminar = 'Desactivar';
    }
    let textoCrear = propiedades.textoCrear;
    if (textoCrear === undefined) {
        textoCrear = 'Nuevo';
    }
    let textoGuardarCreacion = propiedades.textoGuardarCreacion;
    if (textoGuardarCreacion === undefined) {
        textoGuardarCreacion = 'Guardar';
    }
    const accionesExtra = propiedades.accionesExtra;
    let valoresIniciales = propiedades.valoresIniciales;
    if (valoresIniciales === undefined) {
        valoresIniciales = {};
    }
    const prepararEnvio = propiedades.prepararEnvio;
    const camposExtra = propiedades.camposExtra;
    const transformarFilas = propiedades.transformarFilas;
    const ordenDescendente = propiedades.ordenDescendente;
    const alCargar = propiedades.alCargar;
    let recargar = propiedades.recargar;
    if (recargar === undefined) {
        recargar = 0;
    }
    const porPagina = propiedades.porPagina;
    const embebido = propiedades.embebido;

    const crud = useCrud({
        recurso, ids, filtros, conInactivos, textoEliminar, prepararEnvio, transformarFilas,
        ordenDescendente, alCargar, recargar
    });
    const { edicion, setEdicion } = crud;

    let listaCampos = campos || [];
    if (typeof campos === 'function') {
        if (edicion) {
            listaCampos = campos(edicion.valores || {}, edicion.modo);
        } else {
            listaCampos = campos({}, undefined);
        }
    }

    const hayAcciones = !soloLectura || accionesExtra;
    let acciones;
    if (hayAcciones) {
        acciones = function (fila) {
            function iniciarEdicion() {
                setEdicion({ modo: 'editar', valores: { ...fila }, original: fila });
            }

            return (
                <div className="flex flex-wrap justify-end gap-1.5">
                    {accionesExtra?.(fila, crud.cargar)}
                    {!soloLectura && puedeEditar(fila) && (
                        <button type="button" className="btn btn-sec btn-sm"
                            onClick={iniciarEdicion}>
                            Editar
                        </button>
                    )}
                    {!soloLectura && reactivable && crud.estaInactivo(fila) && (
                        <button type="button" className="btn btn-exito btn-sm" onClick={() => crud.reactivar(fila)}>
                            Reactivar
                        </button>
                    )}
                    {!soloLectura && puedeEliminar(fila) && !crud.estaInactivo(fila) && (
                        <button type="button" className="btn btn-peligro btn-sm" onClick={() => crud.eliminar(fila)}>
                            {textoEliminar}
                        </button>
                    )}
                </div>
            );
        };
    }

    let contenidoTabla;
    if (crud.cargando && crud.filas.length === 0) {
        contenidoTabla = <Cargando />;
    } else {
        contenidoTabla = (
            <Tabla columnas={columnas} filas={crud.visibles} acciones={acciones} porPagina={porPagina}
                claveFila={crud.rutaIds} />
        );
    }

    let tituloEdicion = 'Editar';
    if (edicion && edicion.modo === 'crear') {
        tituloEdicion = `${textoCrear}`;
    }

    let textoGuardar = 'Guardar';
    if (crud.guardando) {
        textoGuardar = 'Guardando...';
    } else if (edicion && edicion.modo === 'crear') {
        textoGuardar = textoGuardarCreacion;
    }

    function iniciarCreacion() {
        setEdicion({ modo: 'crear', valores: { ...valoresIniciales } });
    }

    function cerrarEdicion() {
        setEdicion(null);
    }

    function actualizarValores(valores) {
        setEdicion({ ...edicion, valores });
    }

    return (
        <section>
            {!embebido && <Cabecera titulo={titulo} descripcion={descripcion} />}

            <div className="mb-3 flex flex-wrap items-center gap-3">
                <input type="search" className="min-w-0 flex-1 sm:max-w-xs" placeholder="Buscar..." value={crud.busqueda}
                    onChange={(evento) => crud.setBusqueda(evento.target.value)} aria-label="Buscar" />
                {conInactivos && (
                    <label className="casilla">
                        <input type="checkbox" checked={crud.verTodos} onChange={(evento) => crud.setVerTodos(evento.target.checked)} />
                        Mostrar desactivados
                    </label>
                )}
                {!soloLectura && (
                    <button type="button" className="btn ml-auto"
                        onClick={iniciarCreacion}>
                        <Plus size={16} strokeWidth={1.75} aria-hidden="true" /> {textoCrear}
                    </button>
                )}
            </div>

            {contenidoTabla}

            <Modal titulo={tituloEdicion} abierto={!!edicion}
                alCerrar={cerrarEdicion}>
                {edicion && (
                    <form onSubmit={crud.guardar}>
                        <Formulario campos={listaCampos} valores={edicion.valores} modo={edicion.modo}
                            alCambiar={actualizarValores} />
                        {camposExtra != null && camposExtra(edicion.valores, edicion.modo, actualizarValores)}
                        <Pie>
                            <button type="button" className="btn btn-sec" onClick={cerrarEdicion}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn" disabled={crud.guardando}>
                                {textoGuardar}
                            </button>
                        </Pie>
                    </form>
                )}
            </Modal>
        </section>
    );
}
