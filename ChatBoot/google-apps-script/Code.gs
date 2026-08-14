/**
 * ASISTENTE ABORDO 3.0 — API para Google Sheets
 * Hoja: https://docs.google.com/spreadsheets/d/13cxOva1RWMvIjZM_VrCjeOQbhPYjoVOCWKAMWvVuY9Y/
 */
const SPREADSHEET_ID = '13cxOva1RWMvIjZM_VrCjeOQbhPYjoVOCWKAMWvVuY9Y';
const TZ = 'America/Mexico_City';
const SHEETS = {
  CONFIG: 'CONFIGURACION', MENUS: 'MENUS', RESPUESTAS: 'RESPUESTAS',
  AVISOS: 'AVISOS', CONTACTOS: 'CONTACTOS', SINONIMOS: 'SINONIMOS',
  ESTADISTICAS: 'ESTADISTICAS', VALORACIONES: 'VALORACIONES'
};

function doGet(e) {
  try {
    const accion = clean_(e && e.parameter && e.parameter.accion || 'datos').toLowerCase();
    let data;
    switch (accion) {
      case 'salud': data = { ok: true, servicio: 'Asistente Abordo API', fecha: now_() }; break;
      case 'configuracion': data = getConfig_(); break;
      case 'menus': data = getRows_(SHEETS.MENUS, true); break;
      case 'respuestas': data = getRows_(SHEETS.RESPUESTAS, true); break;
      case 'avisos': data = getActiveNotices_(); break;
      case 'contactos': data = getRows_(SHEETS.CONTACTOS, true); break;
      case 'sinonimos': data = getRows_(SHEETS.SINONIMOS, true); break;
      case 'buscar': data = search_(clean_(e.parameter.texto || '')); break;
      case 'datos':
      default: data = getAllData_();
    }
    return json_({ ok: true, data, fecha: now_() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err), fecha: now_() });
  }
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const accion = clean_(body.accion || '').toLowerCase();
    if (accion === 'estadistica') {
      appendStatistic_(body);
      return json_({ ok: true, mensaje: 'Estadística registrada' });
    }
    if (accion === 'valoracion') {
      appendRating_(body);
      return json_({ ok: true, mensaje: 'Valoración registrada' });
    }
    return json_({ ok: false, error: 'Acción POST no válida' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function getAllData_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('chatboot_datos_v3');
  if (cached) return JSON.parse(cached);
  const data = {
    configuracion: getConfig_(),
    menus: getRows_(SHEETS.MENUS, true),
    respuestas: getRows_(SHEETS.RESPUESTAS, true),
    avisos: getActiveNotices_(),
    contactos: getRows_(SHEETS.CONTACTOS, true),
    sinonimos: getRows_(SHEETS.SINONIMOS, true)
  };
  cache.put('chatboot_datos_v3', JSON.stringify(data), 300);
  return data;
}

function getConfig_() {
  const rows = getRows_(SHEETS.CONFIG, true);
  return rows.reduce((obj, row) => {
    if (row.CLAVE) obj[String(row.CLAVE).trim()] = row.VALOR;
    return obj;
  }, {});
}

function getActiveNotices_() {
  const today = new Date(); today.setHours(0,0,0,0);
  return getRows_(SHEETS.AVISOS, true).filter(r => {
    const start = toDate_(r.FECHA_INICIO), end = toDate_(r.FECHA_FIN);
    return (!start || start <= today) && (!end || end >= today);
  });
}

function search_(text) {
  const q = normalize_(text);
  if (!q) return [];
  const synonyms = getRows_(SHEETS.SINONIMOS, true);
  let terms = q.split(/\s+/).filter(Boolean);
  synonyms.forEach(s => {
    const base = normalize_(s.TERMINO);
    const list = normalize_(s.SINONIMOS).split(/[,;]+/).map(x => x.trim()).filter(Boolean);
    if (terms.some(t => t === base || list.some(v => v.includes(t) || t.includes(v)))) terms = terms.concat([base], list);
  });
  terms = [...new Set(terms.filter(t => t.length > 2))];
  return getRows_(SHEETS.RESPUESTAS, true).map(r => {
    const hay = normalize_([r.PREGUNTA, r.RESPUESTA, r.PALABRAS_CLAVE].join(' '));
    const score = terms.reduce((sum, t) => sum + (hay.includes(t) ? 1 : 0), 0);
    return Object.assign({}, r, { PUNTAJE: score });
  }).filter(r => r.PUNTAJE > 0).sort((a,b) => b.PUNTAJE - a.PUNTAJE).slice(0, 10);
}

function appendStatistic_(b) {
  if (String(getConfig_().REGISTRAR_ESTADISTICAS || 'SI').toUpperCase() !== 'SI') return;
  const sh = getSheet_(SHEETS.ESTADISTICAS);
  sh.appendRow([
    now_(), safe_(b.sesion,80), safe_(b.evento,80), safe_(b.idMenu,100),
    safe_(b.idRespuesta,100), safe_(b.busqueda,500), safe_(b.resultado,100),
    safe_(b.dispositivo,150), safe_(b.navegador,200)
  ]);
}

function appendRating_(b) {
  const sh = getSheet_(SHEETS.VALORACIONES);
  sh.appendRow([now_(), safe_(b.sesion,80), safe_(b.idRespuesta,100), safe_(b.valoracion,30), safe_(b.comentario,1000)]);
}

function getRows_(sheetName, onlyActive) {
  const sh = getSheet_(sheetName);
  const values = sh.getDataRange().getDisplayValues();
  if (values.length < 3) return [];
  const headers = values[1].map(h => clean_(h).toUpperCase());
  const out = [];
  for (let i = 2; i < values.length; i++) {
    if (values[i].every(v => clean_(v) === '')) continue;
    const obj = {};
    headers.forEach((h,j) => { if (h) obj[h] = values[i][j] == null ? '' : values[i][j]; });
    if (onlyActive && Object.prototype.hasOwnProperty.call(obj,'ACTIVO') && String(obj.ACTIVO).toUpperCase() !== 'SI') continue;
    out.push(obj);
  }
  return out;
}

function getSheet_(name) {
  const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sh) throw new Error('No existe la hoja: ' + name);
  return sh;
}
function parseBody_(e) {
  const raw = e && e.postData && e.postData.contents || '{}';
  try { return JSON.parse(raw); } catch (_) {
    return (e && e.parameter) || {};
  }
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function now_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function clean_(v) { return String(v == null ? '' : v).trim(); }
function safe_(v,max) { return clean_(v).replace(/[\u0000-\u001F]/g,' ').slice(0,max); }
function normalize_(v) { return clean_(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ñáéíóúü ]/g,' '); }
function toDate_(v) { if (!v) return null; const d = new Date(v); return isNaN(d.getTime()) ? null : new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function limpiarCache() { CacheService.getScriptCache().remove('chatboot_datos_v3'); }
