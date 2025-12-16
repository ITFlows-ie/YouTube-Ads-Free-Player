// Simple recommendations module using locally available videos (Saved + current queue)
// This avoids cross-origin issues with the YouTube embed page.

const state = {
  container: null,
  listEl: null,
  emptyEl: null,
  onSelect: null
};

export function initRecommendations({ container, onSelect, t }){
  if(!container) return;
  state.container = container;
  state.onSelect = onSelect;
  container.innerHTML = `
    <div class="recs-header">${t('recommendations')}</div>
    <div class="recs-list" id="recsList"></div>
    <div class="recs-empty" id="recsEmpty">${t('recommendations_empty')}</div>
  `;
  state.listEl = container.querySelector('#recsList');
  state.emptyEl = container.querySelector('#recsEmpty');
}

// Expect items: [{ id, title?, thumb? }]
export function renderRecommendations(items){
  if(!state.container || !state.listEl || !state.emptyEl) return;
  state.listEl.innerHTML = '';
  const data = Array.isArray(items) ? items : [];
  console.log('[Recs] renderRecommendations call, items:', Array.isArray(items) ? items.length : 'not-array');
  if(!data.length){
    console.log('[Recs] no items to render');
    state.emptyEl.style.display = 'block';
    return;
  }
  console.log('[Recs] rendering items:', data.length, data.map(it => it.id).slice(0, 5));
  state.emptyEl.style.display = 'none';
  const frag = document.createDocumentFragment();
  data.forEach(item => {
    const el = document.createElement('button');
    el.className = 'rec-item';
    el.type = 'button';
    const duration = item.duration && typeof item.duration === 'string' ? item.duration : '';
    el.innerHTML = `
      <div class="rec-thumb">
        <div class="rec-thumb-img" style="background-image:url('https://img.youtube.com/vi/${item.id}/mqdefault.jpg')"></div>
        ${duration ? `<div class="rec-duration">${duration}</div>` : ''}
      </div>
      <div class="rec-meta">
        <div class="rec-title">${item.title || item.id}</div>
      </div>
    `;
    el.addEventListener('click', () => {
      try { state.onSelect && state.onSelect(item.id); } catch(e){}
    });
    frag.appendChild(el);
  });
  state.listEl.appendChild(frag);
}

// Helper to build items from saved and queue
