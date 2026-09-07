# Turno de Hoy — Limpieza Casa Holanda

App web para organizar los turnos de limpieza de la casa compartida de 7 personas: **Yassine, Jorge, Miguel, Noel, Ali, Raul y Alberto**.

## 🔗 https://limpieza-casa-holanda.vercel.app

Se abre desde cualquier navegador y desde el móvil, **sin cuenta ni contraseña**. Quien tenga el enlace, entra. En el móvil conviene usar "Añadir a pantalla de inicio" para tenerla como una app más.

## Qué hace

### Turnos
- Un turno por día, en orden fijo, rotando cada semana: Yassine → Jorge → Miguel → Noel → Ali → Raul → Alberto. Empezó el 2026-09-07.
- Cada día, a quien le toca debe **sacar la basura (poniendo bolsa nueva)** y **barrer y fregar toda la casa**, adjuntando una foto de cada tarea.
- **Cubos verdes**: los domingos hay que sacarlos a la calle y los lunes volver a meterlos. Es una rotación semanal **aparte** de la diaria: cada semana pasa a la siguiente persona de la lista. Empieza **Alberto el domingo 13/09**, luego Yassine, Jorge, Miguel… Quien los saca el domingo es quien los entra el lunes.

  Va aparte a propósito: como son 7 personas y 7 días, en la rotación diaria cada uno cae **siempre en el mismo día de la semana** (Yassine siempre lunes, Alberto siempre domingo), así que si los cubos fueran del turno del día los haría siempre el mismo. Desde Admin se puede cambiar quién los saca el próximo domingo, y la rotación continúa correlativamente desde ahí.

### Fotos: solo cámara, nunca galería
Al pulsar "Hacer foto" se abre la cámara **dentro de la app** (`getUserMedia`) con visor en directo y botón de disparo: no hay forma de elegir una imagen de la galería. Como el sitio va por HTTPS, esto funciona de verdad en el móvil. Si algún navegador no lo permitiera, cae en un `input` con `capture="environment"`, que abre la cámara del teléfono.

### Verificación de Miguel
Cada foto queda como *pendiente de revisión* hasta que Miguel pulse **✓ Verificar**. Ve un aviso en la app con las pendientes y recibe un correo cada noche.

### Stock de material de limpieza
- Artículos por zonas: **Cocina, Baño abajo, Baño arriba, Ducha** (se pueden añadir más).
- Cualquiera marca un artículo como **OK / Queda poco / Agotado**. En cuanto algo baja, salta el aviso de stock bajo y se genera la lista de la compra.
- Cada artículo puede llevar un precio de referencia.

### Bote común y tickets
- Al registrar una compra hay que hacer **foto del ticket** (sin ticket no se guarda), indicar importe, concepto y qué artículos se han repuesto (vuelven a OK automáticamente).
- Bote común = aportaciones − compras. Las aportaciones las registran los admins.

### Administradores
**Miguel** (jefe de la casa) y **Alberto** (desarrollador) tienen pestaña Admin: editar tareas diarias y semanales, asignar el responsable de los cubos, reordenar la rotación, gestionar artículos/zonas/precios y registrar aportaciones al bote.

## Arquitectura

| Pieza | Dónde |
|---|---|
| Web (HTML/CSS/JS en un archivo, sin dependencias) | Vercel — proyecto `limpieza-casa-holanda`, desplegado desde la rama `main` de este repo |
| Datos | Supabase — tablas `casa_*` dentro del proyecto `lista-compra-masiera` |
| Fotos y tickets | Supabase Storage — bucket público `casa-fotos` |
| Correo nocturno | Tarea programada de Claude en el equipo de Alberto |

Cada push a `main` despliega solo en Vercel.

### Tablas

`casa_config` (fila única con la gente, admins, revisor, fecha de inicio de los turnos, ancla de la rotación de cubos —`bins_start_date` y `bins_start_person`—, plantillas de tareas y zonas), `casa_summary` (vista con los totales del bote), `casa_days` (una fila por día con sus tareas en JSON), `casa_items`, `casa_purchases`, `casa_contributions`.

La web habla con PostgREST usando `fetch` y la clave **publicable** de Supabase (la que va en el navegador, no es un secreto). Refresca cada 30 s y al volver a la pestaña, así todos ven lo mismo.

### Sobre el acceso

No hay login: **el enlace es la llave**. Las políticas RLS permiten leer y escribir a cualquiera con la clave publicable, que va en el código de la página. Es el modelo buscado — que los 7 entren sin fricción — pero conviene saberlo: quien tenga el enlace puede tocar los datos. Si algún día hace falta, se puede añadir un PIN de casa.

## Correo diario a Miguel

- **Tarea:** `resumen-limpieza-miguel` (en `~/.claude/scheduled-tasks/`)
- **Cuándo:** todas las noches sobre las 23:00
- **Qué hace:** ejecuta `resumen-diario.mjs`, que lee el estado de Supabase, y envía a `Miguel.ferrer.toribio@gmail.com` las tareas del día, quién las hizo, las fotos pendientes de revisar, los productos por comprar, las compras del día y el saldo del bote.

⚠️ **La tarea solo se ejecuta con la app de Claude abierta.** Si a las 23:00 está cerrada, el correo sale en el siguiente arranque. Para un correo **instantáneo** en cuanto alguien sube una foto haría falta una Edge Function de Supabase con un servicio de email (Resend, plan gratuito) — pendiente de decidir.

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La app entera (HTML + CSS + JS, sin dependencias) |
| `resumen-diario.mjs` | Lee el estado de Supabase y saca el JSON del resumen; lo usa la tarea del correo |
| `README.md` | Esta documentación |

## Historial de cambios

- **2026-09-07 (auditoría)**: Repaso completo con cuatro fallos corregidos — el bote se calculaba mal a partir de la compra 41, el refresco automático borraba lo que estabas escribiendo, el historial de días pasados se reescribía con la plantilla de tareas actual, y los campos de dinero rechazaban la coma decimal. Además, las escrituras releen el día antes de guardar para que dos personas a la vez no se pisen.
- **2026-09-07 (v3)**: Migración a web real. Datos en Supabase, fotos en Storage, despliegue en Vercel desde GitHub. Adiós al requisito de tener cuenta de Claude: ahora entra cualquiera con el enlace desde el móvil. El artifact viejo queda como aviso apuntando a la URL nueva.
- **2026-09-07 (v2)**: Fotos solo desde cámara. Tareas reducidas a basura + barrer/fregar. Tarea semanal de cubos verdes. Verificación de fotos por Miguel. Sección de stock por zonas con avisos. Registro de compras con ticket y bote común. Pestañas Hoy / Stock / Historial / Admin. Correo diario a Miguel.
- **2026-09-07 (v1)**: Primera versión como Claude Artifact — rotación diaria, 3 tareas, panel de admin.

## Pendiente

- Montar el correo instantáneo a Miguel con Resend (Edge Function de Supabase).
- Más secciones y tareas que se irán añadiendo.
