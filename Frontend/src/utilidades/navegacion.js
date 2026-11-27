export function irASeccion(id) {
    return function (evento) {
        evento.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };
}
