# Casa Holanda

App de limpieza de una casa compartida de 7 personas: **Yassine, Jorge, Noel, Raul, Alberto, Sufian y Pablo**.

## 🔗 https://limpieza-casa-holanda.vercel.app

Se abre desde cualquier navegador y móvil, **sin cuenta ni contraseña**. Quien tenga el enlace, entra. En el móvil conviene usar "Añadir a pantalla de inicio".

## Cómo funciona

La limpieza va por dos caminos a la vez: **el día a día** lo lleva una persona, y **la limpieza a fondo** la hacen equipos por zonas el fin de semana.

### El turno diario

Cada día una persona se encarga de la casa entera:

| Tarea | Días |
|---|---|
| Barrer y fregar toda la casa | lunes a viernes |
| Sacar la basura y poner bolsa nueva | todos los días |

**El sábado y el domingo no se barre ni se friega en el turno diario**, solo se saca la basura. Esos días cada equipo friega su propia zona en la limpieza a fondo, y así nadie tiene que hacer las dos cosas el mismo día.

El turno pasa al siguiente de la lista cada día y además **corre dos puestos cada semana** (`rota_salto`). Lo de los dos puestos no es un capricho:

- Con **un** puesto por semana, el turno diario avanza al mismo ritmo que la rotación de zonas y los dos desplazamientos se anulan. El resultado es que **el turno del sábado y el del domingo caen siempre sobre la misma zona durante las 7 semanas de una ronda**: en la ronda 1 eran los dos de Arriba, cada semana, encima de su propia limpieza a fondo.
- Con **dos**, el turno del fin de semana va rotando entre las cuatro zonas. En 28 semanas: Arriba 16, Jardín 16, Planta baja 16, Cocina 8 — que con una sola plaza es la misma carga por persona.

Sigue cumpliéndose que cada semana pasan los siete sin repetir y que en 7 semanas cada uno ha hecho los siete días.

No ocupa plaza en el reparto de zonas, así que se puede tener turno diario y zona a la vez.

### Zonas y equipos

Para la limpieza a fondo, la casa se reparte en **4 zonas**, con un equipo por zona:

| Zona | Plazas | Qué incluye |
|---|---|---|
| Cocina | 1 | Cocina |
| Jardín / Garaje | 2 | Jardín y garaje |
| Planta baja | 2 | Comedor, salón, escalera, baño 1 y cuarto de la lavadora |
| Arriba | 2 | Ducha, baño y pasillo de arriba |

Son **7 plazas para 7 personas**: encaje exacto.

La limpieza a fondo se hace **el fin de semana**. Cada tarea se pide el sábado y el domingo pero se marca **una sola vez**: el equipo la hace el día que le venga mejor.

Todas las zonas incluyen **limpiar las ventanas**. La cocina lleva además horno, microondas, cajones, el filtro de la vitro y el cristal.

### La rotación de zonas

Las 7 plazas van en fila fija y las personas en una lista ordenada. **Cada lunes todos avanzan una plaza**, así que en 7 semanas cada uno ha pasado por todas las zonas. Eso es una **ronda**.

La fórmula es `persona de la plaza i = gente[(paso × i + semana) mod 7]`. El **paso** es lo que hace que roten también los equipos: con paso 1 las parejas son vecinos de la lista, con paso 2 quedan a dos puestos, con paso 3 a tres. Al terminar una ronda se pasa al siguiente paso.

| Ronda | Semanas | Paso | Parejas |
|---|---|---|---|
| 1 | 1–7 | 1 | vecinos de la lista |
| 2 | 8–14 | 2 | saltando uno |
| 3 | 15–21 | 3 | saltando dos |

Con 7 personas hay **3 rondas**: a las 21 semanas cada uno ha pasado por todas las zonas tres veces y ha trabajado con **los otros seis**. Luego vuelve a empezar.

Vale cualquier paso coprimo con el número de personas, que es lo que garantiza que las 7 plazas caigan en 7 personas distintas. Si cambia el número de habitantes, la app recalcula los pasos disponibles (con 6 personas solo hay uno, con 9 hay tres).

En las zonas de 2 plazas siempre **se queda uno y entra otro**, así que nunca cambia el equipo entero de golpe y siempre hay quien ya conoce la zona.

La rotación va por fecha, no por tareas: terminar antes no adelanta el relevo.

### Cubos verdes

Van **aparte**, con su propio turno de una persona que avanza cada domingo. **No ocupan plaza** en el reparto de zonas. Empieza Yassine el domingo 4 de octubre.

Se sacan el domingo y se entran el lunes. Su turno se cuenta **por días desde su propio domingo**, no por la semana de las zonas, así que quien los saca el domingo es siempre quien los entra el lunes aunque por medio haya un relevo de zonas.

### Por qué la semana va de lunes a domingo

