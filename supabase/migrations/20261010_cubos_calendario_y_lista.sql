-- Los cubos dejan de tener rotacion propia y pasan a ser un calendario de
-- fechas. Quien los saca es quien tiene el turno diario ese dia, y quien los
-- entra es quien lo tiene al dia siguiente, asi que no hace falta una zona
-- aparte con su rotacion: basta con saber que dias hay recogida.
create table public.casa_cubos (
  dia   date primary key,
  color text not null,
  nota  text,
  por   text,
  at    timestamptz not null default now()
);
comment on table public.casa_cubos is
  'Calendario de recogida de cubos. Una fila por recogida: el dia y el color.
   Las tareas de sacar y entrar se las queda el turno diario de ese dia y del
   siguiente; no hay rotacion propia de cubos.';
alter table public.casa_cubos enable row level security;
create policy casa_cubos_all on public.casa_cubos
  for all to anon, authenticated using (true) with check (true);

-- Las dos tareas de cubos no se piden por dia de la semana sino por
-- calendario. `cubos` dice cual de las dos es; los dias salen de casa_cubos.
alter table public.casa_tareas
  add column cubos text check (cubos in ('sacar','entrar'));
comment on column public.casa_tareas.cubos is
  'Si vale sacar/entrar, la tarea no sigue los dias de la semana: se pide en
   las fechas de casa_cubos (sacar el mismo dia, entrar el dia siguiente).';

-- La lista de la compra sustituye al stock. No hay minimos ni existencias: es
-- una lista compartida a la que cualquiera anade y de la que cualquiera tacha.
create table public.casa_lista (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  cantidad     numeric not null default 1 check (cantidad > 0),
  nota         text,
  pedido_por   text,
  at           timestamptz not null default now(),
  comprado     boolean not null default false,
  comprado_por text,
  comprado_at  timestamptz,
  orden        integer not null default 0
);
comment on table public.casa_lista is
  'Lista de la compra compartida. Sustituye al stock, que nunca se uso.';
create index casa_lista_orden_idx on public.casa_lista (comprado, orden, at);
alter table public.casa_lista enable row level security;
create policy casa_lista_all on public.casa_lista
  for all to anon, authenticated using (true) with check (true);

-- Fuera el stock: 17 articulos a 3 unidades, sin precios y sin una sola
-- compra registrada en todo su uso.
drop table public.casa_items;

-- La limpieza a fondo pasa a ser solo del domingo.
update public.casa_tareas set dias = '{0}'
 where zona_id in ('cocina','jardin','baja','arriba');

-- Los dias de limpieza de la casa pasan a ser lunes a sabado: el domingo se
-- reserva entero a la limpieza a fondo. Las dos tareas del turno diario los
-- heredan, asi que no pueden contradecirlo.
update public.casa_config set dias_limpieza = '{1,2,3,4,5,6}'::int[] where id = 1;
update public.casa_tareas set dias = null where zona_id = 'diario';
update public.casa_zonas
   set descripcion = 'Barrer, fregar y sacar la basura, de lunes a sábado'
 where id = 'diario';

-- Fuera la zona de cubos con su rotacion propia (arrastra sus dos tareas).
delete from public.casa_zonas where id = 'cubos';

-- Las dos tareas nuevas viven en el turno diario y se piden por calendario.
insert into public.casa_tareas (zona_id, label, foto, orden, dias, semanal, cubos) values
  ('diario','Sacar los cubos a la calle', true, 3, null, false, 'sacar'),
  ('diario','Entrar los cubos',           true, 4, null, false, 'entrar');
