/**
 * Correo nocturno — app "Casa Holanda".
 *
 * Cada noche a las 23:00 hora de Holanda sale un resumen de cómo va la
 * semana por zonas, para que se vea quién cumple y quién no.
 *
 * Lo dispara pg_cron desde dentro de Supabase, así que no depende de que
 * ningún ordenador esté encendido.
 *
 * Horario: pg_cron va en UTC y las 23:00 de Holanda son las 21:00 UTC en
 * verano y las 22:00 en invierno. El cron lanza a las dos horas y esta
 * función solo envía en la que de verdad son las 23 allí. Con
 * `{"forzar":true}` se salta esa comprobación, para probar a mano, y con
 * `{"seco":true}` devuelve el correo que saldría sin enviarlo.
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
const DOW_C = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
const MES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hoyLocal(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}
function horaAhoraLocal(): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false })
    .format(new Date()));
}
function horaLocal(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}
function mas(fecha: string, n: number): string {
  const d = new Date(fecha + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function diaSemana(fecha: string): number {
  return new Date(fecha + "T12:00:00Z").getUTCDay();
}
/** La semana va de lunes a domingo, igual que en la app: así el fin de semana
 *  entero cae dentro de la semana del mismo equipo. */
function semanaDe(fecha: string): string {
  return mas(fecha, -((diaSemana(fecha) + 6) % 7));
}
function corta(fecha: string): string {
  const d = new Date(fecha + "T12:00:00Z");
  return d.getUTCDate() + " " + MES[d.getUTCMonth()];
}
function eur(n: number): string {
  return Number(n).toFixed(2).replace(".", ",") + " EUR";
}

/**
 * Lectura con reintentos. Un "504 Gateway Timeout" pasajero llegó a comerse
 * dos noches enteras cuando sólo había un intento y el cron no vuelve a
 * pasar hasta el día siguiente. Un fallo de servidor se reintenta; uno de
 * petición (4xx) no, porque no va a arreglarse solo.
 */
async function db(path: string, intentos = 3): Promise<any> {
  let ultimoError = "";
  for (let i = 0; i < intentos; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1500 * i));
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      if (r.ok) return r.json();
      ultimoError = `DB ${r.status}: ${await r.text()}`;
      if (r.status < 500) break;
    } catch (e) {
      ultimoError = `DB sin respuesta: ${String((e as Error)?.message ?? e)}`;
    }
  }
  throw new Error(ultimoError || "DB: error desconocido");
}

async function registrar(fecha: string, ok: boolean, destino: string | null, detalle: string) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/casa_avisos`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json", Prefer: "return=minimal",
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
      "api-key": BREVO_API_KEY, "content-type": "application/json", accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: REMITENTE, name: "Casa Holanda" },
      to: destinos.map((email) => ({ email })),
      subject: asunto,
      textContent: cuerpo,
    }),
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${texto}`);
  return texto;
}

