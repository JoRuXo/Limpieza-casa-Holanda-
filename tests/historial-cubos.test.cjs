const test = require('node:test'), assert = require('node:assert/strict');
const { abre, dbBase, frag, GENTE } = require('./harness.cjs');
const sinErrores = (a, m) => assert.deepEqual(a.errs, [], m || 'errores de JS/consola');

/* ---------- (a) calendario de cubos ---------- */
function celdas(a, mes, quien) {
  a.T.mesVisto = mes;
  const c = frag(a.w, a.T.calendarioHTML(quien || 'Jorge')), out = {};
  [...c.querySelectorAll('.cal-c:not(.vacia)')].forEach(e => {
    out[Number(e.querySelector('.cal-d').textContent)] = {
      chips: [...e.querySelectorAll('.cal-b')].map(x => x.textContent),
      marcas: [...e.querySelectorAll('.cal-m')].map(x => x.textContent),
      title: e.getAttribute('title') };
  });
  return { out, c };
}
test('cubos: jueves 12/18/19/26 nov y 3 dic', async () => {
  const a = await abre(); const nov = celdas(a, '2026-11').out, dic = celdas(a, '2026-12').out;
  assert.deepEqual(nov[12].chips, [], 'jueves 12: aún no hay gris grande (desde 19) y el calendario no tiene recogida');
  assert.deepEqual(nov[18].chips, ['VE'], 'miércoles 18: recogida del calendario (verdes)');
  assert.deepEqual(nov[19].chips, ['GG'], 'jueves 19: gris grande');
  assert.match(nov[19].title, /gris grande/);
  assert.deepEqual(nov[26].chips, ['GR', 'GG'], 'jueves 26: grises del calendario + gris grande');
  assert.match(nov[26].title, /grises \+ gris grande/);
  assert.deepEqual(dic[3].chips, ['GG'], 'jueves 3 dic (cambio de mes)');
  assert.deepEqual(dic[10].chips, ['GG']); assert.deepEqual(dic[31].chips, ['GG'], '31 dic jueves');
  sinErrores(a); a.cierra();
});
test('cubos: viernes 20 es «entrar» (CE) sin chip; quien no tiene turno no lo ve', async () => {
  const a = await abre(); const zd = a.T.zonaDiaria();
  const quien = a.T.turnoReal(zd, '2026-11-20')[0], otro = GENTE.find(n => n !== quien);
  const v = celdas(a, '2026-11', quien).out[20], o = celdas(a, '2026-11', otro).out[20];
  assert.deepEqual(v.chips, [], 'viernes sin chip de recogida');
  assert.ok(v.marcas.includes('CE'), 'el del turno diario tiene CE el viernes 20: ' + v.marcas);
  assert.ok(!o.marcas.includes('CE'), 'otro no');
  const cs19 = celdas(a, '2026-11', a.T.turnoReal(zd, '2026-11-19')[0]).out[19];
  assert.ok(cs19.marcas.includes('CS'), 'jueves 19: CS para quien tiene turno: ' + cs19.marcas);
  a.cierra();
});
test('cubos: leyenda nombra el fijo con su fecha; sin fijos no hay chip', async () => {
  const a = await abre(); const { c } = celdas(a, '2026-11');
  assert.match(c.querySelector('.cal-leyenda').textContent, /Cubo gris grande.*cada jueves.*19 nov/);
  a.cierra();
  const db = dbBase(); db.config.cubos_fijos = []; const b = await abre({ db });
  assert.deepEqual(celdas(b, '2026-11').out[19].chips, []); b.cierra();
});
test('cubos: nombres raros no inyectan HTML ni rompen chips', async () => {
  const db = dbBase(); db.cubos.push({ dia: '2026-11-24', color: '<img src=x onerror=alert(1)>', nota: null });
  db.config.cubos_fijos.push({ cubo: '"><b>x</b>', dow: 2, desde: null });
  const a = await abre({ db }); const { c } = celdas(a, '2026-11');
  assert.equal(c.querySelectorAll('img, b').length, 0 + c.querySelectorAll('.cal-leyenda b').length, 'sin <img>; los <b> son solo los de la leyenda');
  assert.equal(c.querySelectorAll('img').length, 0); sinErrores(a); a.cierra();
});

