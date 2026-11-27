export function destinoTrasEntrar(usuario, volver) {
    let rutaInterna = null;
    if (volver && volver.startsWith('/') && !volver.startsWith('//')) {
        rutaInterna = volver;
    }

    if (usuario?.rol === 'CLIENTE') {
        return rutaInterna || '/';
    }

    if (rutaInterna && rutaInterna !== '/') {
        return rutaInterna;
    }
    return '/inicio';
}
