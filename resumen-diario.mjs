/**
 * Resumen diario de la app "Turno de Hoy" (Limpieza Casa Holanda).
 *
 * Uso:  node resumen-diario.mjs
 *
 * Lee el estado directamente de Supabase y escribe por pantalla un JSON
 * pequeño con lo que hace falta para el correo nocturno a Miguel.
 * La clave que usa es la pública (la misma que va en la web), así que
 * este archivo no contiene ningún secreto.
 */

const SUPA_URL = "https://lmuiogddgfmmbouaanzo.supabase.co";
const SUPA_KEY = "sb_publishable_NqIyAof4Y4fYyzf53qjlnA_-xDvYwsc";
const APP_URL = "https://limpieza-casa-holanda.vercel.app";

const DOW = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const pad = (n) => String(n).padStart(2, "0");

async function api(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${path}: ${await r.text()}`);
  return r.json();
}

function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* Los cubos rotan una persona por semana. La semana va del domingo (sacarlos)
   al lunes (entrarlos), así que el lunes sigue siendo de quien los sacó. */
function binsPersonForDate(cfg, dateStr) {
  const people = cfg.people || [];
  if (!people.length || !cfg.bins_start_date || !cfg.bins_start_person) return null;
  const dow = new Date(dateStr + "T00:00:00").getDay();
  const sunday = dow === 1 ? addDays(dateStr, -1) : dateStr;
  if (sunday < cfg.bins_start_date) return null;
  const weeks = Math.floor(daysBetween(cfg.bins_start_date, sunday) / 7);
  let start = people.indexOf(cfg.bins_start_person);
  if (start < 0) start = 0;
  return people[(((start + weeks) % people.length) + people.length) % people.length];
}

try {
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const dow = new Date(today + "T00:00:00").getDay();

  const [cfgRows, dayRows, items, purchases, summaryRows] = await Promise.all([
    api("casa_config?id=eq.1&select=*"),
    api("casa_days?select=*&order=date.desc&limit=60"),
    api("casa_items?select=*&order=sort_order.asc"),
    api("casa_purchases?select=*&order=at.desc&limit=40"),
    // El saldo lo calcula el servidor sobre todas las filas, no sobre las cargadas
    api("casa_summary?select=*"),
  ]);

  const cfg = cfgRows[0];
  if (!cfg) throw new Error("no hay fila de configuración (casa_config)");

  const people = cfg.people || [];
  const leTocaba = people.length
    ? people[((daysBetween(cfg.start_date, today) % people.length) + people.length) % people.length]
    : null;

  // Tareas que tocaban hoy: las diarias + las semanales de este día de la semana
  const wanted = [
    ...(cfg.task_template || []).map((t) => ({ id: t.id, label: t.label, kind: "diaria" })),
    ...(cfg.weekly_tasks || [])
      .filter((w) => w.dow === dow)
      .map((w) => ({ id: w.id, label: w.label, kind: "semanal" })),
  ];
  const stored = (dayRows.find((d) => d.date === today)?.tasks) || [];

  const tareas = wanted.map((w) => {
    const s = stored.find((x) => x.id === w.id) || {};
    return {
      tarea: w.label,
      tipo: w.kind,
      hecha: !!s.done,
      por: s.by || null,
      hora: s.at ? `${pad(new Date(s.at).getHours())}:${pad(new Date(s.at).getMinutes())}` : null,
      con_foto: !!s.img,
      verificada: !!s.verified,
    };
  });

  const pendientes_de_revisar = [];
  for (const day of dayRows) {
    for (const t of day.tasks || []) {
      if (t.done && t.img && !t.verified) {
        pendientes_de_revisar.push({ fecha: day.date, tarea: t.label, por: t.by });
      }
    }
  }

  const por_comprar = items
    .filter((i) => i.status === "low" || i.status === "out")
    .map((i) => ({
      articulo: i.name,
      zona: i.zone,
      estado: i.status === "out" ? "agotado" : "queda poco",
    }));

  const compras_hoy = purchases
    .filter((p) => (p.at || "").slice(0, 10) === today)
    .map((p) => ({
      por: p.by_name,
      importe: Number(p.amount),
      concepto: p.note,
      con_ticket: !!p.ticket_url,
    }));

  const bote = summaryRows[0] ? Number(summaryRows[0].bote) : null;

  console.log(
    JSON.stringify(
      {
        fecha: today,
        dia_semana: DOW[dow],
        le_tocaba: leTocaba,
        responsable_cubos: binsPersonForDate(cfg, today),
        tareas,
        pendientes_de_revisar,
        por_comprar,
        compras_hoy,
        bote_comun: bote,
        url_app: APP_URL,
      },
      null,
      2
    )
  );
} catch (e) {
  console.log(JSON.stringify({ error: String(e.message || e) }));
}
