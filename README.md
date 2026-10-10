# Casa Holanda

App de limpieza de una casa compartida de 7 personas: **Yassine, Jorge, Noel, Raul, Alberto, Sufian y Pablo**.

## 🔗 https://limpieza-casa-holanda.vercel.app

Se abre desde cualquier navegador y móvil, **sin cuenta ni contraseña**. Quien tenga el enlace, entra. En el móvil conviene usar "Añadir a pantalla de inicio".

## Cómo funciona

La limpieza va por dos caminos a la vez: **el día a día** lo lleva una persona de lunes a sábado, y **la limpieza a fondo** la hacen equipos por zonas el domingo.

### El turno diario

Cada día una persona se encarga de la casa entera:

| Tarea | Días |
|---|---|
| Barrer y fregar toda la casa | lunes a sábado |
| Sacar la basura y poner bolsa nueva | lunes a sábado |
| Sacar y entrar los cubos | los días del calendario de recogida |

**El domingo no hay turno diario.** Ese día es el de la limpieza a fondo y todo el mundo tiene su zona, así que nadie debe además barrer la casa entera.

La rotación **no salta el domingo**: sigue nombrando a alguien cada día, y a quien le cae en domingo simplemente no tiene turno diario esa semana. No es un hueco ni un privilegio, porque ese día hace su zona como todos. Como cada semana pasan los siete sin repetir, **el domingo le toca a uno distinto cada semana y a cada uno le cae una vez cada siete**.

El turno pasa al siguiente de la lista cada día y además **corre dos puestos cada semana** (`rota_salto`). Lo de los dos puestos no es un capricho, aunque el motivo ya no es el que era:

- Con **un** puesto por semana, el turno diario avanza al mismo ritmo que la rotación de zonas y los dos desplazamientos se anulan. Entonces **quien cae en domingo pertenece siempre a la misma zona durante las 7 semanas de una ronda**, así que siempre se libra del turno diario la misma gente: 7 semanas seguidas Planta baja, las 7 siguientes Jardín, y así.
- Con **dos**, el domingo va rotando entre las cuatro zonas. En 14 semanas: Planta baja 4, Arriba 4, Jardín 4, Cocina 2 — proporcional a sus plazas, que es lo justo.

Antes el argumento era otro —que el turno del sábado y el del domingo no cayesen siempre sobre la zona que además limpiaba a fondo ese fin de semana—, y dejó de valer al mover la limpieza a fondo al domingo. El número sigue siendo 2, pero por esta razón.

Sigue cumpliéndose que cada semana pasan los siete sin repetir y que en 7 semanas cada uno ha pasado por todos los días.

No ocupa plaza en el reparto de zonas, así que se puede tener turno diario y zona a la vez.

Debajo del turno de hoy va la tira de los **siete días de la semana**, con el nombre de quien lo tiene cada uno. Encima, una línea dice cuándo le toca a quien está mirando: *«Te toca el jueves 8 oct · en 2 días»*, o *«Hoy te toca · vuelves el domingo 18 oct»* si ya lo tiene hoy. Un día sin turno (el domingo) no cuenta como «te toca»: la cuenta salta al siguiente día con trabajo de verdad, y en la tira ese día sale apagado y con la palabra **a fondo** en vez de un nombre. Hace falta porque con el salto de dos puestos por semana la vuelta no cae a los siete días justos y no hay forma de contarla de cabeza.

La tira va **de lunes a domingo**, no «los siete días que vienen». Es a propósito: el turno corre un puesto al día y dos más al cambiar de semana, así que dentro de una semana pasan los siete sin repetir, pero una ventana que se montase sobre dos semanas enseñaría a alguien dos veces y a otro ninguna. Los días ya pasados salen apagados.

### Zonas y equipos

Para la limpieza a fondo, la casa se reparte en **4 zonas**, con un equipo por zona:

| Zona | Plazas | Qué incluye |
|---|---|---|
| Cocina | 1 | Cocina |
| Jardín / Garaje | 2 | Jardín y garaje |
| Planta baja | 2 | Comedor, salón, escalera, baño 1 y cuarto de la lavadora |
| Arriba | 2 | Ducha, baño y pasillo de arriba |

