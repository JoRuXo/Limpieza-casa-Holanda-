# Casa Holanda

App de limpieza de una casa compartida de 6 personas: **Yassine, Jorge, Noel, Alberto, Sufian y Pablo**.

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

La rotación **no salta el domingo**: sigue nombrando a alguien cada día, pero ese día no se le pide nada.

Con **6 personas y 6 días de turno** el encaje es exacto: de lunes a sábado trabajan los seis, uno cada día, y **nadie libra**. El domingo es un día fantasma que recae en la misma persona que tuvo el lunes, sin consecuencias porque no lleva tareas. (Con 7 personas sí había un día de más, y a quien le caía el domingo se quedaba esa semana sin turno diario.)

El turno pasa al siguiente de la lista cada día y además **corre cuatro puestos cada semana** (`rota_salto`). El cuatro no es arbitrario: con 6 personas es **el único valor que hace que el día de cada uno avance exactamente uno por semana**. Si te toca el lunes, la semana siguiente el martes, luego el miércoles, y en 6 semanas has hecho los seis días.

Los otros cinco valores se probaron y ninguno sirve: el 0 va hacia atrás, el 1, el 2 y el 3 saltan y repiten patrón sin recorrer la semana, y el 5 deja a cada uno clavado en el mismo día para siempre.

El motivo era distinto cuando eran 7 (entonces el salto servía para que el domingo libre no cayese siempre sobre la misma zona). Al pasar a 6 ya no hay domingo libre, así que ese argumento desapareció y el número lo fija ahora el requisito del día correlativo.

Sigue cumpliéndose que cada semana pasan los seis sin repetir y que en 6 semanas cada uno ha pasado por todos los días.

No ocupa plaza en el reparto de zonas, así que se puede tener turno diario y zona a la vez.

Debajo del turno de hoy va la tira de los **siete días de la semana**, con el nombre de quien lo tiene cada uno. Encima, una línea dice cuándo le toca a quien está mirando: *«Te toca el jueves 8 oct · en 2 días»*, o *«Hoy te toca · vuelves el domingo 18 oct»* si ya lo tiene hoy. Un día sin turno (el domingo) no cuenta como «te toca»: la cuenta salta al siguiente día con trabajo de verdad, y en la tira ese día sale apagado y con la palabra **a fondo** en vez de un nombre. Hace falta porque el turno salta de semana a semana y la vuelta no cae a los siete días justos.

La tira va **de lunes a domingo**, no «los siete días que vienen». Es a propósito: el turno corre un puesto al día y cuatro más al cambiar de semana, así que dentro de una semana pasan todos sin repetir, pero una ventana que se montase sobre dos semanas enseñaría a alguien dos veces y a otro ninguna. Los días ya pasados salen apagados.

### Zonas y equipos

Para la limpieza a fondo, la casa se reparte en **4 zonas**, con un equipo por zona:

| Zona | Plazas | Qué incluye |
|---|---|---|
| Cocina | 1 | Cocina |
| Jardín / Garaje | 2 | Jardín y garaje |
| Planta baja | 2 | Comedor, salón, baño 1 y cuarto de la lavadora |
| Arriba | 1 | Ducha, baño, escalera y pasillo de arriba |

Son **6 plazas para 6 personas**: encaje exacto. Arriba pasó a una sola persona justamente para que siguiera cuadrando al marcharse Raul.

La limpieza a fondo se hace **el domingo**, y ese día no hay turno diario para nadie. Cada tarea se marca **una sola vez** por semana.

Todas las zonas incluyen **limpiar las ventanas**. La cocina lleva además horno, microondas, cajones, el filtro de la vitro y el cristal.

### La rotación de zonas

Las 6 plazas van en fila fija y las personas en una lista ordenada. **Cada lunes todos avanzan una plaza**, así que en 6 semanas cada uno ha pasado por todas las zonas. Eso es una **ronda**.

La fórmula es `persona de la plaza i = gente[(paso × i + semana) mod n]`. El **paso** es lo que hace que roten también los equipos: con paso 1 las parejas son vecinos de la lista, con paso 2 quedan a dos puestos, y así. Al terminar una ronda se pasa al siguiente paso, cuando hay más de uno.

