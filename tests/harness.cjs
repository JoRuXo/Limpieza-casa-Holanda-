/* Arnés de pruebas: carga index.html en jsdom con fetch simulado y reloj fijo,
   y expone las funciones internas SIN tocar index.html (parchea una copia en
   memoria). jsdom: JSDOM_PATH, tests/node_modules (npm install) o /tmp/pruebas/nav/node_modules/jsdom. */
const fs = require('fs'), path = require('path');
function cargaJsdom() {
  /* 1) JSDOM_PATH, 2) tests/node_modules (npm install en tests/), 3) copia antigua de /tmp. */
  var rutas = [process.env.JSDOM_PATH, 'jsdom', '/tmp/pruebas/nav/node_modules/jsdom'].filter(Boolean);
  for (var i = 0; i < rutas.length; i++) { try { return require(rutas[i]); } catch (e) {} }
  throw new Error('No se encuentra jsdom: ejecuta `npm install` dentro de tests/ o define JSDOM_PATH.');
}
const { JSDOM, VirtualConsole } = cargaJsdom();
const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const i = HTML.lastIndexOf('})();');
const EXPONE = `window.__T={
 get S(){return S}, set S(v){S=v}, get mesVisto(){return mesVisto}, set mesVisto(v){mesVisto=v},
 get semHist(){return semHist}, get histEstado(){return histEstado}, get histSemanas(){return histSemanas},
 get abierto(){return abierto}, get yo(){return yo},
 cumplimientoSemana, calendarioHTML, vHistorial, histVa, histPrimera, histCargada, cargaHistorial, cargar, pinta,
 loDeUnDia, recogidaDe, zonaDiaria, turnoReal, turnoDe, semanaDe, mas, hoy, histPct, vMes, histCargar
};`;
const PAGINA = HTML.slice(0, i) + EXPONE + HTML.slice(i);

const GENTE = ['Yassine', 'Jorge', 'Noel', 'Alberto', 'Sufian', 'Pablo'];
function dbBase(o = {}) {
  const z = (id, nombre, plazas, orden, x = {}) => Object.assign({ id, nombre, color: '#2a7', plazas, orden }, x);
  const t = (id, zona_id, label, x = {}) => Object.assign({ id, zona_id, label, orden: 1, semanal: false, dias: null }, x);
  return Object.assign({
    config: { id: 1, people: GENTE, admins: ['Jorge'], rotacion_desde: '2026-10-05', dias_limpieza: [6, 0],
              aviso_emails: [], cubos_fijos: [{ cubo: 'gris grande', dow: 4, desde: '2026-11-19' }] },
    zonas: [z('z1', 'Cocina', 2, 1), z('z2', 'Baño', 2, 2), z('z3', 'Salón', 1, 3), z('z4', 'Jardín', 1, 4),
            z('zd', 'Turno diario', 1, 5, { rota_aparte: true, rota_desde: '2026-10-05', rota_persona: 'Yassine', rota_cada: 1, rota_salto: 2 })],
    tareas: [t('t10', 'z1', 'Limpiar encimera', { semanal: true, dias: [0] }),
             t('t20', 'z2', 'Limpiar baño', { semanal: true, dias: [0] }),
             t('t30', 'z3', 'Aspirar salón', { semanal: true, dias: [0] }),
             t('t40', 'z4', 'Barrer jardín', { semanal: true, dias: [0] }),
             t('t50', 'zd', 'Barrer y fregar', { dias: [0, 1, 2, 3, 4, 5, 6] }),
             t('t51', 'zd', 'Sacar los cubos', { cubos: 'sacar' }),
             t('t52', 'zd', 'Entrar los cubos', { cubos: 'entrar' })],
    completadas: [], semanas: [], cambios: [],
    cubos: [{ dia: '2026-11-18', color: 'verdes', nota: null }, { dia: '2026-11-26', color: 'grises', nota: null }],
    fallaHist: false,
  }, o);
}
const enRango = (v, q) => { const m = {}; String(q).split('&').forEach(p => { const [k, x] = p.split('='); (m[k] = m[k] || []).push(x); }); return m; };
function filtra(rows, campo, qs) {
  return rows.filter(r => (qs[campo] || []).every(c => c.startsWith('gte.') ? r[campo] >= c.slice(4) : c.startsWith('lt.') ? r[campo] < c.slice(3) : true));
}
/* abre({now:[a,m,d,h], yo, db}) → {w,d,$,T,db,reqs,errs,cierra} */
async function abre(o = {}) {
  const db = o.db || dbBase();
  const now = o.now || [2026, 10, 19, 12];
  const errs = [], reqs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errs.push('jsdomError: ' + e.message));
  vc.on('error', e => errs.push('console.error: ' + e));
  const dom = new JSDOM(PAGINA, { url: 'https://x.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      const R = w.Date, NOW = new R(...now).getTime();
      w.Date = class extends R { constructor(...a) { if (a.length === 0) super(NOW); else super(...a); } static now() { return NOW; } };
      w.matchMedia = () => ({ matches: false }); w.scrollTo = () => {}; w.confirm = () => true;
      w.localStorage.setItem('casaHolanda_yo', o.yo || 'Jorge');
      w.fetch = async (u, op = {}) => {
        u = String(u); const p = u.split('/rest/v1/')[1] || u; reqs.push({ m: op.method || 'GET', p });
        const tabla = p.split('?')[0], qs = enRango(0, p.split('?')[1] || '');
        if (db.fallaHist && /(periodo|semana|dia)=lt\./.test(p)) throw new TypeError('Failed to fetch');
        let b = [];
        if ((op.method || 'GET') !== 'GET') b = [];
        else if (tabla === 'casa_config') b = [db.config];
        else if (tabla === 'casa_zonas') b = db.zonas;
        else if (tabla === 'casa_tareas') b = db.tareas;
        else if (tabla === 'casa_completadas') b = filtra(db.completadas, 'periodo', qs);
        else if (tabla === 'casa_semanas') b = filtra(db.semanas, 'semana', qs);
        else if (tabla === 'casa_cambios') b = filtra(db.cambios, 'dia', qs);
        else if (tabla === 'casa_cubos') b = db.cubos;
        return { ok: true, status: 200, json: async () => b, text: async () => JSON.stringify(b) };
      };
    } });
  const w = dom.window, d = w.document;
  await new Promise(r => setTimeout(r, o.espera || 350));
  if (o.vista !== false) { const b = d.querySelector('#navIn [data-v="' + (o.vista || 'historial') + '"]'); if (b) b.click(); }
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)], T: w.__T, db, reqs, errs,
           espera: ms => new Promise(r => setTimeout(r, ms)), cierra: () => w.close() };
}
/* HTML → documento para consultar */
const frag = (w, html) => { const c = w.document.createElement('div'); c.innerHTML = html; return c; };
module.exports = { abre, dbBase, frag, GENTE };
