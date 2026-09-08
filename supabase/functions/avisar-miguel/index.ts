/**
 * Avisos por correo de la app "Turno de Hoy" (Limpieza Casa Holanda).
 *
 * Dos modos:
 *   {"modo":"instante","fecha":"2026-09-08","tarea":"basura"}
 *      -> la app lo llama justo después de subir una foto: avisa al revisor
 *         (Miguel) de que tiene algo nuevo que comprobar.
 *   {"modo":"resumen"}
 *      -> lo llama pg_cron cada noche: resumen del día completo.
 *
 * El contenido SIEMPRE se compone leyendo la base de datos, nunca a partir de
 * lo que manda el navegador: así nadie puede provocar un correo con datos
 * inventados llamando al endpoint a mano.
 *
 * Secretos necesarios (se ponen en Supabase, nunca en el código):
 *   BREVO_API_KEY     clave de API de Brevo
 *   EMAIL_REMITENTE   dirección verificada en Brevo desde la que se envía
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const REMITENTE = Deno.env.get("EMAIL_REMITENTE") ?? "";
const APP_URL = "https://limpieza-casa-holanda.vercel.app";
const TZ = "Europe/Amsterdam";

const DOW = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hoyLocal(): string {
  // sv-SE formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function horaLocal(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}

function fechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}`;
}

function diaSemana(fecha: string): number {
  return new Date(fecha + "T12:00:00Z").getUTCDay();
}

function eur(n: number): string {
  return Number(n).toFixed(2).replace(".", ",") + " EUR";
}

async function db(path: string): Promise<any> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) throw new Error(`DB ${r.status}: ${await r.text()}`);
  return r.json();
}

async function enviarCorreo(destino: string, asunto: string, cuerpo: string) {
  if (!BREVO_API_KEY) throw new Error("falta el secreto BREVO_API_KEY");
  if (!REMITENTE) throw new Error("falta el secreto EMAIL_REMITENTE");
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: REMITENTE, name: "Turno de Hoy - Casa Holanda" },
      to: [{ email: destino }],
      subject: asunto,
      textContent: cuerpo,
    }),
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${texto}`);
  return texto;
}

/** Tareas que tocaban ese día: las diarias + la semanal que corresponda. */
function tareasDelDia(cfg: any, fecha: string, guardadas: any[]) {
  const dow = diaSemana(fecha);
  const plantilla = [
    ...(cfg.task_template ?? []).map((t: any) => ({ id: t.id, label: t.label, tipo: "diaria" })),
    ...(cfg.weekly_tasks ?? [])
      .filter((w: any) => w.dow === dow)
      .map((w: any) => ({ id: w.id, label: w.label, tipo: "semanal" })),
  ];
  return plantilla.map((p) => {
    const g = guardadas.find((x: any) => x.id === p.id) ?? {};
    return { ...p, hecha: !!g.done, por: g.by ?? null, at: g.at ?? null, foto: !!g.img, verificada: !!g.verified };
  });
}

async function cuerpoInstante(fecha: string, tareaId: string) {
  const [cfgRows, dayRows] = await Promise.all([
    db("casa_config?id=eq.1&select=*"),
    db(`casa_days?date=eq.${fecha}&select=*`),
  ]);
  const cfg = cfgRows[0];
  const dia = dayRows[0];
  if (!cfg || !dia) return null;

  const t = (dia.tasks ?? []).find((x: any) => x.id === tareaId);
  // Solo avisamos de algo realmente hecho, con foto y sin verificar todavía.
  if (!t || !t.done || !t.img || t.verified) return null;

  const pendientes = (dia.tasks ?? []).filter((x: any) => x.done && x.img && !x.verified).length;

  const cuerpo = [
    `${t.by ?? "Alguien"} acaba de subir la foto de "${t.label}".`,
    "",
    `Dia: ${DOW[diaSemana(fecha)]} ${fechaCorta(fecha)}`,
    `Hora: ${horaLocal(t.at)}`,
    `Turno del dia: ${dia.person}`,
    "",
    pendientes > 1
      ? `Tienes ${pendientes} fotos pendientes de revisar.`
      : "Es la unica foto pendiente de revisar.",
    "",
    `Entra en la app, comprueba la foto y pulsa "Verificar":`,
    APP_URL,
  ].join("\n");

  return {
    asunto: `Foto nueva de ${t.by ?? "la casa"}: ${t.label}`,
    cuerpo,
    destino: cfg.reviewer_email,
  };
}

