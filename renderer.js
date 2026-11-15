/* RHINE LAB · AUDIO ARCHIVE — 本地播放器（音頻＋視頻、動態條、載入動畫、三語切換） */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* ---------------- i18n ---------------- */
  const I18N = {
    'zh-CN': {
      'import': '导入', 'search': '搜索本地歌曲',
      'nav.all': '全部歌曲', 'nav.audio': '本地音乐', 'nav.video': '视频',
      'about': '档案终端 · 本地播放',
      'title': '标题', 'duration': '时长',
      'empty.title': '暂无歌曲', 'empty.video': '暂无视频',
      'empty.sub': '点击右上角「导入」，或直接把音频/视频文件拖进页面',
      'count': '共 {n} 首',
      'pb.none': '未播放', 'pb.local': '本地',
      'mode.list': '顺序', 'mode.loop': '循环', 'mode.one': '单曲', 'mode.shuffle': '随机',
      'mode.title': '播放模式',
      'prev': '上一首', 'next': '下一首', 'playpause': '播放 / 暂停',
      'volume': '音量', 'seek': '进度', 'queue': '播放队列', 'clear': '清空', 'close': '关闭',
      'lyrics.none': '暂无歌词（本地文件不包含歌词）',
      'webFull': '网页全屏', 'full': '全屏',
      'loader.sub': '正在初始化档案',
    },
    'zh-TW': {
      'import': '導入', 'search': '搜尋本地歌曲',
      'nav.all': '全部歌曲', 'nav.audio': '本地音樂', 'nav.video': '影片',
      'about': '檔案終端 · 本地播放',
      'title': '標題', 'duration': '時長',
      'empty.title': '暫無歌曲', 'empty.video': '暫無影片',
      'empty.sub': '點擊右上角「導入」，或直接把音訊/影片檔案拖進頁面',
      'count': '共 {n} 首',
      'pb.none': '未播放', 'pb.local': '本地',
      'mode.list': '順序', 'mode.loop': '循環', 'mode.one': '單曲', 'mode.shuffle': '隨機',
      'mode.title': '播放模式',
      'prev': '上一首', 'next': '下一首', 'playpause': '播放 / 暫停',
      'volume': '音量', 'seek': '進度', 'queue': '播放佇列', 'clear': '清空', 'close': '關閉',
      'lyrics.none': '暫無歌詞（本地檔案不包含歌詞）',
      'webFull': '網頁全屏', 'full': '全屏',
      'loader.sub': '正在初始化檔案',
    },
    'en': {
      'import': 'IMPORT', 'search': 'Search local tracks',
      'nav.all': 'All Tracks', 'nav.audio': 'Local Music', 'nav.video': 'Video',
      'about': 'Archive terminal · Local playback',
      'title': 'Title', 'duration': 'Duration',
      'empty.title': 'No tracks', 'empty.video': 'No videos',
      'empty.sub': 'Click IMPORT, or drop audio / video files here',
      'count': '{n} TRACKS',
      'pb.none': 'No track', 'pb.local': 'LOCAL',
      'mode.list': 'SEQ', 'mode.loop': 'LOOP', 'mode.one': 'ONE', 'mode.shuffle': 'SHUF',
      'mode.title': 'Playback mode',
      'prev': 'Previous', 'next': 'Next', 'playpause': 'Play / Pause',
      'volume': 'Volume', 'seek': 'Seek', 'queue': 'Play queue', 'clear': 'Clear', 'close': 'Close',
      'lyrics.none': 'No lyrics (local files carry none)',
      'webFull': 'Web fullscreen', 'full': 'Fullscreen',
      'loader.sub': 'INITIALIZING ARCHIVE',
    },
  };

  function detectLang() {
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.indexOf('zh') === 0) return /tw|hk|mo|hant/i.test(nav) ? 'zh-TW' : 'zh-CN';
    return 'en';
  }

  let lang = (function () {
    try { return localStorage.getItem('rhine-player:lang') || detectLang(); } catch (err) { return detectLang(); }
  })();

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  /* ---------------- elements ---------------- */
  const el = {
    loader: $('#loader'),
    loaderSub: $('#loaderSub'),
    langSel: $('#langSel'),
    search: $('#search'),
    importBtn: $('#importBtn'),
    fileInput: $('#fileInput'),
    allCount: $('#allCount'),
    audioCount: $('#audioCount'),
    videoCount: $('#videoCount'),
    mainTitle: $('#mainTitle'),
    mainCount: $('#mainCount'),
    songList: $('#songList'),
    empty: $('#empty'),
    emptyTitle: $('#emptyTitle'),
    emptySub: $('#emptySub'),
    videoPanel: $('#videoPanel'),
    videoEl: $('#videoEl'),
    videoTitle: $('#videoTitle'),
    webFsBtn: $('#webFsBtn'),
    fullBtn: $('#fullBtn'),
    closeVideoBtn: $('#closeVideoBtn'),
    videoPlay: $('#videoPlay'),
    videoCur: $('#videoCur'),
    videoDur: $('#videoDur'),
    videoProgress: $('#videoProgress'),
    videoProgressFill: $('#videoProgressFill'),
    videoProgressThumb: $('#videoProgressThumb'),
    playbar: $('#playbar'),
    cover: $('#cover'),
    coverLetter: $('#coverLetter'),
    pbTitle: $('#pbTitle'),
    pbArtist: $('#pbArtist'),
    modeBtn: $('#modeBtn'),
    prev: $('#prev'),
    play: $('#play'),
    next: $('#next'),
    curTime: $('#curTime'),
    durTime: $('#durTime'),
    progress: $('#progress'),
    progressFill: $('#progressFill'),
    progressThumb: $('#progressThumb'),
    vol: $('#vol'),
    queueBtn: $('#queueBtn'),
    queueCount: $('#queueCount'),
    drawer: $('#drawer'),
    queueList: $('#queueList'),
    clearAll: $('#clearAll'),
    closeDrawer: $('#closeDrawer'),
    discBig: $('#discBig'),
    drawerTitle: $('#drawerTitle'),
    drawerArtist: $('#drawerArtist'),
    visualizer: $('#visualizer'),
    lyrics: $('#lyrics'),
  };

  /* ---------------- state ---------------- */
  const tracks = []; // { id, name, kind:'audio'|'video', format, size, duration, url }
  let current = -1;
  let playing = false;
  let mode = 'list'; // list | loop | one | shuffle
  let view = 'all';  // all | audio | video
  let localSeq = 0;

  /* ---------------- media graph ---------------- */
  const audio = new Audio();
  audio.preload = 'metadata';
  const video = el.videoEl;
  video.preload = 'metadata';

  let ctx = null;
  let gain = null;
  let analyser = null;

  function ensureAudio() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    gain = ctx.createGain();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    const srcA = ctx.createMediaElementSource(audio);
    const srcV = ctx.createMediaElementSource(video);
    srcA.connect(gain);
    srcV.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    gain.gain.value = Number(el.vol.value) || 0.7;
  }

  audio.addEventListener('ended', onEnded);
  video.addEventListener('ended', onEnded);

  /* ---------------- helpers ---------------- */
  function fmtTime(seconds) {
    const total = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function fmtSize(bytes) {
    if (!bytes || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
    return (v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)) + ' ' + units[i];
  }

  function currentTrack() {
    return current >= 0 && current < tracks.length ? tracks[current] : null;
  }

  function activeMedia() {
    const tr = currentTrack();
    return tr && tr.kind === 'video' ? video : audio;
  }

  function currentDuration() {
    const m = activeMedia();
    if (isFinite(m.duration) && m.duration > 0) return m.duration;
    const tr = currentTrack();
    return tr ? (tr.duration || 0) : 0;
  }

  function coverColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return 'hsl(' + (hash % 360) + ', 62%, 52%)';
  }

  function visibleTracks() {
    const q = (el.search.value || '').trim().toLowerCase();
    return tracks.filter(function (tr) {
      if (view === 'audio' && tr.kind !== 'audio') return false;
      if (view === 'video' && tr.kind !== 'video') return false;
      return !q || tr.name.toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ---------------- i18n apply ---------------- */
  function setModeLabel() {
    el.modeBtn.textContent = t('mode.' + mode);
    el.modeBtn.title = t('mode.title') + '：' + t('mode.' + mode);
  }

  function applyI18n() {
    document.documentElement.lang = lang;
    el.langSel.value = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    el.search.placeholder = t('search');
    el.importBtn.title = t('import');
    setModeLabel();
    el.prev.title = t('prev');
    el.next.title = t('next');
    el.play.title = t('playpause');
    el.videoPlay.title = t('playpause');
    el.queueBtn.title = t('queue');
    el.vol.title = t('volume');
    el.progress.setAttribute('aria-label', t('seek'));
    el.videoProgress.setAttribute('aria-label', t('seek'));
    el.loaderSub.textContent = t('loader.sub');
    render();
    renderNowPlaying();
    syncProgress();
  }

  /* ---------------- rendering ---------------- */
  function render() {
    const list = visibleTracks();
    el.allCount.textContent = String(tracks.length);
    el.audioCount.textContent = String(tracks.filter(function (x) { return x.kind === 'audio'; }).length);
    el.videoCount.textContent = String(tracks.filter(function (x) { return x.kind === 'video'; }).length);
    el.mainTitle.textContent = t('nav.' + view);
    el.mainCount.textContent = t('count').replace('{n}', String(tracks.length));
    el.queueCount.textContent = tracks.length ? String(tracks.length) : '';

    const isEmpty = list.length === 0;
    el.empty.style.display = isEmpty ? 'block' : 'none';
    if (isEmpty) {
      el.emptyTitle.textContent = tracks.length === 0 ? t('empty.title') : (view === 'video' ? t('empty.video') : t('empty.title'));
      el.emptySub.style.display = tracks.length === 0 ? 'block' : 'none';
    }

    el.songList.innerHTML = '';
    list.forEach(function (tr) {
      const idx = tracks.indexOf(tr);
      const row = document.createElement('div');
      row.className = 'song' + (idx === current ? ' current' : '');

      const num = document.createElement('span');
      num.className = 'song-num';
      if (idx === current && playing && tr.kind !== 'video') {
        num.innerHTML = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>';
      } else if (idx === current) {
        num.innerHTML = '<span class="song-playing-ico">&#9835;</span>';
      } else {
        num.textContent = String(idx + 1);
      }

      const main = document.createElement('div');
      main.className = 'song-main';
      const title = document.createElement('div');
      title.className = 'song-title';
      title.textContent = tr.name;
      const meta = document.createElement('div');
      meta.className = 'song-meta';
      if (tr.kind === 'video') {
        const tag = document.createElement('span');
        tag.className = 'tag-video';
        tag.textContent = 'VIDEO';
        meta.appendChild(tag);
      }
      meta.appendChild(document.createTextNode((tr.format || 'AUDIO') + (tr.size ? ' · ' + tr.size : '')));
      main.appendChild(title);
      main.appendChild(meta);

      const dur = document.createElement('span');
      dur.className = 'song-dur';
      dur.textContent = tr.duration > 0 ? fmtTime(tr.duration) : '--:--';

      row.appendChild(num);
      row.appendChild(main);
      row.appendChild(dur);
      row.addEventListener('click', function () { select(idx, true); });
      el.songList.appendChild(row);
    });

    renderQueue();
  }

  function renderQueue() {
    el.queueList.innerHTML = '';
    tracks.forEach(function (tr, i) {
      const row = document.createElement('div');
      row.className = 'q-item' + (i === current ? ' current' : '');
      const name = document.createElement('span');
      name.className = 'q-name';
      name.textContent = tr.name;
      const dur = document.createElement('span');
      dur.className = 'q-dur';
      dur.textContent = tr.duration > 0 ? fmtTime(tr.duration) : '--:--';
      const del = document.createElement('button');
      del.className = 'q-del';
      del.textContent = '✕';
      del.title = t('clear');
      del.addEventListener('click', function (ev) { ev.stopPropagation(); removeTrack(i); });
      row.appendChild(name);
      row.appendChild(dur);
      row.appendChild(del);
      row.addEventListener('click', function () { select(i, true); });
      el.queueList.appendChild(row);
    });
  }

  function renderNowPlaying() {
    const tr = currentTrack();
    if (!tr) {
      el.pbTitle.textContent = t('pb.none');
      el.pbArtist.textContent = '—';
      el.coverLetter.textContent = '♪';
      el.cover.style.background = '#2a2c2e';
      el.discBig.textContent = '♪';
      el.discBig.classList.add('paused');
      el.drawerTitle.textContent = t('pb.none');
      el.drawerArtist.textContent = '—';
      return;
    }
    el.pbTitle.textContent = tr.name;
    el.pbArtist.textContent = (tr.format || 'AUDIO') + (tr.size ? ' · ' + tr.size : '') + ' · ' + t('pb.local') + (tr.kind === 'video' ? ' · VIDEO' : '');
    const letter = (tr.name || '?').charAt(0).toUpperCase();
    el.coverLetter.textContent = letter;
    el.cover.style.background = coverColor(tr.name);
    el.discBig.textContent = letter;
    el.drawerTitle.textContent = tr.name;
    el.drawerArtist.textContent = t('pb.local') + (tr.kind === 'video' ? ' · VIDEO' : '');
    el.discBig.classList.toggle('paused', !playing);
  }

  function setPlaying(on) {
    playing = on;
    const glyph = on ? '\u23F8' : '\u25B6';
    el.play.textContent = glyph;
    el.videoPlay.textContent = glyph;
    el.cover.classList.toggle('spinning', on);
    el.discBig.classList.toggle('paused', !on);
    el.playbar.classList.toggle('playing', on);
    render();
  }

  function syncProgress() {
    const m = activeMedia();
    const d = currentDuration();
    const cur = m.currentTime || 0;
    const pct = d > 0 ? Math.min(100, Math.max(0, (cur / d) * 100)) : 0;
    const timeStr = fmtTime(cur);
    const durStr = d > 0 ? fmtTime(d) : '--:--';
    el.curTime.textContent = timeStr;
    el.durTime.textContent = durStr;
    el.progressFill.style.width = pct + '%';
    el.progressThumb.style.left = pct + '%';
    el.videoCur.textContent = timeStr;
    el.videoDur.textContent = durStr;
    el.videoProgressFill.style.width = pct + '%';
    el.videoProgressThumb.style.left = pct + '%';
    const tr = currentTrack();
    if (tr && d > 0) tr.duration = d;
  }

  /* ---------------- video panel ---------------- */
  function updateVideoPanel(show) {
    const tr = currentTrack();
    const isV = !!(show && tr && tr.kind === 'video');
    el.videoPanel.classList.toggle('visible', isV);
    if (!isV) el.videoPanel.classList.remove('web-full');
    el.videoTitle.textContent = tr ? tr.name : '';
  }

  /* ---------------- playback ---------------- */
  function select(index, autoplay) {
    if (index < 0 || index >= tracks.length) return;
    current = index;
    const tr = tracks[index];
    if (tr.kind === 'video') {
      video.src = tr.url;
      try { video.currentTime = 0; } catch (err) {}
      audio.src = '';
      updateVideoPanel(true);
    } else {
      audio.src = tr.url;
      try { audio.currentTime = 0; } catch (err) {}
      video.src = '';
      updateVideoPanel(false);
    }
    render();
    renderNowPlaying();
    syncProgress();
    if (autoplay) {
      ensureAudio();
      activeMedia().play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
    } else {
      setPlaying(false);
    }
  }

  function toggle() {
    if (current < 0) {
      if (tracks.length) select(0, true);
      return;
    }
    ensureAudio();
    const tr = currentTrack();
    if (playing) {
      activeMedia().pause();
      setPlaying(false);
    } else {
      if (tr.kind === 'video') updateVideoPanel(true);
      activeMedia().play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
    }
  }

  function nextIndex() {
    const n = tracks.length;
    if (!n) return -1;
    if (mode === 'one') return current;
    if (mode === 'shuffle') {
      if (n === 1) return current;
      let r = current;
      while (r === current) r = Math.floor(Math.random() * n);
      return r;
    }
    if (current + 1 < n) return current + 1;
    return mode === 'loop' ? 0 : -1;
  }

  function prevIndex() {
    const n = tracks.length;
    if (!n) return -1;
    if (mode === 'one') return current;
    if (mode === 'shuffle') {
      if (n === 1) return current;
      let r = current;
      while (r === current) r = Math.floor(Math.random() * n);
      return r;
    }
    return (current - 1 + n) % n;
  }

  function step(dir) {
    if (!tracks.length) return;
    const idx = dir > 0 ? nextIndex() : prevIndex();
    if (idx < 0) {
      activeMedia().pause();
      setPlaying(false);
      return;
    }
    select(idx, playing);
  }

  function onEnded() {
    if (mode === 'one') {
      activeMedia().currentTime = 0;
      activeMedia().play().catch(function () {});
      return;
    }
    const idx = nextIndex();
    if (idx < 0) {
      setPlaying(false);
      return;
    }
    select(idx, true);
  }

  function cycleMode() {
    const order = ['list', 'loop', 'one', 'shuffle'];
    mode = order[(order.indexOf(mode) + 1) % order.length];
    setModeLabel();
  }

  /* ---------------- import / remove ---------------- */
  const AUDIO_EXT = /\.(mp3|flac|wav|ogg|oga|opus|m4a|aac|aif|aiff|webm)$/i;
  const VIDEO_EXT = /\.(mp4|ogv|mov|m4v)$/i;

  function classify(file) {
    const type = (file.type || '').toLowerCase();
    if (type.indexOf('video/') === 0) return 'video';
    if (type.indexOf('audio/') === 0) return 'audio';
    const name = (file.name || '').toLowerCase();
    if (AUDIO_EXT.test(name)) return 'audio';
    if (VIDEO_EXT.test(name)) return 'video';
    return null;
  }

  function addFiles(fileList) {
    if (!fileList || !fileList.length) return;
    let first = -1;
    Array.prototype.forEach.call(fileList, function (file) {
      const kind = classify(file);
      if (!kind) return;
      let url;
      try { url = URL.createObjectURL(file); } catch (err) { return; }
      localSeq += 1;
      const entry = {
        id: 'RL-' + String(localSeq).padStart(3, '0'),
        name: (file.name || '').replace(/\.[^.]+$/, '') || file.name,
        kind: kind,
        format: ((file.name || '').split('.').pop() || 'FILE').toUpperCase(),
        size: fmtSize(file.size),
        duration: 0,
        url: url,
      };
      tracks.push(entry);
      if (first < 0) first = tracks.length - 1;
      try {
        const probe = new Audio();
        probe.preload = 'metadata';
        probe.src = url;
        probe.addEventListener('loadedmetadata', function onMeta() {
          if (isFinite(probe.duration) && probe.duration > 0) entry.duration = probe.duration;
          render();
          probe.removeEventListener('loadedmetadata', onMeta);
          probe.src = '';
        });
      } catch (err) { /* duration fills in on load */ }
    });

    if (first < 0) return;
    render();
    if (current < 0 || !playing) select(first, true);
  }

  function removeTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    const removed = tracks.splice(index, 1)[0];
    if (removed.url) { try { URL.revokeObjectURL(removed.url); } catch (err) {} }
    if (index === current) {
      audio.pause();
      video.pause();
      audio.src = '';
      video.src = '';
      setPlaying(false);
      updateVideoPanel(false);
      current = tracks.length ? Math.min(index, tracks.length - 1) : -1;
      if (current >= 0) select(current, false);
      else renderNowPlaying();
    } else if (index < current) {
      current -= 1;
    }
    render();
    syncProgress();
  }

  function clearAll() {
    tracks.forEach(function (tr) { if (tr.url) { try { URL.revokeObjectURL(tr.url); } catch (err) {} } });
    tracks.length = 0;
    current = -1;
    audio.pause();
    video.pause();
    audio.src = '';
    video.src = '';
    setPlaying(false);
    updateVideoPanel(false);
    render();
    renderNowPlaying();
    syncProgress();
  }

  /* ---------------- progress seek ---------------- */
  function bindSeek(bar, getMedia) {
    let scrubbing = false;
    function apply(ev) {
      const rect = bar.getBoundingClientRect();
      if (!rect.width) return;
      const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      const m = getMedia();
      if (isFinite(m.duration) && m.duration > 0) m.currentTime = ratio * m.duration;
      syncProgress();
    }
    bar.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      scrubbing = true;
      try { bar.setPointerCapture(ev.pointerId); } catch (e) {}
      apply(ev);
    });
    bar.addEventListener('pointermove', function (ev) { if (scrubbing) apply(ev); });
    bar.addEventListener('pointerup', function () { scrubbing = false; });
    bar.addEventListener('pointercancel', function () { scrubbing = false; });
  }

  bindSeek(el.progress, activeMedia);
  bindSeek(el.videoProgress, function () { return video; });

  /* ---------------- visualizer ---------------- */
  const VIS_BARS = 44;
  const visBuf = new Uint8Array(512);

  function prepCanvas(canvas) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(60, canvas.clientWidth || 280);
    const h = Math.max(20, canvas.clientHeight || 80);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const g = canvas.getContext('2d');
    if (!g) return null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    return { g: g, w: w, h: h };
  }

  function drawVisualizer() {
    const c = prepCanvas(el.visualizer);
    if (!c) return;
    const g = c.g;
    const w = c.w;
    const h = c.h;

    g.strokeStyle = 'rgba(231, 229, 225, 0.06)';
    g.lineWidth = 1;
    for (let i = 0; i <= 8; i += 1) {
      const x = (w / 8) * i + 0.5;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }

    let data = null;
    if (analyser && playing) {
      analyser.getByteFrequencyData(visBuf);
      data = visBuf;
    }

    const mid = h - 3;
    const total = VIS_BARS * 2;
    const bw = w / total;
    g.shadowColor = 'rgba(255, 123, 0, 0.55)';
    g.shadowBlur = 6;

    for (let i = 0; i < VIS_BARS; i += 1) {
      let v;
      if (data) {
        const bin = Math.floor(Math.pow(i / VIS_BARS, 1.6) * (data.length * 0.6));
        v = data[bin] / 255;
      } else {
        const tt = Date.now() / 260;
        v = 0.04 + 0.03 * (Math.sin(i * 0.5 + tt) * 0.5 + 0.5);
      }
      const bh = Math.max(1.5, v * (h - 12));
      const xL = w / 2 - (i + 1) * bw;
      const xR = w / 2 + i * bw;
      const barW = Math.max(1, bw * 0.62);
      g.fillStyle = 'rgba(255, 123, 0, 0.9)';
      g.fillRect(xL, mid - bh, barW, bh);
      g.fillRect(xR, mid - bh, barW, bh);
      if (v > 0.58) {
        g.fillStyle = 'rgba(185, 228, 50, 0.95)';
        g.fillRect(xL, mid - bh, barW, 1.6);
        g.fillRect(xR, mid - bh, barW, 1.6);
      }
    }
    g.shadowBlur = 0;
    g.fillStyle = 'rgba(231, 229, 225, 0.28)';
    g.fillRect(0, mid, w, 1);
  }

  let lastVis = 0;
  function visLoop(now) {
    window.requestAnimationFrame(visLoop);
    if (now - lastVis < 33) return;
    lastVis = now;
    drawVisualizer();
  }

  /* ---------------- events ---------------- */
  el.play.addEventListener('click', toggle);
  el.prev.addEventListener('click', function () { step(-1); });
  el.next.addEventListener('click', function () { step(1); });
  el.modeBtn.addEventListener('click', cycleMode);
  el.vol.addEventListener('input', function () { if (gain) gain.gain.value = Number(el.vol.value); });
  el.importBtn.addEventListener('click', function () { el.fileInput.click(); });
  el.fileInput.addEventListener('change', function () { addFiles(el.fileInput.files); el.fileInput.value = ''; });
  el.search.addEventListener('input', render);
  el.queueBtn.addEventListener('click', function () { el.drawer.classList.toggle('open'); });
  el.closeDrawer.addEventListener('click', function () { el.drawer.classList.remove('open'); });
  el.clearAll.addEventListener('click', clearAll);

  el.videoPlay.addEventListener('click', toggle);
  el.closeVideoBtn.addEventListener('click', function () {
    video.pause();
    setPlaying(false);
    updateVideoPanel(false);
  });
  el.webFsBtn.addEventListener('click', function () {
    el.videoPanel.classList.toggle('web-full');
  });
  el.fullBtn.addEventListener('click', function () {
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch (err) {}
    } else if (el.videoPanel.classList.contains('visible')) {
      try { el.videoPanel.requestFullscreen(); } catch (err) {}
    }
  });
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) el.videoPanel.classList.remove('web-full');
  });

  el.langSel.addEventListener('change', function () {
    lang = el.langSel.value;
    try { localStorage.setItem('rhine-player:lang', lang); } catch (err) {}
    applyI18n();
  });

  document.querySelectorAll('.side-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      view = btn.getAttribute('data-view');
      document.querySelectorAll('.side-item').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      render();
    });
  });

  window.addEventListener('dragover', function (ev) { ev.preventDefault(); });
  window.addEventListener('drop', function (ev) { ev.preventDefault(); addFiles(ev.dataTransfer && ev.dataTransfer.files); });

  document.addEventListener('keydown', function (ev) {
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'BUTTON' || ev.target.tagName === 'SELECT')) return;
    if (ev.key === 'Escape') {
      if (el.videoPanel.classList.contains('web-full')) el.videoPanel.classList.remove('web-full');
      else el.drawer.classList.remove('open');
      return;
    }
    if (ev.key === ' ' || ev.code === 'Space') { ev.preventDefault(); toggle(); }
    else if (ev.key === 'ArrowRight') { const m = activeMedia(); if (currentTrack()) m.currentTime = Math.min(currentDuration(), (m.currentTime || 0) + 5); }
    else if (ev.key === 'ArrowLeft') { const m = activeMedia(); if (currentTrack()) m.currentTime = Math.max(0, (m.currentTime || 0) - 5); }
  });

  window.setInterval(function () { if (playing) syncProgress(); }, 250);

  /* ---------------- loader ---------------- */
  window.setTimeout(function () {
    el.loader.classList.add('done');
    window.setTimeout(function () {
      if (el.loader.parentNode) el.loader.parentNode.removeChild(el.loader);
    }, 620);
  }, 1400);

  /* ---------------- boot ---------------- */
  setModeLabel();
  applyI18n();
  renderNowPlaying();
  syncProgress();
  window.requestAnimationFrame(visLoop);
})();
