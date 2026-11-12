# Plan visual y funcional — Casa Holanda

Documento de planificación. No toca código. Base: lectura de `index.html` (CSS en `<style>`, vistas `vHoy`, `vFondo`, `vMes`, `vCompra`, `vBote`, `vHistorial`, `vAdmin`, `pintaNav`) y criterios de la skill `dataviz` (estados con icono + texto, tabla alternativa, colores de estado reservados, nada codificado solo por color).

> Los números de línea cambian porque otros agentes editan `index.html` en paralelo. Se citan funciones, no líneas.
> Lo de «pestañas» asume la propuesta de 4 (Hoy · Compra · Historial · Más); si el Coordinador decide otra cosa, las fases 1–2 no cambian.

---

## 1. Diagnóstico

| Área | Hallazgo | Gravedad |
|---|---|---|
| Accesibilidad | 1 `aria-`, 0 `role`/encabezados; iconos sin `aria-label`; lightbox sin teclado; toast sin `role="status"` | Alta |
| Táctil | `.tick` 21px, `.qty button` 28px, `.mini`/`.icon-btn` 34–36px; `×` destructivo pegado a ▲▼ en Admin | Alta |
| Contraste | `--muted #697A71` en etiquetas de 10–11px mayúsculas (~4:1, estimado) | Alta |
| Navegación | 7 pestañas, etiquetas a 9px en ≤420px | Alta |
| Estados | «Cargando…» como texto; error = «Sin conexión» pequeño que reemplaza el rango de semana; vacíos sin acción | Media |
| Mantenibilidad | ~112 `style="…"`, 7 tipos de botón de alturas distintas, `window.confirm` nativo | Media |
| Historial | 8 semanas fijas, solo una media por semana y por zona; **no dice quién cumplió**; lo único «por persona» es el nombre del turno diario en cada día | Alta (pedido del usuario) |
| Externo | Google Fonts bloquea el primer pintado; ancho fijo 480px | Baja |

## 2. Sistema de diseño

Se **conserva** el sistema actual (variables en `:root`, tema claro/oscuro, verde de acento); se ordena, no se rehace.

**Color** (tokens ya existentes; solo cambios señalados)
- `--muted` claro: `#697A71` → `#56665D` (≥4.5:1 sobre `--bg`). Verificar oscuro con una herramienta, no a ojo.
- Estados **reservados** (nunca como color de zona o de persona): `--ok`, `--warn`, `--bad`, más sus `-soft`. Siempre con **icono + palabra** (✓ Cumplido, ! Pendiente, ✕ Fallado, – Libre).
- Colores de zona y de persona (`color(n)`, `z.color`) son categóricos: validar con `scripts/validate_palette.js` de la skill dataviz en claro y oscuro antes de fijarlos, y nunca usarlos como único portador de significado.

**Tipografía**: Instrument Sans (texto) + IBM Plex Mono (datos). Escala propuesta, mínimo 12px para texto informativo:
`12 / 13.5 / 15 / 17 / 23 (cifras) / 26 (título)`. Mono solo para cifras y fechas, no para etiquetas largas. Autoalojar o `preconnect` + `font-display:swap`.

**Espaciado**: escala de 4 (`4 · 8 · 12 · 16 · 24`). Márgenes de página 16px; separación entre tarjetas 8–12px. Padding seguro: `env(safe-area-inset-*)` en cabecera y nav.

**Radios y sombras**: `--r:14px` tarjetas, 10px controles, 999px chips. Una sola sombra (`--shadow`), solo en elementos flotantes (toast, diálogo, nav).

**Componentes** (unificar; todos con área táctil ≥44px)
1. `Button`: 3 tamaños (`sm 36`, `md 44`, `lg 52`) × `primary / secondary / danger / ghost`. Sustituye `.btn`, `.btn-sm`, `.mini`, `.pill`, `.chip`, `.dchip`, `.icon-btn`.
2. `IconButton` con `aria-label` obligatorio y SVG (no ▲▼×✎‹›).
3. `Card` (`.zone`, `.stat`, `.wk`, `.acc` ya lo son; unificar borde/radio).
4. `Stat` (cifra grande + etiqueta + delta), siguiendo el patrón de tile de dataviz.
5. `Status` (icono + texto + color): ✓ / ! / ✕ / –.
6. `Banner` (error, sin conexión, pendiente de envío) con acción «Reintentar».
7. `Dialog` (`<dialog>`) para confirmaciones destructivas; `Toast` con «Deshacer».
8. `Skeleton` (esqueleto) y `Empty` (icono + frase + acción).
9. `Segmented` (selector de semana/persona).

