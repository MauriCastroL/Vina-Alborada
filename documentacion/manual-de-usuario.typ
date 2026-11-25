#set document(title: "Manual de usuario de Viña La Alborada")
#set page(paper: "a4", margin: (x: 22mm, y: 21mm), numbering: "1")
#set text(lang: "es", size: 10.5pt)
#set par(justify: true)
#set heading(numbering: "1.1")
#show heading.where(level: 1): set text(fill: rgb("#68283e"))
#align(center)[#text(25pt, weight: "bold", fill: rgb("#68283e"))[Viña La Alborada] \
  #text(15pt)[Manual de usuario]]
#outline(depth: 2)

= Iniciar el sistema
Los comandos se ejecutan desde la raíz del proyecto, en terminales separadas según se indica. El entorno local supone que el contenedor `oracle-free` ya existe y que `Backend/.env` apunta a un esquema Oracle con acceso. Para preparar una base demo nueva, ejecutar primero `DB/script.sql` y luego `DB/DATOS_DEMO.sql` con el usuario del esquema. El primer script elimina las tablas existentes de este proyecto, por lo que se usa para inicializar o reiniciar una base descartable.

== Oracle
```sh
podman start oracle-free
```
Esperar hasta que el servicio Oracle acepte conexiones. Si es necesario revisar su arranque, ejecutar `podman logs --tail 80 oracle-free`.

== Backend
```sh
cd Backend
npm ci
npm start
```
`npm ci` se usa para instalar las dependencias si aún no están instaladas. El backend lee `DB_USUARIO`, `DB_CLAVE` y `DB_CONEXION` desde `Backend/.env`. Son credenciales de conexión Oracle. Esperar los mensajes «Conectado a Oracle» y «Servidor listo». El puerto por defecto es 3001 y es el destino del proxy de Vite para `/api`.

== Frontend
```sh
cd Frontend
npm ci
npm run dev
```
Abrir la URL que indica Vite, normalmente `http://localhost:5173`. Mantener ambos procesos abiertos. Como alternativa de ejecución compilada, correr `npm run build` en Frontend y arrancar o reiniciar Express, que sirve `Frontend/dist` desde el puerto 3001.

== Cuentas de prueba
Estas cuentas corresponden a la carga `DB/DATOS_DEMO.sql`. Las contraseñas distinguen mayúsculas y minúsculas.

#table(columns: (1fr, 2.05fr, 1.05fr), inset: 6pt, align: left,
  table.header([Perfil], [Correo], [Contraseña]),
  [Administrador], [`ADMIN@ALBORADA.CL`], [`Alborada2026`],
  [Vendedor 1], [`VENTAS1@ALBORADA.CL`], [`Ventas2026`],
  [Vendedor 2], [`VENTAS2@ALBORADA.CL`], [`Ventas2026`],
  [Cliente web], [`CAMILA.ROJAS@CORREO-DEMO.CL`], [`Cliente2026`],
)

= Acceso y navegación
Al entrar, confirmar «Sí, tengo 18 años o más» si corresponde. La tienda pública muestra el catálogo sin cuenta. En «Iniciar sesión» escribir correo y contraseña y pulsar «Ingresar». El cliente vuelve a la tienda o a la acción solicitada y el personal accede al panel. En el panel, el menú lateral muestra las opciones autorizadas y se puede abrir con el botón de menú en pantallas pequeñas. Usar «Cerrar sesión» al cambiar de perfil durante la demostración. La opción «Cambiar contraseña» en el panel solicita la contraseña actual y permite guardar una nueva.

#table(columns: (1.12fr, 2.9fr), inset: 6pt, align: left,
  table.header([Perfil], [Opciones del panel]),
  [Cliente], [Inicio (Mi cuenta), Tienda y Mis pedidos.],
  [Vendedor], [Inicio (Resumen de operaciones), Ventas, Solicitudes web, Inventario, Clientes y Reportes.],
  [Administrador], [Operaciones del vendedor, más Productos, Categorías, Cepas, Usuarios, Métodos de pago y Monitoreo.],
)

= Cliente web
== Crear cuenta
+ En la tienda, pulsar «Crear cuenta» o seleccionar la pestaña de registro en el acceso.
+ Elegir persona natural o empresa. Persona natural completa nombre y dos apellidos. Empresa completa RUT y razón social. Indicar teléfono si se desea, correo, contraseña y confirmación.
+ Pulsar «Crear cuenta». Si el formulario rechaza el RUT o detecta datos ya registrados, revisar los campos señalados. También se puede ingresar directamente con la cuenta demo.

