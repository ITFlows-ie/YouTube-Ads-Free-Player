import { addToQueue, watchNow, next, prev, initQueue, updateQueueUI, state, clearAllQueue } from './queue.js';
import { setLang, getLang, applyTranslations, t } from './translations.js';

window.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('ytUrl');
  const errorMsg = document.getElementById('errorMsg');
  const resultWrap = document.getElementById('result');
  const iframeShell = document.getElementById('iframeShell');
  const queueList = document.getElementById('queueList');
  const queueEmpty = document.getElementById('queueEmpty');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const navControls = document.getElementById('navControls');
  // Removed external clearBtn; replaced by internal inputClearBtn
  const inputClearBtn = document.getElementById('inputClearBtn');
  const inputWrapper = document.querySelector('.input-wrapper');
  const watchBtn = document.getElementById('watchBtn');
  const queueBtn = document.getElementById('queueBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const confirmClearBtn = document.getElementById('confirmClearBtn');
  const cancelClearBtn = document.getElementById('cancelClearBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const openQueueBtn = document.getElementById('openQueueBtn');
  const queueOverlay = document.getElementById('queueOverlay');
  const queuePanel = document.querySelector('.queue-panel');
  const langSelect = document.getElementById('langSelect');

  function setError(msg){ if(errorMsg) errorMsg.textContent = msg; }
  function clearError(){ setError(''); }

  if(watchBtn) watchBtn.addEventListener('click', () => watchNow(urlInput.value));
  if(queueBtn) queueBtn.addEventListener('click', () => {
    const raw = urlInput.value;
    if(!raw){ setError('Введите ссылку.'); return; }
    const ok = addToQueue(raw);
    if(ok){
      // Очистить поле для быстрого добавления следующих видео
      urlInput.value = '';
      clearError();
      updateInputClear();
      urlInput.focus();
    }
    if(ok && state.queue.length === 1){
      setTimeout(()=> { updateQueueUI(); }, 0);
    }
  });
  if(prevBtn) prevBtn.addEventListener('click', prev);
  if(nextBtn) nextBtn.addEventListener('click', next);
  function updateInputClear(){
    if(!inputWrapper) return;
    inputWrapper.classList.toggle('empty', !urlInput.value);
  }
  urlInput.addEventListener('input', updateInputClear);
  if(inputClearBtn) inputClearBtn.addEventListener('click', () => {
    urlInput.value = '';
    updateInputClear();
    clearError();
    urlInput.focus();
  });
  updateInputClear();

  function openModal(){ if(modalBackdrop){ modalBackdrop.hidden = false; confirmClearBtn?.focus(); } }
  function closeModal(){ if(modalBackdrop){ modalBackdrop.hidden = true; clearAllBtn?.focus(); } }

  if(clearAllBtn) clearAllBtn.addEventListener('click', openModal);
  if(cancelClearBtn) cancelClearBtn.addEventListener('click', closeModal);
  if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if(confirmClearBtn) confirmClearBtn.addEventListener('click', () => { clearAllQueue(); closeModal(); });
  if(modalBackdrop) modalBackdrop.addEventListener('click', e => { if(e.target === modalBackdrop) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && modalBackdrop && !modalBackdrop.hidden) closeModal(); });

  function openQueue(){
    if(!queuePanel) return;
    queuePanel.classList.add('open');
    if(queueOverlay) queueOverlay.hidden = false;
    if(openQueueBtn){
      openQueueBtn.setAttribute('aria-label', t('close_queue'));
      const qc = document.getElementById('queueCount');
      if(qc){
        openQueueBtn.innerHTML = `${t('close_queue')} <span id="queueCount" class="queue-count">${qc.textContent}</span>`;
      } else {
        openQueueBtn.textContent = t('close_queue');
      }
    }
  }
  function closeQueue(){
    if(!queuePanel) return;
    queuePanel.classList.remove('open');
    if(queueOverlay) queueOverlay.hidden = true;
    if(openQueueBtn){
      openQueueBtn.setAttribute('aria-label', t('open_queue'));
      const qc = document.getElementById('queueCount');
      if(qc){
        openQueueBtn.innerHTML = `${t('open_queue')} <span id="queueCount" class="queue-count">${qc.textContent}</span>`;
      } else {
        openQueueBtn.textContent = t('open_queue');
      }
    }
  }
  function toggleQueue(){
    if(queuePanel && queuePanel.classList.contains('open')) closeQueue(); else openQueue();
  }
  if(openQueueBtn) openQueueBtn.addEventListener('click', toggleQueue);
  if(queueOverlay) queueOverlay.addEventListener('click', closeQueue);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeQueue(); });
  // Close queue automatically when switching to large viewport
  const mq = window.matchMedia('(min-width: 901px)');
  mq.addEventListener('change', ev => { if(ev.matches) closeQueue(); });

  urlInput.focus();
  initQueue({ errorMsg, resultWrap, iframeShell, queueList, queueEmpty, navControls });

  // Initialize lang select
  if(langSelect){
    langSelect.value = getLang();
    langSelect.addEventListener('change', () => {
      setLang(langSelect.value);
      updateQueueUI(); // update dynamic queue strings
    });
  }
  applyTranslations();
});
