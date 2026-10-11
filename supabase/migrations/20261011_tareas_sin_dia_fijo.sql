-- Hay tareas que no dependen del calendario sino del tiempo que haga: cortar
-- el cesped o pasar la desbrozadora no se pueden hacer si llueve. Se piden
-- toda la semana y se hacen el dia que se pueda, pero siguen contando una
-- sola vez por semana como el resto de la limpieza a fondo.
--
-- No definen el dia del fondo: ese se sigue sacando de las tareas que si
-- tienen dia fijo, para que la app no crea que el fondo esta abierto siempre.
alter table public.casa_tareas
  add column cualquier_dia boolean not null default false;

comment on column public.casa_tareas.cualquier_dia is
  'La tarea se pide todos los dias de la semana de su equipo y se marca el dia
   que se pueda. Requiere semanal = true: cuenta un solo tic por semana. No
   cuenta para calcular que dias hay limpieza a fondo.';

update public.casa_tareas
   set cualquier_dia = true
 where zona_id = 'jardin'
   and label in ('Cortar el césped', 'Pasar la desbrozadora y quitar las hierbas');