== Explorar la tienda y agregar productos
+ Navegar por «Nuestros vinos», «Uva a granel» y «Más vendidos» cuando esas secciones tengan productos. Buscar por nombre o cepa y usar las opciones de orden. Revisar precio, formato, composición y disponibilidad en la tarjeta.
+ Elegir cantidad en botellas o kilos según el producto y pulsar «Agregar». Si se abre el aviso de acceso, iniciar sesión o crear la cuenta para continuar. «Agotado» indica que el producto carece de stock disponible para agregar.
+ Abrir «Mis pedidos» desde la tienda o el menú. Allí se muestran el borrador y el historial. Consultar el folio, las cantidades, los subtotales y el total.

== Enviar un producto y consultar su estado
+ En el borrador, editar cantidades y pulsar «Guardar cantidad» cuando se quiera persistir una edición. «Quitar» elimina una línea. «Anular pedido» cancela el borrador completo después de pedir confirmación.
+ Seleccionar un método de pago activo en la fila y pulsar «Enviar producto». Si había varias líneas, la línea enviada pasa a su propia solicitud pendiente y las restantes siguen en el borrador. Si era la única línea, se envía el pedido actual.
+ Consultar el historial por folio. En un pendiente o un aceptado con venta en borrador se puede cambiar la selección con «Guardar método de pago». La selección identifica la forma de pago para el pedido. El envío web no realiza un cobro.
+ Los estados del pedido son borrador (en preparación), pendiente (enviado), aceptado o rechazado (resuelto) y anulado (borrador cancelado). Cuando existe venta asociada, puede aparecer su estado, número y, si hay metadatos de pago, el ID de transacción al confirmarse o anularse la venta.

= Vendedor
== Inicio y clientes
Entrar como vendedor para ver el resumen de operaciones, las solicitudes pendientes y los productos bajo mínimo. Ir a «Clientes» para buscar fichas o pulsar «Nuevo cliente». Elegir persona natural o empresa, completar identidad y datos de contacto y guardar. «Editar» ajusta la ficha. «Desactivar» da de baja lógica al cliente si no tiene solicitudes pendientes. Activar «Mostrar desactivados» y pulsar «Reactivar» para recuperarlo. Esta ficha permite seleccionar al comprador en una venta presencial.

== Registrar una venta presencial
+ Abrir «Ventas» y pulsar «Nueva venta presencial». Elegir «Sin registro (mostrador)» o «Cliente registrado». Para un cliente registrado, buscar por RUT, correo o nombre y seleccionarlo. En mostrador, el nombre es opcional.
+ Introducir el lugar de venta y, si hacen falta, observaciones. Pulsar «Crear venta y agregar productos». El detalle abre en estado borrador.
+ En «Agregar producto», usar el buscador por nombre, código, categoría o formato, elegir el producto, escribir cantidad y pulsar «Agregar». Revisar las líneas y el total. Al agregar el mismo producto se acumula la cantidad y se comprueba el stock.
+ En «Confirmar venta y registrar pago», seleccionar método activo y confirmar. La venta pasa a confirmada, aparece el pago y se descuenta el stock. Ver los detalles desde «Ventas», que permite buscar y filtrar por estado.
+ Para revertir una venta confirmada, abrir el detalle, indicar «Motivo» y pulsar «Anular venta». Verificar estado anulado, movimiento de reversión y stock restituido. La bitácora y el pago histórico permanecen como evidencia.

== Consultar o anular solicitudes web
Abrir «Solicitudes web», buscar el folio y abrir el detalle. Ver cliente, fecha y estado en el listado, y productos, cantidades, subtotales, total y método cuando se ha elegido uno. «Ver venta N°» aparece si existe una venta vinculada. «Anular solicitud» está disponible en borrador y pendiente. Una solicitud pendiente anulada por el personal queda como rechazada. La versión actual del panel ofrece consulta y anulación. El procedimiento de aceptación está en Oracle y la confirmación del panel se limita a ventas presenciales.

== Operar el inventario
+ Abrir «Inventario» y comparar stock y mínimo en «Stock actual». Un producto marcado como bajo mínimo requiere revisar la reposición.
+ En «Movimientos», pulsar «Nuevo movimiento», seleccionar producto y tipo, introducir cantidad y guardar. Usar entrada para incorporar existencias, ajuste positivo para sumar y ajuste negativo para restar. Los ajustes requieren motivo.
+ El registro queda en borrador. Usar «Editar» para corregir, «Anular» para cancelar o «Aplicar» para actualizar el stock. Si el ajuste negativo supera las existencias, reducir la cantidad o verificar el stock antes de aplicar.
+ Consultar el folio, estado y usuario en la tabla. Las salidas y reversiones de venta aparecen automáticamente al confirmar o anular.

