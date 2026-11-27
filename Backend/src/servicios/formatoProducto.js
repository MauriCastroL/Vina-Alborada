const modelo = require('../modelos/mantenedorModelo');
const categorias = require('../modelos/mantenedores/categorias');
const productos = require('../modelos/mantenedores/productos');
const { errorApp } = require('../utilidades/errores');

async function validarFormatoProducto(cuerpo, usuario, idProducto) {
    const formatoAnio = new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        timeZone: 'America/Santiago'
    });
    const maximo = Number(formatoAnio.format(new Date()));
    const anada = cuerpo.ANADA;
    if (anada != null && anada !== '') {
        const tipoValido = typeof anada === 'string' || typeof anada === 'number';
        let anio;
        if (tipoValido) {
            anio = Number(anada);
        } else {
            anio = NaN;
        }
        if (!Number.isInteger(anio) || anio < 1900 || anio > maximo) {
            throw errorApp(20207, `La añada debe ser un año entero entre 1900 y ${maximo}.`);
        }
    }

    const categoriasRegistradas = await modelo.listar(categorias, { P_SOLO_ACTIVOS: 0 }, usuario);
    const categoria = categoriasRegistradas.find(function (fila) {
        return String(fila.ID_CATEGORIA) === String(cuerpo.ID_CATEGORIA);
    });
    if (!categoria) throw errorApp(20100, 'CATEGORIA NO ENCONTRADA');

    const porPeso = String(categoria.UNIDAD_MEDIDA).toUpperCase() === 'KG';
    if (porPeso && Array.isArray(cuerpo.CEPAS) &&
        (cuerpo.CEPAS.length !== 1 || Number(cuerpo.CEPAS[0]?.PORCENTAJE) !== 100)) {
        throw errorApp(20105, 'La uva a granel debe tener una sola cepa al 100 %.');
    }

    let unidades;
    if (porPeso) {
        unidades = ['g', 'kg', 't'];
    } else {
        unidades = ['ml', 'l'];
    }
    const formato = String(cuerpo.FORMATO ?? '').trim();
    const partes = /^(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg|t)$/i.exec(formato);
    if (partes && formato.length <= 50 && unidades.includes(partes[2].toLowerCase()) &&
        Number(partes[1].replace(',', '.')) > 0) {
        const unidad = partes[2].toLowerCase();
        let unidadFormateada;
        if (unidad === 't') {
            unidadFormateada = 'T';
        } else {
            unidadFormateada = unidad;
        }

        return { ...cuerpo, FORMATO: `${partes[1].replace(',', '.')} ${unidadFormateada}` };
    }

    if (idProducto !== undefined) {
        const productosRegistrados = await modelo.listar(productos, {}, usuario);
        const existente = productosRegistrados.find(function (producto) {
            return String(producto.ID_PRODUCTO) === String(idProducto);
        });
        if (existente && existente.FORMATO === cuerpo.FORMATO &&
            String(existente.ID_CATEGORIA) === String(cuerpo.ID_CATEGORIA)) return cuerpo;
    }

    let mensajeFormato = 'INGRESE UN VOLUMEN MAYOR A CERO EN ML O L';
    if (porPeso) {
        mensajeFormato = 'INGRESE UN PESO MAYOR A CERO EN G, KG O T';
    }

    throw errorApp(20238, mensajeFormato);
}

module.exports = validarFormatoProducto;
