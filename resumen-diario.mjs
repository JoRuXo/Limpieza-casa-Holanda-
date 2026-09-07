/**
 * Extrae un resumen compacto del estado de la app "Turno de Hoy".
 *
 * Uso:  node resumen-diario.mjs <ruta-al-html-del-artifact>
 *
 * El HTML publicado lleva el estado incrustado entre los marcadores
 * STATE_START / STATE_END. Este script lo saca, descarta las fotos en base64
 * (que ocupan megas) y escribe por pantalla un JSON pequeño con lo que hace
 * falta para el correo diario a Miguel.
 */
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.log(JSON.stringify({ error: "falta_ruta_html" }));
  process.exit(0);
}

let html;
try {
  html = fs.readFileSync(file, "utf8");
} catch (e) {
  console.log(JSON.stringify({ error: "no_se_pudo_leer", detalle: String(e.message) }));
  process.exit(0);
}

const m = html.match(/\/\*STATE_START\*\/([\s\S]*?)\/\*STATE_END\*\//);
if (!m) {
  console.log(JSON.stringify({ error: "no_se_encontro_el_estado" }));
  process.exit(0);
}

let state;
try {
  state = JSON.parse(m[1]);
} catch (e) {
  console.log(JSON.stringify({ error: "estado_ilegible", detalle: String(e.message) }));
  process.exit(0);
}

const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const DOW = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const daysBetween = (a, b) =>
  Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);

function personForDate(d) {
  const n = (state.people || []).length;
  if (!n) return null;
  return state.people[((daysBetween(state.startDate, d) % n) + n) % n];
}

const dow = new Date(today + "T00:00:00").getDay();

// Tareas que tocaban hoy: las diarias + las semanales de este día de la semana
const wanted = [
  ...(state.taskTemplate || []).map((t) => ({ id: t.id, label: t.label, kind: "diaria" })),
  ...(state.weeklyTasks || [])
    .filter((w) => w.dow === dow)
    .map((w) => ({ id: w.id, label: w.label, kind: "semanal" })),
];
const stored = (state.days?.[today]?.tasks) || [];
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

// Fotos subidas hoy y fotos pendientes de revisar (de cualquier día guardado)
const subidas_hoy = stored
  .filter((t) => t.done && t.img && (t.at || "").slice(0, 10) === today)
  .map((t) => ({ tarea: t.label, por: t.by, verificada: !!t.verified }));

const pendientes_de_revisar = [];
for (const [fecha, day] of Object.entries(state.days || {})) {
  for (const t of day.tasks || []) {
    if (t.done && t.img && !t.verified) {
      pendientes_de_revisar.push({ fecha, tarea: t.label, por: t.by });
    }
  }
}

const por_comprar = (state.items || [])
  .filter((i) => i.status === "low" || i.status === "out")
  .map((i) => ({ articulo: i.name, zona: i.zone, estado: i.status === "out" ? "agotado" : "queda poco" }));

const compras_hoy = (state.purchases || [])
  .filter((p) => (p.at || "").slice(0, 10) === today)
  .map((p) => ({ por: p.by, importe: p.amount, concepto: p.note, con_ticket: !!p.ticket }));

const potIn = (state.contributions || []).reduce((a, c) => a + (c.amount || 0), 0);
const potOut = (state.purchases || []).reduce((a, p) => a + (p.amount || 0), 0);

console.log(
  JSON.stringify(
    {
      fecha: today,
      dia_semana: DOW[dow],
      le_tocaba: personForDate(today),
      responsable_cubos: state.binsPerson || null,
      tareas,
      subidas_hoy,
      pendientes_de_revisar,
      por_comprar,
      compras_hoy,
      bote_comun: Number((potIn - potOut).toFixed(2)),
    },
    null,
    2
  )
);
