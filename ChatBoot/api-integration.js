(() => {
  'use strict';
  const API = window.CHATBOOT_API_URL || '';
  const SESSION_KEY = 'chatboot_session_v4';
  const sessionId = localStorage.getItem(SESSION_KEY) || (crypto.randomUUID ? crypto.randomUUID() : 's-' + Date.now() + '-' + Math.random().toString(36).slice(2));
  localStorage.setItem(SESSION_KEY, sessionId);
  let sheetData = null;

  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  const safeId = value => 'sheet_' + String(value || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const yes = value => String(value || '').trim().toUpperCase() === 'SI';
  const localFallback = menu => {
    const text = normalize(`${menu.TITULO || ''} ${menu.PALABRAS_CLAVE || ''}`);
    if(text.includes('incentiv')) return 'incentivos_marca';
    if(text.includes('liquid') || text.includes('viaje') || text.includes('cova')) return 'proceso_cova';
    if(text.includes('sueldo') || text.includes('descuento')) return 'sueldo_menu';
    if(text.includes('fonacot')) return 'fonacot';
    if(text.includes('infonavit') || text.includes('credito')) return 'creditos_externos';
    if(text.includes('asesor') || text.includes('contacto')) return 'hablar_asesor';
    return '';
  };

  function setConnectionStatus(ok, text) {
    const el = document.getElementById('connection-status');
    if (!el) return;
    el.classList.toggle('offline', !ok);
    const label = el.querySelector('span:last-child');
    if (label) label.textContent = text || (ok ? 'Información actualizada' : 'Modo local');
  }

  function post(payload) {
    if (!API) return;
    fetch(API, { method: 'POST', mode: 'no-cors', headers: {'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload) }).catch(() => {});
  }
  function stat(evento, extra = {}) {
    post({ accion:'estadistica', sesion:sessionId, evento, dispositivo:navigator.platform || '', navegador:navigator.userAgent || '', ...extra });
  }
  function rating(idRespuesta, valoracion) {
    post({ accion:'valoracion', sesion:sessionId, idRespuesta, valoracion, comentario:'' });
  }

  function resourceAttachment(row) {
    const type = String(row.TIPO_RECURSO || 'NINGUNO').toUpperCase();
    const url = String(row.URL_RECURSO || '').trim();
    const title = row.TEXTO_BOTON || 'Abrir recurso';
    if (type === 'VIDEO' && url) {
      const src = url.includes('player.vimeo.com') ? url : url.replace('vimeo.com/', 'player.vimeo.com/video/');
      return {type:'video', url:`<iframe src="${src}" width="340" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`};
    }
    if (type === 'PDF' && url) return {type:'link', title, url};
    if (type === 'IMAGEN' && url) return {type:'image', url, link:url};
    if (type === 'ENLACE' && url) return {type:'link', title, url};
    if (type === 'WHATSAPP') {
      const phone = (sheetData?.configuracion?.WHATSAPP_PRINCIPAL || '529372547287').replace(/\D/g,'');
      const text = encodeURIComponent(`Hola, necesito apoyo de Recaudación. Mi consulta es: ${row.PREGUNTA || ''}`);
      return {type:'link', title: title || 'Abrir WhatsApp', url:`https://wa.me/${phone}?text=${text}`};
    }
    return null;
  }

  function mergeSheetContent(data) {
    sheetData = data;
    if (!window.nodes || !data) return;
    const menus = Array.isArray(data.menus) ? data.menus.filter(r => !r.ACTIVO || yes(r.ACTIVO)) : [];
    const answers = Array.isArray(data.respuestas) ? data.respuestas.filter(r => !r.ACTIVO || yes(r.ACTIVO)) : [];
    const menuMap = new Map(menus.map(m => [String(m.ID_MENU), m]));

    menus.forEach(menu => {
      const id = safeId(menu.ID_MENU);
      const children = menus.filter(x => String(x.ID_PADRE || '') === String(menu.ID_MENU));
      const ownAnswers = answers.filter(x => String(x.ID_MENU || '') === String(menu.ID_MENU));
      const options = [
        ...children.sort((a,b)=>(+a.ORDEN||0)-(+b.ORDEN||0)).map(x => ({id:x.ID_MENU, label:`${x.ICONO || ''} ${x.TITULO}`.trim(), next:safeId(x.ID_MENU)})),
        ...ownAnswers.sort((a,b)=>(+a.ORDEN||0)-(+b.ORDEN||0)).map(x => ({id:x.ID_RESPUESTA, label:x.PREGUNTA, next:safeId(x.ID_RESPUESTA)}))
      ];
      const fallback = localFallback(menu);
      if (!options.length && fallback && window.nodes[fallback]) options.push({id:'LOCAL_FALLBACK', label:'Abrir información disponible', next:fallback});
      if (!options.length) return;
      options.push({id:'REGRESAR', label:'REGRESAR', next:'__REGRESAR__'});
      window.nodes[id] = {type:'question', id, prompt:`${menu.ICONO || ''} ${menu.TITULO}`.trim(), options};
    });

    answers.forEach(row => {
      const id = safeId(row.ID_RESPUESTA);
      const attachment = resourceAttachment(row);
      window.nodes[id] = {type:'message', id, text:row.RESPUESTA || row.PREGUNTA || '', attachments:attachment ? [attachment] : [], sheetResponseId:row.ID_RESPUESTA};
    });

    const roots = menus.filter(m => !String(m.ID_PADRE || '').trim() && window.nodes[safeId(m.ID_MENU)]).sort((a,b)=>(+a.ORDEN||0)-(+b.ORDEN||0));
    if (roots.length || answers.length) {
      window.nodes.sheet_root = {
        type:'question', id:'sheet_root', prompt:'CONTENIDO ACTUALIZABLE DESDE GOOGLE SHEETS',
        options:[...roots.map(m => ({id:m.ID_MENU, label:`${m.ICONO || ''} ${m.TITULO}`.trim(), next:safeId(m.ID_MENU)})), {id:'REGRESAR',label:'REGRESAR',next:'menuPrincipal'}]
      };
      const mainOptions = window.nodes.menuPrincipal?.options || [];
      if (!mainOptions.some(o => o.next === 'sheet_root')) mainOptions.splice(Math.max(0, mainOptions.length - 1), 0, {id:'CONTENIDO_ACTUALIZABLE', label:'NOVEDADES Y CONTENIDO ACTUALIZABLE', next:'sheet_root'});
    }

    applyConfig(data.configuracion || {});
    showNotices(data.avisos || []);
    window.validateNodes?.(false);
  }

  function applyConfig(config) {
    const title = config.NOMBRE_CHATBOT;
    const subtitle = config.SUBTITULO;
    const color = config.COLOR_PRINCIPAL;
    if (title) {
      document.title = title;
      const h = document.querySelector('.brand-title, .title, header h1, .header strong');
      if (h) h.textContent = title;
    }
    if (subtitle) {
      const s = document.querySelector('.brand-subtitle, .subtitle, .header .small');
      if (s) s.textContent = subtitle;
    }
    if (color && /^#[0-9a-f]{6}$/i.test(color)) document.documentElement.style.setProperty('--sheet-primary', color);
  }

  function showNotices(notices) {
    if (!notices.length || !window.addBotBubble) return;
    const html = notices.map(n => `<div class="sheet-notice"><strong>📢 ${escapeHtml(n.TITULO || 'Aviso')}</strong><br>${escapeHtml(n.MENSAJE || '')}${n.URL ? `<br><a href="${n.URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(n.TEXTO_BOTON || 'Más información')}</a>`:''}</div>`).join('');
    setTimeout(() => window.addBotBubble(html), 350);
  }

  function buildSearchUI() {
    const host = document.querySelector('.footer');
    if (!host || document.getElementById('global-search')) return;
    const box = document.createElement('div');
    box.id = 'global-search';
    box.innerHTML = `<input id="global-search-input" type="search" placeholder="Escribe tu pregunta…" autocomplete="off"><button id="global-search-btn" type="button">Buscar</button>`;
    host.parentNode.insertBefore(box, host);
    const input = box.querySelector('input');
    box.querySelector('button').addEventListener('click', () => runSearch(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(input.value); });
  }

  function runSearch(query) {
    const q = normalize(query);
    if (!q) return;
    window.addUserBubble?.(query);
    const terms = q.split(' ').filter(t => t.length > 2);
    const matches = [];
    Object.entries(window.nodes || {}).forEach(([id,node]) => {
      if (node.type !== 'message') return;
      const hay = normalize(`${node.text || ''} ${id}`);
      const score = terms.reduce((n,t)=>n+(hay.includes(t)?1:0),0);
      if (score) matches.push({id,node,score});
    });
    (sheetData?.respuestas || []).forEach(r => {
      const id = safeId(r.ID_RESPUESTA);
      const hay = normalize(`${r.PREGUNTA} ${r.RESPUESTA} ${r.PALABRAS_CLAVE}`);
      const score = terms.reduce((n,t)=>n+(hay.includes(t)?2:0),0);
      if (score && !matches.some(m=>m.id===id)) matches.push({id,node:window.nodes[id],score});
    });
    matches.sort((a,b)=>b.score-a.score);
    const top = matches.slice(0,6);
    stat('BUSCAR', {busqueda:query, resultado:top.length ? 'CON_RESULTADOS':'SIN_RESULTADOS'});
    if (!top.length) {
      window.addBotBubble?.('No encontré una coincidencia exacta. Puedes intentar con palabras como sueldo, ISR, IMSS, Fonacot, SIIAB, incentivos o asesor.');
      return;
    }
    window.addBotBubble?.('<strong>Encontré estas opciones:</strong>', top.map(m => ({label:(m.node?.text || m.id).slice(0,90), next:m.id, primary:false})));
  }

  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #global-search{display:flex;gap:8px;padding:10px 14px;background:#fff;border-top:1px solid #ddd}
      #global-search input{flex:1;min-width:0;border:1px solid #bbb;border-radius:18px;padding:10px 14px;font:inherit}
      #global-search button{border:0;border-radius:18px;padding:10px 16px;background:var(--sheet-primary,#5B2C83);color:#fff;font-weight:700;cursor:pointer}
      .sheet-notice{border-left:4px solid var(--sheet-primary,#5B2C83);padding:8px 10px;background:#f7f2fb;border-radius:6px;margin:4px 0}
      .rating-row{display:flex;gap:8px;margin-top:8px}.rating-row button{border:1px solid #ccc;background:#fff;border-radius:16px;padding:6px 10px;cursor:pointer}
      @media(max-width:600px){#global-search{padding:8px}.footer{padding-bottom:8px}}
    `;
    document.head.appendChild(style);
  }

  function hookPresentation() {
    if (!window.presentNode || window.__sheetHooked) return;
    window.__sheetHooked = true;
    const original = window.presentNode;
    window.presentNode = function(nodeId, pushToHistory=true) {
      const result = original.call(this, nodeId, pushToHistory);
      const node = window.nodes?.[nodeId];
      stat(node?.type === 'question' ? 'ABRIR_MENU':'VER_RESPUESTA', {idMenu:node?.type==='question'?nodeId:'', idRespuesta:node?.type==='message'?nodeId:''});
      if (node?.type === 'message') setTimeout(() => addRating(node.sheetResponseId || nodeId), 50);
      return result;
    };
  }

  function addRating(id) {
    const chat = document.getElementById('chat');
    if (!chat) return;
    const row = document.createElement('div');
    row.className = 'rating-row';
    row.innerHTML = '<span>¿Te ayudó?</span><button>👍 Sí</button><button>👎 No</button>';
    const buttons = row.querySelectorAll('button');
    buttons[0].onclick = () => { rating(id,'POSITIVA'); row.innerHTML='<span>Gracias por tu valoración.</span>'; };
    buttons[1].onclick = () => { rating(id,'NEGATIVA'); row.innerHTML='<span>Gracias. Revisaremos esta respuesta.</span>'; };
    chat.appendChild(row);
    requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; row.scrollIntoView({block:'end', behavior:'smooth'}); });
  }

  async function init() {
    addStyles();
    buildSearchUI();
    hookPresentation();
    stat('INICIO');
    if (!API) return;
    try {
      const response = await fetch(`${API}?accion=datos&_=${Date.now()}`, {cache:'no-store'});
      const json = await response.json();
      if (!json.ok) throw new Error(json.error || 'API no disponible');
      mergeSheetContent(json.data);
      setConnectionStatus(true, 'Información actualizada');
      if (window.start) window.start();
    } catch (error) {
      console.warn('Chatbot funcionando con contenido local:', error);
      setConnectionStatus(false, 'Modo local');
    }
  }

  window.addEventListener('load', init);
})();