## 3. Mejoras por pantalla

**Hoy** (`vHoy`, `tiraMia`, `tareaHTML`, `proximosHTML`)
- Primera pantalla: «Hoy te toca a X» + tareas pendientes. `Hecho` a ancho completo, 44px, abajo-derecha de cada tarjeta.
- Marcar → tick animado, tarjeta atenuada, toast «Deshacer». Pendiente offline visible **en la propia tarea**.
- Pendientes primero; hechas plegadas. Progreso «2 de 3» en la cabecera del bloque.
- Cubos: chip con el **nombre** del color (incluido el gris grande de los jueves) y no solo el color.
- Sin turno (domingo): «Hoy es limpieza a fondo» + tu zona, en lugar del vacío actual.
- «A fondo» como bloque plegable dentro de Hoy; el punto rojo pasa a la pestaña.

**A fondo** (`vFondo`): tarjeta por zona con equipo, progreso «n de m» y tareas pendientes primero. Si pasa a ser un bloque de Hoy, queda como detalle por zona.

**Mi mes** (`vMes`, `calendarioHTML`): pantalla secundaria desde Hoy. Celdas ≥44px, leyenda de iconos (turno / a fondo / cubos) con texto, el día de hoy marcado con borde, no solo con color. Selector de persona como `Segmented` desplazable.

**Compra** (`vCompra` + `vBote`): una sola pestaña. Orden: saldo del bote (cifra grande) → «Registrar compra» (botón primario) → lista pendiente → comprado plegado → aportaciones/compras. Quitar el botón duplicado de registrar compra.

**Historial**: rediseño completo, ver §9.

**Más** (nuevo): tema, cambiar usuario, Mi mes (si no está en Hoy), Admin (solo admins), versión. Lista vertical de filas de 56px.

**Admin** (`vAdmin`): acordeón por sección (Personas · Zonas · Tareas · Cubos · Días). Explicación de rotación a un «¿Cómo funciona?» plegado, con un único aviso visible si las plazas no cuadran. Borrar → `Dialog`. Reordenar con botones de 44px separados de «Eliminar». **Depende de que el Supervisor cierre antes los permisos del servidor** (hoy el panel solo se oculta).

## 4. Estados vacío / carga / error

| Estado | Hoy | Propuesta |
|---|---|---|
| Carga | `.boot` «Cargando…» | `Skeleton` de 2–3 tarjetas con la forma de la pantalla; respeta `prefers-reduced-motion` |
| Error de red | «Sin conexión» pequeño en cabecera | `Banner` fijo bajo la cabecera: «Sin conexión · datos de las 14:32 · Reintentar» |
| Error servidor | Toast rojo, desaparece | Toast + `Banner` persistente hasta resolver |
| Pendiente de envío | «N marcas por enviar» en cabecera | Chip en cada tarea afectada + resumen en el banner |
| Guardando | Reemplaza el rango de semana | Indicador aparte (punto + «Guardando…»), la cabecera no salta |
| Vacío | Texto plano | `Empty`: icono + frase + acción («Añadir a la lista», «Ir a Hoy») |

## 5. Accesibilidad (checklist de aceptación)

- `<nav aria-label="Principal">`, `aria-current="page"`, `<main>`, un `<h1>` por pantalla y `<h2>` por bloque (los `div` actuales pasan a encabezados sin cambiar el aspecto).
- Todo botón de icono con `aria-label`; `title` solo como ayuda extra.
- `#toast` con `role="status" aria-live="polite"`; errores con `role="alert"`.
- Lightbox y diálogos: foco atrapado, Esc cierra, el foco vuelve al origen.
- Acordeones (`abre-acc`, `abre-sem`): son `div` con `data-a`; cambiar a `<button aria-expanded>`.
- Estado **nunca solo por color**: icono + texto en todo lo de §2.
- Contraste ≥4.5:1 texto, ≥3:1 iconos/bordes de controles; probar claro y oscuro.
- `prefers-reduced-motion` y `forced-colors` (bordes visibles).
- Orden de tabulación = orden visual.

## 6. Móvil con notch

