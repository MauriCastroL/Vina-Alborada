# Viña La Alborada

Descomprima el ZIP y abra una terminal en la carpeta que contiene `compose.yaml`. Ejecute los comandos desde esa carpeta. El primer arranque requiere conexión a internet para descargar las dependencias.

## Arrancar con Docker

Con Docker y Compose en ejecución, ejecute este comando. El primer arranque puede tardar varios minutos mientras se compila la aplicación y se prepara Oracle con los datos de demostración.

```sh
docker compose up --build -d --wait
```

Cuando termine, abra [http://localhost:3001](http://localhost:3001).

Para detener la aplicación y conservar los datos, ejecute `docker compose down`. Para volver a los datos iniciales de la demo, `docker compose down -v` elimina los datos guardados. Después puede repetir el comando de arranque.

Si el arranque falla, consulte `docker compose logs --tail 80 oracle app` y compruebe que el puerto `3001` esté libre.

## Arrancar sin Docker

Necesita Node.js 22 (22.12 o superior dentro de esa versión), una instancia de Oracle Database disponible y SQL*Plus para cargar los datos de la demo. Si la base ya está instalada en otro equipo, utilice su dirección, puerto y servicio en lugar de `localhost:1521/FREEPDB1`. [Descargar Node.js](https://nodejs.org/en/download) · [Instalar Oracle Database Free](https://www.oracle.com/database/free/get-started/) · [Descargar SQL*Plus con Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/downloads.html)

### Preparar Oracle una vez

Conéctese con la cuenta `SYSTEM`. SQL*Plus le pedirá la contraseña elegida al instalar Oracle.

```sh
sqlplus -L system@localhost:1521/FREEPDB1
```

En la consola de SQL*Plus, cree un usuario exclusivo para la demo. Si otra persona administra Oracle, pídale que cree el usuario con estos permisos.

```sql
CREATE USER alborada IDENTIFIED BY AlboradaEsquema2026 DEFAULT TABLESPACE users QUOTA 100M ON users;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE PROCEDURE, CREATE TRIGGER TO alborada;
EXIT
```

De vuelta en la terminal, genere la versión del script para un esquema vacío.

```sh
node -e "const fs = require('node:fs'); const sql = fs.readFileSync('DB/script.sql', 'utf8'); fs.writeFileSync('DB/demo-inicial.sql', sql.replace(/^DROP .*\r?\n/gm, ''));"
```

Configure SQL*Plus para leer el script en UTF-8. En PowerShell de Windows use `$env:NLS_LANG = "AMERICAN_AMERICA.AL32UTF8"`. En Bash o Zsh use `export NLS_LANG=AMERICAN_AMERICA.AL32UTF8`. En esa misma terminal, conéctese con el usuario de la demo.

```sh
sqlplus -L alborada@localhost:1521/FREEPDB1
```

Introduzca la contraseña `AlboradaEsquema2026` y ejecute lo siguiente en SQL*Plus. La primera consulta debe devolver cero filas y la segunda debe mostrar `ADMIN@ALBORADA.CL`.

```sql
WHENEVER SQLERROR EXIT FAILURE ROLLBACK
WHENEVER OSERROR EXIT FAILURE ROLLBACK
SET DEFINE OFF
@DB/demo-inicial.sql
SELECT OBJECT_NAME, OBJECT_TYPE FROM USER_OBJECTS WHERE STATUS = 'INVALID';
SELECT CORREO FROM CEMJ_USUARIO WHERE CORREO = 'ADMIN@ALBORADA.CL';
EXIT
```

### Configurar y arrancar la aplicación

Cree un archivo de texto llamado `Backend/.env` con este contenido. Ajuste la conexión, el usuario y la contraseña si su instalación usa otros valores.

```dotenv
DB_USUARIO=alborada
DB_CLAVE=AlboradaEsquema2026
DB_CONEXION=localhost:1521/FREEPDB1
JWT_SECRETO=pegue_aqui_el_secreto_generado
```

Genere el valor para `JWT_SECRETO` con este comando y péguelo en el archivo.

```sh
node -p "require('node:crypto').randomBytes(48).toString('hex')"
```

Desde la carpeta raíz, instale las dependencias, compile la interfaz y arranque el servidor.

```sh
npm --prefix Frontend ci
npm --prefix Frontend run build
npm --prefix Backend ci
npm --prefix Backend start
```

Cuando aparezca `Servidor listo`, abra [http://localhost:3001](http://localhost:3001). Puede comprobar la conexión con Oracle en [http://localhost:3001/api/salud](http://localhost:3001/api/salud). Para detener la app, presione `Ctrl+C`. Para volver a iniciarla, ejecute `npm --prefix Backend start` con Oracle en funcionamiento.

## Cuentas de demostración

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@alborada.cl` | `Alborada2026` |
| Vendedor | `ventas1@alborada.cl` | `Ventas2026` |

Para probar como cliente, cree una cuenta desde **Registrarse** en la tienda.