Son **7 plazas para 7 personas**: encaje exacto.

La limpieza a fondo se hace **el domingo**, y ese día no hay turno diario para nadie. Cada tarea se marca **una sola vez** por semana.

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

### Cubos de la basura

Los cubos **no tienen turno propio**: van por **calendario de recogidas**, porque el ayuntamiento no recoge siempre el mismo día de la semana ni siempre el mismo color.

Cada recogida es una fecha y un color. Y entonces:

- Los **saca** quien tenga el turno diario **ese día**.
- Los **entra** quien tenga el turno diario **al día siguiente**.

**Normalmente son dos personas distintas, y está garantizado**: el turno corre un puesto al día (tres al cambiar de semana) y con siete personas ninguno de esos avances vuelve al mismo sitio, así que dos días seguidos nunca caen en la misma persona.

La única forma de que el mismo saque y entre es que un **cambio pactado** le ponga encima el día anterior o el siguiente al suyo. Pasa fácil entre vecinos de la lista: como el turno avanza un puesto al día, **quien va detrás de ti en la lista tiene casi siempre el día justo después del tuyo**. No es un error, pero conviene tenerlo en cuenta al elegir el día de un cambio, porque esa persona acabaría haciendo dos días seguidos.

Las dos tareas aparecen solas dentro del turno diario de cada uno, con el color escrito (*«Sacar los cubos azules a la calle»*). Si un día no hay recogida apuntada, no se pide nada.

Esto es más simple que la rotación propia que tenían antes: no hay nada que cuadrar con el reparto de zonas, no gasta plaza y no hace falta re-anclar nada cuando cambia el calendario. Las fechas se meten en **Admin → Cubos de la basura**, y hay que ir añadiéndolas mes a mes.

Octubre de 2026: lunes 12 verdes, viernes 16 azules, jueves 22 grises, lunes 26 verdes.

### Cambios de un día

Cuando alguien cubre a otro, se apunta el cambio y ya está: **ese día esa sección la hace otro y nada más**. La rotación de debajo no se mueve, así que los demás conservan sus turnos y al borrar el cambio vuelve el titular solo.

Es una capa encima de la rotación, no un parche dentro: el código sigue teniendo `turnoDe` (el turno de verdad, el que usa el panel de admin para re-anclar) y `turnoReal` (ese mismo turno con el cambio puesto encima, que es lo que mira todo lo que enseña quién limpia). El correo nocturno hace lo mismo y escribe `Alberto (cambio, por Sufian)`.

A quién le tocaba **no se escribe a mano**: se saca de la rotación de ese día al guardar, así que no se puede apuntar un cambio contra alguien que no lo tenía.

En la tira de la semana el día cambiado sale con borde ámbar y una marca `⇄`; en la ficha de la sección, una línea dice a quién se está cubriendo.

Se gestionan desde **Admin → Cambios de un día**, y solo tienen sentido en las secciones con turno propio: las zonas de fondo se reparten por semana y ahí no hay un día suelto que cambiar.

### Por qué la semana va de lunes a domingo

Para que el **domingo de la limpieza a fondo cierre la semana del mismo equipo** que la ha tenido. Con semanas de domingo a sábado, el domingo sería el primer día de la semana siguiente y la zona que se limpia a fondo no sería la que acaba de tocar.

También es lo que hace que la tira del turno diario salga limpia: dentro de una semana de lunes a domingo pasan los siete sin repetir.

### La pantalla

La barra de abajo separa las dos cosas:

| Pestaña | Qué hay |
|---|---|
| **Hoy** | El turno diario de hoy, con los cubos si ese día tocan, y la tira de la semana |
| **A fondo** | Las 4 zonas y su limpieza del domingo |
| **Mi mes** | Todo el mes de una persona: sus días de turno, sus domingos y los cubos |
| **Compra** | La lista de la compra compartida |
| **Bote** | El bote común, las aportaciones y las compras con ticket |
| **Historial** | Por semanas y, dentro, día a día |
| **Admin** | Solo para quien sea admin |

