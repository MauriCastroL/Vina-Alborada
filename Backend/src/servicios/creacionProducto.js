const baseDatos = require('../config/baseDatos');
const modelo = require('../modelos/mantenedorModelo');
const productos = require('../modelos/mantenedores/productos');
const productosCepas = require('../modelos/mantenedores/productosCepas');
const cepas = require('../modelos/mantenedores/cepas');
const { parametrosCrear, parametrosModificar } = require('./mantenedorServicio');
const { errorApp, traducirError } = require('../utilidades/errores');

async function crearProducto(cuerpo, usuario) {
    const activar = cuerpo.ACTIVAR_AL_GUARDAR === true || Number(cuerpo.ACTIVO ?? 1) === 1;
    if (!Array.isArray(cuerpo.CEPAS)) throw errorApp(20105, 'INGRESE LA COMPOSICION DEL PRODUCTO');

    const composicion = cuerpo.CEPAS.map(function (cepa) {
        return {
            ID_CEPA: Number(cepa?.ID_CEPA),
            PORCENTAJE: Number(cepa?.PORCENTAJE)
        };
    });
    const ids = new Set();
    let total = 0;
    for (const cepa of composicion) {
        const idCepa = cepa.ID_CEPA;
        const porcentaje = cepa.PORCENTAJE;
        const idValido = Number.isSafeInteger(idCepa) && idCepa > 0;
        const porcentajeValido = Number.isFinite(porcentaje) && porcentaje > 0 &&
            porcentaje <= 100 && Number(porcentaje.toFixed(2)) === porcentaje;

        if (!idValido || !porcentajeValido || ids.has(idCepa)) {
            throw errorApp(20105, 'INGRESE CEPAS DISTINTAS Y PORCENTAJES VALIDOS DE HASTA DOS DECIMALES');
        }
        ids.add(idCepa);
        // Sumar centésimas evita comparar porcentajes con errores de redondeo.
        total += Math.round(porcentaje * 100);
    }
    if (total > 10000 || (activar && total !== 10000)) {
        let mensajePorcentaje = 'LAS CEPAS NO PUEDEN SUMAR MAS DE 100';
        if (activar) {
            mensajePorcentaje = 'LAS CEPAS DEBEN SUMAR 100 PARA ACTIVAR EL PRODUCTO';
        }

        throw errorApp(20105, mensajePorcentaje);
    }
    if (ids.size) {
        const cepasActivas = await modelo.listar(cepas, { P_SOLO_ACTIVOS: 1 }, usuario);
        const idsActivos = new Set(cepasActivas.map(function (cepa) {
            return Number(cepa.ID_CEPA);
        }));
        for (const idCepa of ids) {
            if (!idsActivos.has(idCepa)) {
                throw errorApp(20121, 'SELECCIONE CEPAS ACTIVAS');
            }
        }
    }

    await modelo.crear(productos, parametrosCrear(productos, { ...cuerpo, ACTIVO: 0 }, usuario), usuario);

    // Los procedimientos existentes confirman cada paso por separado.
    let idProducto;
    try {
        idProducto = await baseDatos.funcion('CEMJ_FN_PRODUCTO_OBTENER_ID', { P_CODIGO: cuerpo.CODIGO }, usuario);
        for (const cepa of composicion) {
            const datos = { ...cepa, ID_PRODUCTO: idProducto };
            await modelo.crear(productosCepas, parametrosCrear(productosCepas, datos, usuario), usuario);
        }
        if (activar) {
            const guardado = (await modelo.listar(productos, {}, usuario))
                .find(function (fila) {
                    return Number(fila.ID_PRODUCTO) === Number(idProducto);
                });
            if (!guardado) throw errorApp(20100, 'NO SE PUDO CONSULTAR EL PRODUCTO CREADO');
            await modelo.modificar(productos, parametrosModificar(productos, idProducto, undefined,
                { ...guardado, ACTIVO: 1 }), usuario);
            const estado = await baseDatos.funcion('CEMJ_FN_PRODUCTO_ESTADO', { P_ID_PRODUCTO: idProducto }, usuario);
            if (Number(estado) !== 1) throw errorApp(20105, 'NO SE PUDO CONFIRMAR LA ACTIVACION');
        }
        return { ok: true, ID_PRODUCTO: idProducto, ACTIVO: Number(activar) };
    } catch (error) {
        return {
            ok: true,
            ID_PRODUCTO: idProducto,
            AVISO: `Se creó el producto, pero no se pudo completar la configuración. Revisa el producto y sus cepas. ${traducirError(error).mensaje}`
        };
    }
}

module.exports = crearProducto;
