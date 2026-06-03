# Control de gastos e ingresos

Esta carpeta ya esta lista para publicar como app web estatica.

## Estructura recomendada

- GitHub guarda el codigo.
- Netlify muestra la app publicada.
- Supabase guarda y sincroniza los datos.
- Codex ayuda a programar y modificar el sistema.

## Archivos principales

- `index.html`: pantalla principal.
- `styles.css`: estilos.
- `app.js`: logica de movimientos, ingresos, gastos, cuentas, tarjetas, deudas, vencimientos, PIN, pagos, modos, presupuestos, recurrentes, copia de seguridad, Excel, reportes, escaneo y sincronizacion en la nube.
- `manifest.webmanifest`: configuracion para instalar en el movil.
- `sw.js`: guardado local para abrir mas rapido y funcionar sin conexion basica.
- `icon.svg`: icono de la app.
- `supabase-setup.sql`: tabla y permisos para sincronizacion en la nube.
- `netlify.toml`: configuracion para publicar en Netlify.
- `README.md`: documentacion para GitHub.

## Para usarla en el movil

1. Publica esta carpeta en un hosting con HTTPS.
2. Abri el link desde el navegador del celular.
3. En Android/Chrome: menu > Agregar a pantalla principal.
4. En iPhone/Safari: compartir > Agregar a inicio.

Los gastos e ingresos se guardan en el navegador del dispositivo, junto con cuenta, ambito personal/negocio, tipo de pago, modo, etiquetas, notas, vencimientos, deudas, tarjetas, presupuestos y movimientos recurrentes.

## Sincronizacion en la nube con Supabase

1. Crea un proyecto en Supabase.
2. En SQL Editor, pega y ejecuta el contenido de `supabase-setup.sql`.
3. En Supabase, copia la direccion del proyecto y la clave publica anonima.
4. En la app, entra en Datos > Sincronizacion.
5. Pega URL y clave publica anonima.
6. Registra o entra con correo y contrasena.
7. En cada dispositivo, usa la misma URL, clave y usuario.
8. Cada dispositivo abierto sube cambios al instante, baja cambios al abrir, al volver a enfocar la app y revisa la nube cada pocos segundos.
9. Si un dispositivo esta apagado o cerrado, se actualiza cuando se vuelva a abrir la app.

Importante: esto actualiza **todo el sistema junto**, no por partes. Cada dispositivo abierto sube una copia completa despues de cada cambio y revisa cambios en la nube automaticamente. Un dispositivo apagado no puede actualizarse hasta que se prenda y abra la app. Cada usuario ve solo sus propios datos gracias al ingreso con usuario de Supabase. Esta integracion sigue siendo una sincronizacion simple por copia completa; si el mismo usuario edita en dos dispositivos al mismo tiempo, queda la ultima copia subida.

## Conservar los datos de Benjamin Medina

Si la computadora de escritorio ya tiene datos cargados, esa compu tiene que ser la primera en conectarse a la nube:

1. Abrir la app en la computadora donde estan los datos.
2. Ir a Datos > Copia de seguridad y descargar una copia manual.
3. Ir a Datos > Sincronizacion.
4. Entrar o registrar el usuario de Benjamin Medina.
5. Presionar Subir datos para mandar esa copia completa a Supabase.
6. Recien despues entrar con el mismo usuario en el celular u otra computadora.

Como proteccion extra, la app guarda una copia automatica local antes de restaurar un archivo o antes de traer una copia desde la nube. Ese resguardo queda en la misma computadora, dentro del navegador.

## Actualizar el sitio existente en Netlify

No uses `app.netlify.com/drop` para actualizar, porque crea un sitio nuevo. Entra a Netlify > Sitios, abre tu sitio, entra a "Deploys" o "Publicaciones" y arrastra el ZIP actualizado en el area de publicacion manual.

Las fotos de facturas tambien se guardan localmente en el navegador del dispositivo, comprimidas dentro del registro del gasto. No se suben a Netlify ni a ningun servidor.