- `viewport-fit=cover` ya está. Añadir `padding-top:env(safe-area-inset-top)` en `.topbar` y `padding-left/right:env(safe-area-inset-left/right)` en `.app` y `.nav` (modo horizontal).
- `.nav`: ya usa `safe-area-inset-bottom`; comprobar que el toast (`bottom:86px`) y la barra no se solapan con la altura real (con 4 pestañas la barra baja de altura).
- Contenido: `padding-bottom` = altura de nav + safe-area, para que lo último no quede tapado.
- Teclado virtual: los formularios de Compra/Admin deben hacer scroll al campo activo (`scroll-margin`) y no quedar bajo la barra fija.
- `100dvh` en lugar de `100vh` donde se use (lightbox: `max-height:90vh`).
- Objetivos 44px; separar acciones destructivas ≥8px de las vecinas.

## 7. Fases, prioridades y esfuerzo

> **Estado final (2026-11-13):** fases 2–8 terminadas salvo lo que se indica abajo. Añadido en la última pasada: landmarks (`<main>`, `<h1>`, `<h2>` por bloque), bloques y acordeones con `role=button`, `tabindex` y `aria-expanded` (Enter/Espacio), Esc en la foto ampliada, tabla alternativa en Historial («Ver como tabla»), `scroll-margin` en campos, y los estilos en línea estáticos a clases (quedan 19, todos con datos: color de zona como `--zc`, avatares `--zc` y anchos en %). **No hecho:** «Deshacer» (bloqueado por la falta de política DELETE en `casa_completadas`, decisión de la migración 20261018), la tendencia de 8 semanas (opcional en §9.2), el foco atrapado en la foto ampliada (solo Esc), y la comprobación de contraste con herramienta en modo oscuro (calculado a mano).

> **Estado (2026-11-13, pasada de implementación):**
> - **Fase 1 — hecha** en pasadas anteriores (tokens, contraste, áreas táctiles, safe-area, reduced-motion, `role` del toast). No re-auditada aquí con herramienta de contraste.
> - **Fase 2 (Hoy) — hecha salvo «Deshacer».** Hecho 44 px, pendientes primero con hechas plegadas («N hechas»), «Por enviar» en la propia tarea, domingo con «Hoy es limpieza a fondo» y tu zona, transición del tick. Los cubos ya llevan su color en el texto de la tarea y el progreso «n/m» ya está en la zona. **Pendiente: «Deshacer»** — bloqueado: `casa_completadas` no tiene política DELETE (migración 20261018 la quitó a propósito); hace falta cambiarlo en `supabase/`, que no se toca en esta tarea.
> - **Fase 3 (estados y diálogos) — hecha.** Esqueleto de carga, banner con «Reintentar» / «Enviar ahora» (sin conexión, marcas por enviar, error), cabecera sin texto de estado (solo «· Guardando…»), `confirma()` en lugar de `window.confirm` (4 sitios, Esc y Tab dentro), vacíos de Compra y de Aportaciones con acción.
> - **Fase 4 (Historial) — hecha** en pasadas anteriores (`cumplimientoSemana`, navegación y carga bajo demanda, cubierto por tests/).
> - **Fase 5 (navegación) — resuelta con la decisión del usuario:** Hoy · A fondo · Mi mes · Historial · Más. Compra y Bote siguen separadas, sin fusionar; «Más» ya existe.
> - **Fase 6 (componentes) — hecha salvo los estilos dinámicos.** `style="…"` estáticos: 96 convertidos a utilidades atómicas `u-…` (con `!important`, así la precedencia es la del estilo en línea). Quedan 23, todos con datos dentro (color de persona o zona, anchos en %). `IconButton`: `.icon-btn` y `.mini` comparten ahora una sola regla base; `Button`: una única base `.btn` con modificadores (`-pri`, `-sm`, `-wide`, `-danger`). Verificado con un snapshot de estilos calculados en 7 pantallas: 0 diferencias de estilo.
> - **Fase 7 (Admin) — hecha:** acordeón (ya existía), «¿Cómo funciona la rotación?» plegado con el aviso «no cuadran» siempre visible, × de borrar separada de ▲▼ (`mini-del`), borrado con `confirma()`. Depende de la fase 0: el cierre de permisos en el servidor no es de esta tarea.
> - **Fase 8 (pulido) — hecha.** Ancho 640 px desde 768 px, iconos SVG en ▲ ▼ × ✎ ‹ › (`ICO`) y en los chevrons de bloques, acordeones y «Por zona/Por día» (`ICO.chevD/chevR`), triángulo de «N hechas» como máscara SVG, `prefers-reduced-motion` para esqueleto y tick.
> - **Sin probar en móvil real** (notch, chips, Historial): solo jsdom y tests/.

Esfuerzo estimado para una persona; no he medido nada, son órdenes de magnitud.

