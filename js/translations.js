// Simple i18n system
const dictionaries = {
  ru: {
    heading: 'YouTube Ads Free Player',
    subtitle: 'Вставьте ссылку на видео. Можно просто смотреть или добавлять в очередь справа.',
    watch_now: 'Смотреть',
    add_to_queue: 'В очередь',
    previous: '⟨ Предыдущее',
    next: 'Следующее ⟩',
    queue_title: 'Очередь',
    clear_queue: 'Очистить',
    queue_empty: 'Очередь пуста. Добавьте видео.',
    modal_title: 'Очистить всю очередь?',
    modal_text: 'Это удалит все видео из списка. Действие нельзя отменить.',
    modal_confirm: 'Очистить',
    modal_cancel: 'Отмена',
    open_queue: 'Очередь',
    close_queue: 'Закрыть',
    loading: 'Загрузка...',
    delete: 'Удалить',
    error_enter_url: 'Введите ссылку.',
    error_extract: 'Не удалось извлечь ID видео.',
    error_duplicate: 'Видео уже в очереди.'
  },
  en: {
    heading: 'YouTube Ads Free Player',
    subtitle: 'Paste a YouTube link. You can watch or queue videos on the right.',
    watch_now: 'Watch',
    add_to_queue: 'Queue',
    previous: '⟨ Previous',
    next: 'Next ⟩',
    queue_title: 'Queue',
    clear_queue: 'Clear',
    queue_empty: 'Queue is empty. Add videos.',
    modal_title: 'Clear entire queue?',
    modal_text: 'This will remove all videos. This action cannot be undone.',
    modal_confirm: 'Clear',
    modal_cancel: 'Cancel',
    open_queue: 'Queue',
    close_queue: 'Close',
    loading: 'Loading...',
    delete: 'Delete',
    error_enter_url: 'Enter a link.',
    error_extract: 'Could not extract video ID.',
    error_duplicate: 'Video already in queue.'
  },
  es: {
    heading: 'YouTube Ads Free Player',
    subtitle: 'Pega un enlace de YouTube. Puedes ver o añadir a la cola.',
    watch_now: 'Ver',
    add_to_queue: 'A la cola',
    previous: '⟨ Anterior',
    next: 'Siguiente ⟩',
    queue_title: 'Cola',
    clear_queue: 'Limpiar',
    queue_empty: 'La cola está vacía. Añade vídeos.',
    modal_title: '¿Limpiar toda la cola?',
    modal_text: 'Esto eliminará todos los vídeos. No se puede deshacer.',
    modal_confirm: 'Limpiar',
    modal_cancel: 'Cancelar',
    open_queue: 'Cola',
    close_queue: 'Cerrar',
    loading: 'Cargando...',
    delete: 'Eliminar',
    error_enter_url: 'Introduce un enlace.',
    error_extract: 'No se pudo extraer ID.',
    error_duplicate: 'Vídeo ya en la cola.'
  },
  de: {
    heading: 'YouTube Ads Free Player',
    subtitle: 'Füge einen YouTube-Link ein. Du kannst ansehen oder rechts zur Warteschlange hinzufügen.',
    watch_now: 'Ansehen',
    add_to_queue: 'Zur Warteschlange',
    previous: '⟨ Zurück',
    next: 'Weiter ⟩',
    queue_title: 'Warteschlange',
    clear_queue: 'Leeren',
    queue_empty: 'Warteschlange leer. Füge Videos hinzu.',
    modal_title: 'Warteschlange komplett leeren?',
    modal_text: 'Alle Videos werden entfernt. Nicht rückgängig.',
    modal_confirm: 'Leeren',
    modal_cancel: 'Abbrechen',
    open_queue: 'Warteschlange',
    close_queue: 'Schließen',
    loading: 'Lädt...',
    delete: 'Löschen',
    error_enter_url: 'Link eingeben.',
    error_extract: 'Video-ID konnte nicht extrahiert werden.',
    error_duplicate: 'Video bereits in Warteschlange.'
  },
  fr: {
    heading: 'YouTube Ads Free Player',
    subtitle: 'Collez un lien YouTube. Vous pouvez regarder ou ajouter à la file à droite.',
    watch_now: 'Regarder',
    add_to_queue: 'En file',
    previous: '⟨ Précédent',
    next: 'Suivant ⟩',
    queue_title: 'File',
    clear_queue: 'Vider',
    queue_empty: 'La file est vide. Ajoutez des vidéos.',
    modal_title: 'Vider toute la file ?',
    modal_text: 'Cela supprimera toutes les vidéos. Action irréversible.',
    modal_confirm: 'Vider',
    modal_cancel: 'Annuler',
    open_queue: 'File',
    close_queue: 'Fermer',
    loading: 'Chargement...',
    delete: 'Supprimer',
    error_enter_url: 'Entrez un lien.',
    error_extract: 'Impossible d’extraire l’ID.',
    error_duplicate: 'Vidéo déjà dans la file.'
  }
};

let currentLang = localStorage.getItem('appLang') || 'en';
if(!dictionaries[currentLang]) currentLang = 'en';

export function t(key){
  return dictionaries[currentLang][key] || key;
}
export function setLang(lang){
  if(dictionaries[lang]){
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
  }
}
export function getLang(){ return currentLang; }

export function applyTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(!key) return;
    el.textContent = t(key);
  });
  // Buttons that have inner HTML with icons need special handling
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if(prevBtn) prevBtn.textContent = t('previous');
  if(nextBtn) nextBtn.textContent = t('next');
  // Queue toggle button
  const openQueueBtn = document.getElementById('openQueueBtn');
  const qc = document.getElementById('queueCount');
  if(openQueueBtn && qc){
    if(openQueueBtn.getAttribute('aria-label') === 'Закрыть очередь' || openQueueBtn.textContent.includes(t('close_queue'))){
      openQueueBtn.innerHTML = `${t('close_queue')} <span id="queueCount" class="queue-count">${qc.textContent}</span>`;
    } else {
      openQueueBtn.innerHTML = `${t('open_queue')} <span id="queueCount" class="queue-count">${qc.textContent}</span>`;
    }
  }
  // Update aria-labels simple case
  const map = {
    watchBtn: 'watch_now',
    queueBtn: 'add_to_queue',
    clearAllBtn: 'clear_queue',
    prevBtn: 'previous',
    nextBtn: 'next',
    confirmClearBtn: 'modal_confirm',
    cancelClearBtn: 'modal_cancel'
  };
  Object.entries(map).forEach(([id,key]) => {
    const el = document.getElementById(id);
    if(el) el.setAttribute('aria-label', t(key));
  });
}

// Expose dictionary for queue.js error strings
export const dict = dictionaries;