#### Cómo se ordena la fila de plazas

Las plazas de una zona **no van juntas**: se reparten en ronda, una por zona y vuelta a empezar, **empezando por las zonas con más plazas**. Con la casa de ahora la fila queda `jardín · planta baja · cocina · arriba · jardín · planta baja`.

Las dos decisiones tienen un motivo medido:

- **Por qué no van juntas.** Como cada lunes todos corren una plaza, si las dos de una zona fuesen vecinas caerías en la de al lado y harías **la misma zona dos semanas seguidas**. Eso pasaba: con la fila agrupada, todos hacían Jardín dos domingos seguidos y Planta baja otros dos.
- **Por qué las grandes primero.** Repartir en ronda sin ordenar también evita el repetido, pero deja las dos plazas de cada zona a tres puestos de distancia, y entonces cada uno coincide **siempre con la misma persona**: de 6 parejas posibles se baja a 3. Empezando por las grandes quedan a cuatro, y se conservan las 6.

Si alguna vez una zona acapara tantas plazas que el reparto en ronda no basta para separarlas, el panel de admin lo avisa en rojo en vez de dejarlo pasar.

#### El salto cuando cambia el modelo

Que la fila no repita garantiza que **dos semanas calculadas seguidas** no repitan. No dice nada del salto desde una **semana congelada**, que se repartió con la casa y la fila de antes. Al pasar a seis y reordenar la fila, ese salto cayó justo en el desfase malo y tres personas habrían repetido zona.

Para eso está el **ancla** (`rotacion_desde`): mover el lunes de arranque desplaza el reparto de todas las semanas que aún no están congeladas, y de los seis desfases posibles basta con elegir uno que no choque con la última semana vivida. Es lo que se hizo al marcharse Raul, anclando en el lunes 19.

**Al cambiar de gente, de plazas o de fila hay que mirar ese salto a mano**: la rotación por sí sola no lo cubre.

Con 6 personas hay **una sola ronda**, y eso tiene una consecuencia que conviene saber: **las parejas no rotan**. Cada uno coincide siempre con los mismos dos vecinos de lista, y de las 15 parejas posibles solo llegan a darse 6.

No es un fallo ni se arregla reordenando la lista: reordenar cambia quién va con quién, pero no hace que roten. Es aritmética — hace falta un número de personas con más coprimos, como 5 o 7. Con 7 había 3 rondas y en 21 semanas cada uno había trabajado con los otros seis. El panel de admin lo dice en su texto, para que no prometa lo que ya no cumple.

Vale cualquier paso coprimo con el número de personas, que es lo que garantiza que las plazas caigan en personas distintas. Si cambia el número de habitantes, la app recalcula los pasos disponibles (con 6 personas solo hay uno, con 7 hay tres).

En las zonas de 2 plazas siempre **se queda uno y entra otro**, así que nunca cambia el equipo entero de golpe y siempre hay quien ya conoce la zona.

La rotación va por fecha, no por tareas: terminar antes no adelanta el relevo.

### Cubos de la basura

Los cubos **no tienen turno propio**: van por **calendario de recogidas**, porque el ayuntamiento no recoge siempre el mismo día de la semana ni siempre el mismo color.

Cada recogida es una fecha y un color. Y entonces:

- Los **saca** quien tenga el turno diario **ese día**.
- Los **entra** quien tenga el turno diario **al día siguiente**.

**Normalmente son dos personas distintas, y está garantizado**: el turno corre un puesto al día (cinco al cambiar de semana) y con seis personas ninguno de esos avances vuelve al mismo sitio, así que dos días seguidos nunca caen en la misma persona.

La única forma de que el mismo saque y entre es que un **cambio pactado** le ponga encima el día anterior o el siguiente al suyo. Pasa fácil entre vecinos de la lista: como el turno avanza un puesto al día, **quien va detrás de ti en la lista tiene casi siempre el día justo después del tuyo**. No es un error, pero conviene tenerlo en cuenta al elegir el día de un cambio, porque esa persona acabaría haciendo dos días seguidos.