Cada bloque abre con una cabecera que explica de qué va y se puede plegar. De lunes a sábado las zonas de fondo salen **apagadas**, con borde discontinuo y un contador de cuánto falta; el domingo se encienden y la cabecera pasa a ámbar. Arriba del todo, una línea dice lo que te toca a ti hoy.

**Mi mes** existe porque el turno diario cambia cada día y las zonas cada lunes: de memoria nadie sabe cómo tiene el mes. Se puede mirar el mes de otro, que para discutir un cambio hace falta ver los dos.

Arriba va un **calendario** del mes, de lunes a domingo, con una abreviatura en cada día en que a esa persona le toca algo:

| | Qué es | Qué hay que hacer |
|---|---|---|
| **TD** | Turno diario | Barrer, fregar y sacar la basura |
| **AF** | A fondo | Tu zona, los domingos |
| **CS** | Cubos: sacar | Sacarlos a la calle |
| **CE** | Cubos: entrar | Entrarlos a casa |

La misma leyenda va impresa debajo del calendario, para no tener que recordarla. Un día puede llevar dos (`TD CS` es turno diario y además sacar los cubos). **En rojo** sale lo que ya pasó y no se hizo; lo que está por venir nunca sale en rojo, que todavía no es un fallo. El día de hoy va recuadrado y los domingos tienen el fondo distinto.

Debajo siguen las listas, que son el detalle: los días de turno con lo que cae cada uno, la zona de cada domingo y las recogidas del mes con quién las saca y quién las entra.

El calendario y las listas preguntan lo mismo a las mismas funciones (`toca()` y el reparto de la semana), así que no pueden decir cosas distintas.

### Días y tareas

Una tarea se pide en unos días y cuenta por día o por semana:

| Tarea | Días | Cuenta |
|---|---|---|
| Barrer y fregar | los días de limpieza de la casa | una vez por día |
| Sacar la basura | los días de limpieza de la casa | una vez por día |
| Limpieza a fondo | domingo | una vez por semana |
| Sacar / entrar los cubos | por calendario, no por día de la semana | una vez por día |

**Qué días se limpia** es un ajuste de casa (Admin → Días de limpieza): es el calendario del turno diario, ahora **de lunes a sábado**. Las dos tareas del turno diario no tienen días propios, heredan los de la casa, así que cambiar ese ajuste las cambia a la vez y no hay dos sitios que puedan contradecirse. La limpieza a fondo no depende de él: va fijada al domingo.

Las tareas de cubos son la excepción: llevan una marca `cubos` (`sacar` o `entrar`) y **no miran el día de la semana**, sino el calendario de recogidas.

La mayoría de tareas piden **foto**, que queda guardada con el nombre de quien la hizo y la hora.

Si hoy no toca limpieza, la pantalla principal lo dice y señala el siguiente día que toca.

### Lista de la compra

Una lista compartida y sin ceremonias: cualquiera apunta lo que falta, cualquiera lo tacha y todos ven lo mismo. Cada cosa tiene nombre, cantidad y una nota opcional (*«el palo no»*), y se guarda quién la pidió.

Tachar y destachar es el mismo botón, así que equivocarse es barato. Lo comprado se queda abajo a la vista hasta que alguien le da a **Vaciar**.

Sustituye al **stock** anterior, que llevaba existencias y mínimos por artículo y **no se usó nunca**: 17 artículos todos a 3 unidades, sin precios y sin una sola compra registrada. Pedía mantener al día un inventario que nadie iba a mantener.

No lleva punto rojo de aviso: tener cosas apuntadas es el estado normal de una lista de la compra, no una alarma.

### Bote común

Su propia pestaña, separada de la lista. El bote, las aportaciones y las compras registradas con **foto del ticket obligatoria**. Está sin estrenar (0 €), pero se conserva por si algún día se empieza a usar.

### Correo nocturno