| Fase | Contenido | Esfuerzo | Impacto | Riesgo |
|---|---|---|---|---|
| **0** Base de seguridad (otro agente) | Cerrar permisos de Admin y del correo antes de rediseñar Admin | — | Crítico | — |
| **1** Rápidas | Contraste, `aria-*`, `role` toast, objetivos táctiles, safe-area, `font-display` | 0,5–1 día | Alto | Bajo |
| **2** Hoy | «Hecho» grande, feedback + «Deshacer», pendientes primero, progreso, chips de cubo con nombre | 1–1,5 días | Alto | Medio (cola offline) |
| **3** Estados y diálogos | Skeleton, Banner, Empty con acción, `Dialog` en vez de `confirm` | 1–1,5 días | Alto | Bajo |
| **4** Historial nuevo | Spec §9 | 2–3 días | Alto (petición del usuario) | Medio (datos y carga) |
| **5** Navegación | 7 → 4 pestañas, «Más», fusión Compra+Bote, Mi mes dentro de Hoy | 1,5–2 días | Alto | Medio |
| **6** Sistema de componentes | `Button`, `IconButton`, `Card`, `Stat`; estilos en línea → clases | 2–3 días | Medio (futuro) | Medio |
| **7** Admin | Acordeón, texto plegable, borrado con diálogo | 1–1,5 días | Medio | Bajo (tras fase 0) |
| **8** Pulido | Ancho 640px en tablet, SVG por iconos de texto, reduced-motion | 0,5–1 día | Bajo | Bajo |

Orden recomendado: **0 → 1 → 2 → 3 → 4 → 5 → 7 → 6 → 8**. El Historial (4) va antes que la fusión de pestañas porque no depende de ella y es lo que el usuario pidió.

**Prueba tras cada fase:** abrir en móvil real o emulado (≤360px y con notch), tema claro y oscuro, modo sin conexión (`sw.js`), y navegación solo con teclado.

---

## 9. Especificación del nuevo Historial

### 9.1 Objetivo

Responder en una pantalla a: **¿quién ha cumplido y quién no esta semana y en las anteriores?** Hoy `vHistorial` muestra solo una media por semana y por zona, más una fila por día con el nombre del turno. No hay resumen por persona, y solo hay 8 semanas fijas (`SEMANAS_HIST = 8`).

### 9.2 Estructura de la pantalla (de arriba abajo)

1. **Selector de semana** (`Segmented` + flechas): `‹  Semana del 9 – 15 nov  ›` y botón «Esta semana». La flecha derecha se desactiva en la semana actual; la izquierda en la primera semana con reparto (`S.rotacionDesde`). Chip «En curso» o «Cerrada» junto al rango.
2. **Resumen de la semana** (dos o tres `Stat`): «Cumplido 78 %» (n de m tareas), «Fallado 3», «Pendiente 2» (solo semana en curso). Delta frente a la semana anterior con texto («+12 pts»).
3. **Por persona** (el bloque principal): una fila por persona de `S.gente`, ordenada con quien más ha fallado primero, no alfabéticamente.
   - Avatar + nombre + rol de la semana («Turno diario: lun, jue · Zona: Baños»).
   - Barra de progreso + «5 de 6 cumplidas».
   - Estado con icono y palabra: `✓ Al día` · `! Pendiente` · `✕ Falló 2` · `– Sin tareas`.
   - Al tocar la fila se despliega el detalle (9.3). Es un `<button aria-expanded>`.
4. **Por zona** (secundario, plegado): lo que ya existe hoy (`progresoSemana` por zona), sin cambios de datos.
5. **Por día** (secundario, plegado): la lista actual de días (`dy`) con quién, «n/m» y «nada» (día en que tocaba limpiar y no se hizo nada).
6. **Tendencia** (opcional, al final): tira de las últimas 8 semanas, una celda por semana, con el % y el icono de estado; tocar una celda salta a esa semana. Es la «vista de calendario» ligera y sustituye a la lista larga actual de 8 tarjetas.
7. **Vista de tabla** (enlace «Ver como tabla»): la misma información en `<table>` para lectores de pantalla (requisito dataviz).

### 9.3 Detalle de una persona (fila desplegada)

Lista de tareas de esa persona en esa semana, cada una con estado y texto:

