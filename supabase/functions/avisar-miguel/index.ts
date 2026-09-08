/**
 * Correo nocturno a Miguel — app "Turno de Hoy" (Limpieza Casa Holanda).
 *
 * Le llega a las 23:00 hora de Holanda un resumen del día para que compruebe
 * si se han hecho las tareas o no.
 *
 * Lo dispara pg_cron desde dentro de Supabase, así que no depende de que
 * ningún ordenador esté encendido.
 *
 * Sobre el horario: pg_cron va en UTC, y las 23:00 de Holanda son las 21:00
 * UTC en verano y las 22:00 en invierno. Por eso el cron lanza a las dos
 * horas y esta función solo envía si en Holanda son realmente las 23.
 * Con `{"forzar":true}` se salta esa comprobación (para probar a mano).
 *
 * El contenido se compone leyendo la base de datos, nunca a partir de lo que
 * llega en la petición: así nadie puede provocar un correo con datos
 * inventados llamando al endpoint por su cuenta.
 *
 * Secretos (Supabase → Edge Functions → Secrets, nunca en el código):
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
const HORA_ENVIO = 23;

const DOW = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Fecha de hoy en Holanda, como YYYY-MM-DD (sv-SE da ese formato). */
function hoyLocal(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** Hora actual en Holanda, 0-23. */
function horaAhoraLocal(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false })
      .format(new Date()),
  );
}

function horaLocal(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}

function fechaCorta(fecha: string): string {
  const [, m, d] = fecha.split("-");
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

/** Deja constancia del intento, salga bien o mal. */
async function registrar(fecha: string, ok: boolean, destino: string | null, detalle: string) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/casa_avisos`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([{ fecha, ok, destino, detalle: detalle.slice(0, 500) }]),
    });
  } catch {
    // Si ni siquiera se puede registrar, no rompemos el envío por eso.
  }
}

async function enviarCorreo(destinos: string[], asunto: string, cuerpo: string) {
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
      to: destinos.map((email) => ({ email })),
      subject: asunto,
      textContent: cuerpo,
    }),
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${texto}`);
  return texto;
}

/** Tareas que tocaban ese día: las diarias mas la semanal que corresponda. */
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
    return {
      ...p,
      hecha: !!g.done,
      por: g.by ?? null,
      at: g.at ?? null,
      foto: !!g.img,
      verificada: !!g.verified,
    };
  });
}

async function componerResumen(hoy: string) {
  const [cfgRows, dayRows, items, purchases, summaryRows] = await Promise.all([
    db("casa_config?id=eq.1&select=*"),
    db("casa_days?select=*&order=date.desc&limit=60"),
    db("casa_items?select=*&order=sort_order.asc"),
    db("casa_purchases?select=*&order=at.desc&limit=40"),
    db("casa_summary?select=*"),
  ]);
  const cfg = cfgRows[0];
  if (!cfg) throw new Error("no hay fila de configuracion en casa_config");

  const gente: string[] = cfg.people ?? [];
  const diff = Math.round(
    (Date.parse(hoy + "T00:00:00Z") - Date.parse(cfg.start_date + "T00:00:00Z")) / 86400000,
  );
  const leTocaba = gente.length
    ? gente[((diff % gente.length) + gente.length) % gente.length]
    : "sin datos";

  const dia = dayRows.find((d: any) => d.date === hoy);
  const tareas = tareasDelDia(cfg, hoy, dia?.tasks ?? []);
  const hechas = tareas.filter((t) => t.hecha).length;

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
      `  - ${i.name} (${i.zone}): ${i.status === "out" ? "AGOTADO" : "queda poco"}` +
      ` - quedan ${Number(i.quantity)}, avisa a partir de ${Number(i.low_threshold)}`
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
    `Ha hecho ${hechas} de ${tareas.length} tareas.`,
    "",
    "TAREAS DE HOY",
    ...tareas.map((t) => {
      const nombre = `${t.label}${t.tipo === "semanal" ? " (tarea semanal)" : ""}`;
      if (!t.hecha) return `  [ ] SIN HACER - ${nombre}`;
      const foto = t.foto ? (t.verificada ? ", foto ya verificada" : ", con foto por revisar") : ", sin foto";
      return `  [x] HECHA - ${nombre} - ${t.por ?? "sin datos"} a las ${horaLocal(t.at)}${foto}`;
    }),
    "",
    "FOTOS PENDIENTES DE TU REVISION",
    ...(pendientes.length ? pendientes : ["  Ninguna, estan todas revisadas."]),
  ];

  if (porComprar.length) lineas.push("", "PRODUCTOS POR COMPRAR", ...porComprar);
  if (comprasHoy.length) lineas.push("", "COMPRAS DE HOY", ...comprasHoy);

  lineas.push("", `Bote comun: ${eur(bote)}`, "", `Abrir la app: ${APP_URL}`);

  // Destinatarios: la lista de casa_config. Se admite más de uno.
  const destinos: string[] = (cfg.aviso_emails ?? [])
    .filter((e: unknown) => typeof e === "string" && (e as string).includes("@"));

  return {
    asunto: `Limpieza Casa Holanda - ${DOW[diaSemana(hoy)]} ${fechaCorta(hoy)}: ${leTocaba} (${hechas}/${tareas.length})`,
    cuerpo: lineas.join("\n"),
    destinos,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const responder = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  const hoy = hoyLocal();

  try {
    const payload = await req.json().catch(() => ({} as any));
    const forzar = payload?.forzar === true;

    // El cron dispara a las 21:00 y 22:00 UTC; solo una de las dos coincide
    // con las 23:00 de Holanda segun sea verano o invierno.
    if (!forzar && horaAhoraLocal() !== HORA_ENVIO) {
      return responder({ ok: true, enviado: false, motivo: "no son las 23:00 en Holanda todavia" });
    }

    const aviso = await componerResumen(hoy);
    if (!aviso.destinos.length) {
      await registrar(hoy, false, null, "casa_config.aviso_emails esta vacio");
      return responder({ ok: false, enviado: false, motivo: "falta aviso_emails en casa_config" }, 500);
    }

    const destinatarios = aviso.destinos.join(", ");
    await enviarCorreo(aviso.destinos, aviso.asunto, aviso.cuerpo);
    await registrar(hoy, true, destinatarios, aviso.asunto);
    return responder({ ok: true, enviado: true, destinos: aviso.destinos, asunto: aviso.asunto });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    await registrar(hoy, false, null, msg);
    return responder({ ok: false, enviado: false, error: msg }, 500);
  }
});
