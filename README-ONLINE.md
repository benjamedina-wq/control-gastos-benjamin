# Cuentas Claras

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

La app ya trae cargada la direccion de Supabase y la clave publica anonima. El usuario no tiene que tocar esos datos tecnicos.

1. En Supabase, ejecutar una sola vez el contenido de `supabase-setup.sql`.
2. Abrir la app.
3. Crear cuenta o entrar con correo y contrasena.
4. Repetir el mismo ingreso en la PC y en el telefono.
5. Cada dispositivo abierto sube cambios al instante, baja cambios al abrir, al volver a enfocar la app y revisa la nube cada pocos segundos.
6. Si un dispositivo esta apagado o cerrado, se actualiza cuando se vuelva a abrir la app.

Importante: esto actualiza **todo el sistema junto**, no por partes. Cada dispositivo abierto sube una copia completa despues de cada cambio y revisa cambios en la nube automaticamente. Un dispositivo apagado no puede actualizarse hasta que se prenda y abra la app. Cada usuario ve solo sus propios datos gracias al ingreso con usuario de Supabase. Esta integracion sigue siendo una sincronizacion simple por copia completa; si el mismo usuario edita en dos dispositivos al mismo tiempo, queda la ultima copia subida.

## Conservar los datos de Benjamin Medina

Si la computadora de escritorio ya tiene datos cargados, esa compu tiene que ser la primera en conectarse a la nube:

1. Abrir la app en la computadora donde estan los datos.
2. Ir a Datos > Copia de seguridad y descargar una copia manual.
3. Cerrar sesion si hiciera falta.
4. Entrar o registrar el usuario de Benjamin Medina desde la pantalla inicial.
5. Ir a Datos > Sincronizacion y presionar Actualizar sistema completo para mandar esa copia completa a Supabase.
6. Recien despues entrar con el mismo usuario en el celular u otra computadora.

Como proteccion extra, la app guarda una copia automatica local antes de restaurar un archivo o antes de traer una copia desde la nube. Ese resguardo queda en la misma computadora, dentro del navegador.

## Actualizar el sitio existente en Netlify

No uses `app.netlify.com/drop` para actualizar, porque crea un sitio nuevo. Entra a Netlify > Sitios, abre tu sitio, entra a "Deploys" o "Publicaciones" y arrastra el ZIP actualizado en el area de publicacion manual.

Las fotos de facturas tambien se guardan localmente en el navegador del dispositivo, comprimidas dentro del registro del gasto. No se suben a Netlify ni a ningun servidor.
