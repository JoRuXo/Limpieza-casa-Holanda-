/**
 * Vista previa del correo nocturno de Casa Holanda.
 *
 * Uso:  node resumen-diario.mjs
 *
 * Qué es: una herramienta de línea de comandos para ver, sin enviar nada, el
 * correo que saldría esta noche. No forma parte de la app ni del envío: nada
 * la ejecuta (ni pg_cron ni Vercel).
 *
 * El correo real lo compone y manda la Edge Function `avisar-miguel`
 * (supabase/functions/avisar-miguel/index.ts), disparada por pg_cron a las
 * 23:00 de Holanda. Este script solo le pide la prueba en seco
 * (`{"seco":true}`), así que lo que imprime —incluidos los próximos cubos, con
 * el gris grande de los jueves (`casa_config.cubos_fijos`) y quién saca y
 * quién entra— es siempre lo mismo que se enviará. Antes tenía su propia
 * copia de la lógica (rotación semanal de cubos, tablas del modelo antiguo) y
 * se había quedado desfasada; por eso ya no calcula nada por su cuenta.
 *
 * Usa la clave pública, la misma que va en la web. La vista previa no muestra
 * los destinatarios (decisión del usuario: no se exponen).
 */

const FUNC_URL = "https://lmuiogddgfmmbouaanzo.supabase.co/functions/v1/avisar-miguel";
const SUPA_KEY = "sb_publishable_NqIyAof4Y4fYyzf53qjlnA_-xDvYwsc";

try {
  const r = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
    },
    body: JSON.stringify({ seco: true }),
  });
  const j = await r.json();
  if (!r.ok || j.ok === false) throw new Error(j.error || j.motivo || `HTTP ${r.status}`);
  console.log(`Asunto:   ${j.asunto}`);
  console.log(`\n${j.cuerpo}`);
} catch (e) {
  console.error(`No se pudo obtener la vista previa: ${e.message || e}`);
  process.exitCode = 1;
}