Cada noche a las **23:00 hora de Holanda** sale un resumen a Miguel y a Alberto: cómo va cada zona, qué días de la semana no se hizo nada, quién ha hecho qué, la lista de la compra y **las próximas recogidas de cubos con quién las saca y quién las entra** — que es lo que más se olvida, justamente porque no caen siempre el mismo día. Lo dispara `pg_cron` dentro de Supabase, así que **no depende de que ningún ordenador esté encendido**.

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
| Cubos de la basura | Las fechas de recogida y su color · añadir y quitar |
| Cambios de un día | Apuntar que una sección con turno propio la hace otra persona **ese día** · deshacerlos |
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
- `casa_zonas` — zonas con plazas y color. `rota_aparte` marca las que no consumen plaza y llevan turno propio (`rota_desde`, `rota_persona`, `rota_cada` días entre relevos y `rota_salto` puestos extra por semana). Hoy la única es el turno diario, con 1 y 2
- `casa_tareas` — tareas por zona. `dias` son los días en que se pide (`NULL` = los días de limpieza de la casa), `semanal` dice si cuenta una vez por semana en vez de una por día, y `cubos` (`sacar`/`entrar`) marca las que van por el calendario de recogidas en vez de por día de la semana
- `casa_completadas` — una fila por tarea completada. `periodo` es el día, o el lunes que abre la semana para las semanales
- `casa_semanas` — foto fija del reparto de cada semana, para que el historial no se reescriba si alguien entra o sale
- `casa_lista` — la lista de la compra: nombre, cantidad, nota, quién la pidió y si ya está comprada
- `casa_cubos` — calendario de recogidas: una fila por recogida, con el día y el color
- `casa_purchases`, `casa_contributions`, `casa_summary` — el bote común
- `casa_cambios` — cambios de turno de un solo día: `zona_id` + `dia` (únicos), quién lo hace, a quién sustituye y por qué. Borrar la fila deshace el cambio
- `casa_avisos` — registro de cada intento de envío del correo
- `casa_days` — historial del modelo antiguo (una persona al día), conservado sin tocar

### Sobre el acceso

No hay login: **el enlace es la llave**. Las políticas RLS permiten leer y escribir a cualquiera con la clave publicable, que va en el código de la página. Es el modelo buscado, pero conviene saberlo.

### Secretos

En Supabase → Edge Functions → Secrets: `BREVO_API_KEY` y `EMAIL_REMITENTE`. Nunca en el código.

## Historial de cambios

- **2026-10-10 (el mes en calendario)**: **Mi mes** gana un calendario arriba, con los días marcados con abreviaturas — `TD` turno diario, `AF` a fondo, `CS` sacar cubos, `CE` entrar cubos — y su leyenda impresa debajo. En rojo lo que ya pasó sin hacerse. Las listas de detalle se quedan como estaban.

- **2026-10-10 (el domingo es para el fondo, cubos por calendario y lista de la compra)**: La limpieza a fondo pasa a ser **solo del domingo**, y ese día **no hay turno diario**: a quien le cae en domingo no tiene turno esa semana, y le toca a uno distinto cada semana. A cambio el turno diario recupera el sábado, así que son seis días iguales de lunes a sábado. Los **cubos** pierden su rotación propia y pasan a un **calendario de recogidas** con fecha y color: los saca quien tenga el turno diario ese día y los entra quien lo tenga al siguiente. El **stock desaparece** —nunca se usó— y lo sustituye una **lista de la compra** compartida; el **bote** se queda, en su propia pestaña. Y entra **Mi mes**, que enseña de un vistazo los días de turno y las zonas de todo el mes de una persona.

  De paso, la auditoría encontró que el cambio pactado que había apuntado (Sufian cubría a Alberto el domingo 11) se quedaba sin sentido al no haber turno ese día. Se movió al viernes 16, y eso destapó el problema de los vecinos de lista: Sufian tiene el día siguiente al de Alberto casi siempre, así que acabó con dos turnos pegados y sacando y entrando él solo los mismos cubos. Al final el cambio se retiró: el lunes 5 queda apuntado a nombre de Alberto en el historial y ahí acaba el asunto.

