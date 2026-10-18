-- Raul se va de la casa. Tres cosas a la vez, porque dependen una de otra.

-- 1) El reparto de zonas ya se congelaba por semana para que el historial no
-- se reescribiera al entrar o salir alguien. El turno diario no, y se
-- calculaba siempre: al pasar de 7 a 6 personas, 7 de los 12 dias ya vividos
-- habrian cambiado de nombre y el historial diria que un dia le tocaba a
-- quien ya no vive en la casa.
alter table public.casa_semanas add column turnos jsonb;

comment on column public.casa_semanas.turnos is
  'Turno congelado de las zonas con rotacion propia, {zona_id: {fecha: [personas]}}.
   Se escribe dia a dia, no la semana entera: si alguien entra o sale a media
   semana, los dias que quedan deben salir con la lista nueva. Manda solo sobre
   lo ya vivido (hasta hoy); de manana en adelante vuelve a mandar la rotacion.';

-- Las dos semanas ya vividas, con la rotacion de 7 personas que de verdad
-- tuvieron. Coincide con quien marco cada dia en casa_completadas.
update public.casa_semanas set turnos = '{"diario":{
  "2026-10-05":["Sufian"],  "2026-10-06":["Pablo"],  "2026-10-07":["Yassine"],
  "2026-10-08":["Jorge"],   "2026-10-09":["Noel"],   "2026-10-10":["Raul"],
  "2026-10-11":["Alberto"]}}'::jsonb
 where semana = '2026-10-05';

update public.casa_semanas set turnos = '{"diario":{
  "2026-10-12":["Yassine"], "2026-10-13":["Jorge"],  "2026-10-14":["Noel"],
  "2026-10-15":["Raul"],    "2026-10-16":["Alberto"],"2026-10-17":["Sufian"],
  "2026-10-18":["Pablo"]}}'::jsonb
 where semana = '2026-10-12';

-- 2) Raul fuera. Se mantiene el orden relativo del resto.
update public.casa_config
   set people = array['Yassine','Jorge','Noel','Alberto','Sufian','Pablo'],
       updated_at = now()
 where id = 1;

-- Arriba pasa a una persona: 1+2+2+1 = 6 plazas para 6 personas, encaje exacto.
update public.casa_zonas set plazas = 1 where id = 'arriba';

-- 3) Turno diario correlativo: el dia de cada uno avanza uno por semana.
-- Con 6 personas, 4 es el unico salto que lo consigue. Comprobado contra los
-- otros cinco: 0 va hacia atras, 1/2/3 saltan y repiten patron sin recorrer la
-- semana, y 5 deja a cada uno clavado en el mismo dia para siempre.
update public.casa_zonas set rota_salto = 4 where id = 'diario';

-- Nota: la fila de plazas por la que corre la rotacion de zonas no vive en la
-- base de datos, se construye en el codigo a partir de casa_zonas.plazas. Con
-- este cambio deja de ir agrupada por zona y pasa a repartirse en ronda,
-- empezando por las zonas con mas plazas, para que nadie repita zona dos
-- semanas seguidas. Ver plazas() en index.html.

-- Al reordenar la fila de plazas, el salto desde la semana congelada del 12
-- (repartida con 7 personas y la fila vieja) caia justo en el desfase que
-- repite: Noel seguia en Jardin, Alberto en Planta baja y Pablo en Arriba.
-- Reordenar la fila solo garantiza que no repitan dos semanas CALCULADAS; el
-- salto desde una congelada hay que mirarlo a mano y se corrige con el ancla.
update public.casa_config set rotacion_desde = '2026-10-19', updated_at = now() where id = 1;
