-- Cubos fijos: los que salen todas las semanas el mismo dia, sin depender del
-- calendario del ayuntamiento. El primero es el cubo gris grande extra que la
-- casa tiene contratado y que se recoge todos los jueves.
--
-- Siguen las mismas normas que las recogidas del calendario: los saca el turno
-- diario de ese dia y los entra el del dia siguiente. Si un dia coinciden con
-- una recogida del calendario (un jueves de grises), se piden juntos en la
-- misma tarea.
--
-- `desde` evita que la regla se aplique hacia atras: los jueves anteriores no
-- se pidieron, y contarlos marcaria en rojo a quien no se le pidio nada.
alter table public.casa_config
  add column if not exists cubos_fijos jsonb not null default '[]'::jsonb;
comment on column public.casa_config.cubos_fijos is
  'Cubos que salen cada semana el mismo dia: [{"dow":4,"cubo":"gris grande","desde":"2026-11-19"}].
   dow 0 = domingo. Se suman a las recogidas de casa_cubos de ese dia.';

update public.casa_config
   set cubos_fijos = '[{"dow":4,"cubo":"gris grande","desde":"2026-11-19"}]'::jsonb,
       updated_at = now()
 where id = 1;
