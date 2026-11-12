-- Cierra dos puertas que no hacian falta para el funcionamiento de la app.
--
-- 1) `casa_avisos` es el registro de envios del correo (destinatarios y asunto).
--    La app no lo lee; solo la Edge Function lo escribe, con la clave de
--    servicio, que no pasa por RLS. Con la politica de lectura, cualquiera con
--    la clave publicable podia ver a quien se manda el correo y cuando.
drop policy if exists casa_avisos_read on public.casa_avisos;

-- 2) Defensa en profundidad: ni anon ni authenticated necesitan TRUNCATE,
--    TRIGGER ni REFERENCES sobre las tablas de la casa. Las politicas RLS ya
--    limitan SELECT/INSERT/UPDATE/DELETE; esto quita lo que RLS no cubre.
revoke truncate, trigger, references on
  public.casa_avisos, public.casa_cambios, public.casa_completadas, public.casa_config,
  public.casa_contributions, public.casa_cubos, public.casa_days, public.casa_lista,
  public.casa_purchases, public.casa_semanas, public.casa_tareas, public.casa_zonas
from anon, authenticated;
