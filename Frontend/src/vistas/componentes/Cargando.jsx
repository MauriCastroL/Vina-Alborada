export default function Cargando(propiedades) {
    let filas = propiedades.filas;
    if (filas === undefined) {
        filas = 5;
    }

    return (
        <div className="animate-difuminar overflow-hidden rounded-lg border border-borde bg-white p-4"
            role="status" aria-label="Cargando">
            <div className="esqueleto mb-4 h-4 w-1/3" />
            <div className="flex flex-col gap-4">
                {Array.from({ length: filas }, function (_, indice) {
                    return (
                        <div key={indice} className="flex gap-3" style={{ opacity: 1 - indice * 0.14 }}>
                            <div className="esqueleto h-3.5 flex-[2]" />
                            <div className="esqueleto h-3.5 flex-[3]" />
                            <div className="esqueleto h-3.5 flex-1" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
