/* RHINE LAB · AUDIO ARCHIVE — ANALYSIS OS 3D
   Application script, split out of the single-file build (index.single.html).
   No code was changed: this is the exact inline <script> body, dedented.
   Requires three.js r128 (loaded by index.html before this file). */

/**
 * RHINE LAB · AUDIO ARCHIVE — ANALYSIS OS 3D
 * Single-file Three.js r128 endless angled album-rack media player with:
 * - Toroidal zero-edge 3D cartridge matrix (InstancedMesh ceramic/glass frames + glossy cover faces)
 * - Spring pull-out cover reveal + warm amber light spill + 3D-to-2D projected Rhine Lab reticle
 * - Frameless 3D Detail Inspection Mode with interactive drag-to-tilt cover preview
 * - Dual CERAMIC / OBSIDIAN real-time themes
 * - Pure JS ID3v2 / MP4-M4A / FLAC cover & metadata extraction + video frame thumbnailing
 * - 6 built-in playable Web Audio procedural ambient/electronic synth tracks + 18 procedural covers
 */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* =========================================================================
   * 1. TRILINGUAL I18N (zh-TW default, zh-CN, en)
   * ========================================================================= */
  const I18N = {
    'zh-TW': {
      'nav.all': '全部', 'nav.audio': '音樂', 'nav.video': '影片',
      'import': '導入', 'search': '搜尋檔案...',
      'backRack': '返回檔案架', 'dragCue': '拖動卡片，查看完整封面',
      'tab.tracks': '歌單', 'tab.details': '檔案詳情', 'tab.lyrics': '歌詞', 'tab.video': '影像',
      'changeCover': '更換封面', 'playNow': '播放', 'pauseNow': '暫停',
      'meta.format': '格式', 'meta.duration': '時長', 'meta.size': '大小',
      'meta.source': '來源', 'meta.sample': '編碼', 'meta.mode': '狀態',
      'mode.list': '順序', 'mode.loop': '循環', 'mode.one': '單曲', 'mode.shuffle': '隨機',
      'webFull': '網頁全屏', 'full': '全屏',
      'videoEmpty': '目前檔案為音訊格式。導入本地影片檔即可於此播放無邊框影像。',
      'drop.title': '掛載本地媒體至萊茵三維檔案架',
      'drop.sub': '鬆開以自動解析封面與音訊 / 影片檔案（詳情模式可直接拖入圖片更換封面）',
      'loader.sub': '正在初始化萊茵三維檔案…',
      'status.playing': '正在播放', 'status.standby': '待機就緒', 'status.paused': '已暫停',
      'source.local': '本地檔案', 'source.synth': '萊茵核心合成',
      'lyrics.localNone': '本地音訊檔案未檢出內嵌歌詞。\n檔案已完整掛載至萊茵三維資料艙體。',
      'notes.local': '本地媒體檔案已由 ANALYSIS OS 完成元資料索引與光學封裝。\n拖動左側三維卡片即可檢視立體封面細節，或點擊「更換封面」自訂封套影像。',
      'toast.imported': '已解析並掛載 {n} 個檔案至三維檔案架',
      'toast.coverUpdated': '已更新目前檔案艙體封面',
      'toast.themeCeramic': '已切換至 RHINE CERAMIC 陶瓷模式',
      'toast.themeObsidian': '已切換至 OBSIDIAN ARCHIVE 曜石模式',
    },
    'zh-CN': {
      'nav.all': '全部', 'nav.audio': '音乐', 'nav.video': '视频',
      'import': '导入', 'search': '搜索档案...',
      'backRack': '返回档案架', 'dragCue': '拖动卡片，查看完整封面',
      'tab.tracks': '歌单', 'tab.details': '档案详情', 'tab.lyrics': '歌词', 'tab.video': '影像',
      'changeCover': '更换封面', 'playNow': '播放', 'pauseNow': '暂停',
      'meta.format': '格式', 'meta.duration': '时长', 'meta.size': '大小',
      'meta.source': '来源', 'meta.sample': '编码', 'meta.mode': '状态',
      'mode.list': '顺序', 'mode.loop': '循环', 'mode.one': '单曲', 'mode.shuffle': '随机',
      'webFull': '网页全屏', 'full': '全屏',
      'videoEmpty': '当前档案为音频格式。导入本地视频文件即可在此播放无边框影像。',
      'drop.title': '挂载本地媒体至莱茵三维档案架',
      'drop.sub': '松开以自动解析封面与音频 / 视频文件（详情模式可直接拖入图片更换封面）',
      'loader.sub': '正在初始化莱茵三维档案…',
      'status.playing': '正在播放', 'status.standby': '待机就绪', 'status.paused': '已暂停',
      'source.local': '本地文件', 'source.synth': '莱茵核心合成',
      'lyrics.localNone': '本地音频文件未检出内嵌歌词。\n档案已完整挂载至莱茵三维数据舱体。',
      'notes.local': '本地媒体文件已由 ANALYSIS OS 完成元数据索引与光学封装。\n拖动左侧三维卡片即可检视立体封面细节，或点击「更换封面」自定义封套图像。',
      'toast.imported': '已解析并挂载 {n} 个文件至三维档案架',
      'toast.coverUpdated': '已更新当前档案舱体封面',
      'toast.themeCeramic': '已切换至 RHINE CERAMIC 陶瓷模式',
      'toast.themeObsidian': '已切换至 OBSIDIAN ARCHIVE 曜石模式',
    },
    'en': {
      'nav.all': 'ALL', 'nav.audio': 'AUDIO', 'nav.video': 'VIDEO',
      'import': 'IMPORT', 'search': 'Search archive...',
      'backRack': 'BACK TO RACK', 'dragCue': 'Drag cartridge to inspect full artwork',
      'tab.tracks': 'TRACKS', 'tab.details': 'DOSSIER', 'tab.lyrics': 'LYRICS', 'tab.video': 'VIDEO',
      'changeCover': 'SET COVER', 'playNow': 'PLAY', 'pauseNow': 'PAUSE',
      'meta.format': 'FORMAT', 'meta.duration': 'DURATION', 'meta.size': 'SIZE',
      'meta.source': 'SOURCE', 'meta.sample': 'ENCODING', 'meta.mode': 'STATUS',
      'mode.list': 'SEQ', 'mode.loop': 'LOOP', 'mode.one': 'ONE', 'mode.shuffle': 'SHUF',
      'webFull': 'WEB FULL', 'full': 'FULLSCREEN',
      'videoEmpty': 'Active file is audio-only. Import any local video to monitor here.',
      'drop.title': 'MOUNT LOCAL MEDIA TO 3D RACK',
      'drop.sub': 'Drop audio/video files to auto-extract covers (or drop an image in Detail Mode)',
      'loader.sub': 'INITIALIZING ARCHIVE…',
      'status.playing': 'PLAYING', 'status.standby': 'STANDBY', 'status.paused': 'PAUSED',
      'source.local': 'LOCAL FILE', 'source.synth': 'RHINE SYNTH CORE',
      'lyrics.localNone': 'No embedded lyrics detected in local media.\nAudio telemetry remains active.',
      'notes.local': 'Local archive indexed by ANALYSIS OS.\nDrag the 3D showcase cartridge on the left to inspect its cover sleeve, or click SET COVER to assign custom artwork.',
      'toast.imported': 'INDEXED {n} FILE(S) INTO 3D ARCHIVE',
      'toast.coverUpdated': 'CARTRIDGE ARTWORK UPDATED',
      'toast.themeCeramic': 'THEME: RHINE CERAMIC',
      'toast.themeObsidian': 'THEME: OBSIDIAN ARCHIVE',
    },
  };

  let lang = (function () {
    try { return localStorage.getItem('rhine3d:lang') || 'zh-TW'; }
    catch (e) { return 'zh-TW'; }
  })();

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N['zh-TW'][key] || key;
  }

  /* =========================================================================
   * 2. DOM ELEMENTS & TOAST
   * ========================================================================= */
  const el = {
    loader: $('#loader'),
    loaderSub: $('#loaderSub'),
    threeCanvas: $('#threeCanvas'),
    showcaseCanvas: $('#showcaseCanvas'),
    search: $('#search'),
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
    metaSize: $('#metaSize'),
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
    dropOverlay: $('#dropOverlay'),
    hudToast: $('#hudToast'),
  };

  let toastTimer = null;
  function showToast(msg) {
    el.hudToast.textContent = msg;
    el.hudToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.hudToast.classList.remove('show'), 2300);
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function fmtSize(bytes) {
    if (!bytes || bytes <= 0) return 'REALTIME';
    const u = ['B', 'KB', 'MB', 'GB'];
    let v = bytes, i = 0;
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    return (v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)) + ' ' + u[i];
  }

  /* =========================================================================
   * 3. 18 BESPOKE HIGH-RES (512x512) PROCEDURAL GRAPHIC ALBUM COVERS
   * ========================================================================= */
  const COVER_PRESETS = [
    { code: 'RL-001', title: 'ALABASTER', sub: 'HORIZON', style: 'bauhaus', pal: ['#f0ebe1', '#18191d', '#ff7b00', '#d8cfc0'] },
    { code: 'RL-002', title: 'ORIGINIUM', sub: 'RESONANCE', style: 'orbital', pal: ['#0d1528', '#ff7b00', '#38bdf8', '#e2e8f0'] },
    { code: 'RL-003', title: 'ZERO-G', sub: 'CRYO', style: 'melodrama', pal: ['#0b1340', '#2563eb', '#f43f5e', '#93c5fd'] },
    { code: 'RL-004', title: 'HELIOS', sub: 'VECTOR 04', style: 'prism', pal: ['#18121e', '#f59e0b', '#ef4444', '#fef3c7'] },
    { code: 'RL-005', title: 'CERAMIC', sub: 'ECHO', style: 'botanical', pal: ['#e6ece8', '#1e3a34', '#84cc16', '#f7faf8'] },
    { code: 'RL-006', title: 'STAR-POD', sub: 'LULLABY', style: 'eclipse', pal: ['#141824', '#f97316', '#fcd34d', '#f8fafc'] },
    { code: 'X-007', title: 'TRIMOUNT', sub: 'SECTOR 07', style: 'swiss', pal: ['#e84a27', '#151515', '#f3ede2', '#fbbf24'] },
    { code: 'X-008', title: 'AZURE', sub: 'NOCTURNE', style: 'melodrama', pal: ['#0f172a', '#6366f1', '#ec4899', '#c4b5fd'] },
    { code: 'X-009', title: 'MONOLITH', sub: 'ARCHIVE', style: 'monolith', pal: ['#d6d1c7', '#1c1d21', '#ff7b00', '#f4f1ea'] },
    { code: 'X-010', title: 'SOLARIS', sub: 'CHAMBER', style: 'sunburst', pal: ['#fef2e4', '#d9480f', '#1c1917', '#f59f00'] },
    { code: 'X-011', title: 'CYANOTYPE', sub: 'FLORA 11', style: 'botanical', pal: ['#0c2d57', '#60a5fa', '#e0f2fe', '#1d4ed8'] },
    { code: 'X-012', title: 'VORTEX', sub: 'SIGNAL', style: 'orbital', pal: ['#171717', '#b9e432', '#f5f5f4', '#525252'] },
    { code: 'X-013', title: 'CHROMATIC', sub: 'DRIFT', style: 'prism', pal: ['#1e1b4b', '#ec4899', '#06b6d4', '#fde047'] },
    { code: 'X-014', title: 'KINETIC', sub: 'STUDY IV', style: 'bauhaus', pal: ['#f4efe6', '#0f3d6e', '#e11d48', '#eab308'] },
    { code: 'X-015', title: 'OBSIDIAN', sub: 'PULSE', style: 'eclipse', pal: ['#090b10', '#38bdf8', '#818cf8', '#f1f5f9'] },
    { code: 'X-016', title: 'AETHER', sub: 'FIELD', style: 'swiss', pal: ['#1c2826', '#d6f599', '#f7f5f0', '#ff7b00'] },
    { code: 'X-017', title: 'VERMILION', sub: 'CORE', style: 'sunburst', pal: ['#211518', '#ff5722', '#ffca28', '#fff3e0'] },
    { code: 'X-018', title: 'SILENCE', sub: 'INDEX', style: 'monolith', pal: ['#eceae4', '#262930', '#3b82f6', '#ffffff'] },
  ];

  const coverLibrary = []; // { dataUrl, texture, material }

  function buildProceduralCover(preset, idx) {
    const S = 512;
    const cv = document.createElement('canvas');
    cv.width = S;
    cv.height = S;
    const g = cv.getContext('2d');
    const [c0, c1, c2, c3] = preset.pal;

    // Base fill
    g.fillStyle = c0;
    g.fillRect(0, 0, S, S);

    if (preset.style === 'melodrama') {
      // Painterly neon-cobalt & magenta portrait/dreamscape atmosphere
      const rg1 = g.createRadialGradient(S * 0.65, S * 0.35, 20, S * 0.55, S * 0.45, S * 0.72);
      rg1.addColorStop(0, c1);
      rg1.addColorStop(0.55, c0);
      rg1.addColorStop(1, '#040614');
      g.fillStyle = rg1;
      g.fillRect(0, 0, S, S);

      // Luminous warm/rose highlight sweep
      const rg2 = g.createRadialGradient(S * 0.36, S * 0.56, 12, S * 0.4, S * 0.56, S * 0.42);
      rg2.addColorStop(0, c2);
      rg2.addColorStop(0.45, 'rgba(244,63,94,0.38)');
      rg2.addColorStop(1, 'transparent');
      g.fillStyle = rg2;
      g.fillRect(0, 0, S, S);

      // Sculptural wave contours
      for (let k = 0; k < 6; k++) {
        g.beginPath();
        g.moveTo(0, S * (0.42 + k * 0.09));
        g.bezierCurveTo(
          S * 0.3, S * (0.28 + k * 0.07),
          S * 0.68, S * (0.68 - k * 0.05),
          S, S * (0.46 + k * 0.08)
        );
        g.lineTo(S, S);
        g.lineTo(0, S);
        g.closePath();
        g.fillStyle = k % 2 === 0 ? 'rgba(147,197,253,0.11)' : 'rgba(15,23,66,0.28)';
        g.fill();
      }
      // Abstract focal silhouette arc
      g.fillStyle = c3;
      g.globalAlpha = 0.22;
      g.beginPath();
      g.arc(S * 0.44, S * 0.54, 108, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    } else if (preset.style === 'bauhaus') {
      // Architectural Bauhaus composition
      g.fillStyle = c3;
      g.fillRect(S * 0.08, S * 0.08, S * 0.84, S * 0.84);
      g.fillStyle = c1;
      g.beginPath();
      g.arc(S * 0.62, S * 0.44, 155, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = c2;
      g.fillRect(S * 0.12, S * 0.56, S * 0.54, S * 0.28);
      g.fillStyle = c0;
      g.beginPath();
      g.arc(S * 0.62, S * 0.44, 62, 0, Math.PI * 2);
      g.fill();
      // Swiss diagonal slash
      g.strokeStyle = c1;
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(S * 0.12, S * 0.16);
      g.lineTo(S * 0.88, S * 0.16);
      g.stroke();
    } else if (preset.style === 'orbital') {
      // Rhine Lab telemetry orbital rings
      const bgGrad = g.createLinearGradient(0, 0, S, S);
      bgGrad.addColorStop(0, c0);
      bgGrad.addColorStop(1, '#05070c');
      g.fillStyle = bgGrad;
      g.fillRect(0, 0, S, S);

      g.save();
      g.translate(S * 0.52, S * 0.52);
      for (let r = 46; r <= 210; r += 34) {
        g.beginPath();
        g.arc(0, 0, r, 0, Math.PI * 2);
        g.strokeStyle = r === 148 ? c1 : 'rgba(255,255,255,0.18)';
        g.lineWidth = r === 148 ? 5 : 1.5;
        g.stroke();
      }
      // Highlighted orbital arc
      g.beginPath();
      g.arc(0, 0, 182, -0.9, 1.35);
      g.strokeStyle = c2;
      g.lineWidth = 11;
      g.stroke();

      // Crosshair axes
      g.strokeStyle = 'rgba(255,255,255,0.22)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-220, 0); g.lineTo(220, 0);
      g.moveTo(0, -220); g.lineTo(0, 220);
      g.stroke();

      // Core node
      g.fillStyle = c1;
      g.beginPath();
      g.arc(0, 0, 18, 0, Math.PI * 2);
      g.fill();
      g.restore();
    } else if (preset.style === 'prism') {
      // Vibrant diagonal chromatic ribbons
      const lg = g.createLinearGradient(0, 0, S, S);
      lg.addColorStop(0, c0);
      lg.addColorStop(0.5, c1);
      lg.addColorStop(1, c2);
      g.fillStyle = lg;
      g.fillRect(0, 0, S, S);

      g.save();
      g.translate(S * 0.5, S * 0.5);
      g.rotate(-0.42);
      for (let b = -4; b <= 4; b++) {
        g.fillStyle = b % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.22)';
        g.fillRect(-380, b * 54, 760, 24);
      }
      g.fillStyle = c3;
      g.globalAlpha = 0.85;
      g.beginPath();
      g.moveTo(0, -140);
      g.lineTo(130, 110);
      g.lineTo(-130, 110);
      g.closePath();
      g.fill();
      g.restore();
    } else if (preset.style === 'botanical') {
      // Architectural botanical cyanotype / eco-lab
      g.fillStyle = c0;
      g.fillRect(0, 0, S, S);
      g.save();
      g.translate(S * 0.5, S * 0.58);
      for (let p = 0; p < 12; p++) {
        g.rotate(Math.PI / 6);
        g.beginPath();
        g.ellipse(0, -98, 28, 86, 0, 0, Math.PI * 2);
        g.fillStyle = p % 2 === 0 ? c1 : c2;
        g.globalAlpha = 0.42;
        g.fill();
      }
      g.globalAlpha = 0.9;
      g.strokeStyle = c3;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(0, 0, 56, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    } else if (preset.style === 'eclipse') {
      // Dramatic celestial eclipse glow
      const rg = g.createRadialGradient(S * 0.5, S * 0.46, 75, S * 0.5, S * 0.46, 250);
      rg.addColorStop(0, c2);
      rg.addColorStop(0.22, c1);
      rg.addColorStop(0.55, c0);
      rg.addColorStop(1, '#040509');
      g.fillStyle = rg;
      g.fillRect(0, 0, S, S);
      g.fillStyle = '#07090f';
      g.beginPath();
      g.arc(S * 0.5, S * 0.46, 108, 0, Math.PI * 2);
      g.fill();
      // Horizontal horizon rule
      g.fillStyle = c3;
      g.globalAlpha = 0.65;
      g.fillRect(42, S * 0.74, S - 84, 2);
      g.globalAlpha = 1;
    } else if (preset.style === 'swiss') {
      // Bold Swiss grid typography & geometric blocks
      g.fillStyle = c0;
      g.fillRect(0, 0, S, S);
      g.fillStyle = c1;
      g.fillRect(0, S * 0.55, S, S * 0.45);
      g.fillStyle = c2;
      g.fillRect(36, 36, S * 0.46, S * 0.46);
      g.fillStyle = c3;
      g.beginPath();
      g.arc(S * 0.72, S * 0.34, 86, 0, Math.PI * 2);
      g.fill();
    } else if (preset.style === 'sunburst') {
      // Warm retro-modern halftone sunburst
      g.fillStyle = c0;
      g.fillRect(0, 0, S, S);
      g.fillStyle = c1;
      g.beginPath();
      g.arc(S * 0.5, S * 0.52, 168, 0, Math.PI * 2);
      g.fill();
      // Horizontal architectural louvers across lower half of sun
      g.fillStyle = c0;
      for (let y = 265; y < 440; y += 22) {
        g.fillRect(60, y, S - 120, (y - 250) * 0.085);
      }
      g.fillStyle = c2;
      g.fillRect(36, 40, S - 72, 14);
    } else {
      // Architectural monolith stripes
      g.fillStyle = c0;
      g.fillRect(0, 0, S, S);
      for (let k = 0; k < 7; k++) {
        g.fillStyle = k === 2 ? c2 : c1;
        g.globalAlpha = k === 2 ? 0.95 : (0.12 + k * 0.1);
        g.fillRect(42 + k * 62, 68 + k * 14, 42, 340 - k * 18);
      }
      g.globalAlpha = 1;
    }

    // Subtle print grain & Swiss technical typography overlay
    const isDark = (preset.style === 'orbital' || preset.style === 'melodrama' || preset.style === 'eclipse' || preset.style === 'prism' || idx === 10 || idx === 15 || idx === 16);
    const fg = isDark ? 'rgba(250,249,246,0.92)' : 'rgba(20,21,23,0.90)';
    const fgMute = isDark ? 'rgba(250,249,246,0.58)' : 'rgba(20,21,23,0.55)';

    // Top micro-header
    g.fillStyle = fgMute;
    g.font = '700 16px ui-monospace, Consolas, monospace';
    g.fillText('RHINE LAB // ARCHIVE', 34, 46);
    g.textAlign = 'right';
    g.fillText(preset.code, S - 34, 46);

    // Bold display title at bottom-left
    g.textAlign = 'left';
    g.fillStyle = fg;
    g.font = '800 48px Inter, system-ui, sans-serif';
    g.fillText(preset.title, 34, S - 64);

    g.fillStyle = fgMute;
    g.font = '600 22px ui-monospace, Consolas, monospace';
    g.fillText(preset.sub, 36, S - 32);

    // Corner hairline registration marks
    g.strokeStyle = fgMute;
    g.lineWidth = 2;
    g.strokeRect(18, 18, S - 36, S - 36);

    const dataUrl = cv.toDataURL('image/jpeg', 0.88);
    const texture = new THREE.CanvasTexture(cv);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.28,
      metalness: 0.08,
    });
    return { canvas: cv, dataUrl, texture, material };
  }

  function initCoverLibrary() {
    for (let i = 0; i < COVER_PRESETS.length; i++) {
      coverLibrary.push(buildProceduralCover(COVER_PRESETS[i], i));
    }
  }

  /* =========================================================================
   * 4. BUILT-IN 6 PLAYABLE RHINE LAB SYNTH ARCHIVE TRACKS
   * ========================================================================= */
  const BUILTIN_TRACKS = [
    {
      id: 'RL-001',
      name: 'Alabaster Horizon',
      artist: 'Rhine Lab Acoustic Div.',
      album: 'ANALYSIS OS // VOL. I',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'SYNTH / PCM',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 160,
      coverIdx: 0,
      synthConfig: {
        tempoMs: 440,
        wave: 'triangle',
        chords: [
          [220.00, 277.18, 329.63, 415.30], // A maj7
          [196.00, 246.94, 293.66, 369.99], // G maj7
          [174.61, 220.00, 261.63, 329.63], // F maj7
          [164.81, 246.94, 329.63, 392.00], // E m7
        ],
        arp: [440, 554.37, 659.25, 830.61, 659.25, 587.33, 493.88, 659.25],
        bassMul: 0.5,
        filterHz: 1900,
      },
      notes: '萊茵生命核心檔案系統啟動基準音軌。\n採用高純度溫潤泛音與低頻脈衝建構陶瓷空間聲場，用於校準三維檔案矩陣的共振頻率。',
      lyrics: '[00:00] // RHINE LAB TELEMETRY BOOT\n[00:12] White ceramic corridors stretch past the horizon\n[00:28] Amber light spills from Slot X-001\n[00:46] Synthesize information — preserve every resonance\n[01:10] Orbital stillness suspended in warm alabaster',
    },
    {
      id: 'RL-002',
      name: 'Originium Resonance',
      artist: 'Kirsten Telemetry Unit',
      album: 'HIGH ALTITUDE LOGS',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'SYNTH / PCM',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 184,
      coverIdx: 1,
      synthConfig: {
        tempoMs: 360,
        wave: 'sawtooth',
        chords: [
          [146.83, 174.61, 220.00, 261.63], // Dm7
          [130.81, 164.81, 196.00, 246.94], // Cmaj7
          [116.54, 146.83, 174.61, 220.00], // Bbmaj7
          [130.81, 164.81, 196.00, 220.00], // C6
        ],
        arp: [293.66, 349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00],
        bassMul: 0.5,
        filterHz: 1450,
      },
      notes: '高空軌道遙測實驗室觀測記錄。\n以 D Dorian 調式驅動深沉軌道低頻與金屬鐘聲泛音，呈現星際測繪的精密律動。',
      lyrics: '[00:00] // ORBITAL LOCK CONFIRMED\n[00:18] Beyond the barrier, frequencies crystallize\n[00:36] Tracking arc vector 55.0 degrees\n[00:58] Every pulse echoes across the silent dome',
    },
    {
      id: 'RL-003',
      name: 'Zero-G Cryostasis',
      artist: 'Trimounts Observatory',
      album: 'MELODRAMA IN ORBIT',
      year: '2025',
      kind: 'audio',
      isSynth: true,
      format: 'SYNTH / PCM',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 210,
      coverIdx: 2,
      synthConfig: {
        tempoMs: 520,
        wave: 'sine',
        chords: [
          [185.00, 220.00, 277.18, 329.63], // F#m7
          [146.83, 185.00, 220.00, 277.18], // Dmaj7
          [164.81, 207.65, 246.94, 329.63], // E6
          [138.59, 164.81, 207.65, 246.94], // C#m7
        ],
        arp: [369.99, 440.00, 554.37, 659.25, 739.99, 659.25, 554.37, 493.88],
        bassMul: 0.5,
        filterHz: 2200,
      },
      notes: '特里蒙觀測站深藍夜色聲景。\n慢速聲納脈衝與寬闊的九和弦延遲殘響交織，模擬低溫休眠艙中的漂浮寧靜。',
      lyrics: '[00:00] // CRYOSTASIS CHAMBER 03\n[00:22] Cobalt shadows drift over frosted glass\n[00:44] Heartbeat slowed to a distant tidal wave\n[01:15] Dreaming in ultraviolet silence',
    },
    {
      id: 'RL-004',
      name: 'Helios Vector 04',
      artist: 'Energy Section // Saria',
      album: 'STRUCTURAL DYNAMICS',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'SYNTH / PCM',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 152,
      coverIdx: 3,
      synthConfig: {
        tempoMs: 310,
        wave: 'sawtooth',
        chords: [
          [130.81, 155.56, 196.00, 233.08], // Cm7
          [103.83, 130.81, 155.56, 196.00], // Abmaj7
          [116.54, 146.83, 174.61, 207.65], // Bb7
          [98.00, 116.54, 146.83, 174.61],  // Gm7
        ],
        arp: [261.63, 311.13, 392.00, 466.16, 523.25, 466.16, 392.00, 349.23],
        bassMul: 0.5,
        filterHz: 1650,
      },
      notes: '能源科高功率反應堆節律檔案。\n緊湊的合成低音與鮮明斷奏琶音，帶來強勁的頻譜跳動與機械精準感。',
      lyrics: '[00:00] // REACTOR OUTPUT NOMINAL\n[00:14] Prism lines ignite across the steel floor\n[00:32] Velocity locked — zero structural drift\n[00:54] Helios rising through the amber mist',
    },
    {
      id: 'RL-005',
      name: 'Pale Ceramic Echo',
      artist: 'Ecological Lab · Muelsyse',
      album: 'WATER & GLASS',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'SYNTH / PCM',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 176,
      coverIdx: 4,
      synthConfig: {
        tempoMs: 410,
        wave: 'sine',
        chords: [
          [164.81, 207.65, 246.94, 311.13], // Emaj7
          [138.59, 164.81, 207.65, 246.94], // C#m7
          [110.00, 138.59, 164.81, 207.65], // Amaj7
          [123.47, 155.56, 185.00, 220.00], // B7
        ],
        arp: [659.25, 622.25, 493.88, 415.30, 493.88, 659.25, 739.99, 830.61],
        bassMul: 0.5,
        filterHz: 2600,
      },
      notes: '生態科溫室水滴共鳴採樣合成。\n清澈明亮的五聲音階如露珠滴落於白瓷介面，營造純淨自然的空間層次。',
      lyrics: '[00:00] // ECOLOGICAL DOME 05\n[00:19] Clear droplets trace light across pale leaves\n[00:40] Reflections ripple inside glass partitions\n[01:02] Everything flows back to its source',
    },
    {
      id: 'RL-006',
      name: 'Star-Pod Lullaby',
      artist: 'Structural Div. Archive',
      album: 'LONE TRAIL CODA',
      year: '2025',
      kind: 'audio',
      isSynth: true,
      format: 'SYNTH / PCM',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 198,
      coverIdx: 5,
      synthConfig: {
        tempoMs: 490,
        wave: 'triangle',
        chords: [
          [116.54, 146.83, 174.61, 220.00], // Bbmaj7
          [98.00, 116.54, 146.83, 174.61],  // Gm7
          [155.56, 196.00, 233.08, 293.66], // Ebmaj7
          [130.81, 174.61, 196.00, 233.08], // F9sus4
        ],
        arp: [466.16, 587.33, 698.46, 880.00, 698.46, 587.33, 523.25, 466.16],
        bassMul: 0.5,
        filterHz: 1750,
      },
      notes: '孤星遠航終章留聲檔案。\n溫柔緩慢的類比銅管質感和聲與高音鐘琴，獻給飛越天穹之後的靜謐夜晚。',
      lyrics: '[00:00] // TRANSMISSION FROM THE OUTER SHELL\n[00:25] Goodnight, Trimounts — the sky is finally open\n[00:52] Starlight settles gently onto the archival bay\n[01:24] Until the next signal crosses the dark',
    },
  ];

  /* =========================================================================
   * 5. PLAYER STATE, WEB AUDIO ENGINE & PROCEDURAL MULTI-VOICE SYNTH
   * ========================================================================= */
  const tracks = []; // populated with 6 built-in tracks + user local imports
  let currentTrackIdx = 0;
  let playing = false;
  let mode = 'list'; // list | loop | one | shuffle
  let viewFilter = 'all'; // all | audio | video
  let theme = 'ceramic'; // ceramic | obsidian
  let detailMode = false;
  let detailSlotIdx = -1;
  let detailTab = 'tracks';
  let localSeq = 6;

  const audioEl = new Audio();
  audioEl.preload = 'metadata';
  const videoEl = el.videoEl;
  videoEl.preload = 'metadata';

  let audioCtx = null;
  let masterGain = null;
  let analyser = null;
  let mediaNodesWired = false;
  const fftData = new Uint8Array(512);

  function ensureAudioContext() {
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.82;
        masterGain.gain.value = Number(el.volSlider.value) || 0.72;
        masterGain.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      if (!mediaNodesWired) {
        const sA = audioCtx.createMediaElementSource(audioEl);
        const sV = audioCtx.createMediaElementSource(videoEl);
        sA.connect(masterGain);
        sV.connect(masterGain);
        mediaNodesWired = true;
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    } catch (err) {
      console.warn('WebAudio init:', err);
    }
  }

  // Multi-voice Web Audio Synthesizer for built-in Rhine Lab Archive tracks
  const synthPlayer = {
    active: false,
    config: null,
    duration: 160,
    offsetSec: 0,
    startedAt: 0,
    step: 0,
    timer: null,
    bus: null,

    play(track, startOffset) {
      ensureAudioContext();
      if (!audioCtx) return;
      this.stop();
      this.active = true;
      this.config = track.synthConfig;
      this.duration = track.duration || 160;
      this.offsetSec = startOffset != null ? startOffset : 0;
      this.startedAt = performance.now() / 1000;
      this.step = Math.floor((this.offsetSec * 1000) / this.config.tempoMs);

      this.bus = audioCtx.createGain();
      this.bus.gain.setValueAtTime(0.001, audioCtx.currentTime);
      this.bus.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 0.35);

      const lpf = audioCtx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = this.config.filterHz || 1800;
      lpf.Q.value = 1.4;

      const delay = audioCtx.createDelay(1.0);
      delay.delayTime.value = (this.config.tempoMs / 1000) * 0.75;
      const fb = audioCtx.createGain();
      fb.gain.value = 0.34;

      this.bus.connect(lpf);
      lpf.connect(masterGain);
      lpf.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(masterGain);

      this.triggerStep();
      this.timer = setInterval(() => {
        if (this.currentTime() >= this.duration) {
          onTrackEnded();
          return;
        }
        this.triggerStep();
      }, this.config.tempoMs);
    },

    triggerStep() {
      if (!this.active || !audioCtx || !this.config) return;
      const now = audioCtx.currentTime;
      const cfg = this.config;

      // Warm chord swell every 8 steps
      if (this.step % 8 === 0) {
        const chord = cfg.chords[Math.floor(this.step / 8) % cfg.chords.length];
        chord.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = idx === 0 ? cfg.wave : 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? freq * cfg.bassMul : freq, now);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(idx === 0 ? 0.16 : 0.085, now + 0.65);
          g.gain.exponentialRampToValueAtTime(0.0008, now + (cfg.tempoMs * 8) / 1000 + 0.4);
          osc.connect(g);
          g.connect(this.bus);
          osc.start(now);
          osc.stop(now + (cfg.tempoMs * 8) / 1000 + 0.5);
        });
      }

      // Crystalline arpeggio lead
      const note = cfg.arp[this.step % cfg.arp.length];
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.11, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 0.55);
      osc.connect(env);
      env.connect(this.bus);
      osc.start(now);
      osc.stop(now + 0.6);

      // Soft sub pulse every 4 beats for visceral FFT bass response
      if (this.step % 4 === 0) {
        const kick = audioCtx.createOscillator();
        const kEnv = audioCtx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(118, now);
        kick.frequency.exponentialRampToValueAtTime(42, now + 0.17);
        kEnv.gain.setValueAtTime(0.32, now);
        kEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        kick.connect(kEnv);
        kEnv.connect(this.bus);
        kick.start(now);
        kick.stop(now + 0.3);
      }
      this.step += 1;
    },

    pause() {
      if (!this.active) return;
      this.offsetSec = this.currentTime();
      this.stop();
    },

    seek(sec) {
      this.offsetSec = Math.max(0, Math.min(this.duration, sec));
      if (this.active) {
        const tr = tracks[currentTrackIdx];
        if (tr && tr.isSynth) this.play(tr, this.offsetSec);
      }
    },

    stop() {
      this.active = false;
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      if (this.bus && audioCtx) {
        try {
          const now = audioCtx.currentTime;
          this.bus.gain.cancelScheduledValues(now);
          this.bus.gain.setValueAtTime(Math.max(0.001, this.bus.gain.value), now);
          this.bus.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        } catch (e) {}
      }
    },

    currentTime() {
      if (!this.active) return this.offsetSec;
      return Math.min(this.duration, this.offsetSec + (performance.now() / 1000 - this.startedAt));
    }
  };

  audioEl.addEventListener('ended', onTrackEnded);
  videoEl.addEventListener('ended', onTrackEnded);

  /* =========================================================================
   * 6. PURE JS EMBEDDED METADATA & COVER ART PARSERS (ID3v2 / MP4 / FLAC / VIDEO)
   * ========================================================================= */
  function readSynchsafe32(view, offset) {
    return ((view.getUint8(offset) & 0x7f) << 21) |
           ((view.getUint8(offset + 1) & 0x7f) << 14) |
           ((view.getUint8(offset + 2) & 0x7f) << 7) |
           (view.getUint8(offset + 3) & 0x7f);
  }

  function decodeId3Text(bytes, encoding) {
    try {
      if (encoding === 0) {
        let s = '';
        for (let i = 0; i < bytes.length; i++) if (bytes[i] !== 0) s += String.fromCharCode(bytes[i]);
        return s.trim();
      }
      if (encoding === 3) {
        return new TextDecoder('utf-8').decode(bytes).replace(/\0+$/g, '').trim();
      }
      if (encoding === 1) {
        if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
          return new TextDecoder('utf-16be').decode(bytes.subarray(2)).replace(/\0+$/g, '').trim();
        }
        const start = (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) ? 2 : 0;
        return new TextDecoder('utf-16le').decode(bytes.subarray(start)).replace(/\0+$/g, '').trim();
      }
      if (encoding === 2) {
        return new TextDecoder('utf-16be').decode(bytes).replace(/\0+$/g, '').trim();
      }
    } catch (e) {}
    return '';
  }

  function parseID3v2(buffer) {
    const view = new DataView(buffer);
    if (buffer.byteLength < 10) return null;
    if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x44 || view.getUint8(2) !== 0x33) return null;

    const major = view.getUint8(3);
    const flags = view.getUint8(5);
    const tagSize = readSynchsafe32(view, 6);
    const limit = Math.min(buffer.byteLength, 10 + tagSize);
    let pos = 10;

    // Extended header skip
    if (flags & 0x40 && pos + 4 <= limit) {
      const extSize = major === 4 ? readSynchsafe32(view, pos) : view.getUint32(pos);
      pos += major === 4 ? extSize : extSize + 4;
    }

    const meta = {};
    const bytes = new Uint8Array(buffer);

    while (pos + (major === 2 ? 6 : 10) <= limit) {
      let id, size, headerLen;
      if (major === 2) {
        id = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2]);
        size = (bytes[pos + 3] << 16) | (bytes[pos + 4] << 8) | bytes[pos + 5];
        headerLen = 6;
      } else {
        id = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
        size = major === 4 ? readSynchsafe32(view, pos + 4) : view.getUint32(pos + 4);
        headerLen = 10;
      }
      if (!/^[A-Z0-9]{3,4}$/.test(id) || size <= 0 || pos + headerLen + size > limit) break;

      const dataStart = pos + headerLen;
      const frameData = bytes.subarray(dataStart, dataStart + size);

      if (id === 'TIT2' || id === 'TT2') meta.title = decodeId3Text(frameData.subarray(1), frameData[0]);
      else if (id === 'TPE1' || id === 'TP1') meta.artist = decodeId3Text(frameData.subarray(1), frameData[0]);
      else if (id === 'TALB' || id === 'TAL') meta.album = decodeId3Text(frameData.subarray(1), frameData[0]);
      else if (id === 'TYER' || id === 'TDRC' || id === 'TYE') meta.year = decodeId3Text(frameData.subarray(1), frameData[0]).slice(0, 4);
      else if ((id === 'APIC' || id === 'PIC') && !meta.coverBlob) {
        const enc = frameData[0];
        let p = 1;
        let mime = 'image/jpeg';
        if (id === 'APIC') {
          const mimeStart = p;
          while (p < frameData.length && frameData[p] !== 0) p++;
          const rawMime = String.fromCharCode.apply(null, frameData.subarray(mimeStart, p)).toLowerCase();
          if (rawMime.includes('png')) mime = 'image/png';
          else if (rawMime.includes('webp')) mime = 'image/webp';
          p++; // skip null
        } else {
          const fmt = String.fromCharCode(frameData[1], frameData[2], frameData[3]).toUpperCase();
          if (fmt === 'PNG') mime = 'image/png';
          p = 4;
        }
        p++; // picture type byte
        // Skip description null terminator
        if (enc === 1 || enc === 2) {
          while (p + 1 < frameData.length && !(frameData[p] === 0 && frameData[p + 1] === 0)) p += 2;
          p += 2;
        } else {
          while (p < frameData.length && frameData[p] !== 0) p++;
          p += 1;
        }
        if (p < frameData.length) {
          meta.coverBlob = new Blob([frameData.subarray(p)], { type: mime });
        }
      }
      pos += headerLen + size;
    }
    return meta;
  }

  function parseMP4Metadata(buffer) {
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    if (buffer.byteLength < 12) return null;
    const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    if (ftyp !== 'ftyp') return null;

    const meta = {};
    const utf8 = new TextDecoder('utf-8');

    function walk(start, end) {
      let p = start;
      while (p + 8 <= end) {
        let size = view.getUint32(p);
        const type = String.fromCharCode(bytes[p + 4], bytes[p + 5], bytes[p + 6], bytes[p + 7]);
        let hdr = 8;
        if (size === 1 && p + 16 <= end) {
          size = view.getUint32(p + 12); // lower 32-bit for reasonable files
          hdr = 16;
        } else if (size === 0) {
          size = end - p;
        }
        if (size < hdr || p + size > end) break;

        const bodyStart = p + hdr;
        const bodyEnd = p + size;

        if (type === 'moov' || type === 'udta' || type === 'ilst') {
          walk(bodyStart, bodyEnd);
        } else if (type === 'meta') {
          // meta box has 4-byte version/flags before children
          walk(bodyStart + 4, bodyEnd);
        } else if (type === 'covr' || type === '\xa9nam' || type === '\xa9ART' || type === '\xa9alb' || type === '\xa9day') {
          // Find inner 'data' atom
          let q = bodyStart;
          while (q + 16 <= bodyEnd) {
            const dSize = view.getUint32(q);
            const dType = String.fromCharCode(bytes[q + 4], bytes[q + 5], bytes[q + 6], bytes[q + 7]);
            if (dSize < 16 || q + dSize > bodyEnd) break;
            if (dType === 'data') {
              const dataFlag = view.getUint32(q + 8);
              const payload = bytes.subarray(q + 16, q + dSize);
              if (type === 'covr' && !meta.coverBlob) {
                const mime = dataFlag === 14 ? 'image/png' : 'image/jpeg';
                meta.coverBlob = new Blob([payload], { type: mime });
              } else if (type === '\xa9nam') meta.title = utf8.decode(payload).trim();
              else if (type === '\xa9ART') meta.artist = utf8.decode(payload).trim();
              else if (type === '\xa9alb') meta.album = utf8.decode(payload).trim();
              else if (type === '\xa9day') meta.year = utf8.decode(payload).trim().slice(0, 4);
              break;
            }
            q += dSize;
          }
        }
        p += size;
      }
    }

    walk(0, buffer.byteLength);
    return meta;
  }

  function parseFLACMetadata(buffer) {
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    if (buffer.byteLength < 8) return null;
    if (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== 'fLaC') return null;

    const meta = {};
    const utf8 = new TextDecoder('utf-8');
    let p = 4;

    while (p + 4 <= buffer.byteLength) {
      const hdr = bytes[p];
      const isLast = (hdr & 0x80) !== 0;
      const blockType = hdr & 0x7f;
      const len = (bytes[p + 1] << 16) | (bytes[p + 2] << 8) | bytes[p + 3];
      p += 4;
      if (p + len > buffer.byteLength) break;

      if (blockType === 4) {
        // VORBIS_COMMENT (little-endian lengths)
        let q = p;
        if (q + 4 <= p + len) {
          const vendorLen = view.getUint32(q, true);
          q += 4 + vendorLen;
          if (q + 4 <= p + len) {
            const count = view.getUint32(q, true);
            q += 4;
            for (let i = 0; i < count && q + 4 <= p + len; i++) {
              const cLen = view.getUint32(q, true);
              q += 4;
              if (q + cLen > p + len) break;
              const str = utf8.decode(bytes.subarray(q, q + cLen));
              const eq = str.indexOf('=');
              if (eq > 0) {
                const k = str.slice(0, eq).toUpperCase();
                const v = str.slice(eq + 1).trim();
                if (k === 'TITLE') meta.title = v;
                else if (k === 'ARTIST') meta.artist = v;
                else if (k === 'ALBUM') meta.album = v;
                else if (k === 'DATE') meta.year = v.slice(0, 4);
              }
              q += cLen;
            }
          }
        }
      } else if (blockType === 6 && !meta.coverBlob) {
        // METADATA_BLOCK_PICTURE (big-endian)
        let q = p + 4; // skip pic type
        if (q + 4 <= p + len) {
          const mimeLen = view.getUint32(q, false);
          q += 4;
          const mime = utf8.decode(bytes.subarray(q, q + mimeLen)) || 'image/jpeg';
          q += mimeLen;
          const descLen = view.getUint32(q, false);
          q += 4 + descLen + 16; // skip desc + w,h,depth,colors
          if (q + 4 <= p + len) {
            const dataLen = view.getUint32(q, false);
            q += 4;
            if (q + dataLen <= p + len) {
              meta.coverBlob = new Blob([bytes.subarray(q, q + dataLen)], { type: mime });
            }
          }
        }
      }

      p += len;
      if (isLast) break;
    }
    return meta;
  }

  async function extractEmbeddedMetadata(file) {
    try {
      // Read up to 6MB header window (fast even for large files, covers 99% of embedded covers)
      const sliceLen = Math.min(file.size, 6 * 1024 * 1024);
      const buf = await file.slice(0, sliceLen).arrayBuffer();
      const ext = ((file.name || '').split('.').pop() || '').toLowerCase();

      let meta = null;
      if (ext === 'flac') meta = parseFLACMetadata(buf);
      else if (ext === 'm4a' || ext === 'mp4' || ext === 'm4v' || ext === 'mov') meta = parseMP4Metadata(buf);
      else meta = parseID3v2(buf);

      // Fallback cross-check if extension differed
      if (!meta) meta = parseID3v2(buf) || parseMP4Metadata(buf) || parseFLACMetadata(buf);
      return meta || {};
    } catch (err) {
      return {};
    }
  }

  function captureVideoThumbnail(url) {
    return new Promise((resolve) => {
      try {
        const v = document.createElement('video');
        v.muted = true;
        v.playsInline = true;
        v.preload = 'auto';
        v.src = url;
        let settled = false;
        const finish = (res) => {
          if (settled) return;
          settled = true;
          v.src = '';
          resolve(res);
        };
        setTimeout(() => finish(null), 3500);
        v.addEventListener('loadeddata', () => {
          try {
            const target = (isFinite(v.duration) && v.duration > 1.2) ? Math.min(2.0, v.duration * 0.18) : 0.1;
            v.currentTime = target;
          } catch (e) { finish(null); }
        });
        v.addEventListener('seeked', () => {
          try {
            const S = 512;
            const cv = document.createElement('canvas');
            cv.width = S; cv.height = S;
            const g = cv.getContext('2d');
            const vw = v.videoWidth || 640;
            const vh = v.videoHeight || 360;
            const side = Math.min(vw, vh);
            const sx = (vw - side) * 0.5;
            const sy = (vh - side) * 0.5;
            g.drawImage(v, sx, sy, side, side, 0, 0, S, S);
            // Subtle Rhine Lab VIDEO frame stamp
            g.fillStyle = 'rgba(10,12,16,0.58)';
            g.fillRect(20, 20, 92, 26);
            g.fillStyle = '#b9e432';
            g.font = '700 13px ui-monospace, Consolas, monospace';
            g.fillText('VIDEO // HD', 28, 38);
            finish(cv.toDataURL('image/jpeg', 0.86));
          } catch (e) { finish(null); }
        });
        v.addEventListener('error', () => finish(null));
      } catch (e) { resolve(null); }
    });
  }

  function createCoverMaterialFromUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Center-crop square onto 512x512 canvas so every cover fits cleanly without stretching
        const S = 512;
        const cv = document.createElement('canvas');
        cv.width = S; cv.height = S;
        const g = cv.getContext('2d');
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) * 0.5;
        const sy = (img.height - side) * 0.5;
        g.drawImage(img, sx, sy, side, side, 0, 0, S, S);
        const tex = new THREE.CanvasTexture(cv);
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 4;
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.28,
          metalness: 0.08,
        });
        resolve({ canvas: cv, dataUrl: cv.toDataURL('image/jpeg', 0.88), texture: tex, material: mat });
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  /* =========================================================================
   * 7. THREE.JS BOUNDARY-LESS ENDLESS ANGLED 3D CARTRIDGE RACK + DUAL-LAYER SHOWCASE
   * ========================================================================= */
  // Expanded 10 x 42 (420-slot) toroidal grid guarantees zero visible edges/floor
  // at the elevated ~40.7° camera angle across both 16:9 and 21:9 ultrawide viewports.
  const NUM_ROWS = 10;       // along Z (10 * 2.75 = 27.5 units)
  const NUM_COLS = 42;       // along X (42 * 0.50 = 21.0 units) -> 420 seamless endless slots
  const TOTAL_SLOTS = NUM_ROWS * NUM_COLS;

  const SLAB_X = 0.20;       // thickness along X
  const SLAB_Y = 2.40;       // height along Y
  const SLAB_Z = 2.40;       // width along Z
  const PITCH_X = 0.50;      // spacing along X
  const PITCH_Z = 2.75;      // row spacing along Z
  const SPAN_X = NUM_COLS * PITCH_X; // 21.0
  const SPAN_Z = NUM_ROWS * PITCH_Z; // 27.5

  // Center hero slot (row 5, col 21) -> RL-001 starts right in the visual sweet spot
  const HERO_ROW = 5;
  const HERO_COL = 21;
  const HERO_SLOT = HERO_ROW * NUM_COLS + HERO_COL;

  // Order of prominent slots radiating from center for user tracks
  const TRACK_SLOT_ORDER = (function () {
    const arr = [];
    for (let dc = 0; dc < 14; dc++) {
      for (let dr = 0; dr < 4; dr++) {
        const r = (HERO_ROW + (dr % 2 === 0 ? Math.floor(dr / 2) : -Math.ceil(dr / 2)) + NUM_ROWS) % NUM_ROWS;
        const c = (HERO_COL + dc) % NUM_COLS;
        const idx = r * NUM_COLS + c;
        if (!arr.includes(idx)) arr.push(idx);
      }
    }
    return arr;
  })();

  let scene, camera, renderer, raycaster, pointerNDC;
  let ambientLight, hemiLight, keyLight, rimLight, hoverAmberLight;
  let frameInstMesh, spineInstMesh, notchInstMesh;
  let frameMat, spineMat, notchMat;
  let slots = []; // 420 cartridge objects
  let coverMeshes = []; // raycastable cover planes

  // Dedicated Foreground Showcase 3D Scene (z-index: 18, zero clipping above blurred rack)
  let showcaseScene, showcaseCamera, showcaseRenderer;
  let showcaseGroup, showcaseFrameMat, showcaseSpineMat, showcaseNotchMat, showcaseCoverMat, showcaseBackMat;
  let showcaseCoverTex = null;
  let showcaseAmbient, showcaseHemi, showcaseKey, showcaseFill, showcaseRim;
  let heroSlotIdx = -1;
  let showcaseHasFrame = false;

  /* ---- Hero cartridge extraction / retraction choreography -----------------
   * The extracted cartridge is composited on its own transparent canvas layered
   * above the rack (so it stays razor sharp above the defocused veil), which
   * means it cannot lean on the depth buffer for occlusion. It therefore never
   * travels *through* the cartridge wall: it is lifted straight up out of its
   * slot along the rack's only free axis (+Y) and dropped back down that very
   * same axis, perfectly registered with the slot that it belongs to.
   */
  const HERO_OPEN_DUR = 0.62;    // s : seated -> showcase pose
  const HERO_CLOSE_DUR = 0.80;   // s : showcase pose -> seated
  const HERO_LIFT = 2.65;        // world units above the seat: clearly clear of the rack tops
  const HERO_RISE_END = 0.34;    // open : share of the flight spent clearing the slot
  const HERO_DROP_START = 0.62;  // close: share of the flight where the insertion begins
  const HERO_DROP_END = 0.90;    // close: share of the flight where the cartridge has seated

  const HERO_PHASE_SEATED = 0;
  const HERO_PHASE_RISING = 1;
  const HERO_PHASE_SHOWN = 2;
  const HERO_PHASE_DROPPING = 3;

  let heroPhase = HERO_PHASE_SEATED;
  let heroT = 0;              // elapsed seconds of the current flight
  let heroDur = HERO_OPEN_DUR;
  let heroOverlayOn = false;  // draw the overlay cartridge this frame?
  let heroSeatSuppressed = false; // hide the duplicated rack cartridge this frame?
  let heroCanvasOpacity = 0;  // dissolve of the overlay canvas (masks the handoff)
  let heroCanvasOpacityApplied = -1;
  let heroFadeFrom = 0;       // overlay opacity captured when a flight starts
  let heroFromKind = 'seat';  // 'seat' | 'pose' -> departure pose resolver
  let heroRetargetLock = false; // track selection must not steal a lift-off's departure pose

  const heroSeatPos = new THREE.Vector3();    // live world seat of the hero slot
  const heroLiftPos = new THREE.Vector3();    // hover waypoint straight above the seat
  const heroAnchorPos = new THREE.Vector3();  // camera-locked showcase pose (world)
  const heroAnchorQuat = new THREE.Quaternion();
  const heroFromPos = new THREE.Vector3();    // captured departure pose (world)
  const heroFromQuat = new THREE.Quaternion();
  const heroPosePos = new THREE.Vector3();    // current world pose
  const heroPoseQuat = new THREE.Quaternion();
  const heroStartPos = new THREE.Vector3();   // resolved departure pose of this frame
  const heroStartQuat = new THREE.Quaternion();
  const heroPoseCamPos = new THREE.Vector3(); // current pose in showcase-camera space
  const heroPoseCamQuat = new THREE.Quaternion();
  const HERO_IDENTITY = new THREE.Quaternion();

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const smooth01 = (x) => { const c = clamp01(x); return c * c * (3 - 2 * c); };

  const dummy = new THREE.Object3D();
  const tmpEuler = new THREE.Euler();
  const camInvQuat = new THREE.Quaternion();
  const targetCamPos = new THREE.Vector3();
  const targetCamQuat = new THREE.Quaternion();
  const tiltQuat = new THREE.Quaternion();
  // Cartridge +X cover rotated -90° around Y to face viewer (+Z in camera space), +0.16 rad subtle 3D angle
  const baseShowcaseLocalQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.04, -Math.PI / 2 + 0.16, 0, 'YXZ'));

  let hoveredSlot = -1;
  let activeSlotIdx = HERO_SLOT;

  // Smooth toroidal pan & detail inspection tilt state
  const nav = {
    panX: 0,
    panZ: 0,
    targetPanX: 0,
    targetPanZ: 0,
    parallaxX: 0,
    parallaxY: 0,
    isDragging: false,
    dragMoved: false,
    lastX: 0,
    lastY: 0,
    // Interactive drag-to-tilt in Detail Mode
    inspectDragging: false,
    tiltY: 0,
    tiltX: 0,
    targetTiltY: 0,
    targetTiltX: 0,
  };

  function wrapToroidal(val, center, span) {
    let d = val - center;
    d = ((d + span * 0.5) % span + span) % span - span * 0.5;
    return center + d;
  }

  function initThreeScene() {
    if (typeof THREE === 'undefined') {
      showToast('Three.js failed to load');
      return;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeae6df);
    scene.fog = new THREE.Fog(0xeae6df, 10.8, 23.2);

    const w = window.innerWidth;
    const h = window.innerHeight;
    // Narrow telephoto 25° FOV for zero-distortion architectural compression
    camera = new THREE.PerspectiveCamera(25, w / h, 0.2, 60);

    renderer = new THREE.WebGLRenderer({
      canvas: el.threeCanvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // ---- Lighting Rig ----
    ambientLight = new THREE.AmbientLight(0xf6f2ea, 0.42);
    scene.add(ambientLight);

    hemiLight = new THREE.HemisphereLight(0xfffdf9, 0xc9c0b2, 0.72);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    keyLight = new THREE.DirectionalLight(0xfff9f0, 0.85);
    keyLight.position.set(10, 18, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 45;
    const sd = 13;
    keyLight.shadow.camera.left = -sd;
    keyLight.shadow.camera.right = sd;
    keyLight.shadow.camera.top = sd;
    keyLight.shadow.camera.bottom = -sd;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.025;
    scene.add(keyLight);

    rimLight = new THREE.DirectionalLight(0xf4efe8, 0.35);
    rimLight.position.set(-12, 9, -10);
    scene.add(rimLight);

    // Warm Rhine Lab Amber spill PointLight tracking hovered / active cartridge
    hoverAmberLight = new THREE.PointLight(0xff7b00, 3.2, 7.5, 1.8);
    scene.add(hoverAmberLight);

    // ---- Instanced Geometries for 420 Archival Cartridges ----
    // 1. Main frosted ceramic/glass case frame
    const frameGeo = new THREE.BoxGeometry(SLAB_X, SLAB_Y, SLAB_Z);
    frameMat = new THREE.MeshStandardMaterial({
      color: 0xf4f1ea,
      roughness: 0.48,
      metalness: 0.06,
    });
    frameInstMesh = new THREE.InstancedMesh(frameGeo, frameMat, TOTAL_SLOTS);
    frameInstMesh.castShadow = true;
    frameInstMesh.receiveShadow = true;
    frameInstMesh.frustumCulled = false;
    scene.add(frameInstMesh);

    // 2. Proud translucent/frosted vertical front-left spine (matches jewel/ceramic edge)
    const spineGeo = new THREE.BoxGeometry(SLAB_X + 0.035, SLAB_Y + 0.03, 0.22);
    spineMat = new THREE.MeshStandardMaterial({
      color: 0xfbf9f4,
      roughness: 0.32,
      metalness: 0.08,
    });
    spineInstMesh = new THREE.InstancedMesh(spineGeo, spineMat, TOTAL_SLOTS);
    spineInstMesh.castShadow = true;
    spineInstMesh.receiveShadow = true;
    spineInstMesh.frustumCulled = false;
    scene.add(spineInstMesh);

    // 3. Mechanical top-edge index ridge/notch
    const notchGeo = new THREE.BoxGeometry(SLAB_X * 0.56, 0.06, SLAB_Z - 0.32);
    notchMat = new THREE.MeshStandardMaterial({
      color: 0x26282e,
      roughness: 0.55,
      metalness: 0.22,
    });
    notchInstMesh = new THREE.InstancedMesh(notchGeo, notchMat, TOTAL_SLOTS);
    notchInstMesh.frustumCulled = false;
    scene.add(notchInstMesh);

    // ---- Square Album Cover Face Geometry (mounted on +X face, inset inside frosted spine) ----
    const coverGeo = new THREE.PlaneGeometry(2.06, 2.24);
    // Local offset so plane sits on +X face facing outward (+X normal), shifted slightly -Z to leave thick +Z spine visible
    coverGeo.rotateY(Math.PI / 2);
    coverGeo.translate(SLAB_X * 0.5 + 0.006, 0.0, -0.10);

    // Build all 420 cartridge slots
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 0; c < NUM_COLS; c++) {
        const idx = r * NUM_COLS + c;
        const baseX = (c - HERO_COL) * PITCH_X;
        const baseZ = (r - HERO_ROW) * PITCH_Z;

        // Distribute 18 procedural graphic covers richly across the endless field
        const coverLibIdx = (r * 7 + c * 5 + ((r * c) % 3)) % coverLibrary.length;
        const coverMesh = new THREE.Mesh(coverGeo, coverLibrary[coverLibIdx].material);
        coverMesh.userData.slotIndex = idx;
        coverMesh.castShadow = false;
        coverMesh.receiveShadow = true;
        scene.add(coverMesh);
        coverMeshes.push(coverMesh);

        slots.push({
          index: idx,
          row: r,
          col: c,
          baseX: baseX,
          baseZ: baseZ,
          worldX: baseX,
          worldZ: baseZ,
          y: 0,
          velY: 0,
          coverMesh: coverMesh,
          defaultCoverIdx: coverLibIdx,
          customCoverCanvas: null,
          customCoverMat: null,
          customCoverTex: null,
          customCoverDataUrl: null,
          trackIdx: -1,
        });
      }
    }

    raycaster = new THREE.Raycaster();
    pointerNDC = new THREE.Vector2(-10, -10);

    initShowcaseScene();
    bindCanvasInteractions();
  }

  function buildShowcaseBackTexture(isObs) {
    const S = 512;
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const g = cv.getContext('2d');
    g.fillStyle = isObs ? '#1d2432' : '#eae6de';
    g.fillRect(0, 0, S, S);
    g.strokeStyle = isObs ? 'rgba(243,245,249,0.16)' : 'rgba(20,21,23,0.14)';
    g.lineWidth = 2;
    g.strokeRect(24, 24, S - 48, S - 48);
    g.fillStyle = isObs ? 'rgba(243,245,249,0.55)' : 'rgba(20,21,23,0.52)';
    g.font = '700 18px ui-monospace, Consolas, monospace';
    g.fillText('RHINE LAB // ANALYSIS OS', 44, 68);
    g.fillStyle = '#ff7b00';
    g.fillRect(44, 82, 54, 4);
    g.fillStyle = isObs ? 'rgba(243,245,249,0.34)' : 'rgba(20,21,23,0.32)';
    g.font = '600 13px ui-monospace, Consolas, monospace';
    g.fillText('OPTICAL ARCHIVE CARTRIDGE · UNIT REV. 03', 44, S - 48);
    const tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function initShowcaseScene() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    showcaseScene = new THREE.Scene();
    // Identity camera at origin matching main rack FOV (25°) so camera-space coordinates map 1:1
    showcaseCamera = new THREE.PerspectiveCamera(25, w / h, 0.1, 40);
    showcaseCamera.position.set(0, 0, 0);
    showcaseCamera.lookAt(0, 0, -1);

    showcaseRenderer = new THREE.WebGLRenderer({
      canvas: el.showcaseCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    showcaseRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    showcaseRenderer.setSize(w, h, false);
    showcaseRenderer.setClearColor(0x000000, 0);
    showcaseRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    showcaseRenderer.toneMappingExposure = 1.02;
    showcaseRenderer.outputEncoding = THREE.sRGBEncoding;

    // Balanced studio lighting (crisp cover colors with zero blown-out white specular hotspot)
    showcaseAmbient = new THREE.AmbientLight(0xfaf7f2, 0.62);
    showcaseScene.add(showcaseAmbient);

    showcaseHemi = new THREE.HemisphereLight(0xffffff, 0xc8c0b4, 0.52);
    showcaseHemi.position.set(0, 10, 4);
    showcaseScene.add(showcaseHemi);

    showcaseKey = new THREE.DirectionalLight(0xfffaf2, 0.58);
    showcaseKey.position.set(-5.5, 5.0, 6.5);
    showcaseScene.add(showcaseKey);

    showcaseFill = new THREE.DirectionalLight(0xeef4ff, 0.34);
    showcaseFill.position.set(6.5, -2.5, 5.5);
    showcaseScene.add(showcaseFill);

    showcaseRim = new THREE.DirectionalLight(0xffcf99, 0.30);
    showcaseRim.position.set(1.0, 5.5, -6.0);
    showcaseScene.add(showcaseRim);

    // Build Hero 3D Cartridge matching exact rack proportions
    showcaseGroup = new THREE.Group();
    showcaseGroup.visible = false;

    // 1. Main ceramic / obsidian case body
    showcaseFrameMat = new THREE.MeshStandardMaterial({
      color: 0xf4f1ea,
      roughness: 0.44,
      metalness: 0.08,
    });
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(SLAB_X, SLAB_Y, SLAB_Z), showcaseFrameMat);
    showcaseGroup.add(bodyMesh);

    // 2. Proud frosted left vertical spine (+Z edge in cartridge local space)
    showcaseSpineMat = new THREE.MeshStandardMaterial({
      color: 0xfbf9f4,
      roughness: 0.28,
      metalness: 0.10,
    });
    const spineMesh = new THREE.Mesh(
      new THREE.BoxGeometry(SLAB_X + 0.035, SLAB_Y + 0.03, 0.22),
      showcaseSpineMat
    );
    spineMesh.position.set(0, 0, SLAB_Z * 0.5 - 0.09);
    showcaseGroup.add(spineMesh);

    // 3. Dark mechanical top index ridge
    showcaseNotchMat = new THREE.MeshStandardMaterial({
      color: 0x26282e,
      roughness: 0.52,
      metalness: 0.24,
    });
    const notchMesh = new THREE.Mesh(
      new THREE.BoxGeometry(SLAB_X * 0.56, 0.06, SLAB_Z - 0.32),
      showcaseNotchMat
    );
    notchMesh.position.set(0, SLAB_Y * 0.5 + 0.028, -0.08);
    showcaseGroup.add(notchMesh);

    // 4. Satin-gloss cover face on +X (roughness ~0.34 avoids harsh specular glare)
    showcaseCoverMat = new THREE.MeshStandardMaterial({
      roughness: 0.34,
      metalness: 0.05,
    });
    const frontCoverGeo = new THREE.PlaneGeometry(2.06, 2.24);
    frontCoverGeo.rotateY(Math.PI / 2);
    frontCoverGeo.translate(SLAB_X * 0.5 + 0.006, 0, -0.10);
    showcaseGroup.add(new THREE.Mesh(frontCoverGeo, showcaseCoverMat));

    // 5. Clean Rhine Lab matte back plate on -X face
    showcaseBackMat = new THREE.MeshStandardMaterial({
      map: buildShowcaseBackTexture(false),
      roughness: 0.62,
      metalness: 0.08,
    });
    const backPlateGeo = new THREE.PlaneGeometry(2.06, 2.24);
    backPlateGeo.rotateY(-Math.PI / 2);
    backPlateGeo.translate(-SLAB_X * 0.5 - 0.006, 0, -0.10);
    showcaseGroup.add(new THREE.Mesh(backPlateGeo, showcaseBackMat));

    showcaseScene.add(showcaseGroup);
  }

  function getSlotCoverCanvas(slotIdx) {
    const s = slots[slotIdx];
    if (!s) return coverLibrary[0].canvas;
    if (s.customCoverCanvas) return s.customCoverCanvas;
    return coverLibrary[s.defaultCoverIdx].canvas;
  }

  function updateShowcaseCoverTexture(slotIdx) {
    if (!showcaseCoverMat) return;
    const cv = getSlotCoverCanvas(slotIdx);
    if (!cv) return;
    if (showcaseCoverTex) showcaseCoverTex.dispose();
    showcaseCoverTex = new THREE.CanvasTexture(cv);
    showcaseCoverTex.encoding = THREE.sRGBEncoding;
    showcaseCoverTex.anisotropy = 4;
    showcaseCoverMat.map = showcaseCoverTex;
    showcaseCoverMat.needsUpdate = true;
  }

  /* World-space pose of the camera-locked showcase anchor (drag-to-tilt included) */
  function getHeroAnchorPose(outPos, outQuat) {
    const isNarrow = window.innerWidth <= 720;
    if (isNarrow) targetCamPos.set(0.0, 0.65, -8.6);
    else targetCamPos.set(-1.42, 0.04, -7.45);
    tmpEuler.set(nav.tiltX, nav.tiltY, 0, 'YXZ');
    tiltQuat.setFromEuler(tmpEuler);
    targetCamQuat.copy(tiltQuat).multiply(baseShowcaseLocalQuat);
    outPos.copy(targetCamPos).applyMatrix4(camera.matrixWorld);
    outQuat.copy(camera.quaternion).multiply(targetCamQuat);
  }

  /* Live world seat of the hero slot (its spring-elevated rack pose) */
  function getHeroSeatPose(outPos) {
    const s = slots[heroSlotIdx];
    if (!s) return false;
    outPos.set(s.worldX, s.y, s.worldZ);
    return true;
  }

  /* Departure pose of the current flight. A lift-off resolves the live seat (so it
     follows the rack); anything interrupted mid-flight departs from the pose that
     was captured at the moment of the interruption, so nothing ever jumps. */
  function resolveHeroStartPose() {
    if (heroFromKind === 'seat') { heroStartPos.copy(heroSeatPos); heroStartQuat.identity(); }
    else { heroStartPos.copy(heroFromPos); heroStartQuat.copy(heroFromQuat); }
  }

  function beginHeroFlight(phase, fromKind) {
    heroFromKind = fromKind;
    if (fromKind === 'pose') {
      heroFromPos.copy(heroPosePos);
      heroFromQuat.copy(heroPoseQuat);
    }
    heroPhase = phase;
    heroT = 0;
    heroOverlayOn = true;
    heroSeatSuppressed = true;
    heroFadeFrom = heroCanvasOpacity;
  }

  function setHeroSeated() {
    heroPhase = HERO_PHASE_SEATED;
    heroT = 0;
    heroOverlayOn = false;
    heroSeatSuppressed = false;
    heroCanvasOpacity = 0;
    heroPoseQuat.identity();
    getHeroSeatPose(heroPosePos);
    if (document.body.classList.contains('detail-closing')) {
      document.body.classList.remove('detail-closing');
    }
  }

  /* Advance the extraction / retraction flight and resolve this frame's world pose.
     Runs before the rack instance loop so the duplicated slot stays in sync. */
  function updateHeroFlight(dt) {
    if (!camera || !showcaseGroup || heroSlotIdx < 0 || !slots[heroSlotIdx]) return;

    // Live seat + camera-locked anchor for this frame
    getHeroSeatPose(heroSeatPos);
    getHeroAnchorPose(heroAnchorPos, heroAnchorQuat);
    heroLiftPos.copy(heroSeatPos);
    heroLiftPos.y += HERO_LIFT;

    if (heroPhase === HERO_PHASE_SEATED) {
      heroOverlayOn = false;
      heroSeatSuppressed = false;
      heroCanvasOpacity = 0;
      heroPosePos.copy(heroSeatPos);
      heroPoseQuat.identity();
    } else if (heroPhase === HERO_PHASE_SHOWN) {
      heroOverlayOn = true;
      heroSeatSuppressed = true;
      heroCanvasOpacity = 1;
      heroPosePos.copy(heroAnchorPos);
      heroPoseQuat.copy(heroAnchorQuat);
    } else if (heroPhase === HERO_PHASE_RISING) {
      heroOverlayOn = true;
      heroSeatSuppressed = true;
      heroT += dt;
      const u = clamp01(heroT / heroDur);
      resolveHeroStartPose();

      if (u < HERO_RISE_END) {
        // 1. Pull the cartridge straight up out of its slot: clear the wall first
        //    (eased in and out of rest so the lift-off has weight, no yank)
        const k = smooth01(clamp01(u / HERO_RISE_END));
        heroPosePos.copy(heroStartPos).lerp(heroLiftPos, k);
      } else {
        // 2. Carry it out of the wall towards the viewer, with a soft outward arc
        const k = smooth01(clamp01((u - HERO_RISE_END) / (1 - HERO_RISE_END)));
        heroPosePos.copy(heroLiftPos).lerp(heroAnchorPos, k);
        heroPosePos.y += Math.sin(Math.PI * k) * 0.24;
      }
      // Turn from rack registration to the presentation pose once it is clear
      heroPoseQuat.copy(heroStartQuat).slerp(heroAnchorQuat, smooth01((u - HERO_RISE_END) / 0.34));
      // Dissolve in exactly as the cartridge clears the cartridge wall: while it is
      // still inside the stack the plates standing in front of it are composited
      // underneath the overlay, so the card comes up as it becomes unobstructed.
      const riseK = clamp01(u / HERO_RISE_END);
      const riseFade = smooth01(clamp01((riseK - 0.12) / 0.72));
      heroCanvasOpacity = heroFadeFrom + (1 - heroFadeFrom) * (0.30 + 0.70 * riseFade);

      if (u >= 1) {
        heroPhase = HERO_PHASE_SHOWN;
        heroCanvasOpacity = 1;
        heroPosePos.copy(heroAnchorPos);
        heroPoseQuat.copy(heroAnchorQuat);
      }
    } else if (heroPhase === HERO_PHASE_DROPPING) {
      heroOverlayOn = true;
      heroT += dt;
      const u = clamp01(heroT / heroDur);
      resolveHeroStartPose();

      if (u < HERO_DROP_START) {
        // 1. Carry it back over its own slot on a raised arc, so it travels above
        //    the rack tops (where the depth ordering of the overlay is unambiguous)
        //    instead of ploughing through the cartridge wall.
        const k = smooth01(clamp01(u / HERO_DROP_START));
        heroPosePos.copy(heroStartPos).lerp(heroLiftPos, k);
        heroPosePos.y += Math.sin(Math.PI * k) * 0.55;
      } else if (u < HERO_DROP_END) {
        // 2. Insertion: drop straight down the +Y axis, registered to the slot.
        //    Neighbours sit on the other lattice points, so this is the one path
        //    that cannot intersect a cartridge on the way in.
        const k = smooth01(clamp01((u - HERO_DROP_START) / (HERO_DROP_END - HERO_DROP_START)));
        heroPosePos.copy(heroLiftPos).lerp(heroSeatPos, k);
        if (k > 0.72) {
          // 3. Seat with a little compress-and-settle so the insertion has weight
          heroPosePos.y -= Math.sin(Math.PI * ((k - 0.72) / 0.28)) * 0.055;
        }
      } else {
        // Damped rebound onto the live seat (decays to exactly 0 at touchdown)
        const k = clamp01((u - HERO_DROP_END) / (1 - HERO_DROP_END));
        const rebound = Math.sin(Math.PI * 2 * k) * Math.exp(-6.5 * k);
        heroPosePos.copy(heroSeatPos);
        heroPosePos.y += 0.024 * rebound;
        // The real rack cartridge is restored underneath and takes over as the
        // overlay dissolves: no pop, no popping duplicate, no cutting edge.
        heroSeatSuppressed = false;
      }
      // Orientation is fully rack-registered well before the drop-in starts
      heroPoseQuat.copy(heroStartQuat).slerp(HERO_IDENTITY, smooth01(u / HERO_DROP_START));
      // Dissolve out in step with the insertion: the deeper the cartridge sinks into
      // the stack, the more of it the plates in front of it actually cover, so the
      // overlay is retired at the same rate instead of hanging over their faces.
      const dropK = clamp01((u - HERO_DROP_START) / (HERO_DROP_END - HERO_DROP_START));
      const ramp = u < HERO_DROP_START ? smooth01(u / 0.25) : 1;
      const fadeOut = u < HERO_DROP_START ? 1 : 1 - smooth01(clamp01((dropK - 0.22) / 0.78));
      heroCanvasOpacity = (heroFadeFrom + (1 - heroFadeFrom) * ramp) * fadeOut;

      if (u >= 1) setHeroSeated();
    }

    // World -> showcase camera space (the showcase camera is an identity camera at
    // the origin, which is what keeps the extracted cartridge pixel-locked to the rack)
    camInvQuat.copy(camera.quaternion).invert();
    heroPoseCamPos.copy(heroPosePos).applyMatrix4(camera.matrixWorldInverse);
    heroPoseCamQuat.copy(camInvQuat).multiply(heroPoseQuat);
  }

  function applyThemeVisuals(newTheme, silent) {
    theme = newTheme;
    const isObs = theme === 'obsidian';
    document.body.classList.toggle('theme-obsidian', isObs);
    el.themeLabel.textContent = isObs ? 'OBSIDIAN' : 'CERAMIC';

    if (scene) {
      const bgHex = isObs ? 0x0a0d14 : 0xeae6df;
      scene.background.setHex(bgHex);
      scene.fog.color.setHex(bgHex);
      scene.fog.near = isObs ? 9.8 : 10.8;
      scene.fog.far = isObs ? 21.8 : 23.2;

      if (isObs) {
        ambientLight.color.setHex(0x1f283a);
        ambientLight.intensity = 0.65;
        hemiLight.color.setHex(0x88a8d8);
        hemiLight.groundColor.setHex(0x0b0f18);
        hemiLight.intensity = 0.68;
        keyLight.color.setHex(0xdbeafe);
        keyLight.intensity = 1.05;
        rimLight.color.setHex(0x64748b);
        rimLight.intensity = 0.55;
        frameMat.color.setHex(0x2a3140);
        frameMat.roughness = 0.30;
        frameMat.metalness = 0.38;
        spineMat.color.setHex(0xb8c5da);
        spineMat.roughness = 0.22;
        spineMat.metalness = 0.28;
        notchMat.color.setHex(0x11151e);
      } else {
        ambientLight.color.setHex(0xf6f2ea);
        ambientLight.intensity = 0.42;
        hemiLight.color.setHex(0xfffdf9);
        hemiLight.groundColor.setHex(0xc9c0b2);
        hemiLight.intensity = 0.72;
        keyLight.color.setHex(0xfff9f0);
        keyLight.intensity = 0.85;
        rimLight.color.setHex(0xf4efe8);
        rimLight.intensity = 0.35;
        frameMat.color.setHex(0xf4f1ea);
        frameMat.roughness = 0.48;
        frameMat.metalness = 0.06;
        spineMat.color.setHex(0xfbf9f4);
        spineMat.roughness = 0.32;
        spineMat.metalness = 0.08;
        notchMat.color.setHex(0x26282e);
      }
    }

    // Synchronize foreground showcase scene materials & studio lighting
    if (showcaseScene) {
      if (isObs) {
        showcaseAmbient.color.setHex(0xd8e4ff);
        showcaseAmbient.intensity = 0.72;
        showcaseHemi.color.setHex(0xdbeafe);
        showcaseHemi.groundColor.setHex(0x131a2a);
        showcaseHemi.intensity = 0.56;
        showcaseKey.color.setHex(0xf1f5ff);
        showcaseKey.intensity = 0.72;
        showcaseFill.color.setHex(0x93c5fd);
        showcaseFill.intensity = 0.32;
        showcaseRim.color.setHex(0xff9c3d);
        showcaseRim.intensity = 0.38;
        showcaseFrameMat.color.setHex(0x2a3140);
        showcaseFrameMat.roughness = 0.30;
        showcaseFrameMat.metalness = 0.38;
        showcaseSpineMat.color.setHex(0xc2cee0);
        showcaseSpineMat.roughness = 0.22;
        showcaseSpineMat.metalness = 0.26;
        showcaseNotchMat.color.setHex(0x11151e);
      } else {
        showcaseAmbient.color.setHex(0xfaf7f2);
        showcaseAmbient.intensity = 0.62;
        showcaseHemi.color.setHex(0xffffff);
        showcaseHemi.groundColor.setHex(0xc8c0b4);
        showcaseHemi.intensity = 0.52;
        showcaseKey.color.setHex(0xfffaf2);
        showcaseKey.intensity = 0.58;
        showcaseFill.color.setHex(0xeef4ff);
        showcaseFill.intensity = 0.34;
        showcaseRim.color.setHex(0xffcf99);
        showcaseRim.intensity = 0.30;
        showcaseFrameMat.color.setHex(0xf4f1ea);
        showcaseFrameMat.roughness = 0.44;
        showcaseFrameMat.metalness = 0.08;
        showcaseSpineMat.color.setHex(0xfbf9f4);
        showcaseSpineMat.roughness = 0.28;
        showcaseSpineMat.metalness = 0.10;
        showcaseNotchMat.color.setHex(0x26282e);
      }
      if (showcaseBackMat.map) showcaseBackMat.map.dispose();
      showcaseBackMat.map = buildShowcaseBackTexture(isObs);
      showcaseBackMat.needsUpdate = true;
    }

    if (!silent) {
      showToast(isObs ? t('toast.themeObsidian') : t('toast.themeCeramic'));
    }
  }

  /* =========================================================================
   * 8. CANVAS POINTER, PANNING, RAYCAST & DETAIL TILT INTERACTIONS
   * ========================================================================= */
  function bindCanvasInteractions() {
    const canvas = el.threeCanvas;

    function setPointer(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      nav.parallaxX = pointerNDC.x;
      nav.parallaxY = pointerNDC.y;
    }

    canvas.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      setPointer(ev.clientX, ev.clientY);
      nav.lastX = ev.clientX;
      nav.lastY = ev.clientY;
      nav.dragMoved = false;

      if (detailMode) {
        nav.inspectDragging = true;
        canvas.style.cursor = 'grabbing';
      } else {
        nav.isDragging = true;
        canvas.style.cursor = 'grabbing';
      }
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
    });

    canvas.addEventListener('pointermove', (ev) => {
      setPointer(ev.clientX, ev.clientY);

      if (detailMode) {
        if (nav.inspectDragging) {
          const dx = ev.clientX - nav.lastX;
          const dy = ev.clientY - nav.lastY;
          nav.lastX = ev.clientX;
          nav.lastY = ev.clientY;
          nav.targetTiltY = Math.max(-0.55, Math.min(0.55, nav.targetTiltY + dx * 0.0055));
          nav.targetTiltX = Math.max(-0.36, Math.min(0.36, nav.targetTiltX + dy * 0.0045));
        } else {
          canvas.style.cursor = ev.clientX < window.innerWidth * 0.52 ? 'grab' : 'default';
        }
        return;
      }

      if (nav.isDragging) {
        const dx = ev.clientX - nav.lastX;
        const dy = ev.clientY - nav.lastY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) nav.dragMoved = true;
        nav.lastX = ev.clientX;
        nav.lastY = ev.clientY;

        // Pan along camera's horizontal basis vectors so dragging feels directly attached to the rack
        const panSpeed = 0.014;
        const az = 0.94; // camera azimuth ~54°
        const rX = Math.cos(az), rZ = -Math.sin(az);
        const fX = -Math.sin(az), fZ = -Math.cos(az);
        nav.targetPanX += (-dx * rX + dy * fX) * panSpeed;
        nav.targetPanZ += (-dx * rZ + dy * fZ) * panSpeed;
        return;
      }

      // Raycast hover detection against cover meshes + instanced frames
      if (raycaster && camera) {
        raycaster.setFromCamera(pointerNDC, camera);
        const hitCovers = raycaster.intersectObjects(coverMeshes, false);
        if (hitCovers.length > 0) {
          hoveredSlot = hitCovers[0].object.userData.slotIndex;
          canvas.style.cursor = 'pointer';
        } else {
          const hitInst = raycaster.intersectObject(frameInstMesh, false);
          if (hitInst.length > 0 && hitInst[0].instanceId != null) {
            hoveredSlot = hitInst[0].instanceId;
            canvas.style.cursor = 'pointer';
          } else {
            hoveredSlot = -1;
            canvas.style.cursor = 'grab';
          }
        }
      }
    });

    canvas.addEventListener('pointerup', (ev) => {
      if (detailMode) {
        nav.inspectDragging = false;
        // Spring smoothly back to resting showcase pose on release
        nav.targetTiltX = 0;
        nav.targetTiltY = 0;
        canvas.style.cursor = 'grab';
        return;
      }

      const wasDrag = nav.dragMoved;
      nav.isDragging = false;
      canvas.style.cursor = hoveredSlot >= 0 ? 'pointer' : 'grab';

      if (!wasDrag && hoveredSlot >= 0) {
        openDetailForSlot(hoveredSlot);
      }
    });

    canvas.addEventListener('pointerleave', () => {
      hoveredSlot = -1;
      nav.isDragging = false;
      if (nav.inspectDragging) {
        nav.inspectDragging = false;
        nav.targetTiltX = 0;
        nav.targetTiltY = 0;
      }
    });

    // Smooth infinite rack scrolling with mouse wheel
    canvas.addEventListener('wheel', (ev) => {
      if (detailMode) return;
      ev.preventDefault();
      const delta = Math.abs(ev.deltaY) > Math.abs(ev.deltaX) ? ev.deltaY : ev.deltaX;
      if (ev.shiftKey) {
        nav.targetPanZ += delta * 0.008;
      } else {
        nav.targetPanX += delta * 0.0055;
      }
    }, { passive: false });
  }

  /* =========================================================================
   * 9. 3D-TO-2D PROJECTED RHINE LAB RETICLE CALLOUT
   * ========================================================================= */
  const projA = new THREE.Vector3();
  const projTL = new THREE.Vector3();
  const projBL = new THREE.Vector3();

  function project3D(vec) {
    const v = vec.clone().project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * window.innerWidth,
      y: (-v.y * 0.5 + 0.5) * window.innerHeight,
      inFront: v.z >= -1 && v.z <= 1,
    };
  }

  function updateProjectedCallout() {
    if (detailMode || !camera || !slots.length) return;
    const targetIdx = hoveredSlot >= 0 ? hoveredSlot : activeSlotIdx;
    const s = slots[targetIdx];
    if (!s) return;

    // Update text label for the hovered or active slot
    if (s.trackIdx >= 0 && tracks[s.trackIdx]) {
      const tr = tracks[s.trackIdx];
      el.calloutFileNum.textContent = 'FILE NUMBER: ' + tr.id;
      el.calloutTitle.textContent = tr.name;
      el.calloutSub.textContent = (tr.artist || 'LOCAL ARCHIVE') + ' · ' + (tr.format || 'AUDIO');
    } else {
      const preset = COVER_PRESETS[s.defaultCoverIdx];
      const code = 'X-' + String(s.index + 1).padStart(3, '0');
      el.calloutFileNum.textContent = 'FILE NUMBER: ' + code;
      el.calloutTitle.textContent = preset.title + ' // ' + preset.sub;
      el.calloutSub.textContent = 'ARCHIVE SLOT · CLICK TO INSPECT';
    }

    const topY = s.y + SLAB_Y * 0.5;
    projA.set(s.worldX + 0.22, topY - 0.16, s.worldZ - 0.15);
    projTL.set(s.worldX - 0.20, topY + 0.15, s.worldZ + SLAB_Z * 0.48);
    projBL.set(s.worldX - 0.20, topY - 1.05, s.worldZ + SLAB_Z * 0.48);

    const pA = project3D(projA);
    const pTL = project3D(projTL);
    const pBL = project3D(projBL);

    if (!pA.inFront || pA.x < 40 || pA.x > window.innerWidth - 60 || pA.y < 60 || pA.y > window.innerHeight - 90) {
      el.calloutAnchor.style.opacity = '0';
      el.dotTL.style.opacity = el.dotBL.style.opacity = el.dotTR.style.opacity = el.dotBR.style.opacity = '0';
      return;
    }

    const ax = Math.max(90, Math.min(window.innerWidth - 220, pA.x));
    const ay = Math.max(100, Math.min(window.innerHeight - 135, pA.y));

    el.calloutAnchor.style.opacity = '1';
    el.calloutAnchor.style.transform = `translate3d(${ax.toFixed(1)}px, ${ay.toFixed(1)}px, 0)`;

    const lx = Math.max(20, Math.min(ax - 38, pTL.x));
    const ty = Math.max(70, Math.min(ay - 30, pTL.y));
    const by = Math.min(window.innerHeight - 110, Math.max(ay + 14, pBL.y));
    const rx = Math.min(window.innerWidth - 24, ax + 178);

    el.dotTL.style.opacity = el.dotBL.style.opacity = el.dotTR.style.opacity = el.dotBR.style.opacity = '1';
    el.dotTL.style.left = lx.toFixed(1) + 'px'; el.dotTL.style.top = ty.toFixed(1) + 'px';
    el.dotBL.style.left = lx.toFixed(1) + 'px'; el.dotBL.style.top = by.toFixed(1) + 'px';
    el.dotTR.style.left = rx.toFixed(1) + 'px'; el.dotTR.style.top = (ay - 28).toFixed(1) + 'px';
    el.dotBR.style.left = rx.toFixed(1) + 'px'; el.dotBR.style.top = (ay + 14).toFixed(1) + 'px';
  }

  /* =========================================================================
   * 10. MIRRORED REAL-TIME FFT SPECTRUM STRIP
   * ========================================================================= */
  const VIS_BARS = 48;

  function drawVisualizer(timeSec) {
    const cv = el.visualizer;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(120, cv.clientWidth || 320);
    const h = Math.max(16, cv.clientHeight || 22);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const g = cv.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    const isObs = theme === 'obsidian';
    const live = !!(analyser && playing);
    const total = VIS_BARS * 2;
    const bw = w / total;
    const baseY = h - 1;

    for (let i = 0; i < VIS_BARS; i++) {
      let v;
      if (live) {
        const bin = Math.floor(Math.pow(i / VIS_BARS, 1.55) * (fftData.length * 0.56));
        v = fftData[bin] / 255;
      } else {
        v = 0.05 + 0.04 * (Math.sin(i * 0.34 + timeSec * 1.9) * 0.5 + 0.5);
      }
      const bh = Math.max(1.2, v * (h - 3));
      const xL = w * 0.5 - (i + 1) * bw;
      const xR = w * 0.5 + i * bw;
      const barW = Math.max(1, bw * 0.54);

      g.fillStyle = v > 0.30
        ? 'rgba(255, 123, 0, 0.90)'
        : (isObs ? 'rgba(243, 245, 249, 0.34)' : 'rgba(20, 21, 23, 0.30)');
      g.fillRect(xL, baseY - bh, barW, bh);
      g.fillRect(xR, baseY - bh, barW, bh);
    }
  }

  /* =========================================================================
   * 11. 60FPS ANIMATION LOOP (TOROIDAL RACK + PULL-OUT + DETAIL FLY-OUT)
   * ========================================================================= */
  let prevNow = 0;

  function animate(nowMs) {
    window.requestAnimationFrame(animate);
    const timeSec = nowMs * 0.001;
    const dt = Math.min(0.05, prevNow ? (nowMs - prevNow) * 0.001 : 0.016);
    prevNow = nowMs;

    // Sample FFT bass energy
    let bassEnergy = 0;
    if (analyser && playing) {
      analyser.getByteFrequencyData(fftData);
      let sum = 0;
      for (let i = 0; i < 24; i++) sum += fftData[i];
      bassEnergy = sum / (24 * 255);
    }

    drawVisualizer(timeSec);

    if (!renderer || !scene || !camera) return;

    // Smooth damped rack panning & detail inspection tilt
    const damp = 1 - Math.exp(-6.5 * dt);
    nav.panX += (nav.targetPanX - nav.panX) * damp;
    nav.panZ += (nav.targetPanZ - nav.panZ) * damp;
    nav.tiltX += (nav.targetTiltX - nav.tiltX) * (1 - Math.exp(-10 * dt));
    nav.tiltY += (nav.targetTiltY - nav.tiltY) * (1 - Math.exp(-10 * dt));

    // Elevated architectural oblique camera (~40.7° elevation, ~54° azimuth)
    const dist = 9.2;
    const az = 0.94 + (detailMode ? 0 : nav.parallaxX * 0.025);
    const elv = 0.71 - (detailMode ? 0 : nav.parallaxY * 0.025);
    const horiz = dist * Math.cos(elv);

    const lookX = nav.panX;
    const lookY = 0.25;
    const lookZ = nav.panZ;

    camera.position.set(
      lookX + Math.sin(az) * horiz,
      lookY + Math.sin(elv) * dist,
      lookZ + Math.cos(az) * horiz
    );
    camera.lookAt(lookX, lookY, lookZ);
    camera.updateMatrixWorld();

    // Advance the extraction / retraction flight of the foreground Hero Cartridge.
    // Runs before the rack loop so the duplicated slot is hidden/restored in sync.
    updateHeroFlight(dt);

    // Toroidal wrapping center shifted slightly into the background (-1.3, -1.1)
    // so the 420-slot matrix bleeds past all 4 edges with zero visible floor/borders.
    const wrapCenterX = nav.panX - 1.3;
    const wrapCenterZ = nav.panZ - 1.1;

    const stiffness = 12.0;
    const springDamp = Math.pow(0.76, dt * 60);

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const s = slots[i];

      // Toroidal wrap position around camera pan center (ZERO boundaries ever!)
      s.worldX = wrapToroidal(s.baseX, wrapCenterX, SPAN_X);
      s.worldZ = wrapToroidal(s.baseZ, wrapCenterZ, SPAN_Z);

      // Determine target pull-out elevation in rack
      let targetY = 0;
      if (!detailMode && i === hoveredSlot) {
        targetY = 1.48; // Elevated hover pull-out clearly reveals full square cover
      } else if (i === activeSlotIdx) {
        // Active playing cartridge stays elevated with audio-reactive FFT bass breathing
        targetY = playing ? (0.86 + bassEnergy * 0.28) : 0.72;
      }

      // Spring vertical physics
      s.velY = (s.velY + (targetY - s.y) * stiffness * dt) * springDamp;
      s.y += s.velY * dt;

      // Hide the duplicate slot in the background rack while the Hero Cartridge owns
      // the shot. Restored on the seating dissolve, never a frame with both visible.
      if (i === heroSlotIdx && heroSeatSuppressed) {
        dummy.position.set(s.worldX, s.y, s.worldZ);
        dummy.quaternion.identity();
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        frameInstMesh.setMatrixAt(i, dummy.matrix);
        spineInstMesh.setMatrixAt(i, dummy.matrix);
        notchInstMesh.setMatrixAt(i, dummy.matrix);
        s.coverMesh.visible = false;
        continue;
      }

      s.coverMesh.visible = true;
      s.coverMesh.position.set(s.worldX, s.y, s.worldZ);
      s.coverMesh.quaternion.identity();

      // Update 1: Main Frame InstancedMesh
      dummy.position.set(s.worldX, s.y, s.worldZ);
      dummy.quaternion.identity();
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      frameInstMesh.setMatrixAt(i, dummy.matrix);

      // Update 2: Front-left vertical frosted spine (+Z edge)
      dummy.position.set(s.worldX, s.y, s.worldZ + SLAB_Z * 0.5 - 0.09);
      dummy.updateMatrix();
      spineInstMesh.setMatrixAt(i, dummy.matrix);

      // Update 3: Mechanical top-edge index ridge
      dummy.position.set(s.worldX, s.y + SLAB_Y * 0.5 + 0.028, s.worldZ - 0.08);
      dummy.updateMatrix();
      notchInstMesh.setMatrixAt(i, dummy.matrix);
    }

    frameInstMesh.instanceMatrix.needsUpdate = true;
    spineInstMesh.instanceMatrix.needsUpdate = true;
    notchInstMesh.instanceMatrix.needsUpdate = true;

    // Track Warm Amber Light Spill to hovered/active cartridge
    const lightTargetIdx = (!detailMode && hoveredSlot >= 0) ? hoveredSlot : activeSlotIdx;
    const lt = slots[lightTargetIdx];
    if (lt && hoverAmberLight) {
      const liftFactor = Math.max(0.35, Math.min(1.25, lt.y / 1.1));
      const targetLx = lt.worldX + 0.42;
      const targetLy = lt.y + 0.65;
      const targetLz = lt.worldZ + 0.72;
      hoverAmberLight.position.lerp(new THREE.Vector3(targetLx, targetLy, targetLz), 0.16);
      hoverAmberLight.intensity = (detailMode ? 1.4 : 3.4) * liftFactor * (1 + bassEnergy * 0.45);
    }

    // Render background endless cartridge rack
    renderer.render(scene, camera);

    // Render foreground razor-sharp Hero 3D Album Cartridge on transparent #showcaseCanvas
    if (showcaseRenderer && showcaseScene && showcaseCamera && showcaseGroup) {
      // Dissolve level of the overlay layer (lets the depth-tested rack take over)
      if (el.showcaseCanvas && Math.abs(heroCanvasOpacity - heroCanvasOpacityApplied) > 0.002) {
        heroCanvasOpacityApplied = heroCanvasOpacity;
        el.showcaseCanvas.style.opacity = heroCanvasOpacity >= 0.999 ? '1' : heroCanvasOpacity.toFixed(3);
      }

      if (heroOverlayOn && heroCanvasOpacity > 0.002) {
        // Pose was resolved in updateHeroFlight() / camera space, 1:1 with the rack
        showcaseGroup.position.copy(heroPoseCamPos);
        showcaseGroup.quaternion.copy(heroPoseCamQuat);
        showcaseGroup.visible = true;

        showcaseRenderer.render(showcaseScene, showcaseCamera);
        showcaseHasFrame = true;
      } else if (showcaseHasFrame) {
        showcaseGroup.visible = false;
        showcaseRenderer.clear();
        showcaseHasFrame = false;
      }
    }

    updateProjectedCallout();
  }

  function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (renderer && camera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
    }
    if (showcaseRenderer && showcaseCamera) {
      showcaseCamera.aspect = w / h;
      showcaseCamera.updateProjectionMatrix();
      showcaseRenderer.setPixelRatio(dpr);
      showcaseRenderer.setSize(w, h, false);
    }
  }

  /* =========================================================================
   * 12. DETAIL INSPECTION MODE & TRACK MANAGEMENT
   * ========================================================================= */
  function getSlotCoverDataUrl(slotIdx) {
    const s = slots[slotIdx];
    if (!s) return coverLibrary[0].dataUrl;
    if (s.customCoverDataUrl) return s.customCoverDataUrl;
    if (s.trackIdx >= 0 && tracks[s.trackIdx] && tracks[s.trackIdx].coverDataUrl) {
      return tracks[s.trackIdx].coverDataUrl;
    }
    return coverLibrary[s.defaultCoverIdx].dataUrl;
  }

  function setSlotCover(slotIdx, coverObj) {
    const s = slots[slotIdx];
    if (!s || !coverObj) return;
    if (s.customCoverTex) s.customCoverTex.dispose();
    if (s.customCoverMat) s.customCoverMat.dispose();
    s.customCoverCanvas = coverObj.canvas;
    s.customCoverTex = coverObj.texture;
    s.customCoverMat = coverObj.material;
    s.customCoverDataUrl = coverObj.dataUrl;
    s.coverMesh.material = coverObj.material;
    if (s.trackIdx >= 0 && tracks[s.trackIdx]) {
      tracks[s.trackIdx].coverDataUrl = coverObj.dataUrl;
    }
    if (slotIdx === heroSlotIdx || slotIdx === detailSlotIdx) {
      updateShowcaseCoverTexture(slotIdx);
    }
    syncPlaybarInfo();
  }

  /* Swap the cartridge under inspection without ever teleporting the overlay copy.
     While a flight is airborne the departure pose is re-captured so the path stays
     continuous; when it is already presented the pose is identical and only the
     artwork swaps. */
  function retargetHeroSlot(slotIdx) {
    if (heroRetargetLock) return;
    if (heroSlotIdx === slotIdx) {
      updateShowcaseCoverTexture(slotIdx);
      return;
    }
    heroSlotIdx = slotIdx;
    updateShowcaseCoverTexture(slotIdx);

    if (heroPhase !== HERO_PHASE_RISING && heroPhase !== HERO_PHASE_DROPPING) return;
    // A lift-off that has not been sampled yet still departs from its live seat:
    // re-capturing the pose here would use the previous slot's pose.
    if (heroFromKind === 'seat' && heroT === 0) return;

    const phase = heroPhase;
    beginHeroFlight(phase, 'pose');
    heroDur = phase === HERO_PHASE_RISING ? HERO_OPEN_DUR * 0.72 : HERO_CLOSE_DUR * 0.9;
  }

  function openDetailForSlot(slotIdx) {
    const s = slots[slotIdx];
    if (!s) return;
    const wasInDetail = detailMode;
    detailSlotIdx = slotIdx;
    detailMode = true;

    // Track selection may re-target the hero slot as a side effect. It runs first,
    // behind a lock, so it can never overwrite the departure pose that the flight
    // below is about to capture.
    if (s.trackIdx >= 0 && (s.trackIdx !== currentTrackIdx || !playing)) {
      heroRetargetLock = true;
      try {
        selectTrack(s.trackIdx, true);
      } finally {
        heroRetargetLock = false;
      }
    }

    if (!wasInDetail) {
      if (heroPhase === HERO_PHASE_SEATED) {
        // Fresh entry: lift the clicked cartridge up out of the rack and present it
        heroSlotIdx = slotIdx;
        beginHeroFlight(HERO_PHASE_RISING, 'seat');
        heroDur = HERO_OPEN_DUR;
      } else {
        // Re-opening while a retraction is still underway: catch the live pose
        heroSlotIdx = slotIdx;
        beginHeroFlight(HERO_PHASE_RISING, 'pose');
        heroDur = HERO_OPEN_DUR * 0.72;
      }
      updateShowcaseCoverTexture(slotIdx);
    } else {
      // Already inspecting: a different cartridge swaps in at the presentation pose
      retargetHeroSlot(slotIdx);
    }

    document.body.classList.remove('detail-closing');
    nav.tiltX = nav.targetTiltX = 0;
    nav.tiltY = nav.targetTiltY = 0;
    document.body.classList.add('in-detail');
    renderDossier();
  }

  function closeDetailMode() {
    if (!detailMode) return;
    detailMode = false;
    document.body.classList.remove('in-detail');
    el.videoStageWrap.classList.remove('web-full');

    // Release the drag-to-tilt so the cartridge returns square
    nav.targetTiltX = 0;
    nav.targetTiltY = 0;
    nav.inspectDragging = false;

    // Opened and closed inside the same frame: there is no flight to unwind
    if (heroPhase === HERO_PHASE_RISING && heroT <= 0) {
      setHeroSeated();
      return;
    }

    if (heroPhase === HERO_PHASE_SHOWN || heroPhase === HERO_PHASE_RISING) {
      // Retraction: carry the cartridge back over its own slot and insert it down
      // the free +Y axis. The defocused veil is held until it has seated, so the
      // return is never seen slicing through the sharp cartridge wall.
      beginHeroFlight(HERO_PHASE_DROPPING, 'pose');
      heroDur = HERO_CLOSE_DUR;
      document.body.classList.add('detail-closing');
    }
  }

  function setDetailTab(tabName) {
    detailTab = tabName;
    document.querySelectorAll('.dtab').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.dpane').forEach((p) => {
      p.classList.toggle('active', p.id === 'pane-' + tabName);
    });
  }

  function renderDossier() {
    const s = slots[detailSlotIdx >= 0 ? detailSlotIdx : activeSlotIdx];
    if (!s) return;
    const tr = s.trackIdx >= 0 ? tracks[s.trackIdx] : null;

    if (tr) {
      el.cueFileId.textContent = 'FILE // ' + tr.id;
      el.dossierId.textContent = 'ARCHIVE // ' + tr.id + (tr.album ? ' · ' + tr.album : '');
      el.dossierTitle.textContent = tr.name;
      el.dossierArtist.textContent = tr.artist || t('source.local');
      el.metaFormat.textContent = tr.format || 'AUDIO';
      el.metaDuration.textContent = tr.duration > 0 ? fmtTime(tr.duration) : '--:--';
      el.metaSize.textContent = tr.size || 'REALTIME';
      el.metaSource.textContent = tr.isSynth ? t('source.synth') : t('source.local');
      el.metaSample.textContent = tr.sample || (tr.kind === 'video' ? 'H.264 / AAC' : '44.1 kHz · STEREO');
      const isThisActive = tracks[currentTrackIdx] === tr;
      el.metaMode.textContent = (isThisActive && playing) ? t('status.playing') : (isThisActive ? t('status.paused') : t('status.standby'));
      el.dossierNotes.textContent = tr.notes || t('notes.local');
      el.dossierLyrics.textContent = tr.lyrics || t('lyrics.localNone');

      el.dossierPlayBtn.style.display = 'inline-block';
      el.dossierPlayBtn.innerHTML = (isThisActive && playing)
        ? '&#9208; ' + t('pauseNow')
        : '&#9654; ' + t('playNow');

      // Video tab visibility
      const isCurVideo = isThisActive && tr.kind === 'video';
      el.videoStageWrap.style.display = isCurVideo ? 'block' : 'none';
      el.videoEmptyNote.style.display = isCurVideo ? 'none' : 'block';
      if (isCurVideo && detailTab !== 'video') {
        setDetailTab('video');
      }
    } else {
      const preset = COVER_PRESETS[s.defaultCoverIdx];
      const code = 'X-' + String(s.index + 1).padStart(3, '0');
      el.cueFileId.textContent = 'FILE // ' + code;
      el.dossierId.textContent = 'ARCHIVE // ' + code + ' · STANDBY';
      el.dossierTitle.textContent = preset.title + ' — ' + preset.sub;
      el.dossierArtist.textContent = 'Rhine Lab Archival Visual Plate';
      el.metaFormat.textContent = 'VISUAL PLATE';
      el.metaDuration.textContent = '--:--';
      el.metaSize.textContent = 'UNASSIGNED';
      el.metaSource.textContent = 'RHINE MATRIX';
      el.metaSample.textContent = '512×512 sRGB';
      el.metaMode.textContent = t('status.standby');
      el.dossierNotes.textContent = t('notes.local');
      el.dossierLyrics.textContent = t('lyrics.localNone');
      el.dossierPlayBtn.style.display = 'none';
      el.videoStageWrap.style.display = 'none';
      el.videoEmptyNote.style.display = 'block';
    }

    renderTrackList();
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
        tg.textContent = 'SYNTH';
        sub.appendChild(tg);
      }
      sub.appendChild(document.createTextNode(tr.id + ' · ' + (tr.artist || t('source.local'))));
      main.appendChild(title);
      main.appendChild(sub);

      const dur = document.createElement('span');
      dur.className = 'tr-dur';
      dur.textContent = tr.duration > 0 ? fmtTime(tr.duration) : '--:--';

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
        retargetHeroSlot(tr.slotIndex);
        renderDossier();
      });

      el.trackListEl.appendChild(row);
    });
  }

  /* =========================================================================
   * 13. PLAYBACK CONTROLLER
   * ========================================================================= */
  function activeTrack() {
    return currentTrackIdx >= 0 && currentTrackIdx < tracks.length ? tracks[currentTrackIdx] : null;
  }

  function activeMediaEl() {
    const tr = activeTrack();
    return tr && tr.kind === 'video' ? videoEl : audioEl;
  }

  function currentTimeSec() {
    const tr = activeTrack();
    if (!tr) return 0;
    if (tr.isSynth) return synthPlayer.currentTime();
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
    el.pbSub.textContent = tr.id + ' · ' + (tr.artist || t('source.local'));
    el.playBtn.textContent = playing ? '\u23F8' : '\u25B6';
    el.vPlayBtn.textContent = playing ? '\u23F8' : '\u25B6';
    document.body.classList.toggle('is-playing', playing);
  }

  function syncProgressUI() {
    const cur = currentTimeSec();
    const dur = currentDurationSec();
    const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;
    el.progressFill.style.width = pct + '%';
    el.progressThumb.style.left = pct + '%';
    el.vFill.style.width = pct + '%';
    el.vThumb.style.left = pct + '%';
    const curS = fmtTime(cur);
    const durS = dur > 0 ? fmtTime(dur) : '--:--';
    el.timeReadout.textContent = curS + ' / ' + durS;
    el.vCur.textContent = curS;
    el.vDur.textContent = durS;
    const tr = activeTrack();
    if (tr && !tr.isSynth && dur > 0) tr.duration = dur;
  }

  function selectTrack(idx, autoplay) {
    if (idx < 0 || idx >= tracks.length) return;
    synthPlayer.stop();
    audioEl.pause();
    videoEl.pause();

    currentTrackIdx = idx;
    const tr = tracks[idx];
    activeSlotIdx = tr.slotIndex;

    // Gently pan the endless rack to center the newly active cartridge
    const s = slots[activeSlotIdx];
    if (s) {
      nav.targetPanX = s.baseX;
      nav.targetPanZ = s.baseZ;
    }

    if (tr.isSynth) {
      audioEl.src = '';
      videoEl.src = '';
      synthPlayer.offsetSec = 0;
      if (autoplay) {
        synthPlayer.play(tr, 0);
        playing = true;
      } else {
        playing = false;
      }
    } else if (tr.kind === 'video') {
      audioEl.src = '';
      videoEl.src = tr.url;
      try { videoEl.currentTime = 0; } catch (e) {}
      if (autoplay) {
        ensureAudioContext();
        videoEl.play().then(() => { playing = true; syncPlaybarInfo(); renderDossier(); }).catch(() => { playing = false; syncPlaybarInfo(); });
      } else {
        playing = false;
      }
    } else {
      videoEl.src = '';
      audioEl.src = tr.url;
      try { audioEl.currentTime = 0; } catch (e) {}
      if (autoplay) {
        ensureAudioContext();
        audioEl.play().then(() => { playing = true; syncPlaybarInfo(); renderDossier(); }).catch(() => { playing = false; syncPlaybarInfo(); });
      } else {
        playing = false;
      }
    }

    syncPlaybarInfo();
    syncProgressUI();
    if (detailMode) {
      detailSlotIdx = activeSlotIdx;
      retargetHeroSlot(activeSlotIdx);
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
    ensureAudioContext();
    if (tr.isSynth) {
      if (playing) {
        synthPlayer.pause();
        playing = false;
      } else {
        synthPlayer.play(tr, synthPlayer.offsetSec);
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
      synthPlayer.stop();
      syncPlaybarInfo();
      renderDossier();
      return;
    }
    selectTrack(idx, true);
  }

  function cycleMode() {
    const order = ['list', 'loop', 'one', 'shuffle'];
    mode = order[(order.indexOf(mode) + 1) % order.length];
    el.modeBtn.textContent = t('mode.' + mode);
  }

  /* =========================================================================
   * 14. LOCAL FILE IMPORT & CUSTOM COVER HANDLING
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
    for (let i = 0; i < TRACK_SLOT_ORDER.length; i++) {
      if (!used.has(TRACK_SLOT_ORDER[i])) return TRACK_SLOT_ORDER[i];
    }
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      if (!used.has(i)) return i;
    }
    return 0;
  }

  async function importFiles(fileList) {
    if (!fileList || !fileList.length) return;
    const files = Array.from(fileList);

    // If in Detail Mode and user drops an image file, update selected cartridge's cover art!
    if (detailMode && files.length === 1 && classifyFile(files[0]) === 'image') {
      const url = URL.createObjectURL(files[0]);
      const cov = await createCoverMaterialFromUrl(url);
      URL.revokeObjectURL(url);
      if (cov) {
        setSlotCover(detailSlotIdx, cov);
        showToast(t('toast.coverUpdated'));
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

      // Parse embedded ID3v2 / MP4 / FLAC metadata & cover art
      const meta = await extractEmbeddedMetadata(file);

      const entry = {
        id: 'RL-' + String(localSeq).padStart(3, '0'),
        slotIndex: slotIdx,
        name: meta.title || fallbackName,
        artist: meta.artist || t('source.local'),
        album: meta.album || '',
        year: meta.year || '',
        kind: kind,
        isSynth: false,
        format: ext,
        size: fmtSize(file.size),
        sample: kind === 'video' ? 'LOCAL VIDEO STREAM' : '44.1 / 48 kHz',
        duration: 0,
        url: url,
        coverDataUrl: null,
      };

      const idx = tracks.push(entry) - 1;
      slots[slotIdx].trackIdx = idx;
      count += 1;
      if (firstIdx < 0) firstIdx = idx;

      // Apply embedded cover art OR extract video thumbnail frame
      if (meta.coverBlob) {
        const covUrl = URL.createObjectURL(meta.coverBlob);
        const covObj = await createCoverMaterialFromUrl(covUrl);
        URL.revokeObjectURL(covUrl);
        if (covObj) setSlotCover(slotIdx, covObj);
      } else if (kind === 'video') {
        captureVideoThumbnail(url).then(async (thumbUrl) => {
          if (thumbUrl) {
            const covObj = await createCoverMaterialFromUrl(thumbUrl);
            if (covObj) setSlotCover(slotIdx, covObj);
          }
        });
      }

      // Probe exact media duration asynchronously
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
      showToast(t('toast.imported').replace('{n}', String(count)));
      selectTrack(firstIdx, true);
      if (tracks[firstIdx].kind === 'video') {
        openDetailForSlot(tracks[firstIdx].slotIndex);
        setDetailTab('video');
      }
    }
  }

  function removeTrack(idx) {
    if (idx < 0 || idx >= tracks.length) return;
    const tr = tracks[idx];
    if (tr.isSynth) return;
    if (tr.url) { try { URL.revokeObjectURL(tr.url); } catch (e) {} }

    // Reset cartridge slot
    const s = slots[tr.slotIndex];
    if (s) {
      s.trackIdx = -1;
      s.customCoverCanvas = null;
      if (s.customCoverTex) { s.customCoverTex.dispose(); s.customCoverTex = null; }
      if (s.customCoverMat) { s.customCoverMat.dispose(); s.customCoverMat = null; }
      s.customCoverDataUrl = null;
      s.coverMesh.material = coverLibrary[s.defaultCoverIdx].material;
      if (tr.slotIndex === heroSlotIdx || tr.slotIndex === detailSlotIdx) {
        updateShowcaseCoverTexture(tr.slotIndex);
      }
    }

    tracks.splice(idx, 1);
    // Re-index slot.trackIdx pointers
    tracks.forEach((item, newI) => {
      if (slots[item.slotIndex]) slots[item.slotIndex].trackIdx = newI;
    });

    if (idx === currentTrackIdx) {
      selectTrack(Math.min(idx, tracks.length - 1), false);
    } else if (idx < currentTrackIdx) {
      currentTrackIdx -= 1;
    }
    renderDossier();
  }

  /* =========================================================================
   * 15. UI EVENTS, SEEK SCRUBBING, I18N & BOOT
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
        synthPlayer.seek(target);
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
    document.documentElement.lang = lang;
    el.langSel.value = lang;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    el.search.placeholder = t('search');
    el.modeBtn.textContent = t('mode.' + mode);
    el.loaderSub.textContent = t('loader.sub');
    syncPlaybarInfo();
    renderDossier();
  }

  function bindUIEvents() {
    bindSeekBar(el.progressBar);
    bindSeekBar(el.vProgress);

    el.playBtn.addEventListener('click', togglePlay);
    el.vPlayBtn.addEventListener('click', togglePlay);
    el.prevBtn.addEventListener('click', () => stepTrack(-1));
    el.nextBtn.addEventListener('click', () => stepTrack(1));
    el.modeBtn.addEventListener('click', cycleMode);

    el.volSlider.addEventListener('input', () => {
      if (masterGain) masterGain.gain.value = Number(el.volSlider.value);
    });

    el.pbTrackTrigger.addEventListener('click', () => {
      if (detailMode && detailSlotIdx === activeSlotIdx) closeDetailMode();
      else openDetailForSlot(activeSlotIdx);
    });

    el.backBtn.addEventListener('click', closeDetailMode);

    el.dossierPlayBtn.addEventListener('click', () => {
      const s = slots[detailSlotIdx];
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
      const cov = await createCoverMaterialFromUrl(url);
      URL.revokeObjectURL(url);
      if (cov) {
        setSlotCover(detailSlotIdx >= 0 ? detailSlotIdx : activeSlotIdx, cov);
        showToast(t('toast.coverUpdated'));
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
          openDetailForSlot(activeSlotIdx);
          setDetailTab('tracks');
        }
      });
    });

    el.search.addEventListener('input', () => {
      renderTrackList();
      if (el.search.value.trim() && !detailMode) {
        openDetailForSlot(activeSlotIdx);
        setDetailTab('tracks');
      }
    });

    el.themeBtn.addEventListener('click', () => {
      applyThemeVisuals(theme === 'ceramic' ? 'obsidian' : 'ceramic', false);
    });

    el.langSel.addEventListener('change', () => {
      lang = el.langSel.value;
      try { localStorage.setItem('rhine3d:lang', lang); } catch (e) {}
      applyI18n();
    });

    el.importBtn.addEventListener('click', () => el.fileInput.click());
    el.fileInput.addEventListener('change', () => {
      importFiles(el.fileInput.files);
      el.fileInput.value = '';
    });

    // Video fullscreen toggles
    el.vWebFsBtn.addEventListener('click', () => el.videoStageWrap.classList.toggle('web-full'));
    el.vFsBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        try { document.exitFullscreen(); } catch (e) {}
      } else {
        try { el.videoStageWrap.requestFullscreen(); } catch (e) {}
      }
    });

    // Full-window Drag & Drop
    let dragDepth = 0;
    window.addEventListener('dragenter', (ev) => {
      ev.preventDefault();
      dragDepth++;
      el.dropOverlay.classList.add('active');
    });
    window.addEventListener('dragover', (ev) => ev.preventDefault());
    window.addEventListener('dragleave', (ev) => {
      ev.preventDefault();
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) el.dropOverlay.classList.remove('active');
    });
    window.addEventListener('drop', (ev) => {
      ev.preventDefault();
      dragDepth = 0;
      el.dropOverlay.classList.remove('active');
      if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) {
        importFiles(ev.dataTransfer.files);
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (ev) => {
      if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'TEXTAREA')) return;
      if (ev.key === 'Escape') {
        if (el.videoStageWrap.classList.contains('web-full')) {
          el.videoStageWrap.classList.remove('web-full');
        } else if (detailMode) {
          closeDetailMode();
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
          if (tr && tr.isSynth) synthPlayer.seek(target);
          else if (tr) activeMediaEl().currentTime = target;
          syncProgressUI();
        } else {
          nav.targetPanX += PITCH_X * 2;
        }
      } else if (ev.key === 'ArrowLeft') {
        if (detailMode) {
          const target = Math.max(0, currentTimeSec() - 5);
          const tr = activeTrack();
          if (tr && tr.isSynth) synthPlayer.seek(target);
          else if (tr) activeMediaEl().currentTime = target;
          syncProgressUI();
        } else {
          nav.targetPanX -= PITCH_X * 2;
        }
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        stepTrack(-1);
      } else if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        stepTrack(1);
      }
    });

    window.addEventListener('resize', handleResize);
    window.setInterval(() => { if (playing) syncProgressUI(); }, 250);
  }

  function mountBuiltinTracks() {
    BUILTIN_TRACKS.forEach((b, i) => {
      const slotIdx = TRACK_SLOT_ORDER[i];
      const entry = Object.assign({}, b, {
        slotIndex: slotIdx,
        coverDataUrl: coverLibrary[b.coverIdx].dataUrl,
      });
      const idx = tracks.push(entry) - 1;
      const s = slots[slotIdx];
      if (s) {
        s.trackIdx = idx;
        s.defaultCoverIdx = b.coverIdx;
        s.coverMesh.material = coverLibrary[b.coverIdx].material;
      }
    });
    currentTrackIdx = 0;
    activeSlotIdx = tracks[0].slotIndex;
  }

  function boot() {
    initCoverLibrary();
    initThreeScene();
    mountBuiltinTracks();
    applyThemeVisuals('ceramic', true);
    bindUIEvents();
    applyI18n();
    syncPlaybarInfo();
    syncProgressUI();
    window.requestAnimationFrame(animate);

    // Brief sleek Rhine Lab boot ring fade-out (~1.1s)
    window.setTimeout(() => {
      el.loader.classList.add('done');
      window.setTimeout(() => {
        if (el.loader && el.loader.parentNode) el.loader.parentNode.removeChild(el.loader);
      }, 550);
    }, 1100);
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
