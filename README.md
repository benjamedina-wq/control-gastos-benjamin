# Cuentas Claras

Sistema web estatico para controlar ingresos, egresos, cuentas, tarjetas, deudas, presupuestos, movimientos recurrentes y sincronizacion en la nube.

## Arquitectura

- GitHub guarda el codigo.
- Netlify publica la app.
- Supabase guarda y sincroniza los datos.
- Codex ayuda a modificar y mantener el sistema.

## Publicacion

Este proyecto no necesita compilacion. Netlify publica la carpeta completa usando `netlify.toml`.

Para actualizar el sitio existente:

1. Entrar a Netlify.
2. Ir a Sites.
3. Abrir el sitio ya creado.
4. Entrar a "Deploys" o "Publicaciones".
5. Arrastrar el ZIP actualizado al area de publicacion manual.

No usar `app.netlify.com/drop` para actualizar, porque crea otro sitio.

## Supabase

1. Crear un proyecto en Supabase.
2. Abrir SQL Editor.
3. Ejecutar `supabase-setup.sql`.
4. Copiar la direccion del proyecto y la clave publica anonima.
5. En la app, ir a Datos > Sincronizacion.
6. En la app, registrar o entrar con correo y contrasena.
7. Repetir la misma conexion y el mismo usuario en cada dispositivo.

Con el usuario conectado, cada dispositivo abierto sube cambios, baja cambios al abrir y revisa cambios en la nube cada pocos segundos. Cada usuario ve solo sus propios datos.

## Multiusuario

La app ya esta preparada para varios usuarios. Cada persona se registra con su correo y contrasena, y Supabase guarda los datos separados por identificador de usuario.

Recomendacion para seguir mejorandola:

- Agregar roles: administrador, usuario normal y solo lectura.
- Crear grupos o familias para compartir una misma caja entre varias personas.
- Mejorar conflictos cuando dos dispositivos editan al mismo tiempo.
- Hacer historial de cambios para poder volver atras si alguien borra datos.
- Pasar comprobantes grandes a Storage de Supabase si se usan muchas imagenes.

## Archivos principales

- `index.html`: interfaz.
- `styles.css`: estilos.
- `app.js`: logica del sistema.
- `manifest.webmanifest`: instalacion como app.
- `sw.js`: guardado local para abrir mas rapido y funcionar sin conexion basica.
- `supabase-setup.sql`: tabla de sincronizacion en la nube.
- `netlify.toml`: configuracion de publicacion.
