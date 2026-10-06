-- Un cambio pactado: ese día esa sección la hace otro, sin mover la rotación
-- de los demás. Una fila por día y sección; la rotación de debajo no se toca,
-- así que al quitar la fila todo vuelve a su sitio solo.
create table public.casa_cambios (
  id          uuid primary key default gen_random_uuid(),
  zona_id     text not null references public.casa_zonas(id) on delete cascade,
  dia         date not null,
  quien       text not null,
  en_lugar_de text not null,
  nota        text,
  por         text,
  at          timestamptz not null default now(),
  unique (zona_id, dia)
);

comment on table public.casa_cambios is
  'Cambios de turno de un solo dia. La rotacion base no se altera: se sustituye
   quien le toca ese dia a esa seccion. Al borrar la fila vuelve el titular.';

create index casa_cambios_dia_idx on public.casa_cambios (dia);

alter table public.casa_cambios enable row level security;

-- Mismo criterio que el resto de la casa: la app no tiene cuentas, entra quien
-- tiene el enlace.
create policy casa_cambios_all on public.casa_cambios
  for all to anon, authenticated using (true) with check (true);