Para que **el fin de semana entero caiga dentro de la semana del mismo equipo**. Con semanas de domingo a sábado, el sábado y el domingo pertenecen a equipos distintos y la limpieza a fondo no se podría repartir entre los dos días.

### La pantalla

La barra de abajo separa las dos cosas:

| Pestaña | Qué hay |
|---|---|
| **Hoy** | El turno diario y, los días que tocan, los cubos verdes |
| **A fondo** | Las 4 zonas y su limpieza de fin de semana |
| Stock · Historial · Admin | Como antes |

Cada pestaña abre con una cabecera que explica de qué va la sección y se puede plegar. Entre semana las zonas de fondo salen **apagadas**, con borde discontinuo y un contador de cuánto falta para que se abran; el sábado y el domingo se encienden y la cabecera pasa a ámbar. Arriba del todo, una línea dice lo que te toca a ti hoy.

### Días y tareas

Una tarea se pide en unos días y cuenta por día o por semana:

| Tarea | Días | Cuenta |
|---|---|---|
| Barrer y fregar | lunes a viernes | una vez por día |
| Sacar la basura | los días de limpieza de la casa | una vez por día |
| Limpieza a fondo | sábado y domingo | una vez por semana |
| Cubos verdes | domingo (sacar), lunes (entrar) | una vez por día |

**Qué días se limpia** es un ajuste de casa (Admin → Días de limpieza): es el calendario del turno diario, de lunes a domingo por defecto. La limpieza a fondo no depende de él, va fijada al fin de semana.

La mayoría de tareas piden **foto**, que queda guardada con el nombre de quien la hizo y la hora.

Si hoy no toca limpieza, la pantalla principal lo dice y señala el siguiente día que toca.

### Stock

Artículos por zona, con **cantidad** y **umbral de aviso** por artículo. Cuando algo baja de su mínimo, salta el aviso y entra en la lista de la compra. Las compras se registran con **foto del ticket obligatoria** y descuentan del bote común.

### Correo nocturno

Cada noche a las **23:00 hora de Holanda** sale un resumen a Miguel y a Alberto: cómo va cada zona, qué días de la semana no se hizo nada, quién ha hecho qué y qué falta por comprar. Lo dispara `pg_cron` dentro de Supabase, así que **no depende de que ningún ordenador esté encendido**.

Para comprobar que va a salir bien sin enviar nada a nadie, se puede pedir el correo en seco:

```bash
curl -s -X POST "https://lmuiogddgfmmbouaanzo.supabase.co/functions/v1/avisar-miguel" -H "Content-Type: application/json" -H "apikey: sb_publishable_NqIyAof4Y4fYyzf53qjlnA_-xDvYwsc" -H "Authorization: Bearer sb_publishable_NqIyAof4Y4fYyzf53qjlnA_-xDvYwsc" -d '{"seco":true}'
```

### Historial

Dos niveles. Por semanas, con el porcentaje de cada zona; y al abrir una semana, **una fila por día**. Los días en que tocaba limpiar y no se hizo nada salen marcados en rojo, y arriba hay un contador de cuántos han sido. La semana en curso no cuenta los días que aún no han llegado.

### Panel de admin

Solo quien esté en `admins`. **Todo el modelo se edita desde ahí, sin tocar código ni base de datos:**

| Sección | Qué se puede cambiar |
|---|---|
| Personas y rotación | Añadir, quitar y reordenar personas · marcar quién es **admin** · la fecha en que arranca la rotación de zonas |
| Días de limpieza | Qué días de la semana se pide lo que no tiene días propios |
| Zonas y plazas | Nombre, qué incluye, plazas, color, orden · crear y borrar zonas · convertir una zona en **turno propio** y al revés, con su ritmo (cada día / cada semana) y su salto semanal |
| Tareas | Texto · **qué días se pide**, uno a uno · si cuenta **1 vez por semana** o una por día · si lleva foto · orden dentro de la zona · crear y borrar |
| Artículos | Nombre, precio, mínimo, **zona** · crear y borrar |
| Bote común | Aportaciones |
| Correo nocturno | Destinatarios |

Lo único que no se hace desde ahí es **renombrar a una persona**: el historial guarda los nombres tal cual, así que un cambio dejaría huérfano lo ya hecho. Para eso, quitar y volver a añadir.

Los días de una tarea se marcan uno a uno. Mientras no tenga días propios sigue los **días de limpieza de la casa** y sus botones salen con borde discontinuo; al tocar cualquiera se fijan en la tarea. Si se quitan todos, vuelve a heredarlos.

No se puede quitar al último admin: no habría forma de volver a entrar.

## Arquitectura

| Pieza | Dónde |
|---|---|
| Web (un solo HTML, sin dependencias) | Vercel, desplegado desde la rama `main` de este repo |
| Datos | Supabase, tablas `casa_*` dentro del proyecto `lista-compra-masiera` |
| Fotos y tickets | Supabase Storage, bucket público `casa-fotos` |
| Correo | Edge Function `avisar-miguel` + `pg_cron`, con Brevo de proveedor |

