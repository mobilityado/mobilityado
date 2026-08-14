(() => {
  'use strict';

  const API = window.CHATBOOT_API_URL || '';
  const SESSION_KEY = 'chatboot_session_v4';
  const PHONE_FALLBACK = '529372547287';
  let lastConsultation = '';
  let sheetPayload = null;

  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const escapeHtml = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function getSessionId() {
    return localStorage.getItem(SESSION_KEY) || 's-' + Date.now();
  }

  function post(payload) {
    if (!API) return;
    fetch(API, {
      method: 'POST',
      mode: 'no-cors',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(payload)
    }).catch(() => {});
  }

  function scrollChat() {
    const chat = document.getElementById('chat');
    if (!chat) return;
    requestAnimationFrame(() => {
      chat.scrollTop = chat.scrollHeight;
      setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 90);
    });
  }

  function getWhatsappPhone() {
    const fromSheet = sheetPayload?.configuracion?.WHATSAPP_PRINCIPAL;
    return String(fromSheet || PHONE_FALLBACK).replace(/\D/g, '');
  }

  function detectMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  }

  function openWhatsAppDirect(phone, message) {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent || '');

    post({
      accion: 'estadistica',
      sesion: getSessionId(),
      evento: 'ABRIR_WHATSAPP_GUIADO',
      resultado: 'INTENTO_APP',
      dispositivo: navigator.platform || '',
      navegador: navigator.userAgent || ''
    });

    if (isAndroid) {
      window.location.href = `intent://send?phone=${cleanPhone}&text=${encoded}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
      setTimeout(() => {
        if (document.visibilityState === 'visible') window.location.href = `https://wa.me/${cleanPhone}?text=${encoded}`;
      }, 1400);
      return;
    }

    if (isIOS) {
      window.location.href = `whatsapp://send?phone=${cleanPhone}&text=${encoded}`;
      setTimeout(() => {
        if (document.visibilityState === 'visible') window.location.href = `https://wa.me/${cleanPhone}?text=${encoded}`;
      }, 1400);
      return;
    }

    window.open(`https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank', 'noopener,noreferrer');
  }

  function buildModal() {
    if (document.getElementById('advisor-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'advisor-modal';
    modal.className = 'advisor-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="advisor-card" role="dialog" aria-modal="true" aria-labelledby="advisor-title">
        <button class="advisor-close" type="button" aria-label="Cerrar">×</button>
        <div class="advisor-icon">💬</div>
        <h2 id="advisor-title">Hablar con un asesor</h2>
        <p>Completa estos datos para enviar tu consulta con contexto. El número de empleado es opcional y no se almacena.</p>
        <label>Marca
          <select id="advisor-brand">
            <option value="ADO">ADO</option>
            <option value="SUR">SUR</option>
            <option value="TRT">TRT</option>
            <option value="ADMINISTRATIVO">Administrativo</option>
            <option value="OTRA">Otra</option>
          </select>
        </label>
        <label>Número de empleado <span>(opcional)</span>
          <input id="advisor-employee" inputmode="numeric" maxlength="20" placeholder="Ejemplo: 123456">
        </label>
        <label>Motivo de consulta
          <textarea id="advisor-reason" maxlength="500" rows="4" placeholder="Describe brevemente tu duda"></textarea>
        </label>
        <div class="advisor-actions">
          <button type="button" class="advisor-cancel">Cancelar</button>
          <button type="button" class="advisor-send">Abrir WhatsApp</button>
        </div>
        <small>En celular se intentará abrir directamente la aplicación de WhatsApp.</small>
      </div>`;
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };
    modal.querySelector('.advisor-close').addEventListener('click', close);
    modal.querySelector('.advisor-cancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

    modal.querySelector('.advisor-send').addEventListener('click', () => {
      const brand = modal.querySelector('#advisor-brand').value;
      const employee = modal.querySelector('#advisor-employee').value.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      const reason = modal.querySelector('#advisor-reason').value.trim() || lastConsultation || 'Asesoría general';
      const lines = [
        'Hola, necesito apoyo de Recaudación.',
        '',
        `Marca: ${brand}`,
        employee ? `Número de empleado: ${employee}` : '',
        `Motivo de consulta: ${reason}`,
        lastConsultation && normalize(lastConsultation) !== normalize(reason) ? `Consulta previa: ${lastConsultation}` : '',
        '',
        'Vengo desde Asistente Abordo.'
      ].filter(Boolean);
      close();
      openWhatsAppDirect(getWhatsappPhone(), lines.join('\n'));
    });
  }

  function openAdvisor(reason = '') {
    buildModal();
    const modal = document.getElementById('advisor-modal');
    const textarea = modal.querySelector('#advisor-reason');
    textarea.value = reason || lastConsultation || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => textarea.focus(), 80);
  }

  function messageText(node) {
    return normalize(`${node?.text || ''} ${node?.id || ''}`);
  }

  function relatedNodes(currentId) {
    const current = window.nodes?.[currentId];
    if (!current || current.type !== 'message') return [];
    const source = messageText(current);
    const terms = source.split(' ').filter(t => t.length > 4);
    const candidates = [];
    Object.entries(window.nodes || {}).forEach(([id, node]) => {
      if (id === currentId || node?.type !== 'message') return;
      if (id === 'hablar_asesor') return;
      const hay = messageText(node);
      let score = terms.reduce((total, term) => total + (hay.includes(term) ? 1 : 0), 0);
      if (currentId.includes('fonacot') && id.includes('fonacot')) score += 3;
      if (currentId.includes('infonavit') && id.includes('infonavit')) score += 3;
      if (currentId.includes('sueldo') && id.includes('sueldo')) score += 3;
      if (currentId.includes('isr') && id.includes('isr')) score += 3;
      if (currentId.includes('imss') && id.includes('imss')) score += 3;
      if (score > 0) candidates.push({id, node, score});
    });
    return candidates.sort((a,b) => b.score - a.score).slice(0, 3);
  }

  function appendRelated(currentId) {
    const chat = document.getElementById('chat');
    if (!chat || chat.querySelector(`[data-related-for="${CSS.escape(currentId)}"]`)) return;
    const related = relatedNodes(currentId);
    const section = document.createElement('div');
    section.className = 'related-panel';
    section.dataset.relatedFor = currentId;
    section.innerHTML = '<strong>También podría interesarte</strong>';
    const list = document.createElement('div');
    list.className = 'related-list';

    related.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(item.node.text || item.id).replace(/<[^>]*>/g, '').slice(0, 95);
      button.addEventListener('click', () => {
        window.historyStack?.push?.(window.currentNode);
        window.presentNode?.(item.id);
      });
      list.appendChild(button);
    });

    const advisor = document.createElement('button');
    advisor.type = 'button';
    advisor.className = 'related-advisor';
    advisor.textContent = '💬 Hablar con un asesor';
    advisor.addEventListener('click', () => openAdvisor(lastConsultation));
    list.appendChild(advisor);
    section.appendChild(list);
    chat.appendChild(section);
    scrollChat();
  }

  function appendReportButton(currentId) {
    const chat = document.getElementById('chat');
    if (!chat || chat.querySelector(`[data-report-for="${CSS.escape(currentId)}"]`)) return;
    const row = document.createElement('div');
    row.className = 'report-row';
    row.dataset.reportFor = currentId;
    const updated = sheetPayload?.configuracion?.ULTIMA_ACTUALIZACION;
    row.innerHTML = `${updated ? `<span>Actualizado: ${escapeHtml(updated)}</span>` : '<span>¿Detectaste un dato incorrecto?</span>'}<button type="button">⚑ Reportar información desactualizada</button>`;
    row.querySelector('button').addEventListener('click', () => {
      const comment = prompt('Describe brevemente qué información debe revisarse (opcional):') || '';
      post({
        accion: 'reporte',
        sesion: getSessionId(),
        idRespuesta: currentId,
        valoracion: 'DESACTUALIZADA',
        comentario: comment.slice(0, 1000)
      });
      row.innerHTML = '<span>Gracias. El reporte fue enviado para revisión.</span>';
      scrollChat();
    });
    chat.appendChild(row);
    scrollChat();
  }

  function hookPresentation() {
    if (!window.presentNode || window.__experienceHooked) return;
    window.__experienceHooked = true;
    const original = window.presentNode;
    window.presentNode = function(nodeId, pushToHistory = true) {
      const node = window.nodes?.[nodeId];
      if (node?.type === 'message') {
        const plain = String(node.text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (plain) lastConsultation = plain.slice(0, 240);
      }
      const result = original.call(this, nodeId, pushToHistory);
      if (nodeId === 'hablar_asesor') setTimeout(() => openAdvisor(lastConsultation), 180);
      if (node?.type === 'message' && nodeId !== 'hablar_asesor') {
        setTimeout(() => appendRelated(nodeId), 160);
        setTimeout(() => appendReportButton(node.sheetResponseId || nodeId), 220);
      }
      return result;
    };
  }

  function interceptWhatsappLinks() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href*="wa.me"],a[href*="web.whatsapp.com"],a[href^="whatsapp://"]');
      if (!link) return;
      event.preventDefault();
      openAdvisor(lastConsultation);
    }, true);
  }

  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .advisor-modal{position:fixed;inset:0;background:rgba(9,15,28,.68);display:none;align-items:center;justify-content:center;padding:18px;z-index:12000;backdrop-filter:blur(7px)}
      .advisor-modal.open{display:flex}.advisor-card{position:relative;width:min(520px,100%);max-height:92vh;overflow:auto;background:var(--panel,#fff);color:var(--text,#1f2937);border:1px solid var(--border,#ddd);border-radius:24px;padding:25px;box-shadow:0 28px 80px rgba(0,0,0,.28)}
      .advisor-card h2{margin:4px 0 8px}.advisor-card p{margin:0 0 18px;color:var(--muted,#64748b);line-height:1.5}.advisor-icon{font-size:34px}.advisor-close{position:absolute;right:16px;top:14px;border:0;background:transparent;color:inherit;font-size:30px;cursor:pointer}.advisor-card label{display:grid;gap:7px;margin:13px 0;font-weight:750}.advisor-card label span{font-weight:500;color:var(--muted,#64748b)}
      .advisor-card input,.advisor-card select,.advisor-card textarea{width:100%;box-sizing:border-box;border:1px solid var(--border,#ccd3df);border-radius:14px;padding:12px 13px;background:var(--panel-2,#f8fafc);color:var(--text,#1f2937);font:inherit;resize:vertical}.advisor-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.advisor-actions button{border:0;border-radius:14px;padding:11px 16px;font-weight:800;cursor:pointer}.advisor-cancel{background:var(--panel-2,#edf2f7);color:var(--text,#1f2937)}.advisor-send{background:linear-gradient(135deg,#19a463,#087f5b);color:#fff}.advisor-card small{display:block;margin-top:13px;color:var(--muted,#64748b)}
      .related-panel{align-self:flex-start;width:min(620px,92%);margin:5px 0 8px;padding:13px 14px;border:1px solid var(--border,#ddd);border-radius:17px;background:var(--panel-2,#f7f8fb);color:var(--text,#1f2937)}.related-panel strong{display:block;margin-bottom:9px}.related-list{display:flex;gap:7px;flex-wrap:wrap}.related-list button{border:1px solid color-mix(in srgb,var(--primary,#6d28d9) 30%,var(--border,#ddd));background:var(--panel,#fff);color:var(--text,#1f2937);border-radius:14px;padding:8px 11px;cursor:pointer;text-align:left}.related-list .related-advisor{background:linear-gradient(135deg,#19a463,#087f5b);color:#fff;border:0}
      .report-row{align-self:flex-start;width:min(620px,92%);display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 9px;color:var(--muted,#64748b);font-size:12px}.report-row button{border:0;background:transparent;color:var(--primary,#6d28d9);font:inherit;font-weight:750;cursor:pointer;padding:5px}
      @media(max-width:600px){.advisor-card{padding:20px;border-radius:20px}.advisor-actions{display:grid;grid-template-columns:1fr 1fr}.related-panel,.report-row{width:94%}.report-row{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  async function loadSheetConfig() {
    if (!API) return;
    try {
      const response = await fetch(`${API}?accion=datos&_=${Date.now()}`, {cache: 'no-store'});
      const json = await response.json();
      if (json?.ok) sheetPayload = json.data;
    } catch (_) {}
  }

  function init() {
    addStyles();
    buildModal();
    hookPresentation();
    interceptWhatsappLinks();
    loadSheetConfig();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ChatBootAdvisor = { open: openAdvisor };
})();
