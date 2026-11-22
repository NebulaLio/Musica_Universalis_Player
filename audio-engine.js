/**
 * MUSICA UNIVERSALIS — Web Audio Cosmic Synth Engine, FFT Analyser
 * & Pure-JS Embedded Metadata / Cover Art Parsers (ID3v2 / MP4 / FLAC / Video)
 */
(function (global) {
  'use strict';

  const COSMOS = (global.COSMOS = global.COSMOS || {});

  const BUILTIN_TRACKS = [
    {
      id: 'MU-001',
      name: 'Event Horizon Overture',
      artist: 'Nebula Harmonic Ensemble',
      album: 'MUSICA UNIVERSALIS // VOL. I',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'COSMIC SYNTH',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 168,
      coverIdx: 0,
      synthConfig: {
        tempoMs: 430,
        wave: 'triangle',
        chords: [
          [220.00, 277.18, 329.63, 415.30],
          [196.00, 246.94, 293.66, 369.99],
          [174.61, 220.00, 261.63, 329.63],
          [164.81, 246.94, 329.63, 392.00],
        ],
        arp: [440, 554.37, 659.25, 830.61, 659.25, 587.33, 493.88, 659.25],
        bassMul: 0.5,
        filterHz: 2100,
      },
      notes: '音樂宇宙核心共振序曲。\n以溫潤泛音和聲與深空低頻脈衝構築星際聲場，喚醒六重諧振軌道的星體律動。',
      lyrics: '[00:00] // HARMONIC SINGULARITY IGNITION\n[00:14] Light bends gently around the golden rim\n[00:30] Six concentric orbits awaken in resonance\n[00:50] Every star carries a silent frequency\n[01:14] Drifting across the luminous event horizon',
    },
    {
      id: 'MU-002',
      name: 'Pulsar Resonance 432',
      artist: 'Celestial Telemetry Unit',
      album: 'DEEP SPACE LOGS',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'COSMIC SYNTH',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 184,
      coverIdx: 1,
      synthConfig: {
        tempoMs: 350,
        wave: 'sawtooth',
        chords: [
          [146.83, 174.61, 220.00, 261.63],
          [130.81, 164.81, 196.00, 246.94],
          [116.54, 146.83, 174.61, 220.00],
          [130.81, 164.81, 196.00, 220.00],
        ],
        arp: [293.66, 349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00],
        bassMul: 0.5,
        filterHz: 1650,
      },
      notes: '來自深空脈衝星的精密節拍觀測記錄。\n以 D Dorian 調式驅動軌道低頻與星光琶音，呈現天體鐘擺般的精密律動。',
      lyrics: '[00:00] // PULSAR SIGNAL LOCKED\n[00:18] Across the vacuum, frequencies crystallize\n[00:36] Tracking radial vector through the cyan mist\n[00:58] Every pulse ripples across the star-chart dome',
    },
    {
      id: 'MU-003',
      name: 'Zero-G Nocturne',
      artist: 'Kepler Deep Observatory',
      album: 'MELODRAMA IN ORBIT',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'COSMIC SYNTH',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 210,
      coverIdx: 2,
      synthConfig: {
        tempoMs: 510,
        wave: 'sine',
        chords: [
          [185.00, 220.00, 277.18, 329.63],
          [146.83, 185.00, 220.00, 277.18],
          [164.81, 207.65, 246.94, 329.63],
          [138.59, 164.81, 207.65, 246.94],
        ],
        arp: [369.99, 440.00, 554.37, 659.25, 739.99, 659.25, 554.37, 493.88],
        bassMul: 0.5,
        filterHz: 2400,
      },
      notes: '無重力深藍星雲夜曲。\n寬闊的九和弦與空間延遲殘響交織，勾勒出漂浮在紫藍星雲之間的靜謐失重感。',
      lyrics: '[00:00] // ZERO-GRAVITY DRIFT\n[00:22] Violet clouds breathe across the observatory glass\n[00:44] Heartbeat slowed to a distant galactic tide\n[01:15] Dreaming in ultraviolet silence',
    },
    {
      id: 'MU-004',
      name: 'Heliosphere Drift',
      artist: 'Solar Wind Acoustic Lab',
      album: 'SOLAR CORONA SUITE',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'COSMIC SYNTH',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 156,
      coverIdx: 3,
      synthConfig: {
        tempoMs: 305,
        wave: 'sawtooth',
        chords: [
          [130.81, 155.56, 196.00, 233.08],
          [103.83, 130.81, 155.56, 196.00],
          [116.54, 146.83, 174.61, 207.65],
          [98.00, 116.54, 146.83, 174.61],
        ],
        arp: [261.63, 311.13, 392.00, 466.16, 523.25, 466.16, 392.00, 349.23],
        bassMul: 0.5,
        filterHz: 1850,
      },
      notes: '太陽風與日冕粒子流的高能節律。\n鮮明的斷奏合成器與推進低音，為星盤中心頻譜環帶來充滿張力的視覺脈動。',
      lyrics: '[00:00] // CORONA OUTPUT NOMINAL\n[00:14] Amber arcs ignite across the ecliptic plane\n[00:32] Velocity locked — riding the solar wind\n[00:54] Heliosphere glowing beyond the outer shell',
    },
    {
      id: 'MU-005',
      name: 'Crystalline Orbit',
      artist: 'Aether Chamber Orchestra',
      album: 'GLASS HARMONICS',
      year: '2026',
      kind: 'audio',
      isSynth: true,
      format: 'COSMIC SYNTH',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 176,
      coverIdx: 4,
      synthConfig: {
        tempoMs: 400,
        wave: 'sine',
        chords: [
          [164.81, 207.65, 246.94, 311.13],
          [138.59, 164.81, 207.65, 246.94],
          [110.00, 138.59, 164.81, 207.65],
          [123.47, 155.56, 185.00, 220.00],
        ],
        arp: [659.25, 622.25, 493.88, 415.30, 493.88, 659.25, 739.99, 830.61],
        bassMul: 0.5,
        filterHz: 2800,
      },
      notes: '冰晶星環清澈共鳴練習曲。\n晶瑩剔透的高頻五聲音階如彗星冰粒互相折射，營造空靈純淨的三維層次感。',
      lyrics: '[00:00] // ICE RING TELEMETRY\n[00:19] Starlight refracts through floating crystal shards\n[00:40] Reflections spiral across the orbital glass\n[01:02] Every chime returns to the harmonic core',
    },
    {
      id: 'MU-006',
      name: 'Starlight Lullaby',
      artist: 'Outer Rim Voyager Archive',
      album: 'GOLDEN RECORD CODA',
      year: '2025',
      kind: 'audio',
      isSynth: true,
      format: 'COSMIC SYNTH',
      sample: '48.0 kHz · 32-bit Float',
      size: 'REALTIME',
      duration: 198,
      coverIdx: 5,
      synthConfig: {
        tempoMs: 485,
        wave: 'triangle',
        chords: [
          [116.54, 146.83, 174.61, 220.00],
          [98.00, 116.54, 146.83, 174.61],
          [155.56, 196.00, 233.08, 293.66],
          [130.81, 174.61, 196.00, 233.08],
        ],
        arp: [466.16, 587.33, 698.46, 880.00, 698.46, 587.33, 523.25, 466.16],
        bassMul: 0.5,
        filterHz: 1850,
      },
      notes: '外星域航行者黃金唱片終章。\n溫暖緩慢的類比銅管質感和聲與高音星鈴，獻給越過星海邊界的寧靜夜晚。',
      lyrics: '[00:00] // TRANSMISSION FROM THE OUTER RIM\n[00:25] Goodnight, traveler — the galaxy is wide open\n[00:52] Starlight settles gently onto the spinning disc\n[01:24] Until the next melody crosses the dark',
    },
  ];

  COSMOS.BUILTIN_TRACKS = BUILTIN_TRACKS;

  const audioEl = new Audio();
  audioEl.preload = 'metadata';

  let videoEl = null;
  let audioCtx = null;
  let masterGain = null;
  let analyser = null;
  let mediaNodesWired = false;
  let onEndedCb = null;
  const fftData = new Uint8Array(512);

  function bindVideoElement(vEl) {
    videoEl = vEl;
    if (videoEl) {
      videoEl.preload = 'metadata';
      videoEl.addEventListener('ended', () => { if (onEndedCb) onEndedCb(); });
    }
  }

  audioEl.addEventListener('ended', () => { if (onEndedCb) onEndedCb(); });

  function ensureAudioContext(initialVol) {
    try {
      if (!audioCtx) {
        const AC = global.AudioContext || global.webkitAudioContext;
        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.82;
        masterGain.gain.value = (initialVol != null) ? initialVol : 0.72;
        masterGain.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      if (!mediaNodesWired && videoEl) {
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

  const synthPlayer = {
    active: false,
    config: null,
    duration: 168,
    offsetSec: 0,
    startedAt: 0,
    step: 0,
    timer: null,
    bus: null,
    currentTrackRef: null,

    play(track, startOffset, vol) {
      ensureAudioContext(vol);
      if (!audioCtx) return;
      this.stop();
      this.active = true;
      this.currentTrackRef = track;
      this.config = track.synthConfig;
      this.duration = track.duration || 168;
      this.offsetSec = startOffset != null ? startOffset : 0;
      this.startedAt = performance.now() / 1000;
      this.step = Math.floor((this.offsetSec * 1000) / this.config.tempoMs);

      this.bus = audioCtx.createGain();
      this.bus.gain.setValueAtTime(0.001, audioCtx.currentTime);
      this.bus.gain.exponentialRampToValueAtTime(0.52, audioCtx.currentTime + 0.35);

      const lpf = audioCtx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = this.config.filterHz || 1950;
      lpf.Q.value = 1.3;

      const delay = audioCtx.createDelay(1.0);
      delay.delayTime.value = (this.config.tempoMs / 1000) * 0.75;
      const fb = audioCtx.createGain();
      fb.gain.value = 0.38;

      this.bus.connect(lpf);
      lpf.connect(masterGain);
      lpf.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(masterGain);

      this.triggerStep();
      this.timer = setInterval(() => {
        if (this.currentTime() >= this.duration) {
          if (onEndedCb) onEndedCb();
          return;
        }
        this.triggerStep();
      }, this.config.tempoMs);
    },

    triggerStep() {
      if (!this.active || !audioCtx || !this.config) return;
      const now = audioCtx.currentTime;
      const cfg = this.config;

      if (this.step % 8 === 0) {
        const chord = cfg.chords[Math.floor(this.step / 8) % cfg.chords.length];
        const dur = (cfg.tempoMs * 8) / 1000;
        chord.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = idx === 0 ? cfg.wave : 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? freq * cfg.bassMul : freq, now);
          osc.detune.setValueAtTime((idx - 1.5) * 4.5, now);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(idx === 0 ? 0.16 : 0.082, now + 0.65);
          g.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.45);
          osc.connect(g);
          g.connect(this.bus);
          osc.start(now);
          osc.stop(now + dur + 0.55);
        });
      }

      const note = cfg.arp[this.step % cfg.arp.length];
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.11, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 0.58);
      osc.connect(env);
      env.connect(this.bus);
      osc.start(now);
      osc.stop(now + 0.62);

      if (this.step % 2 === 1) {
        const shim = audioCtx.createOscillator();
        const sEnv = audioCtx.createGain();
        shim.type = 'triangle';
        shim.frequency.setValueAtTime(note * 2, now);
        sEnv.gain.setValueAtTime(0.0001, now);
        sEnv.gain.linearRampToValueAtTime(0.026, now + 0.015);
        sEnv.gain.exponentialRampToValueAtTime(0.0005, now + 0.36);
        shim.connect(sEnv);
        sEnv.connect(this.bus);
        shim.start(now);
        shim.stop(now + 0.4);
      }

      if (this.step % 4 === 0) {
        const kick = audioCtx.createOscillator();
        const kEnv = audioCtx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(116, now);
        kick.frequency.exponentialRampToValueAtTime(40, now + 0.18);
        kEnv.gain.setValueAtTime(0.32, now);
        kEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
        kick.connect(kEnv);
        kEnv.connect(this.bus);
        kick.start(now);
        kick.stop(now + 0.32);
      }
      this.step += 1;
    },

    pause() {
      if (!this.active) return;
      this.offsetSec = this.currentTime();
      this.stop();
    },

    seek(sec, vol) {
      this.offsetSec = Math.max(0, Math.min(this.duration, sec));
      if (this.active && this.currentTrackRef) {
        this.play(this.currentTrackRef, this.offsetSec, vol);
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
          this.bus.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        } catch (e) {}
      }
    },

    currentTime() {
      if (!this.active) return this.offsetSec;
      return Math.min(this.duration, this.offsetSec + (performance.now() / 1000 - this.startedAt));
    },
  };

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
      if (encoding === 3) return new TextDecoder('utf-8').decode(bytes).replace(/\0+$/g, '').trim();
      if (encoding === 1) {
        if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
          return new TextDecoder('utf-16be').decode(bytes.subarray(2)).replace(/\0+$/g, '').trim();
        }
        const start = (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) ? 2 : 0;
        return new TextDecoder('utf-16le').decode(bytes.subarray(start)).replace(/\0+$/g, '').trim();
      }
      if (encoding === 2) return new TextDecoder('utf-16be').decode(bytes).replace(/\0+$/g, '').trim();
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
          p++;
        } else {
          const fmt = String.fromCharCode(frameData[1], frameData[2], frameData[3]).toUpperCase();
          if (fmt === 'PNG') mime = 'image/png';
          p = 4;
        }
        p++;
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
    if (String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) !== 'ftyp') return null;

    const meta = {};
    const utf8 = new TextDecoder('utf-8');

    function walk(start, end) {
      let p = start;
      while (p + 8 <= end) {
        let size = view.getUint32(p);
        const type = String.fromCharCode(bytes[p + 4], bytes[p + 5], bytes[p + 6], bytes[p + 7]);
        let hdr = 8;
        if (size === 1 && p + 16 <= end) { size = view.getUint32(p + 12); hdr = 16; }
        else if (size === 0) size = end - p;
        if (size < hdr || p + size > end) break;

        const bodyStart = p + hdr;
        const bodyEnd = p + size;

        if (type === 'moov' || type === 'udta' || type === 'ilst') walk(bodyStart, bodyEnd);
        else if (type === 'meta') walk(bodyStart + 4, bodyEnd);
        else if (type === 'covr' || type === '\xa9nam' || type === '\xa9ART' || type === '\xa9alb' || type === '\xa9day') {
          let q = bodyStart;
          while (q + 16 <= bodyEnd) {
            const dSize = view.getUint32(q);
            const dType = String.fromCharCode(bytes[q + 4], bytes[q + 5], bytes[q + 6], bytes[q + 7]);
            if (dSize < 16 || q + dSize > bodyEnd) break;
            if (dType === 'data') {
              const dataFlag = view.getUint32(q + 8);
              const payload = bytes.subarray(q + 16, q + dSize);
              if (type === 'covr' && !meta.coverBlob) {
                meta.coverBlob = new Blob([payload], { type: dataFlag === 14 ? 'image/png' : 'image/jpeg' });
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
        let q = p + 4;
        if (q + 4 <= p + len) {
          const mimeLen = view.getUint32(q, false);
          q += 4;
          const mime = utf8.decode(bytes.subarray(q, q + mimeLen)) || 'image/jpeg';
          q += mimeLen;
          const descLen = view.getUint32(q, false);
          q += 4 + descLen + 16;
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
      const sliceLen = Math.min(file.size, 6 * 1024 * 1024);
      const buf = await file.slice(0, sliceLen).arrayBuffer();
      const ext = ((file.name || '').split('.').pop() || '').toLowerCase();

      let meta = null;
      if (ext === 'flac') meta = parseFLACMetadata(buf);
      else if (ext === 'm4a' || ext === 'mp4' || ext === 'm4v' || ext === 'mov') meta = parseMP4Metadata(buf);
      else meta = parseID3v2(buf);

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
            g.fillStyle = 'rgba(4,8,20,0.68)';
            g.fillRect(20, 20, 108, 26);
            g.fillStyle = '#4ce0ff';
            g.font = '700 12px ui-monospace, Consolas, monospace';
            g.fillText('HOLO // VIDEO', 28, 38);
            finish(cv.toDataURL('image/jpeg', 0.86));
          } catch (e) { finish(null); }
        });
        v.addEventListener('error', () => finish(null));
      } catch (e) { resolve(null); }
    });
  }

  COSMOS.audioEngine = {
    audioEl,
    fftData,
    synthPlayer,
    bindVideoElement,
    ensureAudioContext,
    setVolume(v) { if (masterGain) masterGain.gain.value = v; },
    setOnEnded(cb) { onEndedCb = cb; },
    isAnalyserReady() { return !!analyser; },
    sampleFFT(isPlaying) {
      let bass = 0;
      let mid = 0;
      let high = 0;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(fftData);
        let bSum = 0;
        for (let i = 0; i < 24; i++) bSum += fftData[i];
        bass = bSum / (24 * 255);
        let mSum = 0;
        for (let i = 24; i < 96; i++) mSum += fftData[i];
        mid = mSum / (72 * 255);
        let hSum = 0;
        for (let i = 96; i < 200; i++) hSum += fftData[i];
        high = hSum / (104 * 255);
      }
      return { bass, mid, high };
    },
    extractEmbeddedMetadata,
    captureVideoThumbnail,
  };
})(window);
