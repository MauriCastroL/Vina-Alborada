# Viña La Alborada

La entrega incluye la aplicación y Oracle con datos de demostración. Para probarla, basta con tener Docker con Compose en ejecución y conexión a internet durante el primer arranque.

## Ejecutar la aplicación

Descomprima el ZIP y abre una terminal en la carpeta que contiene `compose.yaml` y ejecute este comando.

```sh
docker compose up --build -d --wait
```

El primer arranque puede tardar varios minutos mientras Docker descarga las imágenes, compila la aplicación y prepara Oracle. Cuando termine, abra [http://localhost:3001](http://localhost:3001).

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@alborada.cl` | `Alborada2026` |
| Vendedor | `ventas1@alborada.cl` | `Ventas2026` |

Para probar como cliente, cree una cuenta desde **Registrarse** en la tienda.

## Detener la aplicación

```sh
docker compose down
```

Los datos quedan guardados. Si quiere reiniciar la demo desde cero, `docker compose down -v` elimina los datos guardados. Luego puede ejecutar nuevamente el comando de arranque.

Si el arranque falla, consulte en los registros con `docker compose logs --tail 80 oracle app`. El puerto `3001` debe estar libre.
