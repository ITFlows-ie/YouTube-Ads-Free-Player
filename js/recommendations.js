import { getSavedProgress, getHistorySnapshot } from './player.js';

// Simple recommendations module using locally available videos (Saved + current queue)
// This avoids cross-origin issues with the YouTube embed page.

const state = {
  container: null,
  listEl: null,
  emptyEl: null,
  onSelect: null
};

export function initRecommendations({ container, onSelect, onSave, t }){
  if(!container) return;
  state.container = container;
  state.onSelect = onSelect;
  state.onSave = onSave;
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
  const history = getHistorySnapshot();
  if(!data.length){
    state.emptyEl.style.display = 'block';
    return;
  }
  state.emptyEl.style.display = 'none';
  const frag = document.createDocumentFragment();
  data.forEach(item => {
    const el = document.createElement('div');
    el.className = 'rec-item';
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    const duration = item.duration && typeof item.duration === 'string' ? item.duration : '';
    const durationSec = parseDuration(duration);
    const hist = history[item.id];
    const saved = getSavedProgress(item.id);
    const progress = durationSec > 0 ? Math.min(saved / durationSec, 1) : null;
    const histProgress = durationSec > 0 && hist?.p ? Math.min(hist.p / durationSec, 1) : progress;
    const bar = histProgress && histProgress > 0 ? Math.max(Math.min(histProgress, 1), 0) : 0;
    el.innerHTML = `
      <div class="rec-thumb">
        <div class="rec-thumb-img" style="background-image:url('https://img.youtube.com/vi/${item.id}/mqdefault.jpg')"></div>
        ${duration ? `<div class="rec-duration">${duration}</div>` : ''}
        ${bar > 0 ? `<div class="rec-progress"><span style="width:${(bar*100).toFixed(1)}%"></span></div>` : ''}
        <button class="rec-save" type="button" aria-label="Save">+</button>
      </div>
      <div class="rec-meta">
        <div class="rec-title">${item.title || item.id}</div>
      </div>
    `;
    el.addEventListener('click', () => {
      try { state.onSelect && state.onSelect(item); } catch(e){}
    });
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        try { state.onSelect && state.onSelect(item); } catch(e){}
      }
    });
    const saveBtn = el.querySelector('.rec-save');
    if(saveBtn){
      saveBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        try { state.onSave && state.onSave(item); } catch(e){}
      });
    }
    frag.appendChild(el);
  });
  state.listEl.appendChild(frag);
}

function parseDuration(str){
  if(!str || typeof str !== 'string') return 0;
  const parts = str.split(':').map(x => parseInt(x, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  return 0;
}

// Helper to build items from saved and queue