- **2026-10-06 (cambios de un día)**: Se puede apuntar que una sección con turno propio la hace otro **ese día**, sin mover la rotación de nadie más: tabla `casa_cambios`, capa `turnoReal` encima de `turnoDe`, marca en la tira y en la ficha, y su sección en el panel de admin. El correo nocturno lo nombra igual. Primer uso: Alberto cubrió a Sufian el lunes 5 y Sufian le devuelve el domingo 11.

- **2026-10-06 (los próximos días a la vista)**: La pestaña **Hoy** añade una tira con los **siete días de la semana** del turno diario y el nombre de quien lo tiene cada uno, más una línea que dice cuándo le vuelve a tocar a quien mira. Antes solo se veía el turno del día, y con el salto de dos puestos por semana nadie podía calcular su próxima vez contando personas. La tira va de lunes a domingo y no «los siete días que vienen»: dentro de una semana pasan los siete sin repetir, pero una ventana a caballo entre dos semanas enseñaba a uno dos veces y a otro ninguna.

- **2026-10-05 (arranque limpio)**: La rotación de zonas se re-ancla en el **lunes 5 de octubre**, que pasa a ser su semana 1, y el historial arranca de cero desde ahí. El turno diario **retoma la lista donde se quedó**: el último turno hecho de verdad fue Alberto el 29 de septiembre, así que empieza **Sufian**, que junto con Pablo nunca había tenido uno. Los cubos verdes no se tocan — Yassine los sacó el domingo 4 y los entra el lunes 5. El historial del modelo viejo (`casa_days`, septiembre) se conserva aparte; la app no lo lee.

- **2026-10-04 (dos secciones, y el choque de los fines de semana)**: La portada se parte en dos pestañas, **Hoy** y **A fondo**, cada una con su cabecera plegable; entre semana las zonas de fondo salen apagadas. El turno diario deja de barrer y fregar los fines de semana —solo saca la basura— para que nadie tenga que fregar la casa y además limpiar su zona a fondo el mismo día. Y el turno diario pasa a correr **dos** puestos por semana en vez de uno: con uno se anulaba contra la rotación de zonas y el turno del finde caía siempre sobre la misma zona durante toda una ronda. Lista nueva de cocina y **ventanas en todas las zonas**.

- **2026-10-04 (turno diario + fondo de fin de semana)**: Vuelve el **turno diario**: una persona al día barre, friega y saca la basura de toda la casa, con el turno corriendo un puesto cada día y uno más cada semana para que a nadie le toque siempre el mismo día. Las zonas se quedan con la **limpieza a fondo del fin de semana**, un tic por tarea que vale marcar el sábado o el domingo. La semana pasa a ir de **lunes a domingo** para que el finde no se parta entre dos equipos, y los turnos propios (diario, cubos) se cuentan por días para no depender de ello. El historial dice quién tenía cada día y el correo nocturno lo desglosa día a día con nombre.

- **2026-10-02 (rotaciones y calendario)**: Todas las tareas pasan a diarias y la casa elige **qué días de la semana se limpia**, así una zona no espera al relevo para volver a limpiarse. La rotación gana un **paso variable** para que cambien también los equipos, no solo las zonas: en 3 rondas cada uno trabaja con los seis. El historial baja a nivel de día y marca los **días en que no se hizo nada**. El correo nocturno los lista, y acepta `{"seco":true}` para probarlo sin enviar.
- **2026-10-01/02 (rediseño por zonas)**: Fuera Miguel y Ali. La casa pasa de "una persona al día para toda la casa" a equipos semanales por zona. Cubos verdes con rotación propia. App rediseñada entera: una tipografía, navegación inferior, color por zona. Stock e historial conservados y reorganizados por zonas y semanas. Panel de admin completo.
- **2026-09-24**: El historial muestra los días que nadie hizo. Se retiró la verificación de fotos. Reintentos en el correo.
- **2026-09-15**: Entran Sufian y Pablo.
- **2026-09-08**: El correo nocturno pasa al backend (Supabase + Brevo), dejando de depender del portátil de Alberto.
- **2026-09-07**: Primera versión (Claude Artifact), luego migrada a web real en Vercel + Supabase.
