# Despliegue pendiente: función `avisar-miguel`

Lo que hay en el repositorio (`supabase/functions/avisar-miguel/index.ts`) **no está en producción** todavía. Hasta desplegarlo, la función que corre en Supabase puede seguir devolviendo los destinatarios en la prueba en seco y no tiene el límite de 10 minutos para los envíos forzados.

Decisiones que se mantienen (no hay que cambiarlas al desplegar):

- Sin contraseña ni PIN para `{"forzar":true}`.
- Límite de **10 minutos** entre envíos forzados (mira el último `FORZADO` en `casa_avisos`).
- La prueba en seco (`{"seco":true}`) no devuelve destinatarios.
- No hace falta ningún secreto nuevo (`FORZAR_SECRET` no existe).

## Pasos (panel de Supabase)

1. Abre el proyecto `lmuiogddgfmmbouaanzo` (lista-compra-masiera) en el panel.
2. **Edge Functions → avisar-miguel → Code.**
3. Sustituye el contenido de `index.ts` por el de `supabase/functions/avisar-miguel/index.ts` del repositorio (tal cual, sin cambios).
4. **Deploy.** Comprueba que los secretos `BREVO_API_KEY` y `EMAIL_REMITENTE` siguen existentes (no hay que tocarlos).

## Comprobaciones tras desplegar

Desde cualquier terminal (usa la clave publicable, que es pública):

```bash
K=sb_publishable_NqIyAof4Y4fYyzf53qjlnA_-xDvYwsc
U=https://lmuiogddgfmmbouaanzo.supabase.co/functions/v1/avisar-miguel
```

1. **Prueba en seco, sin destinatarios:**
   ```bash
   curl -s -X POST "$U" -H "Content-Type: application/json" -H "apikey: $K" -H "Authorization: Bearer $K" -d '{"seco":true}'
   ```
   La respuesta debe tener `asunto` y `cuerpo`, y **no** debe tener `destinos`.

2. **Hora fuera de las 23:00 (Holanda):** `{}` sin más debe responder `"motivo":"no son las 23:00 en Holanda todavia"`. No envía nada.

3. **Forzar (solo si hace falta de verdad: envía un correo real a Miguel y a Alberto):** la primera llamada envía; una segunda antes de 10 minutos debe responder **429**.
   ```bash
   curl -s -X POST "$U" -H "Content-Type: application/json" -H "apikey: $K" -H "Authorization: Bearer $K" -d '{"forzar":true}'
   ```

4. **Registro:** en Supabase → Table Editor → `casa_avisos`, la última fila de un forzado debe tener `detalle` que empiece por `FORZADO ·`.

## Si algo falla

- Respuesta 500 con «no se pudo completar el envío»: el detalle está en `casa_avisos` (columna `detalle`, `ok=false`) y en los logs de la función (Edge Functions → avisar-miguel → Logs).
- Respuesta 500 con «no se pudo comprobar el envío de hoy»: la base no respondió; la función no envía en ese caso, a propósito.

## Qué no cambia con el despliegue

- El cron `resumen-limpieza-nocturno` (pg_cron, 21:00 y 22:00 UTC) sigue llamando a la misma URL. La función solo envía a las 23:00 de Holanda, una vez al día.
- `casa_config.aviso_emails` ya tiene a Miguel y a Alberto (`joruxoo@gmail.com`).