async function cuerpoResumen() {
  const hoy = hoyLocal();
  const [cfgRows, dayRows, items, purchases, summaryRows] = await Promise.all([
    db("casa_config?id=eq.1&select=*"),
    db("casa_days?select=*&order=date.desc&limit=60"),
    db("casa_items?select=*&order=sort_order.asc"),
    db("casa_purchases?select=*&order=at.desc&limit=40"),
    db("casa_summary?select=*"),
  ]);
  const cfg = cfgRows[0];
  if (!cfg) throw new Error("no hay fila de configuracion");

  const gente: string[] = cfg.people ?? [];
  const diff = Math.round(
    (Date.parse(hoy + "T00:00:00Z") - Date.parse(cfg.start_date + "T00:00:00Z")) / 86400000,
  );
  const leTocaba = gente.length ? gente[((diff % gente.length) + gente.length) % gente.length] : "sin datos";

  const dia = dayRows.find((d: any) => d.date === hoy);
  const tareas = tareasDelDia(cfg, hoy, dia?.tasks ?? []);

  const pendientes: string[] = [];
  for (const d of dayRows) {
    for (const t of d.tasks ?? []) {
      if (t.done && t.img && !t.verified) {
        pendientes.push(`  - ${fechaCorta(d.date)} "${t.label}" (${t.by ?? "sin datos"})`);
      }
    }
  }

  const porComprar = (items ?? [])
    .filter((i: any) => i.status === "low" || i.status === "out")
    .map((i: any) =>
      `  - ${i.name} (${i.zone}): ${i.status === "out" ? "agotado" : "queda poco"}` +
      ` - quedan ${Number(i.quantity)}, avisa por debajo de ${Number(i.low_threshold)}`
    );

  const comprasHoy = (purchases ?? [])
    .filter((p: any) => (p.at ?? "").slice(0, 10) === hoy)
    .map((p: any) =>
      `  - ${eur(Number(p.amount))} - ${p.by_name} - ${p.note ?? "sin concepto"}` +
      `${p.ticket_url ? " (con ticket)" : " (SIN TICKET)"}`
    );

  const bote = summaryRows?.[0] ? Number(summaryRows[0].bote) : 0;

  const lineas = [
    `Hoy ${DOW[diaSemana(hoy)]} ${fechaCorta(hoy)} le tocaba a ${leTocaba}.`,
    "",
    "TAREAS DE HOY",
    ...tareas.map((t) =>
      t.hecha
        ? `  HECHA  ${t.label}${t.tipo === "semanal" ? " (tarea semanal)" : ""} - ${t.por ?? "sin datos"} a las ${horaLocal(t.at)}`
        : `  SIN HACER  ${t.label}${t.tipo === "semanal" ? " (tarea semanal)" : ""}`
    ),
    "",
    "FOTOS PENDIENTES DE TU REVISION",
    ...(pendientes.length ? pendientes : ["  Ninguna, estan todas revisadas."]),
  ];

  if (porComprar.length) lineas.push("", "PRODUCTOS POR COMPRAR", ...porComprar);
  if (comprasHoy.length) lineas.push("", "COMPRAS DE HOY", ...comprasHoy);

  lineas.push("", `Bote comun: ${eur(bote)}`, "", `Abrir la app: ${APP_URL}`);

  return {
    asunto: `Limpieza Casa Holanda - ${DOW[diaSemana(hoy)]} ${fechaCorta(hoy)}: ${leTocaba}`,
    cuerpo: lineas.join("\n"),
    destino: cfg.reviewer_email,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const responder = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  try {
    const payload = await req.json().catch(() => ({}));
    const modo = payload.modo ?? "resumen";

    const aviso = modo === "instante"
      ? await cuerpoInstante(String(payload.fecha ?? ""), String(payload.tarea ?? ""))
      : await cuerpoResumen();

    // En modo instante, si la tarea ya estaba verificada o no existe, no hay
    // nada que avisar: no es un error.
    if (!aviso) return responder({ ok: true, enviado: false, motivo: "nada que avisar" });
    if (!aviso.destino) return responder({ ok: false, enviado: false, motivo: "no hay reviewer_email en casa_config" });

    await enviarCorreo(aviso.destino, aviso.asunto, aviso.cuerpo);
    return responder({ ok: true, enviado: true, modo, destino: aviso.destino, asunto: aviso.asunto });
  } catch (e) {
    return responder({ ok: false, enviado: false, error: String((e as Error).message ?? e) }, 500);
  }
});
