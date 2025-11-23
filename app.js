(function(){
  const form = document.getElementById('ytForm');
  const urlInput = document.getElementById('ytUrl');
  const errorMsg = document.getElementById('errorMsg');
  const resultWrap = document.getElementById('result');
  const iframeShell = document.getElementById('iframeShell');
  const clearBtn = document.getElementById('clearBtn');
  const watchBtn = document.getElementById('watchBtn');
  const queueBtn = document.getElementById('queueBtn');
  const queueList = document.getElementById('queueList');
  const queueEmpty = document.getElementById('queueEmpty');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const navControls = document.getElementById('navControls');

  let queue = []; // {id, original}
  let currentIndex = -1;
  const metaCache = new Map(); // id -> {title, thumb}

  function extractId(raw) {
    if(!raw) return null;
    try { raw = raw.trim(); } catch(e) {}

    const idPattern = /^[a-zA-Z0-9_-]{11}$/;
    if(idPattern.test(raw)) return raw;

    if(!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;

    let u;
    try { u = new URL(raw); } catch(e) { return null; }

    const host = u.hostname.replace(/^www\./,'');

    if(host === 'youtu.be') {
      const seg = u.pathname.split('/').filter(Boolean)[0];
      return seg && idPattern.test(seg) ? seg : seg || null;
    }
    if(host.endsWith('youtube.com')) {
      if(u.searchParams.get('v')) {
        const v = u.searchParams.get('v');
        return v && v.length <= 20 ? v : null;
      }
      const parts = u.pathname.split('/').filter(Boolean);
      if(parts[0] === 'embed' && parts[1]) return parts[1];
      if(parts[0] === 'shorts' && parts[1]) return parts[1];
    }
    return null;
  }

  function buildEmbed(id) {
    const base = 'https://www.youtube.com/embed/' + encodeURIComponent(id);
    const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
    return `${base}?${params.toString()}`;
  }

  function renderIframe(src) {
    iframeShell.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.width = '560';
    iframe.height = '315';
    iframe.src = src;
    iframe.title = 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => {
      iframeShell.classList.remove('loading');
    });
    iframeShell.appendChild(iframe);
  }

  function updateQueueUI() {
    queueList.innerHTML = '';
    if(queue.length === 0){
      queueEmpty.style.display = 'block';
      navControls.hidden = true;
      return;
    }
    queueEmpty.style.display = 'none';
    queue.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'queue-item' + (idx === currentIndex ? ' active' : '') + (item.loading ? ' loading' : '');
      li.dataset.index = idx;
      const meta = metaCache.get(item.id);
      const title = meta?.title || (item.loading ? 'Загрузка...' : item.id);
      const thumb = meta?.thumb || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`;
      li.innerHTML = `<div class="thumb-wrap">${item.loading ? '' : `<img src="${thumb}" alt="Thumbnail">`}</div>
        <div class="meta"><div class="title">${escapeHtml(title)}</div><div class="orig">${escapeHtml(item.original)}</div></div>
        <span class="qid">#${idx+1}</span>`;
      li.addEventListener('click', () => {
        playIndex(idx);
      });
      queueList.appendChild(li);
    });
    navControls.hidden = queue.length < 2;
  }

  function escapeHtml(str){
    return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c]));
  }

  async function fetchMeta(id){
    if(metaCache.has(id)) return metaCache.get(id);
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 4500);
    try {
      const resp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, {signal: controller.signal});
      clearTimeout(timeout);
      if(!resp.ok) throw new Error('oEmbed status ' + resp.status);
      const data = await resp.json();
      const meta = { title: data.title || id, thumb: data.thumbnail_url || `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
      metaCache.set(id, meta);
      return meta;
    } catch(e){
      clearTimeout(timeout);
      const meta = { title: id, thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
      metaCache.set(id, meta);
      return meta;
    }
  }

  function playIndex(idx){
    if(idx < 0 || idx >= queue.length) return;
    currentIndex = idx;
    setError('');
    const embedSrc = buildEmbed(queue[idx].id);
    resultWrap.hidden = false;
    iframeShell.classList.add('loading');
    renderIframe(embedSrc);
    updateQueueUI();
  }

  function addToQueue(raw){
    const id = extractId(raw);
    if(!id){
      setError('Не удалось извлечь ID видео. Проверьте ссылку.');
      return false;
    }
    // prevent duplicates by id
    if(queue.some(q => q.id === id)){
      setError('Видео уже в очереди.');
      return false;
    }
    queue.push({id, original: raw.trim(), loading: true});
    if(currentIndex === -1) currentIndex = 0; // first item
    updateQueueUI();
    // Fetch meta asynchronously
    fetchMeta(id).then(()=>{
      const item = queue.find(q => q.id === id);
      if(item){ item.loading = false; updateQueueUI(); }
    });
    return true;
  }

  function watchNow(raw){
    const id = extractId(raw);
    if(!id){
      setError('Не удалось извлечь ID видео. Проверьте ссылку.');
      resultWrap.hidden = true;
      return;
    }
    // Temporary play without adding to queue (unless queue empty -> optional add?)
    setError('');
    resultWrap.hidden = false;
    iframeShell.classList.add('loading');
    renderIframe(buildEmbed(id));
  }

  function next(){
    if(queue.length === 0) return;
    const idx = (currentIndex + 1) % queue.length;
    playIndex(idx);
  }
  function prev(){
    if(queue.length === 0) return;
    const idx = (currentIndex - 1 + queue.length) % queue.length;
    playIndex(idx);
  }

  function setError(msg){
    errorMsg.textContent = msg || '';
    if(msg){
      urlInput.setAttribute('aria-invalid','true');
    } else {
      urlInput.removeAttribute('aria-invalid');
    }
  }

  // Buttons
  watchBtn.addEventListener('click', () => {
    watchNow(urlInput.value);
  });
  queueBtn.addEventListener('click', () => {
    const raw = urlInput.value;
    if(!raw){ setError('Введите ссылку.'); return; }
    const ok = addToQueue(raw);
    if(ok && queue.length === 1){ // auto play first added
      playIndex(0);
    }
  });
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    setError('');
    urlInput.focus();
  });

  window.addEventListener('DOMContentLoaded', () => {
    urlInput.focus();
    updateQueueUI();
  });
})();
