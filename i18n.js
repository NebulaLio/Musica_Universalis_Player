/**
 * MUSICA UNIVERSALIS — Trilingual Localization & Formatting Utilities
 */
(function (global) {
  'use strict';

  const COSMOS = (global.COSMOS = global.COSMOS || {});

  const I18N = {
    'zh-TW': {
      'nav.all': '全部', 'nav.audio': '星軌音訊', 'nav.video': '星際影像',
      'import': '匯入星體', 'search': '搜尋星軌檔案...', 'resetView': '歸位',
      'backCosmos': '返回音樂宇宙',
      'dragCue': '拖曳星碟，自由旋轉檢視正反封面與律動黑膠',
      'galaxyHint': '拖曳環繞音樂宇宙 · 滾輪縮放星域 · 下滑播放欄進入沉浸模式',
      'restoreBar': '展開播放欄',
      'tab.tracks': '星軌歌單', 'tab.details': '星體檔案', 'tab.lyrics': '星語歌詞', 'tab.video': '全息影像',
      'changeCover': '更換封面', 'playNow': '播放', 'pauseNow': '暫停',
      'meta.format': '格式', 'meta.duration': '時長', 'meta.orbit': '軌道層',
      'meta.source': '來源', 'meta.sample': '編碼', 'meta.mode': '狀態',
      'mode.list': '順序', 'mode.loop': '循環', 'mode.one': '單曲', 'mode.shuffle': '隨機',
      'webFull': '網頁全屏', 'full': '全屏',
      'videoEmpty': '目前星體為音訊格式。匯入本地影片檔即可於此播放無邊框全息影像。',
      'drop.title': '將本地媒體注入音樂宇宙軌道',
      'drop.sub': '鬆開以自動解析封面與音訊 / 影片檔案（詳情模式可直接拖入圖片更換封面）',
      'loader.sub': '正在校準三維音樂宇宙星軌…',
      'status.playing': '共振播放中', 'status.standby': '軌道待機', 'status.paused': '已暫停',
      'kinetic.tip': '點擊切換播放 / 暫停並觸發聲場共振',
      'source.local': '本地星體檔案', 'source.synth': '脈衝核心合成',
      'lyrics.localNone': '本地音訊未檢出內嵌歌詞。\n星體已穩定懸浮於三維音樂軌道。',
      'notes.local': '本地媒體已完成星圖索引與雙面三維黑膠封裝。\n拖曳左側星碟即可 360° 檢視正反封面與動態黑膠紋理，或點擊「更換封面」自訂星圖視覺。',
      'toast.imported': '已將 {n} 個星體注入三維音樂軌道',
      'toast.coverUpdated': '已更新目前星體雙面封面與黑膠盤心',
      'toast.themeCosmos': '已切換至 DEEP COSMOS 深空星雲模式',
      'toast.themeEther': '已切換至 SOLAR ETHER 日冕光穹模式',
      'toast.orbitOn': '已開啟宇宙自動公轉',
      'toast.orbitOff': '已切換為手動自由環繞',
      'toast.camReset': '星域視角已重置至諧振中心',
      'toast.immersiveOn': '已收起播放欄 · 沉浸宇宙模式（按 H 或上滑恢復）',
      'toast.immersiveOff': '已恢復底部播放欄',
    },
    'zh-CN': {
      'nav.all': '全部', 'nav.audio': '星轨音频', 'nav.video': '星际影像',
      'import': '导入星体', 'search': '搜索星轨档案...', 'resetView': '归位',
      'backCosmos': '返回音乐宇宙',
      'dragCue': '拖动星碟，自由旋转检视正反封面与律动黑胶',
      'galaxyHint': '拖动环绕音乐宇宙 · 滚轮缩放星域 · 下滑播放栏进入沉浸模式',
      'restoreBar': '展开播放栏',
      'tab.tracks': '星轨歌单', 'tab.details': '星体档案', 'tab.lyrics': '星语歌词', 'tab.video': '全息影像',
      'changeCover': '更换封面', 'playNow': '播放', 'pauseNow': '暂停',
      'meta.format': '格式', 'meta.duration': '时长', 'meta.orbit': '轨道层',
      'meta.source': '来源', 'meta.sample': '编码', 'meta.mode': '状态',
      'mode.list': '顺序', 'mode.loop': '循环', 'mode.one': '单曲', 'mode.shuffle': '随机',
      'webFull': '网页全屏', 'full': '全屏',
      'videoEmpty': '当前星体为音频格式。导入本地视频文件即可在此播放无边框全息影像。',
      'drop.title': '将本地媒体注入音乐宇宙轨道',
      'drop.sub': '松开以自动解析封面与音频 / 视频文件（详情模式可直接拖入图片更换封面）',
      'loader.sub': '正在校准三维音乐宇宙星轨…',
      'status.playing': '共振播放中', 'status.standby': '轨道待机', 'status.paused': '已暂停',
      'kinetic.tip': '点击切换播放 / 暂停并触发声场共振',
      'source.local': '本地星体文件', 'source.synth': '脉冲核心合成',
      'lyrics.localNone': '本地音频未检出内嵌歌词。\n星体已稳定悬浮于三维音乐轨道。',
      'notes.local': '本地媒体已完成星图索引与双面三维黑胶封装。\n拖动左侧星碟即可 360° 检视正反封面与动态黑胶纹理，或点击「更换封面」自定义星图视觉。',
      'toast.imported': '已将 {n} 个星体注入三维音乐轨道',
      'toast.coverUpdated': '已更新当前星体双面封面与黑胶盘心',
      'toast.themeCosmos': '已切换至 DEEP COSMOS 深空星云模式',
      'toast.themeEther': '已切换至 SOLAR ETHER 日冕光穹模式',
      'toast.orbitOn': '已开启宇宙自动公转',
      'toast.orbitOff': '已切换为手动自由环绕',
      'toast.camReset': '星域视角已重置至谐振中心',
      'toast.immersiveOn': '已收起播放栏 · 沉浸宇宙模式（按 H 或上滑恢复）',
      'toast.immersiveOff': '已恢复底部播放栏',
    },
    'en': {
      'nav.all': 'ALL', 'nav.audio': 'AUDIO', 'nav.video': 'VIDEO',
      'import': 'IMPORT', 'search': 'Search cosmos...', 'resetView': 'CENTER',
      'backCosmos': 'BACK TO COSMOS',
      'dragCue': 'Drag celestial sleeve to inspect front/back artwork & spinning vinyl',
      'galaxyHint': 'Drag to orbit · Scroll to zoom · Slide down playbar for immersive view',
      'restoreBar': 'SHOW PLAYBAR',
      'tab.tracks': 'TRACKS', 'tab.details': 'DOSSIER', 'tab.lyrics': 'LYRICS', 'tab.video': 'HOLO-VIDEO',
      'changeCover': 'SET COVER', 'playNow': 'PLAY', 'pauseNow': 'PAUSE',
      'meta.format': 'FORMAT', 'meta.duration': 'DURATION', 'meta.orbit': 'ORBIT',
      'meta.source': 'SOURCE', 'meta.sample': 'ENCODING', 'meta.mode': 'STATUS',
      'mode.list': 'SEQ', 'mode.loop': 'LOOP', 'mode.one': 'ONE', 'mode.shuffle': 'SHUF',
      'webFull': 'WEB FULL', 'full': 'FULLSCREEN',
      'videoEmpty': 'Active celestial node is audio-only. Import a local video to play here.',
      'drop.title': 'INJECT LOCAL MEDIA INTO ORBIT',
      'drop.sub': 'Drop audio/video files to auto-extract artwork (or drop an image in Detail Mode)',
      'loader.sub': 'CALIBRATING HARMONIC COSMOS…',
      'status.playing': 'RESONATING', 'status.standby': 'IN ORBIT', 'status.paused': 'PAUSED',
      'kinetic.tip': 'Click to toggle playback & trigger harmonic pulse',
      'source.local': 'LOCAL ARCHIVE', 'source.synth': 'PULSAR SYNTH CORE',
      'lyrics.localNone': 'No embedded lyrics detected.\nHarmonic resonance telemetry remains active.',
      'notes.local': 'Local media indexed into the 3D Music Universe with double-sided artwork.\nDrag the foreground celestial sleeve on the left to inspect its front/back cover and rotating vinyl disc.',
      'toast.imported': 'MOUNTED {n} CELESTIAL NODE(S) INTO ORBIT',
      'toast.coverUpdated': 'DOUBLE-SIDED ARTWORK & VINYL LABEL UPDATED',
      'toast.themeCosmos': 'THEME: DEEP COSMOS',
      'toast.themeEther': 'THEME: SOLAR ETHER',
      'toast.orbitOn': 'AUTO-ORBIT ENGAGED',
      'toast.orbitOff': 'FREE MANUAL ORBIT',
      'toast.camReset': 'CAMERA ALIGNED TO PULSAR CORE',
      'toast.immersiveOn': 'IMMERSIVE MODE ENGAGED (PRESS H OR SWIPE UP)',
      'toast.immersiveOff': 'PLAYBAR RESTORED',
    },
  };

  let currentLang = (function () {
    try { return localStorage.getItem('musica3d:lang') || 'zh-TW'; }
    catch (e) { return 'zh-TW'; }
  })();

  COSMOS.I18N = I18N;
  COSMOS.getLang = () => currentLang;
  COSMOS.setLang = (l) => {
    currentLang = I18N[l] ? l : 'zh-TW';
    try { localStorage.setItem('musica3d:lang', currentLang); } catch (e) {}
  };
  COSMOS.t = (key) => (I18N[currentLang] && I18N[currentLang][key]) || I18N['zh-TW'][key] || key;

  COSMOS.fmtTime = function (sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  COSMOS.fmtSize = function (bytes) {
    if (!bytes || bytes <= 0) return 'REALTIME';
    const u = ['B', 'KB', 'MB', 'GB'];
    let v = bytes, i = 0;
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    return (v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)) + ' ' + u[i];
  };
})(window);