async function componerResumen(hoy: string) {
  const sem = semanaDe(hoy);
  const [cfgRows, zonas, tareas, hechas, semanas, items, summaryRows] = await Promise.all([
    db("casa_config?id=eq.1&select=*"),
    db("casa_zonas?select=*&order=orden.asc"),
    db("casa_tareas?select=*&order=orden.asc"),
    db(`casa_completadas?select=*&periodo=gte.${sem}`),
    db(`casa_semanas?select=*&semana=eq.${sem}`),
    db("casa_items?select=*&order=sort_order.asc"),
    db("casa_summary?select=*"),
  ]);
  const cfg = cfgRows[0];
  if (!cfg) throw new Error("no hay fila de configuracion en casa_config");

  const gente: string[] = cfg.people ?? [];
  const hechasMap = new Map<string, any>();
  for (const h of hechas ?? []) hechasMap.set(`${h.tarea_id}|${h.periodo}`, h);

  // Reparto de zonas de la semana: el guardado si existe, calculado si todavía
  // no. Las secciones con turno propio (el turno diario, los cubos) no ocupan
  // plaza y se calculan aparte, por día.
  const n = gente.length;
  let reparto: Record<string, string[]> = semanas?.[0]?.asignacion ?? {};
  if (!semanas?.length && n && cfg.rotacion_desde && sem >= cfg.rotacion_desde) {
    reparto = {};
    const plazas: string[] = [];
    for (const z of zonas) {
      if (z.rota_aparte) continue;
      reparto[z.id] = [];
      for (let i = 0; i < z.plazas; i++) plazas.push(z.id);
    }
    const w = Math.round(
      (Date.parse(sem + "T00:00:00Z") - Date.parse(cfg.rotacion_desde + "T00:00:00Z")) / 604800000,
    );
    // Mismo paso que la app: cada ronda de n semanas cambia el multiplicador
    // para que cambien las parejas sin romper el reparto.
    const mcd = (a: number, b: number): number => { while (b) { const t = a % b; a = b; b = t; } return a; };
    const posibles: number[] = [];
    for (let a = 1; a <= Math.floor(n / 2); a++) if (mcd(a, n) === 1) posibles.push(a);
    if (!posibles.length) posibles.push(1);
    const ronda = Math.floor(w / n);
    const paso = posibles[((ronda % posibles.length) + posibles.length) % posibles.length];
    plazas.forEach((zid, i) => {
      reparto[zid].push(gente[(((paso * i + w) % n) + n) % n]);
    });
  }

  // El turno de una sección propia depende del día, no de la semana.
  const turnoDe = (z: any, dia: string): string[] => {
    if (!n || !z.rota_desde || !z.rota_persona || dia < z.rota_desde) return [];
    const dias = Math.round(
      (Date.parse(dia + "T00:00:00Z") - Date.parse(z.rota_desde + "T00:00:00Z")) / 86400000,
    );
    const cada = Math.max(1, z.rota_cada ?? 7);
    const idx = Math.floor(dias / cada) + (cada < 7 ? Math.floor(dias / 7) : 0);
    let base = gente.indexOf(z.rota_persona);
    if (base < 0) base = 0;
    const out: string[] = [];
    for (let k = 0; k < Math.max(1, z.plazas); k++) {
      out.push(gente[(((base + idx + k) % n) + n) % n]);
    }
    return out;
  };
  const zonaDiaria = zonas.find((z: any) => z.rota_aparte && (z.rota_cada ?? 7) < 7) ?? null;

  // Una tarea se pide en sus dias propios, o en los dias de limpieza de la casa
  // si no los tiene. El turno diario usa los de la casa; la limpieza a fondo va
  // fijada a sabado y domingo, y los cubos a domingo y lunes.
  const diasLimpieza: number[] = (cfg.dias_limpieza?.length ? cfg.dias_limpieza : [0, 1, 2, 3, 4, 5, 6]);
  const toca = (t: any, dia: string): boolean =>
    (t.dias && t.dias.length) ? t.dias.includes(diaSemana(dia)) : diasLimpieza.includes(diaSemana(dia));
  // El periodo es la clave con la que se guarda que una tarea esta hecha: el
  // dia para las diarias, el lunes que abre la semana para las semanales. La
  // limpieza a fondo se pide sabado y domingo pero cuenta una sola vez.
  const periodo = (t: any, dia: string): string => (t.semanal ? semanaDe(dia) : dia);
  // Una zona sin nadie asignado ese dia no pide nada: no puede estar sin hacer
  // lo que no era de nadie. Pasa antes de que arranque una rotacion.
  const asignado = (z: any, dia: string): boolean =>
    (z.rota_aparte ? turnoDe(z, dia).length : (reparto[z.id] ?? []).length) > 0;
  const diasPasados: string[] = [];
  for (let d = sem; d <= hoy; d = mas(d, 1)) diasPasados.push(d);

  const lineas: string[] = [
    `Semana del ${corta(sem)} al ${corta(mas(sem, 6))}. Hoy es ${DOW[diaSemana(hoy)]}.`,
    `Turno diario ${diasLimpieza.length} dias por semana. ` +
      `Limpieza a fondo de las zonas, el fin de semana.`,
    "",
  ];

  let totalGlobal = 0, hechoGlobal = 0;
  const bloques: string[] = [];

  for (const z of zonas) {
    const ts = (tareas ?? []).filter((t: any) => t.zona_id === z.id);
    const equipo = z.rota_aparte
      ? (turnoDe(z, hoy).join(", ") || "sin asignar")
      : ((reparto[z.id] ?? []).join(", ") || "sin asignar");
    let total = 0, hecho = 0;
    const detalle: string[] = [];

    // El turno diario cambia de dueno cada dia, asi que se cuenta dia a dia
    // y con nombre: es lo unico que dice quien cumplio y quien no.
    if (zonaDiaria && z.id === zonaDiaria.id) {
      for (const dia of diasPasados) {
        if (!asignado(z, dia)) continue;
        const delDia = ts.filter((t: any) => toca(t, dia));
        if (!delDia.length) continue;
        const puestas = delDia.filter((t: any) => hechasMap.has(`${t.id}|${periodo(t, dia)}`)).length;
        total += delDia.length;
        hecho += puestas;
        const quien = turnoDe(z, dia)[0] ?? "sin asignar";
        detalle.push(
          `    ${puestas === delDia.length ? "[x]" : "[ ]"} ${DOW_C[diaSemana(dia)]} ${corta(dia)} - ` +
          `${quien} - ${puestas} de ${delDia.length}`,
        );
      }
      totalGlobal += total;
      hechoGlobal += hecho;
      const pctD = total ? Math.round((hecho / total) * 100) : 0;
      bloques.push(`  ${z.nombre.toUpperCase()} - ${total ? `${pctD}%` : "sin tareas esta semana"}`);
      bloques.push(...detalle);
      bloques.push("");
      continue;
    }

    for (const t of ts) {
      const tocaban = diasPasados.filter((d) => toca(t, d) && asignado(z, d));
      if (!tocaban.length) continue;          // esta semana no tocaba todavia
      // Una semanal pedida en varios dias es un solo periodo: un solo tic.
      const claves: string[] = [];
      for (const d of tocaban) {
        const k = periodo(t, d);
        if (!claves.includes(k)) claves.push(k);
      }
      const faltan = claves.filter((k) => !hechasMap.has(`${t.id}|${k}`));
      const puestas = claves.length - faltan.length;
      total += claves.length;
      hecho += puestas;
      const ult = hechasMap.get(`${t.id}|${claves[claves.length - 1]}`);
      if (t.semanal) {
        detalle.push(
          faltan.length
            ? `    [ ] ${t.label} - SIN HACER este fin de semana`
            : `    [x] ${t.label} - ${ult?.por ?? "?"} a las ${horaLocal(ult?.at ?? "")}`,
        );
      } else {
        detalle.push(
          `    ${faltan.length ? "[ ]" : "[x]"} ${t.label} - ${puestas} de ${claves.length}` +
          (faltan.length
            ? ` - falta ${faltan.map((d) => DOW_C[diaSemana(d)]).join(", ")}`
            : (ult ? ` - ultima: ${ult.por} a las ${horaLocal(ult.at)}` : "")),
        );
      }
    }

    totalGlobal += total;
    hechoGlobal += hecho;
    const pct = total ? Math.round((hecho / total) * 100) : 0;
    bloques.push(
      `  ${z.nombre.toUpperCase()} - ${equipo} - ` +
      (total ? `${pct}%` : "sin tareas esta semana"),
    );
    bloques.push(...detalle);
    bloques.push("");
  }

  const pctGlobal = totalGlobal ? Math.round((hechoGlobal / totalGlobal) * 100) : 0;

  // Dias de esta semana en que tocaba limpiar y no se hizo absolutamente nada.
  const vacios: string[] = [];
  for (const dia of diasPasados) {
    let tocaba = 0, puestas = 0;
    for (const z of zonas) {
      if (!asignado(z, dia)) continue;
      for (const t of (tareas ?? []).filter((x: any) => x.zona_id === z.id)) {
        if (!toca(t, dia)) continue;
        tocaba++;
        if (hechasMap.has(`${t.id}|${periodo(t, dia)}`)) puestas++;
      }
    }
    if (tocaba && !puestas) vacios.push(`${DOW[diaSemana(dia)]} ${corta(dia)}`);
  }

  lineas.push(`LA CASA VA AL ${pctGlobal}%`);
  if (vacios.length) {
    lineas.push(
      `DIAS SIN HACER NADA ESTA SEMANA (${vacios.length}): ${vacios.join(" | ")}`,
    );
  }
  lineas.push("", ...bloques);

  const porComprar = (items ?? [])
    .filter((i: any) => i.status === "low" || i.status === "out")
    .map((i: any) =>
      `  - ${i.name} (${i.zone}): ${i.status === "out" ? "AGOTADO" : "queda poco"}` +
      ` - quedan ${Number(i.quantity)}, avisa a partir de ${Number(i.low_threshold)}`
    );
  if (porComprar.length) lineas.push("PRODUCTOS POR COMPRAR", ...porComprar, "");

  const bote = summaryRows?.[0] ? Number(summaryRows[0].bote) : 0;
  lineas.push(`Bote comun: ${eur(bote)}`, "", `Abrir la app: ${APP_URL}`);

  const destinos: string[] = (cfg.aviso_emails ?? [])
    .filter((e: unknown) => typeof e === "string" && (e as string).includes("@"));

  return {
    asunto: `Casa Holanda - ${DOW[diaSemana(hoy)]} ${corta(hoy)}: la casa al ${pctGlobal}%`,
    cuerpo: lineas.join("\n"),
    destinos,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const responder = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status, headers: { ...CORS, "Content-Type": "application/json" },
    });

  const hoy = hoyLocal();

  try {
    const payload = await req.json().catch(() => ({} as any));
    const forzar = payload?.forzar === true;
    const seco = payload?.seco === true;

    // Prueba en seco: compone el resumen y lo devuelve sin enviar ni registrar
    // nada. Sirve para comprobar que el correo de esta noche va a salir bien
    // sin molestar a nadie con un correo de prueba.
    if (seco) {
      const previo = await componerResumen(hoy);
      return responder({ ok: true, enviado: false, seco: true, ...previo });
    }

    if (!forzar && horaAhoraLocal() !== HORA_ENVIO) {
      return responder({ ok: true, enviado: false, motivo: "no son las 23:00 en Holanda todavia" });
    }

    const aviso = await componerResumen(hoy);
    if (!aviso.destinos.length) {
      await registrar(hoy, false, null, "casa_config.aviso_emails esta vacio");
      return responder({ ok: false, enviado: false, motivo: "falta aviso_emails" }, 500);
    }

    await enviarCorreo(aviso.destinos, aviso.asunto, aviso.cuerpo);
    await registrar(hoy, true, aviso.destinos.join(", "), aviso.asunto);
    return responder({ ok: true, enviado: true, destinos: aviso.destinos, asunto: aviso.asunto });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    await registrar(hoy, false, null, msg);
    return responder({ ok: false, enviado: false, error: msg }, 500);
  }
});