/* ---------- (b) historial ---------- */
const SEM = '2026-11-16'; // semana de «hoy» = jueves 19 nov 2026
test('historial: semana actual → pendiente vs fallo; hoy no es fallo', async () => {
  const a = await abre(); const c = a.T.cumplimientoSemana(SEM);
  const e = (id, dia) => c.tareas.find(x => x.t.id === id && x.dia === dia);
  assert.equal(e('t50', '2026-11-18').estado, 'falla', 'miércoles pasado sin hacer = fallo');
  assert.equal(e('t50', '2026-11-19').estado, 'pend', 'hoy aún pendiente');
  assert.equal(e('t50', '2026-11-20').estado, 'pend', 'futuro pendiente');
  assert.equal(e('t51', '2026-11-19').estado, 'pend', 'sacar cubo gris grande hoy');
  assert.equal(e('t52', '2026-11-20').estado, 'pend', 'entrar cubos el viernes');
  assert.match(e('t51', '2026-11-19').texto, /cubo gris grande/);
  const sem = c.tareas.filter(x => x.t.semanal); assert.ok(sem.every(x => x.estado === 'pend'), 'semanales pendientes hasta pasar el domingo');
  assert.equal(c.h + c.f + c.p, c.tareas.length);
  sinErrores(a); a.cierra();
});
test('historial: semana cerrada con y sin turno guardado', async () => {
  const db = dbBase(); const a0 = await abre({ db }); const zd = a0.T.zonaDiaria();
  const turnos = { zd: {} }; for (let i = 0; i < 5; i++) { const d = a0.T.mas('2026-11-09', i); turnos.zd[d] = a0.T.turnoDe(zd, d); }
  a0.cierra();
  db.semanas.push({ semana: '2026-11-09', asignacion: { z1: ['Yassine', 'Jorge'], z2: ['Noel', 'Alberto'], z3: ['Sufian'], z4: ['Pablo'] }, turnos });
  const a = await abre({ db });
  const g = a.T.cumplimientoSemana('2026-11-09'), s = a.T.cumplimientoSemana('2026-11-02');
  assert.equal(g.recalcReparto, false); assert.equal(g.diasRecalculados, 2, 'lunes–viernes guardados, sáb y dom recalculados');
  assert.equal(s.recalcReparto, true); assert.equal(s.diasRecalculados, 7);
  assert.ok(g.tareas.every(x => x.estado !== 'pend'), 'semana cerrada: nada pendiente');
  a.T.histVa('2026-11-02'); await a.espera(50);
  assert.match(a.$('#app').textContent, /Reparto recalculado/);
  a.T.histVa('2026-11-09'); await a.espera(50);
  assert.match(a.$('#app').textContent, /Turno diario recalculado en 2 días/); assert.doesNotMatch(a.$('#app').textContent, /Reparto recalculado/);
  sinErrores(a); a.cierra();
});
test('historial: tarea cubierta por otra persona y equipo', async () => {
  const db = dbBase(); db.completadas.push({ tarea_id: 't10', periodo: '2026-11-09', por: 'Pablo', at: '2026-11-15T10:00:00Z', foto_url: null });
  db.semanas.push({ semana: '2026-11-09', asignacion: { z1: ['Yassine', 'Jorge'], z2: ['Noel', 'Alberto'], z3: ['Sufian'], z4: ['Pablo'] }, turnos: {} });
  const a = await abre({ db }); const c = a.T.cumplimientoSemana('2026-11-09');
  const e = c.tareas.find(x => x.t.id === 't10');
  assert.equal(e.estado, 'hecha'); assert.equal(e.otro, true); assert.equal(e.equipo, true);
  assert.equal(c.personas.Yassine.h, 1); assert.equal(c.personas.Jorge.h, 1, 'cuenta para los dos del equipo');
  assert.equal(c.personas.Pablo.tareas.some(x => x.t.id === 't10'), false, 'quien la cubrió no la recibe como suya');
  const total = c.h + c.f + c.p; assert.equal(c.tareas.filter(x => x.t.id === 't10').length, 1, 'cuenta una sola vez en el total'); assert.ok(total > 0);
  a.T.histVa('2026-11-09'); await a.espera(30);
  a.$$('[data-a="hist-abre"]').find(b => /Yassine/.test(b.textContent)).click(); await a.espera(30);
  assert.match(a.$('#app').textContent, /Hecha por Pablo \(le tocaba a Yassine y Jorge\)/);
  assert.match(a.$('#app').textContent, /Equipo: Yassine, Jorge/);
  sinErrores(a); a.cierra();
});
test('historial: persona sin tareas y persona que ya no vive aquí', async () => {
  const db = dbBase(); db.config.people = GENTE.concat('Extra'); db.tareas = db.tareas.filter(t => t.semanal);
  db.semanas.push({ semana: '2026-11-09', asignacion: { z1: ['Yassine', 'Fantasma'], z2: ['Noel', 'Alberto'], z3: ['Sufian'], z4: ['Pablo'] }, turnos: {} });
  const a = await abre({ db }); a.T.histVa('2026-11-09'); await a.espera(30);
  const t = a.$('#app').textContent;
  assert.match(t, /Extra.*Sin tareas/s); assert.match(t, /Fantasma/, 'quien salió sigue apareciendo en la semana donde tuvo tareas');
  assert.doesNotMatch(t, /NaN|undefined|null/);
  sinErrores(a); a.cierra();
});
test('historial: semana sin tareas y antes de la rotación', async () => {
  const dbf = dbBase(); dbf.config.rotacion_desde = '2026-12-07';
  const a = await abre({ db: dbf });
  assert.match(a.$('#app').textContent, /rotaci.n a.n no hab.a empezado/, 'rotación que arranca en el futuro');
  const dbm = dbBase(); dbm.config.rotacion_desde = '2026-10-07'; const m = await abre({ db: dbm });
  m.T.histVa('2026-09-28'); await m.espera(30); assert.equal(m.T.semHist, '2026-10-05', 'el retroceso se para en la semana donde arranca la rotación'); m.cierra();
  const db = dbBase(); db.tareas = []; const b = await abre({ db }); b.T.histVa('2026-11-09'); await b.espera(30);
  assert.match(b.$('#app').textContent, /no tocaba nada/); sinErrores(b); a.cierra(); b.cierra();
});
test('historial: límite de retroceso 26 semanas y carga bajo demanda', async () => {
  const db = dbBase(); db.config.rotacion_desde = '2025-01-06';
  for (let i = 0; i < 30; i++) { const d = new Date(2026, 10, 16 - 7 * i); const s = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    db.completadas.push({ tarea_id: 't10', periodo: s, por: 'Yassine', at: s + 'T10:00:00Z' }); }
  const a = await abre({ db }); const min = a.T.histPrimera();
  assert.equal(min, '2026-05-25', '26 semanas incluida la actual');
  assert.equal(a.T.histSemanas, 8);
  const n0 = a.reqs.length; a.T.histVa('2026-09-14'); await a.espera(200); // 9 semanas atrás: fuera de las 8 cargadas
  const nuevas = a.reqs.slice(n0).map(r => r.p);
  assert.ok(nuevas.some(p => /casa_completadas.*periodo=gte\.2026-05-25&periodo=lt\.2026-09-28/.test(p)), 'una consulta con el hueco: ' + nuevas.join(' | '));
  assert.equal(a.T.histSemanas, 26); assert.equal(a.T.histEstado, '');
  assert.ok(a.T.histCargada('2026-05-25'));
  a.T.histVa('2024-01-01'); assert.equal(a.T.semHist, min, 'no retrocede más de la semana 26');
  await a.espera(50); assert.ok(a.$('[data-a="hist-ant"]').disabled, 'botón anterior desactivado en el límite');
  a.T.histVa('2030-01-01'); assert.equal(a.T.semHist, null, 'no avanza más allá de la actual');
  const n1 = a.reqs.length; a.T.histVa('2026-06-01'); await a.espera(50); assert.equal(a.reqs.length, n1, 'ya cargado: sin más consultas');
  sinErrores(a); a.cierra();
});
test('historial: fallo de red al cargar semanas → aviso, reintento y recuperación', async () => {
  const db = dbBase(); db.config.rotacion_desde = '2025-01-06'; db.fallaHist = true;
  const a = await abre({ db }); a.T.histVa('2026-08-03'); await a.espera(200);
  assert.equal(a.T.histEstado, 'error'); assert.match(a.$('#app').textContent, /No se han podido cargar/); assert.ok(a.$('[data-a="hist-reintenta"]'));
  assert.equal(a.T.histSemanas, 8, 'no se marca como cargado');
  db.fallaHist = false; a.$('[data-a="hist-reintenta"]').click(); await a.espera(250);
  assert.equal(a.T.histEstado, ''); assert.equal(a.T.histSemanas, 26); assert.doesNotMatch(a.$('#app').textContent, /No se han podido/);
  sinErrores(a); a.cierra();
});
test('historial: tras un fallo, volver a una semana YA cargada no debería seguir mostrando el error', async () => {
  const db = dbBase(); db.config.rotacion_desde = '2025-01-06'; db.fallaHist = true;
  const a = await abre({ db }); a.T.histVa('2026-08-03'); await a.espera(200); assert.equal(a.T.histEstado, 'error');
  a.T.histVa('2026-11-09'); await a.espera(30);   // semana anterior, ya cargada
  assert.doesNotMatch(a.$('#app').textContent, /No se han podido cargar/, 'FALLO REPRODUCIBLE: sigue el aviso de error en una semana que sí está cargada');
  a.cierra();
});
test('historial: nombres con <, &, comillas no rompen HTML ni abrir/cerrar filas', async () => {
  const raros = ['<img src=x onerror=alert(1)>', "O'Brien", 'A&B', 'Ana "la" X', 'Zoë', 'Pablo'];
  const db = dbBase(); db.config.people = raros; db.config.admins = ['Pablo']; db.config.cubos_fijos = [];
  db.zonas[0].nombre = '<b>Cocina</b>'; db.tareas[0].label = 'Limpiar <i>encimera</i> & más';
  const a = await abre({ db, yo: 'Pablo' }); a.T.histVa('2026-11-09'); await a.espera(30);
  assert.equal(a.$$('#app img, #app b > b, #app i').length, 0, 'ninguna etiqueta inyectada');
  const filas = a.$$('[data-a="hist-abre"][aria-controls]'); assert.ok(filas.length >= 6);
  for (let i = 0; i < filas.length; i++) { a.$$('[data-a="hist-abre"][aria-controls]')[i].click(); await a.espera(5); }
  assert.ok(a.$$('.hp-det').length >= 6, 'todas las filas se abren (clave con comillas OK)');
  const t = a.$('#app').textContent;
  for (const n of raros) assert.ok(t.includes(n), 'sale el nombre literal: ' + n);
  assert.ok(t.includes('Limpiar <i>encimera</i> & más'));
  sinErrores(a); a.cierra();
});
for (const [nombre, now, semana, antes] of [
  ['fin de año', [2027, 0, 2, 12], '2026-12-28', '2026-12-21'],
  ['cambio de hora de marzo', [2027, 3, 5, 12], '2027-04-05', '2027-03-29'],
  ['cambio de hora de octubre', [2026, 9, 28, 12], '2026-10-26', '2026-10-19'] ]) {
  test('semanas: ' + nombre + ' (TZ=' + (process.env.TZ || 'sistema') + ')', async () => {
    const db = dbBase(); db.config.rotacion_desde = '2026-01-05';
    const a = await abre({ db, now });
    assert.equal(a.T.semanaDe(a.T.hoy()), semana);
    let w = semana; for (let i = 0; i < 26; i++) { assert.equal(new a.w.Date(w + 'T00:00:00').getDay(), 1, w + ' no es lunes'); const p = a.T.mas(w, -7); assert.equal(Math.round((new a.w.Date(w + 'T00:00:00') - new a.w.Date(p + 'T00:00:00')) / 86400000), 7); w = p; }
    assert.equal(a.T.mas(semana, -7), antes);
    a.T.histVa(antes); await a.espera(150); assert.match(a.$('#app').textContent, /Cerrada/);
    const c = a.T.cumplimientoSemana(antes); assert.equal(new Set(c.tareas.filter(x => x.t.id === 't50').map(x => x.dia)).size, 7, '7 días distintos sin duplicar ni saltar por el cambio de hora');
    sinErrores(a); a.cierra();
  });
}
test('historial: los desplegables funcionan y sin errores en todas las semanas cargadas', async () => {
  const a = await abre(); a.$$('[data-a="hist-abre"]').forEach(b => b.click());
  for (let w = a.T.histPrimera(); w <= SEM; w = a.T.mas(w, 7)) { a.T.histVa(w); await a.espera(10); a.$$('[data-a="hist-abre"]').forEach(b => b.click()); assert.doesNotMatch(a.$('#app').textContent, /NaN|undefined|\[object/, w); }
  sinErrores(a); a.cierra();
});

test('regresión: error de red en semana vieja → «Volver a esta semana» sin aviso → «Reintentar» con red funciona', async () => {
  const db = dbBase(); db.config.rotacion_desde = '2025-01-06'; db.fallaHist = true;
  const a = await abre({ db }); const texto = () => a.$('#app').textContent;
  a.T.histVa('2026-08-03'); await a.espera(200);                     // fuera de las 8 semanas cargadas
  assert.equal(a.T.histEstado, 'error'); assert.match(texto(), /No se han podido cargar/);
  a.$('[data-a="hist-hoy"]').click(); await a.espera(50);            // botón real de la UI
  assert.doesNotMatch(texto(), /No se han podido cargar|Cargando semanas/, 'semana actual: sin aviso');
  assert.match(texto(), /Esta semana/); assert.ok(a.$('.hp-lista'), 'se ve el historial normal');
  a.$('#navIn [data-v="hoy"]').click(); a.$('#navIn [data-v="historial"]').click(); await a.espera(30);
  assert.doesNotMatch(texto(), /No se han podido cargar/, 'salir y volver a la pestaña tampoco lo trae de vuelta');
  a.$('[data-a="hist-ant"]').click(); await a.espera(30);            // una semana ya cargada
  assert.doesNotMatch(texto(), /No se han podido cargar/, 'semana anterior ya cargada: sin aviso');
  a.T.histVa('2026-08-03'); await a.espera(200);                     // vuelve a faltar y sigue sin red
  assert.match(texto(), /No se han podido cargar/, 'la semana que falta sí sigue avisando');
  db.fallaHist = false; a.$('[data-a="hist-reintenta"]').click(); await a.espera(300);
  assert.equal(a.T.histEstado, ''); assert.equal(a.T.histSemanas, 26);
  assert.doesNotMatch(texto(), /No se han podido cargar|Cargando semanas/); assert.ok(a.$('.hp-lista'));
  sinErrores(a); a.cierra();
});
