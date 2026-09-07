# Turno de Hoy — Limpieza Casa Holanda

App web para organizar los turnos de limpieza de la casa compartida de 7 personas: **Yassine, Jorge, Miguel, Noel, Ali, Raul y Alberto**.

## Enlace de la app

https://claude.ai/code/artifact/e2732477-bc6b-4405-aaef-b56f51859ca7

Por defecto los artifacts se publican privados. Para que los 7 podáis acceder, compártelo desde el propio menú de la página con permiso de **edición**, no solo de vista. Si alguien solo puede ver pero no marcar tareas, es por ese permiso.

## Qué hace

### Turnos
- Un turno por día, en orden fijo, rotando cada semana: Yassine → Jorge → Miguel → Noel → Ali → Raul → Alberto. Empezó el 2026-09-07.
- Cada día, a quien le toca debe: **sacar la basura (poniendo bolsa nueva)** y **barrer y fregar toda la casa**, adjuntando una foto de cada tarea.
- **Cubos verdes**: los domingos hay que sacar los cubos verdes a la calle y los lunes volver a meterlos. Es una tarea semanal aparte, con su propio responsable configurable desde el panel de admin (ahora mismo sin asignar).

### Fotos: solo cámara, nunca galería
Al pulsar "Hacer foto" se abre la cámara **dentro de la app** (`getUserMedia`) con un botón de disparo: no hay forma de elegir una imagen de la galería. Si el navegador no permite abrir la cámara incrustada, cae en un `input` con `capture="environment"`, que en el móvil abre directamente la cámara.

### Verificación de Miguel
- Cada foto queda marcada como *pendiente de revisión* hasta que Miguel pulse **✓ Verificar**.
- Miguel ve un aviso en la app con las fotos pendientes, y recibe un correo cada noche (ver más abajo).

### Stock de material de limpieza
- Artículos separados por zonas: **Cocina, Baño abajo, Baño arriba, Ducha** (se pueden añadir más zonas).
- Cualquiera puede marcar un artículo como **OK / Queda poco / Agotado**. En cuanto algo no está OK, aparece un aviso de stock bajo en la pantalla principal y una lista de la compra.
- Cada artículo puede llevar un precio de referencia (lo ponen los admins).

### Bote común y tickets
- Al registrar una compra hay que hacer **foto del ticket** (sin ticket no se puede guardar), indicar el importe, el concepto y qué artículos se han repuesto (se marcan como OK automáticamente).
- El bote común se calcula como aportaciones − compras. Las aportaciones las registran los admins.

### Administradores
**Miguel** (jefe de la casa) y **Alberto** (desarrollador) tienen una pestaña Admin para: editar las tareas diarias y semanales, asignar el responsable de los cubos, reordenar o cambiar la rotación, gestionar artículos/zonas/precios y registrar aportaciones al bote.

## Correo diario a Miguel

Una página publicada no puede enviar correos por sí sola (el navegador bloquea las conexiones externas), así que el aviso lo manda una **tarea programada de Claude** en el equipo de Alberto:

- **Tarea:** `resumen-limpieza-miguel` (en `~/.claude/scheduled-tasks/`)
- **Cuándo:** todas las noches sobre las 23:00
- **Qué hace:** lee el artifact publicado, extrae el estado con `resumen-diario.mjs` y envía a `Miguel.ferrer.toribio@gmail.com` un correo con las tareas del día, quién las hizo, las fotos pendientes de revisar, los productos por comprar, las compras del día y el saldo del bote.

⚠️ **La tarea solo se ejecuta con la app de Claude abierta.** Si a las 23:00 está cerrada, el correo sale en el siguiente arranque.

## Cómo funciona técnicamente

Está publicada como un **Claude Artifact** con la capacidad `artifact` (auto-publicación). No hay base de datos externa: el estado de la app va incrustado en el propio HTML entre los marcadores `STATE_START` / `STATE_END`, y cada vez que alguien completa una tarea la página se republica a sí misma, de modo que todos los que tengan el enlace abierto ven el cambio.

- **Identificación:** cada uno elige su nombre de una lista de 7; se recuerda en ese dispositivo (`localStorage`).
- **Fotos:** se comprimen en el navegador (640 px para tareas, 900 px para tickets, JPEG calidad 0.6) y se guardan como data URI dentro del HTML.
- **Control de tamaño:** las fotos de tareas se conservan 7 días (después el día se archiva solo con el resultado), se guardan los 12 últimos tickets, y hay una poda automática si el estado supera ~3 MB.

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La app entera (HTML + CSS + JS en un solo archivo) |
| `resumen-diario.mjs` | Extrae un resumen compacto del estado del artifact; lo usa la tarea programada del correo |
| `README.md` | Esta documentación |

## Historial de cambios

- **2026-09-07 (v2)**: Fotos solo desde cámara. Tareas reducidas a basura + barrer/fregar. Tarea semanal de cubos verdes (domingo saca / lunes entra). Verificación de fotos por Miguel. Sección de stock por zonas con avisos de stock bajo. Registro de compras con foto del ticket y bote común. Pestañas Hoy / Stock / Historial / Admin. Correo diario automático a Miguel a las 23:00.
- **2026-09-07 (v1)**: Primera versión — rotación diaria fija, 3 tareas por defecto, panel de admin para Miguel y Alberto.

## Pendiente

- Decidir quién es el responsable de sacar los cubos verdes los domingos (se asigna desde la pestaña Admin).
- Más secciones y tareas que se irán añadiendo.
