(() => {
  'use strict';
  const API = window.CHATBOOT_API_URL || '';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function setThinking(active){
    let el = document.getElementById('ai-thinking');
    if(active && !el){
      el = document.createElement('div');
      el.id = 'ai-thinking'; el.className = 'bubble bot ai-thinking';
      el.innerHTML = '<strong>Asistente IA</strong><div class="typing-dots"><i></i><i></i><i></i></div>';
      document.getElementById('chat')?.appendChild(el);
      window.scrollEnd?.(el);
    } else if(!active && el) el.remove();
  }

  function renderSources(sources){
    if(!Array.isArray(sources) || !sources.length) return '';
    return '<div class="ai-sources"><strong>Información relacionada:</strong>' + sources.slice(0,3).map(s =>
      `<button type="button" class="ai-source" data-ai-node="${esc(s.nodeId || '')}">${esc(s.pregunta || 'Ver información')}</button>`
    ).join('') + '</div>';
  }

  async function askAI(question){
    const q = String(question || '').trim();
    if(!q) return;
    window.addUserBubble?.(q);
    setThinking(true);
    try{
      if(!API) throw new Error('API no configurada');
      const url = `${API}?accion=ia&texto=${encodeURIComponent(q)}&_=${Date.now()}`;
      const res = await fetch(url, {cache:'no-store'});
      const json = await res.json();
      if(!json.ok) throw new Error(json.error || 'No fue posible consultar la IA');
      const data = json.data || {};
      const badge = data.modo === 'GEMINI' ? '✨ IA con contenido oficial' : '🔎 Respuesta inteligente';
      window.addBotBubble?.(`<div class="ai-answer"><div class="ai-badge">${badge}</div>${esc(data.respuesta || 'No encontré información suficiente.').replace(/\n/g,'<br>')}${renderSources(data.fuentes)}</div>`);
    }catch(err){
      console.warn(err);
      window.addBotBubble?.('No pude consultar el servicio inteligente en este momento. Puedes usar los menús, videos, documentos o hablar con un asesor.');
    }finally{ setThinking(false); window.scrollEnd?.(); }
  }

  function enhanceSearch(){
    const box = document.getElementById('global-search');
    const input = document.getElementById('global-search-input');
    if(!box || !input || document.getElementById('ai-search-btn')) return;
    const old = document.getElementById('global-search-btn');
    if(old){ old.textContent = 'Buscar'; old.title = 'Buscar coincidencias'; }
    const btn = document.createElement('button');
    btn.id='ai-search-btn'; btn.type='button'; btn.className='ai-search-btn'; btn.innerHTML='✨ Preguntar IA';
    btn.addEventListener('click', ()=> askAI(input.value));
    box.appendChild(btn);
    input.placeholder='Pregunta sobre sueldo, descuentos, viajes, Fonacot…';
    input.addEventListener('keydown', e=>{ if(e.key==='Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); askAI(input.value); } });
  }

  document.addEventListener('click', e=>{
    const b=e.target.closest('[data-ai-node]');
    if(!b) return;
    const id=b.dataset.aiNode;
    if(id && window.nodes?.[id]) window.presentNode?.(id);
  });

  const observer = new MutationObserver(enhanceSearch);
  window.addEventListener('load', ()=>{ enhanceSearch(); observer.observe(document.body,{childList:true,subtree:true}); });
  window.askChatbootAI = askAI;
})();