== Consultar reportes
- «Productos más y menos vendidos del mes». Elegir mes y revisar posiciones, unidades y montos. Abrir «Ver tabla» para los valores detallados.
- «Ventas mensuales por canal». Cambiar año y comparar las ventas presenciales y digitales. Consultar los indicadores y la tabla mensual.
- «Stock crítico y reposición». Cambiar período entre 7, 30 o 90 días. Revisar stock, mínimo, demanda, días de cobertura y cantidad sugerida; usar el filtro de alertas para concentrarse en los casos que requieren atención.

= Administrador
== Usar los mantenedores
El administrador dispone de las operaciones del vendedor. En cada mantenedor, usar la búsqueda, el botón de alta y «Guardar». Abrir «Editar» desde la fila para modificar. «Desactivar» conserva los datos históricos. «Mostrar desactivados» permite localizarlos donde aparece la casilla.

- *Categorías.* Crear nombre, descripción y unidad botella o kilogramo. La unidad queda protegida si hay productos asociados. Una categoría con productos activos no admite baja. Usar «Reactivar» para recuperar una categoría dada de baja.
- *Cepas.* Crear nombre y descripción. Si participa en productos activos, hay que retirar ese uso antes de darla de baja. Usar «Reactivar» para recuperarla.
- *Productos.* Pulsar «Nuevo producto». Indicar código único, categoría, nombre, precio CLP, cantidad y unidad del formato, stock mínimo y añada o descripción cuando corresponda. Elegir cepas activas y porcentajes que sumen 100%. Para la categoría por kg se elige una sola cepa al 100%. Pulsar «Guardar y activar». El stock inicial es cero y se carga en Inventario mediante una entrada aplicada.
- *Composición.* Abrir «Cepas» desde la fila del producto. Desactivar el producto antes de editar su composición. Agregar, editar o quitar filas y verificar el total. Pulsar «Activar» cuando las cepas estén activas y sumen 100%. Si se mostró un aviso al crear el producto, revisar qué cepas se guardaron y completar la ficha antes de activarlo.
- *Clientes.* Alta, modificación, baja y reactivación según el flujo de vendedor.
- *Usuarios.* Pulsar «Nuevo usuario», ingresar correo, perfil y contraseña de al menos seis caracteres. Si el perfil es cliente, seleccionar su ficha. En edición, dejar vacía «Nueva contraseña» para conservar la actual. Cambiar la casilla «Activo» para habilitar o deshabilitar la cuenta.
- *Métodos de pago.* Pulsar «Nuevo método», indicar nombre, descripción y estado. Editar la casilla «Activo» para controlar si aparece al registrar pagos nuevos.

== Monitoreo
- *Auditoría de cambios.* Elegir período y tabla. Revisar fecha, operación, registro, responsable y detalle. Los triggers generan estos eventos y la interfaz permite consultarlos.
- *Alertas de stock.* Consultar eventos de ingreso bajo mínimo y reposición. Comparar los cambios con el stock actual de Inventario.
- *Intentos de inicio de sesión.* Revisar registros de acceso por período y distinguir éxitos y fallos. Después de cinco fallos de credenciales en la ventana de 15 minutos, esperar a que venza el bloqueo y volver a ingresar con la contraseña correcta.

= Demostración y resolución de problemas
+ *Cliente.* Agregar un producto con stock, enviarlo y anotar el folio.
+ *Vendedor.* Localizar el folio en Solicitudes web. Crear, confirmar y anular una venta presencial de prueba. Verificar en Inventario la diferencia de stock y la reversión.
+ *Administrador.* Abrir Monitoreo y localizar la venta y los movimientos. Consultar los reportes del mes y del año de carga. Mostrar el estado bajo mínimo con los productos de la carga demo.

Si la tienda no carga productos, revisar que Oracle y Express estén activos y que se haya cargado la demo. Si Vite muestra un error de proxy, comprobar que el backend escucha en el puerto 3001. Si faltan módulos, verificar la cuenta y volver a iniciar sesión. Si faltan métodos de pago, pedir al administrador que revise si hay alguno activo. Si se rechaza una confirmación por stock insuficiente, comprobar existencias en Inventario antes de repetirla.