Las dos tareas aparecen solas dentro del turno diario de cada uno, con el color escrito (*«Sacar los cubos azules a la calle»*). Si un día no hay recogida apuntada, no se pide nada.

Esto es más simple que la rotación propia que tenían antes: no hay nada que cuadrar con el reparto de zonas, no gasta plaza y no hace falta re-anclar nada cuando cambia el calendario. Las fechas se meten en **Admin → Cubos de la basura**, y hay que ir añadiéndolas mes a mes.

Octubre de 2026: lunes 12 verdes, viernes 16 azules, jueves 22 grises, lunes 26 verdes.

### Lo ya vivido no se mueve

El reparto de zonas se congela por semana en `casa_semanas.asignacion`, y **el turno diario se congela día a día** en `casa_semanas.turnos`. Las dos cosas por el mismo motivo: si no, al entrar o salir alguien de la casa el pasado se recalcularía y el historial pasaría a decir que un día le tocaba a quien ya no vive aquí. Pasó justo al marcharse Raul: 7 de los 12 días ya vividos habrían cambiado de nombre.

Lo congelado **solo manda sobre lo ya vivido**. De mañana en adelante vuelve a mandar la rotación, que es lo que permite que un cambio de gente surta efecto sin esperar a la semana siguiente.

Y se congela **día a día**, no la semana entera de golpe, precisamente para eso: si se guardase la semana completa al abrirla y alguien se fuese el miércoles, los días que quedan saldrían con la lista vieja. El reparto de zonas sí va por semana entera, porque esa es su unidad.

Los cambios pactados siguen siendo una capa aparte, encima de lo congelado.

### Cambios de un día

Cuando alguien cubre a otro, se apunta el cambio y ya está: **ese día esa sección la hace otro y nada más**. La rotación de debajo no se mueve, así que los demás conservan sus turnos y al borrar el cambio vuelve el titular solo.

Es una capa encima de la rotación, no un parche dentro: el código sigue teniendo `turnoDe` (el turno de verdad, el que usa el panel de admin para re-anclar) y `turnoReal` (ese mismo turno con el cambio puesto encima, que es lo que mira todo lo que enseña quién limpia). El correo nocturno hace lo mismo y escribe `Alberto (cambio, por Sufian)`.

A quién le tocaba **no se escribe a mano**: se saca de la rotación de ese día al guardar, así que no se puede apuntar un cambio contra alguien que no lo tenía.

En la tira de la semana el día cambiado sale con borde ámbar y una marca `⇄`; en la ficha de la sección, una línea dice a quién se está cubriendo.

Se gestionan desde **Admin → Cambios de un día**, y solo tienen sentido en las secciones con turno propio: las zonas de fondo se reparten por semana y ahí no hay un día suelto que cambiar.

### Por qué la semana va de lunes a domingo

Para que el **domingo de la limpieza a fondo cierre la semana del mismo equipo** que la ha tenido. Con semanas de domingo a sábado, el domingo sería el primer día de la semana siguiente y la zona que se limpia a fondo no sería la que acaba de tocar.

También es lo que hace que la tira del turno diario salga limpia: dentro de una semana de lunes a domingo pasan todos sin repetir.

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
| Cortar el césped, desbrozadora | cualquier día de la semana | una vez por semana |

**Qué días se limpia** es un ajuste de casa (Admin → Días de limpieza): es el calendario del turno diario, ahora **de lunes a sábado**. Las dos tareas del turno diario no tienen días propios, heredan los de la casa, así que cambiar ese ajuste las cambia a la vez y no hay dos sitios que puedan contradecirse. La limpieza a fondo no depende de él: va fijada al domingo.

Las tareas de cubos son la excepción: llevan una marca `cubos` (`sacar` o `entrar`) y **no miran el día de la semana**, sino el calendario de recogidas.

### Tareas sin día fijo

