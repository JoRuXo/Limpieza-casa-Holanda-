-- La app no tiene cuentas: entra quien tiene el enlace y la clave publica va
-- dentro del HTML. Eso esta asumido. Lo que no hacia falta asumir es que esa
-- misma clave pudiera BORRAR: las 11 tablas tenian una politica "ALL" y desde
-- la consola del navegador se podia vaciar la casa entera.
--
-- Cada tabla pasa a tener solo los verbos que la app usa de verdad. Ninguna
-- linea de la app cambia por esto.

drop policy if exists casa_completadas_all on public.casa_completadas;
create policy casa_completadas_leer  on public.casa_completadas for select to anon, authenticated using (true);
create policy casa_completadas_poner on public.casa_completadas for insert to anon, authenticated with check (true);
create policy casa_completadas_tocar on public.casa_completadas for update to anon, authenticated using (true) with check (true);

drop policy if exists casa_semanas_all on public.casa_semanas;
create policy casa_semanas_leer  on public.casa_semanas for select to anon, authenticated using (true);
create policy casa_semanas_poner on public.casa_semanas for insert to anon, authenticated with check (true);
create policy casa_semanas_tocar on public.casa_semanas for update to anon, authenticated using (true) with check (true);

drop policy if exists casa_purchases_all on public.casa_purchases;
create policy casa_purchases_leer  on public.casa_purchases for select to anon, authenticated using (true);
create policy casa_purchases_poner on public.casa_purchases for insert to anon, authenticated with check (true);

drop policy if exists casa_contributions_all on public.casa_contributions;
create policy casa_contributions_leer  on public.casa_contributions for select to anon, authenticated using (true);
create policy casa_contributions_poner on public.casa_contributions for insert to anon, authenticated with check (true);

drop policy if exists casa_config_all on public.casa_config;
create policy casa_config_leer  on public.casa_config for select to anon, authenticated using (true);
create policy casa_config_tocar on public.casa_config for update to anon, authenticated using (true) with check (true);

-- El historial del modelo viejo (septiembre) no lo lee ni lo escribe nadie.
drop policy if exists casa_days_all on public.casa_days;

-- Quitar el DELETE cierra la puerta principal, pero queda la de atras:
-- casa_completadas cuelga de casa_tareas con ON DELETE CASCADE y casa_tareas
-- de casa_zonas igual, asi que borrar una zona se llevaria todas las fotos de
-- sus tareas sin avisar. Es lo que estuvo a punto de pasar al reescribir las
-- tareas de Arriba, con tres marcas con foto de ese mismo domingo.
create or replace function public.casa_no_borrar_tarea_usada()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare veces integer;
begin
  select count(*) into veces from public.casa_completadas where tarea_id = old.id;
  if veces > 0 then
    raise exception
      'La tarea "%" no se puede borrar: tiene % marca(s) con su foto. Cambiale el nombre en vez de borrarla.',
      old.label, veces
      using errcode = 'restrict_violation';
  end if;
  return old;
end;
$$;

create trigger casa_tareas_no_borrar_usada
  before delete on public.casa_tareas
  for each row execute function public.casa_no_borrar_tarea_usada();

comment on function public.casa_no_borrar_tarea_usada is
  'Impide borrar una tarea con historial, y de paso que borrar una zona se lo
   lleve por el ON DELETE CASCADE. Renombrar si: esa es la via.';