| Estado | Icono + texto | Cuándo |
|---|---|---|
| Cumplida | ✓ Hecha · quién · hora (`hecha.por`, `hecha.at`) | Existe `S.hechas[tarea|periodo]` |
| Fallada | ✕ No hecha | No existe y el día (o la semana, si es semanal) ya pasó |
| Pendiente | ! Pendiente | No existe y el día es hoy o futuro, o la semanal aún no vence |
| No tocaba | – Libre | `tareasDeDia` vacío |

Si la hizo otra persona que la asignada: «Hecha por Jorge (le tocaba a Noel)». Distingue «cumplió quien debía» de «alguien lo cubrió».

### 9.4 Reglas de cálculo (para que los números cuadren con la app)

Reutilizar siempre las funciones existentes, no recalcular a mano:

- **Qué tareas tocaban un día para una zona:** `tareasDeDia(zid, dia)` (ya devuelve `[]` si la zona no tenía a nadie asignado, así que no cuenta como fallo).
- **Excepción a respetar:** `progresoDia` descarta las tareas `cualquier_dia` si `!fondoAbierto(dia)` (se imputan al día del fondo). El nuevo código debe hacer **lo mismo** para no dar cifras distintas a las del resumen de arriba.
- **Tarea semanal:** se cuenta **una vez por semana**, con la clave `t.id + "|" + periodoDe(t, dia)` (como `progresoSemana`, que usa `vistos`). Falla solo cuando pasa el domingo de esa semana.
- **Clave de hecha:** `S.hechas[t.id + "|" + periodoDe(t, dia)]`; `hecha(t, dia)` lo resuelve.
- **Pasado / pendiente:** `dia < hoy()` → fallada si no hecha; `dia >= hoy()` → pendiente. Para semanales: `mas(sem, 6) < hoy()`.
- **A quién se le atribuye una tarea:**
  - Zona diaria (`zonaDiaria()`): `turnoReal(zd, dia)[0]` (incluye cambios de turno y turno congelado).
  - Zonas de equipo: `asignacion(sem)[z.id]` (lista de personas; el fallo se atribuye a **todo el equipo** de esa zona y se muestra como «equipo»).
  - Otras secciones aparte (cubos): `turnoReal(z, dia)`.
  - Alternativa más simple y equivalente a lo existente: `asignacionDia(dia)[z.id]`, que ya combina las tres.
- Resultado por persona y semana: `{ hechas, falladas, pendientes, total, pct }`. `pct = hechas / (hechas + falladas)` para semanas cerradas; en la semana en curso, `hechas / (hechas + falladas + pendientes)` mostrando «n pendientes» aparte para no penalizar lo que aún no venció.
- Semana sin reparto (`mas(w,6) < S.rotacionDesde`): no se muestra (ya se omite hoy).

### 9.5 Datos que hay que leer del código existente

| Dato | Dónde | Notas |
|---|---|---|
| Personas | `S.gente` | Orden de la rotación |
| Colores | `color(n)`, `z.color` | |
| Zonas y tareas | `S.zonas`, `tareasDe(zid)`, `tareasDeDia(zid, dia)`, `toca(t, dia)` | Incluye cubos (`recogidaDe`, `cubosFijosDe`) para el cubo gris de los jueves |
| Quién tenía qué | `asignacion(sem)`, `asignacionDia(dia)`, `turnoReal(z, dia)`, `turnoSemana(z, sem)`, `turnoCongelado` | Congelado = lo vivido no se reescribe |
| Hecho / no hecho | `S.hechas` (clave `tarea_id|periodo`), `hecha(t, dia)`, `periodoDe(t, dia)` | Valor trae `por`, `at`, `foto_url` |
| Progreso | `progreso`, `progresoSemana`, `progresoDia` | Para totales y barras |
| Semanas y fechas | `semanaDe`, `mas`, `hoy`, `dow`, `rango`, `corta`, `DOW_C` | |
| Fondo / domingo | `fondoAbierto`, `diasFondo`, `rotaEmpezada`, `S.rotacionDesde` | |
| Rotación | `rondaDe`, `pasoDe`, `pasos` | Para la tarjeta «Ronda» si se conserva |
| Estilos reutilizables | `.wk`, `.wk-top`, `.seg`, `.bar`, `.stat`, `.dy`, `.nada`, `.eyebrow` | |

### 9.6 Limitación de datos: la carga solo trae 8 semanas

`cargar()` pide `casa_completadas`, `casa_semanas` y `casa_cambios` con `periodo/semana/dia >= desde`, donde `desde = lunes actual − 7·(SEMANAS_HIST − 1)`. Para navegar más atrás hay dos opciones:

- **A (simple):** subir `SEMANAS_HIST` a 26 (medio año). Una semana tiene pocas decenas de filas, así que el coste es pequeño, pero conviene medirlo.
- **B (mejor):** cargar bajo demanda al pulsar ‹ más allá de lo cargado, con una consulta por rango y guardando en `S.hechas`/`S.semanas`; mostrar `Skeleton` mientras llega.

Sin esto, el selector llegaría solo a 8 semanas atrás. Decisión pendiente (ver PARA Coordinador).

Otro límite: las semanas anteriores a `casa_semanas` (sin turno congelado) se recalculan con `calcula(sem)`; si la gente o las zonas cambiaron, el reparto mostrado puede no ser el vivido. Mostrar nota «reparto reconstruido» cuando `S.semanas[w]` no exista.

### 9.7 Estados del Historial

- **Carga:** `Skeleton` de resumen + 3 filas de persona.
- **Vacío** (sin reparto aún): «La rotación empieza el lunes 18 oct» (ya existe el texto en `Ronda`) con botón «Ir a Hoy».
- **Semana sin tareas:** «Esta semana no tocaba nada».
- **Error / copia vieja** (`copiaDe`): banner «Datos de las 14:32, sin conexión».
- **Todos al día:** mensaje positivo breve con ✓.

### 9.8 Diseño visual y accesibilidad

- Estado = **icono + palabra + color** (`✓ Al día` verde, `! Pendiente` ámbar, `✕ Falló` rojo, `– Sin tareas` gris). Colores solo de los tokens de estado; las personas llevan su color en el avatar y nunca en la barra de estado.
- Barras de 8px, con el valor en texto al lado (`5/6`); el color de relleno no es el único portador.
- Semana actual: borde `--accent` y chip «En curso»; semanas pasadas con fondo neutro; la peor semana de la tira se resalta con el texto «Peor semana».
- Objetivos ≥44px; filas expandibles con `aria-expanded`; selector de semana con `aria-label="Semana anterior"` / `"Semana siguiente"`.
- Móvil con notch: sin elementos pegados al borde; tira de tendencia con scroll horizontal controlado.
- Tabla alternativa (9.2·7) con `<th scope>`.
- Sin animaciones obligatorias; barras sin transición si `prefers-reduced-motion`.

### 9.9 Criterios de aceptación

1. Para cualquier semana cerrada, la suma de cumplidas+falladas por persona coincide con el total de `progresoSemana` sumado por zonas (tolerando el reparto de zonas de equipo, que cuenta una vez por zona).
2. Un cambio de turno (`casa_cambios`) pasa la tarea a la persona nueva.
3. El cubo gris de los jueves (`recogidaDe`) aparece en el detalle del día correspondiente y puede quedar «fallado» como cualquier otra tarea.
4. La semana en curso nunca marca como «fallada» una tarea de hoy o de días futuros.
5. Se puede llegar a la primera semana con reparto y la flecha izquierda se desactiva allí.
6. Sin color: la pantalla es comprensible en escala de grises.
7. Lector de pantalla: cada fila de persona anuncia nombre, estado y recuento.

### 9.10 Pasos de implementación sugeridos

1. Función pura `cumplimientoSemana(sem)` → `{persona: {hechas, falladas, pendientes, tareas:[{t, dia, estado, por}]}}`, apoyada en las funciones de 9.5. Sin tocar el DOM; fácil de probar a mano con semanas conocidas.
2. Estado `semHist` (semana vista) y acciones `hist-ant`, `hist-sig`, `hist-hoy`, `abre-pers` en el despachador `data-a`.
3. Reescribir `vHistorial` con los bloques de 9.2; conservar la lista por día y por zona como secciones plegadas.
4. Resolver la carga de semanas (9.6, opción A o B).
5. Estilos nuevos: `.hist-sel`, `.pers`, `.estado`, `.tira`. Pasarlos a los tokens, sin `style=""` en línea.
6. Revisión: contraste, teclado, 360px, tema oscuro, offline.

---

## 10. Riesgos y preguntas abiertas

- ¿Cuántas semanas hacia atrás interesan (8, 26, todas)? Condiciona 9.6.
- ¿Los fallos de zonas de equipo se atribuyen a toda la pareja/equipo o solo a quien tenía asignada la tarea? Se propone «equipo» salvo que haya una asignación por tarea (no la he visto en el código).
- La fusión de pestañas cambia el modelo mental del grupo: probar con ellos antes de dejarla fija.
- Admin: no rediseñar antes de cerrar la seguridad del servidor.
