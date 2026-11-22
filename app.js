/**
 * MUSICA UNIVERSALIS — Main Application Controller
 * Coordinates 3D Music Universe, Audio Playback, Immersive Slide-Down Playbar & File Import
 */
(function (global) {
  'use strict';

  const COSMOS = global.COSMOS;
  const $ = (sel) => document.querySelector(sel);

  const el = {
    loader: $('#loader'),
    loaderSub: $('#loaderSub'),
    musicKineticHud: $('#musicKineticHud'),
    kineticPulseDot: $('#kineticPulseDot'),
    kineticMoodText: $('#kineticMoodText'),
    kineticStateBadge: $('#kineticStateBadge'),
    kineticTitle: $('#kineticTitle'),
    kineticArtist: $('#kineticArtist'),
    miniWaveCanvas: $('#miniWaveCanvas'),
    threeCanvas: $('#threeCanvas'),
    showcaseCanvas: $('#showcaseCanvas'),
    search: $('#search'),
    orbitBtn: $('#orbitBtn'),
    resetCamBtn: $('#resetCamBtn'),
    themeBtn: $('#themeBtn'),
    themeLabel: $('#themeLabel'),
    langSel: $('#langSel'),
    importBtn: $('#importBtn'),
    fileInput: $('#fileInput'),
    coverInput: $('#coverInput'),
    cntAll: $('#cntAll'),
    cntAudio: $('#cntAudio'),
    cntVideo: $('#cntVideo'),
    calloutAnchor: $('#calloutAnchor'),
    calloutFileNum: $('#calloutFileNum'),
    calloutTitle: $('#calloutTitle'),
    calloutSub: $('#calloutSub'),
    dotTL: $('#dotTL'), dotBL: $('#dotBL'), dotTR: $('#dotTR'), dotBR: $('#dotBR'),
    backBtn: $('#backBtn'),
    cueFileId: $('#cueFileId'),
    dossierId: $('#dossierId'),
    dossierTitle: $('#dossierTitle'),
    dossierArtist: $('#dossierArtist'),
    changeCoverBtn: $('#changeCoverBtn'),
    dossierPlayBtn: $('#dossierPlayBtn'),
    metaFormat: $('#metaFormat'),
    metaDuration: $('#metaDuration'),
    metaOrbit: $('#metaOrbit'),
    metaSource: $('#metaSource'),
    metaSample: $('#metaSample'),
    metaMode: $('#metaMode'),
    trackListEl: $('#trackListEl'),
    dossierNotes: $('#dossierNotes'),
    dossierLyrics: $('#dossierLyrics'),
    videoStageWrap: $('#videoStageWrap'),
    videoEl: $('#videoEl'),
    videoEmptyNote: $('#videoEmptyNote'),
    vPlayBtn: $('#vPlayBtn'),
    vCur: $('#vCur'), vDur: $('#vDur'),
    vProgress: $('#vProgress'), vFill: $('#vFill'), vThumb: $('#vThumb'),
    vWebFsBtn: $('#vWebFsBtn'), vFsBtn: $('#vFsBtn'),
    visualizer: $('#visualizer'),
    progressBar: $('#progressBar'),
    progressFill: $('#progressFill'),
    progressThumb: $('#progressThumb'),
    pbTrackTrigger: $('#pbTrackTrigger'),
    pbThumb: $('#pbThumb'),
    pbTitle: $('#pbTitle'),
    pbSub: $('#pbSub'),
    modeBtn: $('#modeBtn'),
    prevBtn: $('#prevBtn'),
    playBtn: $('#playBtn'),
    nextBtn: $('#nextBtn'),
    timeReadout: $('#timeReadout'),
    volSlider: $('#volSlider'),
    playbar: $('#playbar'),
    playbarHandle: $('#playbarHandle'),
    playbarRestore: $('#playbarRestore'),
    dropOverlay: $('#dropOverlay'),
    hudToast: $('#hudToast'),
  };

  /* ---- Application State ---- */
  const tracks = [];
  let currentTrackIdx = 0;
  let playing = false;
  let mode = 'list';
  let viewFilter = 'all';
  let detailMode = false;
  let detailSlotIdx = -1;
  let detailTab = 'tracks';
  let localSeq = 6;
  let toastTimer = null;
  let playbarHidden = false;
  let currentMoodPalette = null;
  let kineticGlyphs = [];
  let hoverGlyphIdx = -1;
  let renderedKineticText = '';

  function showToast(msg) {
    el.hudToast.textContent = msg;
    el.hudToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.hudToast.classList.remove('show'), 2300);
  }

  function getSlotCoverDataUrl(slotIdx) {
    const s = COSMOS.scene3d.slots[slotIdx];
    if (!s) return COSMOS.coverLibrary[0].dataUrl;
    if (s.customCoverDataUrl) return s.customCoverDataUrl;
    if (s.trackIdx >= 0 && tracks[s.trackIdx] && tracks[s.trackIdx].coverDataUrl) {
      return tracks[s.trackIdx].coverDataUrl;
    }
    return COSMOS.coverLibrary[s.defaultCoverIdx].dataUrl;
  }

  /* =========================================================================
   * 2D MIRRORED FFT COSMIC SPECTRUM STRIP
   * ========================================================================= */
  const VIS_BARS = 52;

  function drawVisualizer(timeSec) {
    const cv = el.visualizer;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(120, cv.clientWidth || 320);
    const h = Math.max(18, cv.clientHeight || 24);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const g = cv.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    const isLight = COSMOS.scene3d.getTheme() === 'ether';
    const live = !!(COSMOS.audioEngine.isAnalyserReady() && playing);
    const fft = COSMOS.audioEngine.fftData;
    const total = VIS_BARS * 2;
    const bw = w / total;
    const baseY = h - 1;

    for (let i = 0; i < VIS_BARS; i++) {
      let v;
      if (live) {
        const bin = Math.floor(Math.pow(i / VIS_BARS, 1.52) * (fft.length * 0.56));
        v = fft[bin] / 255;
      } else {
        v = 0.05 + 0.05 * (Math.sin(i * 0.32 + timeSec * 1.8) * 0.5 + 0.5);
      }
      const bh = Math.max(1.4, v * (h - 3));
      const xL = w * 0.5 - (i + 1) * bw;
      const xR = w * 0.5 + i * bw;
      const barW = Math.max(1, bw * 0.54);

      if (v > 0.36) {
        g.fillStyle = currentMoodPalette ? currentMoodPalette.rimCss : (isLight ? 'rgba(180, 110, 50, 0.85)' : 'rgba(190, 210, 232, 0.85)');
      } else if (v > 0.15) {
        g.fillStyle = currentMoodPalette ? currentMoodPalette.hudCss : (isLight ? 'rgba(60, 115, 130, 0.70)' : 'rgba(130, 165, 205, 0.70)');
      } else {
        g.fillStyle = isLight ? 'rgba(19, 24, 38, 0.22)' : 'rgba(180, 206, 255, 0.22)';
      }
      g.fillRect(xL, baseY - bh, barW, bh);
      g.fillRect(xR, baseY - bh, barW, bh);
    }
  }

  /* =========================================================================
   * COLOR PSYCHOLOGY SYNC & TOP-LEFT MUSIC-INTERACTIVE KINETIC TYPOGRAPHY
   * ========================================================================= */
  function syncMoodFromSlot(slotIdx) {
    if (!COSMOS.colorPsych || !COSMOS.scene3d) return;
    const isLight = COSMOS.scene3d.getTheme() === 'ether';
    const cv = COSMOS.scene3d.getSlotCoverCanvas(slotIdx);
    const pal = COSMOS.colorPsych.analyzeCoverPsychology(cv, isLight);
    currentMoodPalette = pal;

    // Smoothly morph central 3D orb, armillary rings, halo & tether beam
    COSMOS.scene3d.setMoodPalette(pal);

    // Sync subtle non-glaring CSS mood custom properties
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--mood-primary', pal.hudCss);
    rootStyle.setProperty('--mood-soft', pal.hudSoftCss);
    rootStyle.setProperty('--mood-rim', pal.rimCss);

    if (el.kineticMoodText) {
      el.kineticMoodText.textContent = COSMOS.colorPsych.getMoodLabel(pal, COSMOS.getLang());
    }
  }

  function renderKineticTitle(text) {
    if (!el.kineticTitle) return;
    const clean = (text || 'Musica Universalis').trim();
    const trimmed = clean.length > 26 ? clean.slice(0, 25) + '…' : clean;
    if (trimmed === renderedKineticText) return;
    renderedKineticText = trimmed;

    el.kineticTitle.innerHTML = '';
    kineticGlyphs = [];
    const chars = Array.from(trimmed);
    chars.forEach((ch, idx) => {
      const span = document.createElement('span');
      span.className = 'k-glyph';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.addEventListener('pointerenter', () => { hoverGlyphIdx = idx; });
      el.kineticTitle.appendChild(span);
      kineticGlyphs.push(span);
    });
  }

  function drawMiniWave(timeSec, bass, mid) {
    const cv = el.miniWaveCanvas;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = 96, h = 18;
    if (cv.width !== w * dpr || cv.height !== h * dpr) {
      cv.width = w * dpr;
      cv.height = h * dpr;
    }
    const g = cv.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    const strokeCol = currentMoodPalette ? currentMoodPalette.hudCss : '#8ea8c8';
    const fft = COSMOS.audioEngine.fftData;
    const live = !!(COSMOS.audioEngine.isAnalyserReady() && playing);

    g.beginPath();
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = u * w;
      const env = Math.sin(u * Math.PI);
      let amp;
      if (live) {
        const bin = Math.min(180, Math.floor(u * 90));
        const energy = (fft[bin] / 255) * 0.65 + bass * 0.35;
        amp = Math.sin(u * 11.0 - timeSec * 5.2) * (1.8 + energy * 6.5) * env;
      } else {
        amp = Math.sin(u * 8.0 - timeSec * 1.9) * (1.5 + mid * 2.0) * env;
      }
      const y = h * 0.5 + amp;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokeStyle = strokeCol;
    g.lineWidth = 1.45;
    g.lineCap = 'round';
    g.stroke();
  }

  function animateKineticHud(timeSec, bass, mid) {
    if (detailMode) return;
    const fft = COSMOS.audioEngine.fftData;
    const live = !!(COSMOS.audioEngine.isAnalyserReady() && playing);
    const n = kineticGlyphs.length;

    for (let i = 0; i < n; i++) {
      const span = kineticGlyphs[i];
      let lift = 0;
      let scaleY = 1;

      if (live) {
        const bin = Math.min(200, Math.floor((i / Math.max(1, n)) * 88) + 2);
        const energy = fft[bin] / 255;
        const wave = Math.sin(timeSec * 3.1 - i * 0.42) * (1.2 + bass * 2.6);
        lift = -energy * 5.2 + wave * 0.55;
        scaleY = 1 + energy * 0.08;
      } else {
        lift = Math.sin(timeSec * 1.55 - i * 0.36) * 1.35;
      }

      // Silky Gaussian harp-string ripple under cursor hover
      if (hoverGlyphIdx >= 0) {
        const dist = Math.abs(i - hoverGlyphIdx);
        if (dist <= 3) {
          lift -= Math.exp(-(dist * dist) / 2.2) * 5.4;
        }
      }

      span.style.transform = `translate3d(0, ${lift.toFixed(2)}px, 0) scaleY(${scaleY.toFixed(3)})`;
    }

    if (el.kineticPulseDot) {
      const s = 1 + (live ? bass * 0.65 : Math.sin(timeSec * 2.0) * 0.14);
      el.kineticPulseDot.style.transform = `scale(${s.toFixed(2)})`;
    }

    drawMiniWave(timeSec, bass, mid);
  }

  /* =========================================================================
   * DETAIL INSPECTION DOSSIER & TRACKLIST
   * ========================================================================= */
  function setDetailTab(tabName) {
    detailTab = tabName;
    document.querySelectorAll('.dtab').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.dpane').forEach((p) => {
      p.classList.toggle('active', p.id === 'pane-' + tabName);
    });
  }

  function openDetailForSlot(slotIdx) {
    const s = COSMOS.scene3d.slots[slotIdx];
    if (!s) return;
    detailSlotIdx = slotIdx;
    detailMode = true;

    if (s.trackIdx >= 0 && (s.trackIdx !== currentTrackIdx || !playing)) {
      COSMOS.scene3d.setRetargetLock(true);
      try {
        selectTrack(s.trackIdx, true);
      } finally {
        COSMOS.scene3d.setRetargetLock(false);
      }
    }

    COSMOS.scene3d.openShowcase(slotIdx);
    document.body.classList.add('in-detail');
    renderDossier();
  }

  function closeDetailMode() {
    if (!detailMode) return;
    detailMode = false;
    document.body.classList.remove('in-detail');
    el.videoStageWrap.classList.remove('web-full');
    COSMOS.scene3d.closeShowcase();
  }

  function visibleTracks() {
    const q = (el.search.value || '').trim().toLowerCase();
    return tracks.filter((tr) => {
      if (viewFilter === 'audio' && tr.kind !== 'audio') return false;
      if (viewFilter === 'video' && tr.kind !== 'video') return false;
      return !q || tr.name.toLowerCase().includes(q) || (tr.artist || '').toLowerCase().includes(q) || tr.id.toLowerCase().includes(q);
    });
  }

  function renderTrackList() {
    el.cntAll.textContent = String(tracks.length);
    el.cntAudio.textContent = String(tracks.filter((x) => x.kind === 'audio').length);
    el.cntVideo.textContent = String(tracks.filter((x) => x.kind === 'video').length);

    const list = visibleTracks();
    el.trackListEl.innerHTML = '';

    list.forEach((tr) => {
      const idx = tracks.indexOf(tr);
      const row = document.createElement('div');
      row.className = 'track-row' + (idx === currentTrackIdx ? ' current' : '');

      const num = document.createElement('span');
      num.className = 'tr-num';
      if (idx === currentTrackIdx && playing) {
        num.innerHTML = '<span class="eq"><i></i><i></i><i></i></span>';
      } else {
        num.textContent = String(idx + 1).padStart(2, '0');
      }

      const main = document.createElement('div');
      main.className = 'tr-main';
      const title = document.createElement('div');
      title.className = 'tr-title';
      title.textContent = tr.name;

      const sub = document.createElement('div');
      sub.className = 'tr-sub';
      if (tr.kind === 'video') {
        const tg = document.createElement('span');
        tg.className = 'tag-video';
        tg.textContent = 'VIDEO';
        sub.appendChild(tg);
      } else if (tr.isSynth) {
        const tg = document.createElement('span');
        tg.className = 'tag-synth';
        tg.textContent = 'COSMOS';
        sub.appendChild(tg);
      }
      sub.appendChild(document.createTextNode(tr.id + ' · ' + (tr.artist || COSMOS.t('source.local'))));
      main.appendChild(title);
      main.appendChild(sub);

      const dur = document.createElement('span');
      dur.className = 'tr-dur';
      dur.textContent = tr.duration > 0 ? COSMOS.fmtTime(tr.duration) : '--:--';

      const del = document.createElement('button');
      del.className = 'tr-del';
      del.textContent = '✕';
      del.title = 'Remove';
      if (tr.isSynth) {
        del.style.visibility = 'hidden';
      } else {
        del.addEventListener('click', (ev) => {
          ev.stopPropagation();
          removeTrack(idx);
        });
      }

      row.appendChild(num);
      row.appendChild(main);
      row.appendChild(dur);
      row.appendChild(del);

      row.addEventListener('click', () => {
        selectTrack(idx, true);
        detailSlotIdx = tr.slotIndex;
        COSMOS.scene3d.retargetHeroSlot(tr.slotIndex);
        renderDossier();
      });

      el.trackListEl.appendChild(row);
    });
  }

  function renderDossier() {
    const slotIdx = detailSlotIdx >= 0 ? detailSlotIdx : COSMOS.scene3d.getActiveSlotIdx();
    const s = COSMOS.scene3d.slots[slotIdx];
    if (!s) return;
    const tr = s.trackIdx >= 0 ? tracks[s.trackIdx] : null;

    if (tr) {
      el.cueFileId.textContent = 'SECTOR // ' + tr.id;
      el.dossierId.textContent = 'COSMOS // ' + tr.id + (tr.album ? ' · ' + tr.album : '');
      el.dossierTitle.textContent = tr.name;
      el.dossierArtist.textContent = tr.artist || COSMOS.t('source.local');
      el.metaFormat.textContent = tr.format || 'AUDIO';
      el.metaDuration.textContent = tr.duration > 0 ? COSMOS.fmtTime(tr.duration) : '--:--';
      el.metaOrbit.textContent = s.ringName;
      el.metaSource.textContent = tr.isSynth ? COSMOS.t('source.synth') : COSMOS.t('source.local');
      el.metaSample.textContent = tr.sample || (tr.kind === 'video' ? 'H.264 / AAC' : '44.1 kHz · STEREO');
      const isThisActive = tracks[currentTrackIdx] === tr;
      el.metaMode.textContent = (isThisActive && playing)
        ? COSMOS.t('status.playing')
        : (isThisActive ? COSMOS.t('status.paused') : COSMOS.t('status.standby'));
      el.dossierNotes.textContent = tr.notes || COSMOS.t('notes.local');
      el.dossierLyrics.textContent = tr.lyrics || COSMOS.t('lyrics.localNone');

      el.dossierPlayBtn.style.display = 'inline-block';
      el.dossierPlayBtn.innerHTML = (isThisActive && playing)
        ? '&#9208; ' + COSMOS.t('pauseNow')
        : '&#9654; ' + COSMOS.t('playNow');

      const isCurVideo = isThisActive && tr.kind === 'video';
      el.videoStageWrap.style.display = isCurVideo ? 'block' : 'none';
      el.videoEmptyNote.style.display = isCurVideo ? 'none' : 'block';
      if (isCurVideo && detailTab !== 'video') setDetailTab('video');
    } else {
      const preset = COSMOS.COVER_PRESETS[s.defaultCoverIdx];
      const code = 'S-' + String(s.index + 1).padStart(3, '0');
      el.cueFileId.textContent = 'SECTOR // ' + code;
      el.dossierId.textContent = 'COSMOS // ' + code + ' · STANDBY';
      el.dossierTitle.textContent = preset.title + ' — ' + preset.sub;
      el.dossierArtist.textContent = 'Musica Universalis Celestial Plate';
      el.metaFormat.textContent = 'STAR PLATE';
      el.metaDuration.textContent = '--:--';
      el.metaOrbit.textContent = s.ringName;
      el.metaSource.textContent = 'COSMOS MATRIX';
      el.metaSample.textContent = '512×512 sRGB';
      el.metaMode.textContent = COSMOS.t('status.standby');
      el.dossierNotes.textContent = COSMOS.t('notes.local');
      el.dossierLyrics.textContent = COSMOS.t('lyrics.localNone');
      el.dossierPlayBtn.style.display = 'none';
      el.videoStageWrap.style.display = 'none';
      el.videoEmptyNote.style.display = 'block';
    }

    renderTrackList();
  }

  /* =========================================================================
   * PLAYBACK CONTROLLER
   * ========================================================================= */
  function activeTrack() {
    return currentTrackIdx >= 0 && currentTrackIdx < tracks.length ? tracks[currentTrackIdx] : null;
  }

  function activeMediaEl() {
    const tr = activeTrack();
    return tr && tr.kind === 'video' ? el.videoEl : COSMOS.audioEngine.audioEl;
  }

  function currentTimeSec() {
    const tr = activeTrack();
    if (!tr) return 0;
    if (tr.isSynth) return COSMOS.audioEngine.synthPlayer.currentTime();
    return activeMediaEl().currentTime || 0;
  }

  function currentDurationSec() {
    const tr = activeTrack();
    if (!tr) return 0;
    if (tr.isSynth) return tr.duration;
    const m = activeMediaEl();
    return (isFinite(m.duration) && m.duration > 0) ? m.duration : (tr.duration || 0);
  }

  function syncPlaybarInfo() {
    const tr = activeTrack();
    if (!tr) return;
    el.pbThumb.src = getSlotCoverDataUrl(tr.slotIndex);
    el.pbTitle.textContent = tr.name;
    el.pbSub.textContent = tr.id + ' · ' + (tr.artist || COSMOS.t('source.local'));
    el.playBtn.textContent = playing ? '\u23F8' : '\u25B6';
    el.vPlayBtn.textContent = playing ? '\u23F8' : '\u25B6';
    document.body.classList.toggle('is-playing', playing);
    renderKineticTitle(tr.name);
    if (el.kineticArtist) el.kineticArtist.textContent = tr.artist || COSMOS.t('source.local');
    if (el.kineticStateBadge) {
      el.kineticStateBadge.textContent = playing ? COSMOS.t('status.playing') : COSMOS.t('status.standby');
    }
  }

  function syncProgressUI() {
    const cur = currentTimeSec();
    const dur = currentDurationSec();
    const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;
    el.progressFill.style.width = pct + '%';
    el.progressThumb.style.left = pct + '%';
    el.vFill.style.width = pct + '%';
    el.vThumb.style.left = pct + '%';
    const curS = COSMOS.fmtTime(cur);
    const durS = dur > 0 ? COSMOS.fmtTime(dur) : '--:--';
    el.timeReadout.textContent = curS + ' / ' + durS;
    el.vCur.textContent = curS;
    el.vDur.textContent = durS;
    const tr = activeTrack();
    if (tr && !tr.isSynth && dur > 0) tr.duration = dur;
  }

  function selectTrack(idx, autoplay) {
    if (idx < 0 || idx >= tracks.length) return;
    COSMOS.audioEngine.synthPlayer.stop();
    COSMOS.audioEngine.audioEl.pause();
    el.videoEl.pause();

    currentTrackIdx = idx;
    const tr = tracks[idx];
    COSMOS.scene3d.focusSlot(tr.slotIndex);
    syncMoodFromSlot(tr.slotIndex);

    const vol = Number(el.volSlider.value) || 0.72;

    if (tr.isSynth) {
      COSMOS.audioEngine.audioEl.src = '';
      el.videoEl.src = '';
      COSMOS.audioEngine.synthPlayer.offsetSec = 0;
      if (autoplay) {
        COSMOS.audioEngine.synthPlayer.play(tr, 0, vol);
        playing = true;
      } else {
        playing = false;
      }
    } else if (tr.kind === 'video') {
      COSMOS.audioEngine.audioEl.src = '';
      el.videoEl.src = tr.url;
      try { el.videoEl.currentTime = 0; } catch (e) {}
      if (autoplay) {
        COSMOS.audioEngine.ensureAudioContext(vol);
        el.videoEl.play()
          .then(() => { playing = true; syncPlaybarInfo(); renderDossier(); })
          .catch(() => { playing = false; syncPlaybarInfo(); });
      } else {
        playing = false;
      }
    } else {
      el.videoEl.src = '';
      COSMOS.audioEngine.audioEl.src = tr.url;
      try { COSMOS.audioEngine.audioEl.currentTime = 0; } catch (e) {}
      if (autoplay) {
        COSMOS.audioEngine.ensureAudioContext(vol);
        COSMOS.audioEngine.audioEl.play()
          .then(() => { playing = true; syncPlaybarInfo(); renderDossier(); })
          .catch(() => { playing = false; syncPlaybarInfo(); });
      } else {
        playing = false;
      }
    }

    syncPlaybarInfo();
    syncProgressUI();
    if (detailMode) {
      detailSlotIdx = tr.slotIndex;
      COSMOS.scene3d.retargetHeroSlot(tr.slotIndex);
      renderDossier();
    } else {
      renderTrackList();
    }
  }

  function togglePlay() {
    const tr = activeTrack();
    if (!tr) {
      if (tracks.length) selectTrack(0, true);
      return;
    }
    const vol = Number(el.volSlider.value) || 0.72;
    COSMOS.audioEngine.ensureAudioContext(vol);

    if (tr.isSynth) {
      if (playing) {
        COSMOS.audioEngine.synthPlayer.pause();
        playing = false;
      } else {
        COSMOS.audioEngine.synthPlayer.play(tr, COSMOS.audioEngine.synthPlayer.offsetSec, vol);
        playing = true;
      }
      syncPlaybarInfo();
      renderDossier();
      return;
    }

    const m = activeMediaEl();
    if (playing) {
      m.pause();
      playing = false;
      syncPlaybarInfo();
      renderDossier();
    } else {
      m.play().then(() => {
        playing = true;
        syncPlaybarInfo();
        renderDossier();
      }).catch(() => {});
    }
  }

  function nextTrackIdx() {
    const n = tracks.length;
    if (!n) return -1;
    if (mode === 'one') return currentTrackIdx;
    if (mode === 'shuffle') {
      if (n === 1) return currentTrackIdx;
      let r = currentTrackIdx;
      while (r === currentTrackIdx) r = Math.floor(Math.random() * n);
      return r;
    }
    if (currentTrackIdx + 1 < n) return currentTrackIdx + 1;
    return mode === 'loop' ? 0 : -1;
  }

  function prevTrackIdx() {
    const n = tracks.length;
    if (!n) return -1;
    if (mode === 'one') return currentTrackIdx;
    if (mode === 'shuffle') {
      if (n === 1) return currentTrackIdx;
      let r = currentTrackIdx;
      while (r === currentTrackIdx) r = Math.floor(Math.random() * n);
      return r;
    }
    return (currentTrackIdx - 1 + n) % n;
  }

  function stepTrack(dir) {
    const idx = dir > 0 ? nextTrackIdx() : prevTrackIdx();
    if (idx < 0) {
      if (playing) togglePlay();
      return;
    }
    selectTrack(idx, true);
  }

  function onTrackEnded() {
    if (mode === 'one') {
      selectTrack(currentTrackIdx, true);
      return;
    }
    const idx = nextTrackIdx();
    if (idx < 0) {
      playing = false;
      COSMOS.audioEngine.synthPlayer.stop();
      syncPlaybarInfo();
      renderDossier();
      return;
    }
    selectTrack(idx, true);
  }

  function cycleMode() {
    const order = ['list', 'loop', 'one', 'shuffle'];
    mode = order[(order.indexOf(mode) + 1) % order.length];
    el.modeBtn.textContent = COSMOS.t('mode.' + mode);
  }

  /* =========================================================================
   * LOCAL FILE IMPORT & CUSTOM COVER ART HANDLING
   * ========================================================================= */
  const AUDIO_RE = /\.(mp3|flac|wav|ogg|oga|opus|m4a|aac|aif|aiff|webm)$/i;
  const VIDEO_RE = /\.(mp4|ogv|mov|m4v)$/i;
  const IMG_RE = /\.(png|jpe?g|webp|gif|bmp)$/i;

  function classifyFile(file) {
    const tp = (file.type || '').toLowerCase();
    const nm = (file.name || '').toLowerCase();
    if (tp.startsWith('image/') || IMG_RE.test(nm)) return 'image';
    if (tp.startsWith('video/') || VIDEO_RE.test(nm)) return 'video';
    if (tp.startsWith('audio/') || AUDIO_RE.test(nm)) return 'audio';
    return null;
  }

  function allocateTrackSlot() {
    const used = new Set(tracks.map((x) => x.slotIndex));
    const order = COSMOS.scene3d.TRACK_SLOT_ORDER;
    for (let i = 0; i < order.length; i++) {
      if (!used.has(order[i])) return order[i];
    }
    return 0;
  }

  async function importFiles(fileList) {
    if (!fileList || !fileList.length) return;
    const files = Array.from(fileList);

    if (detailMode && files.length === 1 && classifyFile(files[0]) === 'image') {
      const url = URL.createObjectURL(files[0]);
      const cov = await COSMOS.createCoverMaterialFromUrl(url);
      URL.revokeObjectURL(url);
      if (cov) {
        applyCustomCoverToSlot(detailSlotIdx, cov);
        showToast(COSMOS.t('toast.coverUpdated'));
      }
      return;
    }

    let firstIdx = -1;
    let count = 0;

    for (const file of files) {
      const kind = classifyFile(file);
      if (kind !== 'audio' && kind !== 'video') continue;

      let url;
      try { url = URL.createObjectURL(file); } catch (e) { continue; }

      localSeq += 1;
      const slotIdx = allocateTrackSlot();
      const fallbackName = (file.name || '').replace(/\.[^.]+$/, '') || file.name;
      const ext = ((file.name || '').split('.').pop() || 'FILE').toUpperCase();

      const meta = await COSMOS.audioEngine.extractEmbeddedMetadata(file);

      const entry = {
        id: 'MU-' + String(localSeq).padStart(3, '0'),
        slotIndex: slotIdx,
        name: meta.title || fallbackName,
        artist: meta.artist || COSMOS.t('source.local'),
        album: meta.album || '',
        year: meta.year || '',
        kind: kind,
        isSynth: false,
        format: ext,
        size: COSMOS.fmtSize(file.size),
        sample: kind === 'video' ? 'HOLO VIDEO STREAM' : '44.1 / 48 kHz',
        duration: 0,
        url: url,
        coverDataUrl: null,
      };

      const idx = tracks.push(entry) - 1;
      COSMOS.scene3d.slots[slotIdx].trackIdx = idx;
      count += 1;
      if (firstIdx < 0) firstIdx = idx;

      if (meta.coverBlob) {
        const covUrl = URL.createObjectURL(meta.coverBlob);
        const covObj = await COSMOS.createCoverMaterialFromUrl(covUrl);
        URL.revokeObjectURL(covUrl);
        if (covObj) applyCustomCoverToSlot(slotIdx, covObj);
      } else if (kind === 'video') {
        COSMOS.audioEngine.captureVideoThumbnail(url).then(async (thumbUrl) => {
          if (thumbUrl) {
            const covObj = await COSMOS.createCoverMaterialFromUrl(thumbUrl);
            if (covObj) applyCustomCoverToSlot(slotIdx, covObj);
          }
        });
      }

      try {
        const probe = document.createElement(kind === 'video' ? 'video' : 'audio');
        probe.preload = 'metadata';
        probe.src = url;
        probe.addEventListener('loadedmetadata', function onM() {
          if (isFinite(probe.duration) && probe.duration > 0) {
            entry.duration = probe.duration;
            renderTrackList();
            if (tracks[currentTrackIdx] === entry) syncProgressUI();
          }
          probe.removeEventListener('loadedmetadata', onM);
          probe.src = '';
        });
      } catch (e) {}
    }

    if (firstIdx >= 0) {
      renderTrackList();
      showToast(COSMOS.t('toast.imported').replace('{n}', String(count)));
      selectTrack(firstIdx, true);
      if (tracks[firstIdx].kind === 'video') {
        openDetailForSlot(tracks[firstIdx].slotIndex);
        setDetailTab('video');
      }
    }
  }

  function applyCustomCoverToSlot(slotIdx, coverObj) {
    COSMOS.scene3d.setSlotCover(slotIdx, coverObj);
    const s = COSMOS.scene3d.slots[slotIdx];
    if (s && s.trackIdx >= 0 && tracks[s.trackIdx]) {
      tracks[s.trackIdx].coverDataUrl = coverObj.dataUrl;
    }
    syncPlaybarInfo();
    if (slotIdx === COSMOS.scene3d.getActiveSlotIdx()) syncMoodFromSlot(slotIdx);
  }

  function removeTrack(idx) {
    if (idx < 0 || idx >= tracks.length) return;
    const tr = tracks[idx];
    if (tr.isSynth) return;
    if (tr.url) { try { URL.revokeObjectURL(tr.url); } catch (e) {} }

    COSMOS.scene3d.resetSlotCover(tr.slotIndex);
    tracks.splice(idx, 1);
    tracks.forEach((item, newI) => {
      if (COSMOS.scene3d.slots[item.slotIndex]) {
        COSMOS.scene3d.slots[item.slotIndex].trackIdx = newI;
      }
    });

    if (idx === currentTrackIdx) {
      selectTrack(Math.min(idx, tracks.length - 1), false);
    } else if (idx < currentTrackIdx) {
      currentTrackIdx -= 1;
    }
    renderDossier();
  }

  /* =========================================================================
   * IMMERSIVE PLAYBAR SLIDE-DOWN / PULL-UP GESTURES
   * ========================================================================= */
  function setPlaybarHidden(hidden, silent) {
    playbarHidden = !!hidden;
    if (el.playbar) {
      el.playbar.classList.remove('is-dragging');
      el.playbar.style.transform = '';
      el.playbar.style.opacity = '';
    }
    document.body.classList.toggle('playbar-hidden', playbarHidden);
    if (!silent) {
      showToast(playbarHidden ? COSMOS.t('toast.immersiveOn') : COSMOS.t('toast.immersiveOff'));
    }
  }

  function bindPlaybarSlideGestures() {
    const bar = el.playbar;
    const handle = el.playbarHandle;
    const restore = el.playbarRestore;
    if (!bar || !handle || !restore) return;

    // 1. Drag down on the top handle or playbar background (or simply click the handle) to enter Immersive Mode
    let dragging = false;
    let startY = 0;
    let lastDy = 0;
    let startedOnHandle = false;

    function onBarDown(ev) {
      if (ev.button !== 0 || playbarHidden) return;
      if (ev.target.closest('button, input, select, .razor-progress, .pb-left')) return;
      dragging = true;
      startedOnHandle = !!ev.target.closest('.pb-handle');
      startY = ev.clientY;
      lastDy = 0;
      bar.classList.add('is-dragging');
      try { bar.setPointerCapture(ev.pointerId); } catch (e) {}
    }

    function onBarMove(ev) {
      if (!dragging) return;
      const dy = Math.max(0, ev.clientY - startY);
      lastDy = dy;
      if (dy > 2) {
        bar.style.transform = `translateY(${dy}px)`;
        const fade = Math.max(0.12, 1 - dy / 130);
        bar.style.opacity = fade.toFixed(3);
      }
    }

    function onBarUp() {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove('is-dragging');
      if (lastDy > 28 || (startedOnHandle && lastDy < 6)) {
        setPlaybarHidden(true, false);
      } else {
        bar.style.transform = '';
        bar.style.opacity = '';
      }
    }

    bar.addEventListener('pointerdown', onBarDown);
    bar.addEventListener('pointermove', onBarMove);
    bar.addEventListener('pointerup', onBarUp);
    bar.addEventListener('pointercancel', onBarUp);

    handle.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        setPlaybarHidden(true, false);
      }
    });

    // 2. Restore pill: click OR swipe upward to smoothly slide the playbar back up
    let rDrag = false;
    let rStartY = 0;
    let rDy = 0;

    restore.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      rDrag = true;
      rStartY = ev.clientY;
      rDy = 0;
      try { restore.setPointerCapture(ev.pointerId); } catch (e) {}
    });

    restore.addEventListener('pointermove', (ev) => {
      if (!rDrag) return;
      rDy = ev.clientY - rStartY;
      if (rDy < -20) {
        rDrag = false;
        setPlaybarHidden(false, false);
      }
    });

    restore.addEventListener('pointerup', () => {
      if (!rDrag) return;
      rDrag = false;
      if (Math.abs(rDy) < 12) setPlaybarHidden(false, false);
    });

    restore.addEventListener('pointercancel', () => { rDrag = false; });

    restore.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        setPlaybarHidden(false, false);
      }
    });
  }

  /* =========================================================================
   * UI BINDINGS, SEEKBAR, I18N & BOOT
   * ========================================================================= */
  function bindSeekBar(barEl) {
    let dragging = false;
    function applySeek(ev) {
      const rect = barEl.getBoundingClientRect();
      if (!rect.width) return;
      const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      const dur = currentDurationSec();
      if (dur <= 0) return;
      const target = ratio * dur;
      const tr = activeTrack();
      if (tr && tr.isSynth) {
        COSMOS.audioEngine.synthPlayer.seek(target, Number(el.volSlider.value) || 0.72);
      } else if (tr) {
        activeMediaEl().currentTime = target;
      }
      syncProgressUI();
    }
    barEl.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      dragging = true;
      try { barEl.setPointerCapture(ev.pointerId); } catch (e) {}
      applySeek(ev);
    });
    barEl.addEventListener('pointermove', (ev) => { if (dragging) applySeek(ev); });
    barEl.addEventListener('pointerup', () => { dragging = false; });
    barEl.addEventListener('pointercancel', () => { dragging = false; });
  }

  function applyI18n() {
    document.documentElement.lang = COSMOS.getLang();
    el.langSel.value = COSMOS.getLang();
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = COSMOS.t(node.getAttribute('data-i18n'));
    });
    el.search.placeholder = COSMOS.t('search');
    el.modeBtn.textContent = COSMOS.t('mode.' + mode);
    el.loaderSub.textContent = COSMOS.t('loader.sub');
    if (el.kineticTitle) el.kineticTitle.title = COSMOS.t('kinetic.tip');
    if (currentMoodPalette && el.kineticMoodText) {
      el.kineticMoodText.textContent = COSMOS.colorPsych.getMoodLabel(currentMoodPalette, COSMOS.getLang());
    }
    syncPlaybarInfo();
    renderDossier();
  }

  function bindUIEvents() {
    bindSeekBar(el.progressBar);
    bindSeekBar(el.vProgress);
    bindPlaybarSlideGestures();

    el.playBtn.addEventListener('click', togglePlay);
    if (el.kineticTitle) {
      el.kineticTitle.addEventListener('pointerleave', () => { hoverGlyphIdx = -1; });
      const triggerKineticPlay = () => {
        togglePlay();
        COSMOS.scene3d.triggerCorePulse();
        el.kineticTitle.classList.add('pulse-flash');
        setTimeout(() => el.kineticTitle.classList.remove('pulse-flash'), 340);
      };
      el.kineticTitle.addEventListener('click', triggerKineticPlay);
      el.kineticTitle.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); triggerKineticPlay(); }
      });
    }
    if (el.kineticArtist) {
      el.kineticArtist.addEventListener('click', () => {
        openDetailForSlot(COSMOS.scene3d.getActiveSlotIdx());
      });
    }
    el.vPlayBtn.addEventListener('click', togglePlay);
    el.prevBtn.addEventListener('click', () => stepTrack(-1));
    el.nextBtn.addEventListener('click', () => stepTrack(1));
    el.modeBtn.addEventListener('click', cycleMode);

    el.volSlider.addEventListener('input', () => {
      COSMOS.audioEngine.setVolume(Number(el.volSlider.value));
    });

    el.pbTrackTrigger.addEventListener('click', () => {
      const actSlot = COSMOS.scene3d.getActiveSlotIdx();
      if (detailMode && detailSlotIdx === actSlot) closeDetailMode();
      else openDetailForSlot(actSlot);
    });

    el.backBtn.addEventListener('click', closeDetailMode);

    el.dossierPlayBtn.addEventListener('click', () => {
      const s = COSMOS.scene3d.slots[detailSlotIdx];
      if (!s || s.trackIdx < 0) return;
      if (s.trackIdx === currentTrackIdx) togglePlay();
      else selectTrack(s.trackIdx, true);
    });

    el.changeCoverBtn.addEventListener('click', () => el.coverInput.click());
    el.coverInput.addEventListener('change', async () => {
      const f = el.coverInput.files && el.coverInput.files[0];
      el.coverInput.value = '';
      if (!f) return;
      const url = URL.createObjectURL(f);
      const cov = await COSMOS.createCoverMaterialFromUrl(url);
      URL.revokeObjectURL(url);
      if (cov) {
        const target = detailSlotIdx >= 0 ? detailSlotIdx : COSMOS.scene3d.getActiveSlotIdx();
        applyCustomCoverToSlot(target, cov);
        showToast(COSMOS.t('toast.coverUpdated'));
      }
    });

    document.querySelectorAll('.dtab').forEach((btn) => {
      btn.addEventListener('click', () => setDetailTab(btn.getAttribute('data-tab')));
    });

    document.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewFilter = btn.getAttribute('data-view');
        document.querySelectorAll('.pill-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderTrackList();
        if (!detailMode) {
          openDetailForSlot(COSMOS.scene3d.getActiveSlotIdx());
          setDetailTab('tracks');
        }
      });
    });

    el.search.addEventListener('input', () => {
      renderTrackList();
      if (el.search.value.trim() && !detailMode) {
        openDetailForSlot(COSMOS.scene3d.getActiveSlotIdx());
        setDetailTab('tracks');
      }
    });

    el.orbitBtn.addEventListener('click', () => {
      const on = COSMOS.scene3d.toggleAutoOrbit();
      el.orbitBtn.classList.toggle('active', on);
      showToast(on ? COSMOS.t('toast.orbitOn') : COSMOS.t('toast.orbitOff'));
    });

    el.resetCamBtn.addEventListener('click', () => {
      COSMOS.scene3d.resetCamera();
      showToast(COSMOS.t('toast.camReset'));
    });

    el.themeBtn.addEventListener('click', () => {
      const next = COSMOS.scene3d.getTheme() === 'cosmos' ? 'ether' : 'cosmos';
      COSMOS.scene3d.applyTheme(next);
      el.themeLabel.textContent = next === 'ether' ? 'ETHER' : 'COSMOS';
      syncMoodFromSlot(COSMOS.scene3d.getActiveSlotIdx());
      showToast(next === 'ether' ? COSMOS.t('toast.themeEther') : COSMOS.t('toast.themeCosmos'));
    });

    el.langSel.addEventListener('change', () => {
      COSMOS.setLang(el.langSel.value);
      applyI18n();
    });

    el.importBtn.addEventListener('click', () => el.fileInput.click());
    el.fileInput.addEventListener('change', () => {
      importFiles(el.fileInput.files);
      el.fileInput.value = '';
    });

    el.vWebFsBtn.addEventListener('click', () => el.videoStageWrap.classList.toggle('web-full'));
    el.vFsBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        try { document.exitFullscreen(); } catch (e) {}
      } else {
        try { el.videoStageWrap.requestFullscreen(); } catch (e) {}
      }
    });

    let dragDepth = 0;
    global.addEventListener('dragenter', (ev) => {
      ev.preventDefault();
      dragDepth++;
      el.dropOverlay.classList.add('active');
    });
    global.addEventListener('dragover', (ev) => ev.preventDefault());
    global.addEventListener('dragleave', (ev) => {
      ev.preventDefault();
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) el.dropOverlay.classList.remove('active');
    });
    global.addEventListener('drop', (ev) => {
      ev.preventDefault();
      dragDepth = 0;
      el.dropOverlay.classList.remove('active');
      if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) {
        importFiles(ev.dataTransfer.files);
      }
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'TEXTAREA')) return;
      if (ev.key === 'h' || ev.key === 'H') {
        setPlaybarHidden(!playbarHidden, false);
        return;
      }
      if (ev.key === 'Escape') {
        if (el.videoStageWrap.classList.contains('web-full')) {
          el.videoStageWrap.classList.remove('web-full');
        } else if (detailMode) {
          closeDetailMode();
        } else if (playbarHidden) {
          setPlaybarHidden(false, false);
        }
        return;
      }
      if (ev.key === ' ' || ev.code === 'Space') {
        ev.preventDefault();
        togglePlay();
      } else if (ev.key === 'ArrowRight') {
        if (detailMode) {
          const target = Math.min(currentDurationSec(), currentTimeSec() + 5);
          const tr = activeTrack();
          if (tr && tr.isSynth) COSMOS.audioEngine.synthPlayer.seek(target, Number(el.volSlider.value) || 0.72);
          else if (tr) activeMediaEl().currentTime = target;
          syncProgressUI();
        } else {
          COSMOS.scene3d.nudgeAzimuth(-0.24);
        }
      } else if (ev.key === 'ArrowLeft') {
        if (detailMode) {
          const target = Math.max(0, currentTimeSec() - 5);
          const tr = activeTrack();
          if (tr && tr.isSynth) COSMOS.audioEngine.synthPlayer.seek(target, Number(el.volSlider.value) || 0.72);
          else if (tr) activeMediaEl().currentTime = target;
          syncProgressUI();
        } else {
          COSMOS.scene3d.nudgeAzimuth(0.24);
        }
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        stepTrack(-1);
      } else if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        stepTrack(1);
      }
    });

    global.setInterval(() => { if (playing) syncProgressUI(); }, 250);
  }

  function mountBuiltinTracks() {
    COSMOS.BUILTIN_TRACKS.forEach((b, i) => {
      const slotIdx = COSMOS.scene3d.TRACK_SLOT_ORDER[i];
      const entry = Object.assign({}, b, {
        slotIndex: slotIdx,
        coverDataUrl: COSMOS.coverLibrary[b.coverIdx].dataUrl,
      });
      const idx = tracks.push(entry) - 1;
      const s = COSMOS.scene3d.slots[slotIdx];
      if (s) {
        s.trackIdx = idx;
        s.defaultCoverIdx = b.coverIdx;
        s.coverMesh.material = COSMOS.coverLibrary[b.coverIdx].material;
      }
    });
    currentTrackIdx = 0;
    COSMOS.scene3d.setActiveSlotIdx(tracks[0].slotIndex);
  }

  function boot() {
    COSMOS.audioEngine.bindVideoElement(el.videoEl);
    COSMOS.audioEngine.setOnEnded(onTrackEnded);

    COSMOS.initCoverLibrary();
    COSMOS.scene3d.init(el, {
      onSlotClick: openDetailForSlot,
      getTrackByIndex: (i) => tracks[i] || null,
      isPlaying: () => playing,
      onFrameUpdate: (timeSec, bass, mid) => { drawVisualizer(timeSec); animateKineticHud(timeSec, bass || 0, mid || 0); },
    });

    mountBuiltinTracks();
    syncMoodFromSlot(tracks[0].slotIndex);
    bindUIEvents();
    applyI18n();
    syncPlaybarInfo();
    syncProgressUI();

    global.setTimeout(() => {
      el.loader.classList.add('done');
      global.setTimeout(() => {
        if (el.loader && el.loader.parentNode) el.loader.parentNode.removeChild(el.loader);
      }, 580);
    }, 1050);
  }

  if (document.readyState === 'complete') boot();
  else global.addEventListener('load', boot);
})(window);