Cada push a `main` despliega solo.

### Tablas

- `casa_config` — fila única: gente, admins, ancla de rotación, `dias_limpieza`, destinatarios del correo
- `casa_zonas` — zonas con plazas y color. `rota_aparte` marca las que no consumen plaza y llevan turno propio (`rota_desde`, `rota_persona`, `rota_cada` días entre relevos y `rota_salto` puestos extra por semana: el turno diario va con 1 y 2, los cubos con 7 y 0)
- `casa_tareas` — tareas por zona. `dias` son los días en que se pide (`NULL` = los días de limpieza de la casa) y `semanal` dice si cuenta una vez por semana en vez de una por día
- `casa_completadas` — una fila por tarea completada. `periodo` es el día, o el lunes que abre la semana para las semanales
- `casa_semanas` — foto fija del reparto de cada semana, para que el historial no se reescriba si alguien entra o sale
- `casa_items`, `casa_purchases`, `casa_contributions`, `casa_summary` — stock y bote
- `casa_avisos` — registro de cada intento de envío del correo
- `casa_days` — historial del modelo antiguo (una persona al día), conservado sin tocar

### Sobre el acceso

No hay login: **el enlace es la llave**. Las políticas RLS permiten leer y escribir a cualquiera con la clave publicable, que va en el código de la página. Es el modelo buscado, pero conviene saberlo.

### Secretos

En Supabase → Edge Functions → Secrets: `BREVO_API_KEY` y `EMAIL_REMITENTE`. Nunca en el código.

## Historial de cambios

- **2026-10-05 (arranque limpio)**: La rotación de zonas se re-ancla en el **lunes 5 de octubre**, que pasa a ser su semana 1, y el historial arranca de cero desde ahí. El turno diario **retoma la lista donde se quedó**: el último turno hecho de verdad fue Alberto el 29 de septiembre, así que empieza **Sufian**, que junto con Pablo nunca había tenido uno. Los cubos verdes no se tocan — Yassine los sacó el domingo 4 y los entra el lunes 5. El historial del modelo viejo (`casa_days`, septiembre) se conserva aparte; la app no lo lee.

- **2026-10-04 (dos secciones, y el choque de los fines de semana)**: La portada se parte en dos pestañas, **Hoy** y **A fondo**, cada una con su cabecera plegable; entre semana las zonas de fondo salen apagadas. El turno diario deja de barrer y fregar los fines de semana —solo saca la basura— para que nadie tenga que fregar la casa y además limpiar su zona a fondo el mismo día. Y el turno diario pasa a correr **dos** puestos por semana en vez de uno: con uno se anulaba contra la rotación de zonas y el turno del finde caía siempre sobre la misma zona durante toda una ronda. Lista nueva de cocina y **ventanas en todas las zonas**.

- **2026-10-04 (turno diario + fondo de fin de semana)**: Vuelve el **turno diario**: una persona al día barre, friega y saca la basura de toda la casa, con el turno corriendo un puesto cada día y uno más cada semana para que a nadie le toque siempre el mismo día. Las zonas se quedan con la **limpieza a fondo del fin de semana**, un tic por tarea que vale marcar el sábado o el domingo. La semana pasa a ir de **lunes a domingo** para que el finde no se parta entre dos equipos, y los turnos propios (diario, cubos) se cuentan por días para no depender de ello. El historial dice quién tenía cada día y el correo nocturno lo desglosa día a día con nombre.

- **2026-10-02 (rotaciones y calendario)**: Todas las tareas pasan a diarias y la casa elige **qué días de la semana se limpia**, así una zona no espera al relevo para volver a limpiarse. La rotación gana un **paso variable** para que cambien también los equipos, no solo las zonas: en 3 rondas cada uno trabaja con los seis. El historial baja a nivel de día y marca los **días en que no se hizo nada**. El correo nocturno los lista, y acepta `{"seco":true}` para probarlo sin enviar.
- **2026-10-01/02 (rediseño por zonas)**: Fuera Miguel y Ali. La casa pasa de "una persona al día para toda la casa" a equipos semanales por zona. Cubos verdes con rotación propia. App rediseñada entera: una tipografía, navegación inferior, color por zona. Stock e historial conservados y reorganizados por zonas y semanas. Panel de admin completo.
- **2026-09-24**: El historial muestra los días que nadie hizo. Se retiró la verificación de fotos. Reintentos en el correo.
- **2026-09-15**: Entran Sufian y Pablo.
- **2026-09-08**: El correo nocturno pasa al backend (Supabase + Brevo), dejando de depender del portátil de Alberto.
- **2026-09-07**: Primera versión (Claude Artifact), luego migrada a web real en Vercel + Supabase.
