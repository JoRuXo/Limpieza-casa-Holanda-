# Casa Holanda

App de limpieza de una casa compartida de 7 personas: **Yassine, Jorge, Noel, Raul, Alberto, Sufian y Pablo**.

## 🔗 https://limpieza-casa-holanda.vercel.app

Se abre desde cualquier navegador y móvil, **sin cuenta ni contraseña**. Quien tenga el enlace, entra. En el móvil conviene usar "Añadir a pantalla de inicio".

## Cómo funciona

### Zonas y equipos

La casa se reparte en **4 zonas**, con un equipo por zona:

| Zona | Plazas | Qué incluye |
|---|---|---|
| Cocina | 1 | Cocina |
| Jardín / Garaje | 2 | Jardín y garaje |
| Planta baja | 2 | Comedor, salón, escalera, baño 1 y cuarto de la lavadora |
| Arriba | 2 | Ducha, baño y pasillo de arriba |

Son **7 plazas para 7 personas**: encaje exacto.

### La rotación

Las 7 plazas van en fila fija y las personas en una lista ordenada. **Cada domingo todos avanzan una plaza**, así que en 7 semanas cada uno ha pasado por todas las zonas. Eso es una **ronda**.

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

Van **aparte**, con su propio turno de una persona que también avanza cada domingo. **No ocupan plaza** en el reparto de zonas — por eso siguen siendo 7 plazas para 7 personas. Empieza Yassine el domingo 4 de octubre.

Se sacan el domingo y se entran el lunes.

### Por qué la semana va de domingo a sábado

Precisamente por los cubos: se sacan el domingo y se entran el lunes. Con semanas de lunes a domingo esas dos tareas caerían a cada lado de un relevo y las haría un equipo distinto cada una.

### Días de limpieza y tareas

Hay un ajuste de casa: **qué días de la semana se limpia**. Las tareas se piden solo esos días, en todas las zonas a la vez. Se cambia en Admin → Días de limpieza.

Todas las tareas son **diarias**: se piden en cada día de limpieza. Así una zona se limpia varias veces por semana y no hay que esperar al relevo del domingo para que vuelva a tocar. Una tarea suelta puede salirse de ese calendario y fijarse a su propio día: los cubos verdes van a domingo y lunes.

La mayoría piden **foto**, que queda guardada con el nombre de quien la hizo y la hora.

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

Solo **Alberto**. Permite editar todo sin tocar código: personas y su orden en la rotación, los días de limpieza, zonas con sus plazas y colores, cada tarea (texto, días, si lleva foto), artículos con precio y mínimo, aportaciones al bote, el turno de los cubos y los destinatarios del correo.

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
- `casa_zonas` — zonas con plazas y color. `rota_aparte` marca las que no consumen plaza y llevan turno propio (`rota_desde`, `rota_persona`)
- `casa_tareas` — tareas por zona. `dias` son los días en que se pide; `NULL` significa "los días de limpieza de la casa"
- `casa_completadas` — una fila por tarea completada. `periodo` es siempre el día
- `casa_semanas` — foto fija del reparto de cada semana, para que el historial no se reescriba si alguien entra o sale
- `casa_items`, `casa_purchases`, `casa_contributions`, `casa_summary` — stock y bote
- `casa_avisos` — registro de cada intento de envío del correo
- `casa_days` — historial del modelo antiguo (una persona al día), conservado sin tocar

### Sobre el acceso

No hay login: **el enlace es la llave**. Las políticas RLS permiten leer y escribir a cualquiera con la clave publicable, que va en el código de la página. Es el modelo buscado, pero conviene saberlo.

### Secretos

En Supabase → Edge Functions → Secrets: `BREVO_API_KEY` y `EMAIL_REMITENTE`. Nunca en el código.

## Historial de cambios

- **2026-10-02 (rotaciones y calendario)**: Todas las tareas pasan a diarias y la casa elige **qué días de la semana se limpia**, así una zona no espera al relevo para volver a limpiarse. La rotación gana un **paso variable** para que cambien también los equipos, no solo las zonas: en 3 rondas cada uno trabaja con los seis. El historial baja a nivel de día y marca los **días en que no se hizo nada**. El correo nocturno los lista, y acepta `{"seco":true}` para probarlo sin enviar.
- **2026-10-01/02 (rediseño por zonas)**: Fuera Miguel y Ali. La casa pasa de "una persona al día para toda la casa" a equipos semanales por zona. Cubos verdes con rotación propia. App rediseñada entera: una tipografía, navegación inferior, color por zona. Stock e historial conservados y reorganizados por zonas y semanas. Panel de admin completo.
- **2026-09-24**: El historial muestra los días que nadie hizo. Se retiró la verificación de fotos. Reintentos en el correo.
- **2026-09-15**: Entran Sufian y Pablo.
- **2026-09-08**: El correo nocturno pasa al backend (Supabase + Brevo), dejando de depender del portátil de Alberto.
- **2026-09-07**: Primera versión (Claude Artifact), luego migrada a web real en Vercel + Supabase.
