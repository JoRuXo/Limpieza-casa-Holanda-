-- Revision de las tareas de la limpieza a fondo: las listas se escribieron
-- antes de usar la app de verdad y no encajaban con lo que hay que hacer.
--
-- Importante: en Arriba se RENOMBRA en vez de borrar. casa_completadas tiene
-- ON DELETE CASCADE sobre casa_tareas, asi que borrar una tarea se lleva su
-- historial y sus fotos, y tres de las de Arriba ya estaban marcadas.

-- COCINA: fuera el cristal (nunca se habia hecho).
delete from public.casa_tareas where zona_id = 'cocina' and label = 'Limpiar el cristal';
update public.casa_tareas set orden = 5 where zona_id = 'cocina' and label = 'Limpiar las ventanas';

-- PLANTA BAJA: la escalera pasa a Arriba, que es donde esta la tarea de barrerla.
update public.casa_zonas
   set descripcion = 'Comedor, salón, baño 1 y cuarto de la lavadora'
 where id = 'baja';
insert into public.casa_tareas (zona_id, label, foto, orden, dias, semanal)
values ('baja', 'Limpiar la mesa', true, 2, '{0}', true);

-- ARRIBA: tres de las nuevas son las viejas con otro nombre.
update public.casa_tareas set label = 'Quitar las algas de la ducha', orden = 1
 where zona_id = 'arriba' and label = 'Limpiar la ducha';
update public.casa_tareas set label = 'Limpiar el baño', orden = 4
 where zona_id = 'arriba' and label = 'Limpiar el baño de arriba';
update public.casa_tareas set label = 'Barrer y fregar la escalera y el pasillo', orden = 6
 where zona_id = 'arriba' and label = 'Barrer y fregar el pasillo';
update public.casa_tareas set orden = 7
 where zona_id = 'arriba' and label = 'Limpiar las ventanas';
insert into public.casa_tareas (zona_id, label, foto, orden, dias, semanal) values
  ('arriba','Limpiar la mampara de cristal',     true, 2, '{0}', true),
  ('arriba','Limpiar el lavamanos y el cristal', true, 3, '{0}', true),
  ('arriba','Cambiar las bolsas de basura',      true, 5, '{0}', true);
update public.casa_zonas
   set descripcion = 'Ducha, baño, escalera y pasillo de arriba'
 where id = 'arriba';

-- JARDIN: las tres de antes no se habian hecho nunca, se reemplazan limpias.
-- Es la unica zona que se queda sin "Limpiar las ventanas".
delete from public.casa_tareas where zona_id = 'jardin';
insert into public.casa_tareas (zona_id, label, foto, orden, dias, semanal) values
  ('jardin','Ordenar el garaje y embolsar lo que se tira',    true, 1, '{0}', true),
  ('jardin','Cortar el césped',                               true, 2, '{0}', true),
  ('jardin','Pasar la desbrozadora y quitar las hierbas',     true, 3, '{0}', true),
  ('jardin','Barrer las hojas del pasillo y la parte trasera',true, 4, '{0}', true),
  ('jardin','Echar las ramas y las hojas al cubo verde',      true, 5, '{0}', true);