Algunas tareas no dependen del calendario sino del tiempo que haga: el césped no se corta con lluvia. Esas llevan la marca `cualquier_dia` y **se piden los siete días de la semana de su equipo**; se hacen el día que se pueda y, al ser semanales, cuentan **un solo tic**. En la lista salen con la etiqueta `CUALQUIER DÍA`, y el bloque de la limpieza a fondo avisa de que ya se pueden hacer aunque el domingo quede lejos.

Hay dos detalles que las hacen menos triviales de lo que parecen, y los dos están resueltos en el código:

- **No cuentan para decidir qué días hay limpieza a fondo.** Si contasen, al pedirse los siete días la app creería que el fondo está abierto siempre, y se vendría abajo todo lo que cuelga de eso: la cuenta atrás, el domingo sin turno diario, la pestaña del mes.
- **No cuentan en la cuenta de un día suelto** salvo el día del fondo. Si contasen, bastaría con cortar el césped un martes para que ningún día del resto de la semana pudiera volver a salir como «no se hizo nada»: su tic vale para toda la semana y taparía el hueco.

Se marcan desde **Admin → Tareas**, con el interruptor `cualquier día`, que además pone la tarea en «1 vez/semana» porque sin eso habría que marcarla los siete días.

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
| Tareas | Texto · **qué días se pide**, uno a uno · si cuenta **1 vez por semana** o una por día · si vale **cualquier día** · si lleva foto · orden dentro de la zona · crear y borrar |
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
- `casa_tareas` — tareas por zona. `dias` son los días en que se pide (`NULL` = los días de limpieza de la casa), `semanal` dice si cuenta una vez por semana en vez de una por día, `cubos` (`sacar`/`entrar`) marca las que van por el calendario de recogidas en vez de por día de la semana, y `cualquier_dia` las que se piden toda la semana y se hacen cuando se pueda
- `casa_completadas` — una fila por tarea completada. `periodo` es el día, o el lunes que abre la semana para las semanales
- `casa_semanas` — foto fija de cada semana: `asignacion` con el reparto de zonas y `turnos` con el turno diario día a día (`{zona: {fecha: [personas]}}`), para que el historial no se reescriba si alguien entra o sale
- `casa_lista` — la lista de la compra: nombre, cantidad, nota, quién la pidió y si ya está comprada
- `casa_cubos` — calendario de recogidas: una fila por recogida, con el día y el color
- `casa_purchases`, `casa_contributions`, `casa_summary` — el bote común
- `casa_cambios` — cambios de turno de un solo día: `zona_id` + `dia` (únicos), quién lo hace, a quién sustituye y por qué. Borrar la fila deshace el cambio
- `casa_avisos` — registro de cada intento de envío del correo
- `casa_days` — historial del modelo antiguo (una persona al día), conservado sin tocar

### Sin cobertura

El garaje y el jardín son donde peor entra la señal y donde más se marca, así que la app está pensada para que eso no se pierda. Dos piezas:

- Un **service worker** (`sw.js`) guarda la app para que **abra sin red**. Va primero a la red y solo tira del guardado si no hay: al revés, la casa se quedaría con una versión vieja hasta vaciar el navegador. Los datos **no** se cachean ahí a propósito — una respuesta vieja servida como fresca es peor que no tener nada.
- La app guarda aparte una **copia de lo último que supo**, y si no puede conectar la enseña diciendo de qué hora es (*«Sin conexión · datos de las 23:40»*). Se puede mirar el turno y marcar igual.

Lo que se marca sin red **se apunta en una cola** con la foto dentro y sale solo al volver la cobertura, o al refrescar, o al abrir la app. Mientras tanto la cabecera lo dice: *«1 marca por enviar»*.

Reenviar no es peligroso porque el tic se guarda con `on_conflict` sobre (tarea, periodo): repetirlo no duplica nada. Esa idempotencia es lo que permite reintentar sin llevar la cuenta de qué llegó. La cola admite **5 marcas** —una foto ocupa y `localStorage` no da para mucho más— y avisa si se llena.

