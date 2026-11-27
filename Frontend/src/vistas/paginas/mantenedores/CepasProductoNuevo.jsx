import { nombrePropio, numero } from '../../../utilidades/formato.js';

export default function CepasProductoNuevo(propiedades) {
    const cepas = propiedades.cepas;
    const composicion = propiedades.composicion;
    const alCambiar = propiedades.alCambiar;
    const cargando = propiedades.cargando;
    const error = propiedades.error;
    const unaSola = propiedades.unaSola;

    let totalCentesimas = 0;
    for (const cepa of composicion) {
        if (cepa.ID_CEPA) {
            const porcentaje = Number(cepa.PORCENTAJE) || 0;
            totalCentesimas += Math.round(porcentaje * 100);
        }
    }
    const total = totalCentesimas / 100;

    function cambiar(indice, cambios) {
        alCambiar(composicion.map(function (cepa, posicion) {
            if (posicion === indice) {
                return { ...cepa, ...cambios };
            }
            return cepa;
        }));
    }

    function agregarCepa() {
        const porcentajeDisponible = Math.max(0, 100 - total);
        const nuevaCepa = { ID_CEPA: '', PORCENTAJE: porcentajeDisponible || '' };
        alCambiar([...composicion, nuevaCepa]);
    }

    return (
        <fieldset className="mt-5 flex flex-col gap-3 rounded-lg border border-borde p-4">
            <legend className="px-1 text-sm font-semibold">Composición de cepas</legend>
            {error && <p role="alert" className="text-sm text-peligro">{error}</p>}
            {cargando && <p className="text-sm text-suave">Cargando cepas…</p>}
            {!cargando && !error && !cepas.length && <p className="text-sm text-suave">No hay cepas activas.</p>}
            {composicion.map(function (fila, indice) {
                const opciones = cepas.filter(function (cepa) {
                    return !composicion.some((otra, posicion) =>
                        posicion !== indice && String(cepa.ID_CEPA) === String(otra.ID_CEPA));
                });
                let claseComposicion = 'grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-2';
                if (unaSola) {
                    claseComposicion = 'grid gap-2';
                }

                function quitarCepa() {
                    return alCambiar(composicion.filter((_, posicion) => posicion !== indice));
                }

                return (
                    <div key={indice} className={claseComposicion}>
                        <label className="flex flex-col gap-1 text-sm">
                            Cepa
                            <select value={fila.ID_CEPA} required
                                onChange={(evento) => cambiar(indice, { ID_CEPA: evento.target.value })}>
                                <option value="">Selecciona una cepa</option>
                                {opciones.map(function (cepa) {
                                    return (
                                        <option key={cepa.ID_CEPA} value={cepa.ID_CEPA}>{nombrePropio(cepa.NOMBRE)}</option>
                                    );
                                })}
                            </select>
                        </label>
                        {!unaSola && (
                            <>
                                <label className="flex flex-col gap-1 text-sm">
                                    Porcentaje
                                    <input type="number" min="0.01" max="100" step="0.01" value={fila.PORCENTAJE}
                                        required
                                        onChange={(evento) => cambiar(indice, { PORCENTAJE: evento.target.value })} />
                                </label>
                                <button type="button" className="btn btn-sec btn-sm" aria-label={`Quitar cepa ${indice + 1}`}
                                    disabled={composicion.length === 1}
                                    onClick={quitarCepa}>
                                    Quitar
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
            <div className="flex flex-wrap items-center justify-between gap-2">
                {!unaSola && (
                    <button type="button" className="btn btn-sec btn-sm" disabled={composicion.length >= cepas.length}
                        onClick={agregarCepa}>
                        Agregar cepa
                    </button>
                )}
                <p className="text-sm" aria-live="polite">Total {numero(total)}%</p>
            </div>
        </fieldset>
    );
}