Reintentar sin más no basta: hay fallos que no se arreglan esperando. Si el servidor **contesta que no** —la tarea ya no existe, la foto está corrupta—, la marca se descarta con el motivo en pantalla en vez de reintentarse cada 45 segundos para siempre dejando la cuenta encallada. Solo se conserva lo que falló por falta de red. Y la foto, una vez subida, se apunta en la propia entrada: si lo que falla es la marca, el reintento no vuelve a subir la imagen.

### Permisos: qué puede hacer la clave pública

La app no tiene cuentas: entra quien tiene el enlace, y la clave pública va dentro del HTML. Eso está asumido. Lo que no hacía falta asumir es que esa misma clave pudiera **borrar**: las once tablas tenían una política `ALL` y desde la consola del navegador se podía vaciar la casa entera.

Ahora cada tabla tiene solo los verbos que la app usa:

| Tabla | Puede |
|---|---|
| `casa_completadas`, `casa_semanas` | leer, insertar, actualizar — **nunca borrar** |
| `casa_purchases`, `casa_contributions` | leer e insertar — ni editar ni borrar |
| `casa_config` | leer y editar la fila única |
| `casa_zonas`, `casa_tareas`, `casa_lista`, `casa_cubos`, `casa_cambios` | todo: el admin las crea y las borra de verdad |
| `casa_days` (modelo viejo) | nada |

Quitar el `DELETE` cierra la puerta principal, pero quedaba la de atrás: `casa_completadas` cuelga de `casa_tareas` con `ON DELETE CASCADE`, así que borrar una zona se llevaría las fotos de sus tareas. Un **trigger** lo impide y lo dice con nombre y apellidos: *«La tarea X no se puede borrar: tiene 3 marcas con su foto. Cámbiale el nombre en vez de borrarla.»* Es la regla que ya estaba escrita, ahora hecha norma de la base.

Para que ese mensaje llegue, los errores del servidor se enseñan tal cual en vez del genérico «revisa la conexión», que mandaba a mirar donde no era.

**Lo que sigue abierto, a sabiendas:** cualquiera con el enlace puede *escribir* — marcar por otro, añadir a la lista, cambiar la configuración. Para una casa de seis compensa; cerrarlo pediría cuentas de usuario.

### Sobre el acceso

No hay login: **el enlace es la llave**. Las políticas RLS permiten leer y escribir a cualquiera con la clave publicable, que va en el código de la página. Es el modelo buscado, pero conviene saberlo.

### Secretos

En Supabase → Edge Functions → Secrets: `BREVO_API_KEY` y `EMAIL_REMITENTE`. Nunca en el código.

## Historial de cambios

- **2026-10-18 (candado y sin cobertura)**: Dos cosas que faltaban y un fallo propio.

  **Permisos.** Las once tablas tenían política `ALL`, así que la clave pública del HTML podía vaciar el historial desde la consola del navegador. Cada tabla pasa a tener solo lo que la app usa, y un trigger impide borrar una tarea con historial — también por la puerta de atrás del `ON DELETE CASCADE` al borrar una zona. Los errores del servidor ya se leen en pantalla en vez del «revisa la conexión» genérico.

  **Sin cobertura.** Service worker para que la app abra sin red, copia de lo último sabido con su hora, y cola de marcas pendientes con la foto dentro que sale sola al volver la cobertura. Reenviar es inofensivo porque el tic es idempotente.

  **El fallo:** el botón de añadir aportación al Bote llevaba desde el día 10 sin hacer nada — me llevé su manejador por delante al quitar el stock del admin. Nadie lo notó porque el bote no se usa.

  Y una cosa que **no** se ha hecho: el borrado automático de fotos viejas que yo mismo había propuesto. Al medirlo resultaron ser 4 MB en seis semanas (51 KB por foto, ya se redimensionan), unos 35 MB al año sobre 1 GB de plan. No hacía falta.

- **2026-10-18 (el salto entre la casa vieja y la nueva)**: Reordenar la fila de plazas evita que dos semanas **calculadas** repitan zona, pero no cubre el salto desde una semana **congelada**, repartida con la casa y la fila de antes. Ese salto cayó justo en el peor de los seis desfases: Noel habría seguido en Jardín, Alberto en Planta baja y Pablo en Arriba. Se re-ancla la rotación de zonas en el **lunes 19**, el único arranque limpio junto con el 12 y el que de verdad estrena la casa de seis.

  De paso, dos cosas que el re-anclaje destapó: el aviso de «las zonas no tienen equipo» salía en una semana anterior al ancla aunque estuviera congelada y sí tuviera equipo, y el contador de días del historial se recortaba en el ancla y se comía las semanas vividas antes. Las dos arregladas.

- **2026-10-18 (nadie repite zona dos semanas seguidas)**: La fila de plazas deja de ir agrupada por zona. Antes las dos plazas de Jardín eran vecinas, y como cada lunes todos corren una plaza, al avanzar caías en la de al lado: **todo el mundo hacía Jardín dos domingos seguidos**, y Planta baja otros dos. Ahora se reparten en ronda, una por zona y vuelta a empezar, empezando por las zonas con más plazas.

  Lo de empezar por las grandes no es un detalle: repartir en ronda sin ordenar también quita el repetido, pero deja las plazas de cada zona a tres puestos y entonces cada uno coincide siempre con la misma persona — de 6 parejas posibles se cae a 3. Ordenando quedan a cuatro y se conservan las 6. Comprobado sobre 15 semanas: nadie repite zona y las parejas se mantienen.

- **2026-10-18 (Raul se va: la casa pasa a 6)**: Fuera Raul, **Arriba baja a una persona** y vuelve a cuadrar exacto (1+2+2+1 = 6 plazas para 6). El turno diario pasa a ser **correlativo**: `rota_salto` de 2 a **4**, que con 6 personas es el único valor que hace que el día de cada uno avance uno por semana. Y como ahora hay 6 días de turno para 6 personas, **desaparece el domingo libre**: trabajan los seis, de lunes a sábado.

  Lo que no se veía venir: al quitar a alguien, **el turno diario se recalculaba hacia atrás** y 7 de los 12 días ya vividos habrían cambiado de nombre. El reparto de zonas ya estaba protegido con `casa_semanas.asignacion`; ahora el turno también, congelado **día a día** en `casa_semanas.turnos`. El historial de Raul se conserva entero.

  Y una pérdida que no se puede evitar: con 6 personas **solo hay un paso de rotación posible**, así que las parejas de zona dejan de rotar y cada uno coincide siempre con los mismos. Es aritmética del 6, no del código; el panel de admin ya lo explica en vez de prometer lo contrario.

- **2026-10-11 (tareas sin día fijo)**: Cortar el césped y pasar la desbrozadora no se pueden hacer si llueve, así que dejan de estar atadas al domingo: se piden **toda la semana** y se marcan el día que se pueda, contando igual un solo tic. Columna `cualquier_dia` en `casa_tareas` e interruptor en Admin → Tareas para marcar cualquier otra.

  Lo delicado no era pedirlas los siete días sino que eso no contaminara el resto: no definen el día de la limpieza a fondo (si no, la app lo daría por abierto siempre) ni cuentan en la cuenta de un día suelto (si no, cortar el césped un martes taparía los días sin hacer nada del resto de la semana).

- **2026-10-11 (las tareas de cada zona, revisadas)**: Listas nuevas despues del primer domingo de uso real. Cocina pierde «Limpiar el cristal»; Planta baja suelta la escalera y gana «Limpiar la mesa»; **Arriba** se reescribe entera (algas de la ducha, mampara, lavamanos, baño, bolsas, escalera y pasillo) y se queda la escalera en su descripción; **Jardín** pasa a cinco tareas de garaje, césped, desbrozadora y hojas, y es la única zona sin «Limpiar las ventanas».

  En Arriba las tareas que seguían existiendo con otro nombre se **renombraron en vez de borrarse**: `casa_completadas` cuelga de `casa_tareas` con `ON DELETE CASCADE`, y borrarlas habría tirado las tres marcas con foto que Pablo acababa de hacer ese mismo domingo. Es la regla a seguir siempre que se toquen tareas ya usadas.

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
