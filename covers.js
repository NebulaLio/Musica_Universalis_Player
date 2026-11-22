/**
 * MUSICA UNIVERSALIS — 18 Bespoke 512x512 Procedural Cosmic Album Artworks
 * Plus 3D Vinyl Groove Texture Generator
 */
(function (global) {
  'use strict';

  const COSMOS = (global.COSMOS = global.COSMOS || {});

  const COVER_PRESETS = [
    { code: 'MU-001', title: 'EVENT', sub: 'HORIZON', style: 'eclipse', pal: ['#080b1c', '#ff9d2e', '#4ce0ff', '#fff7e6'] },
    { code: 'MU-002', title: 'PULSAR', sub: 'RESONANCE', style: 'pulsar', pal: ['#060d20', '#4ce0ff', '#ff7b29', '#e0f2fe'] },
    { code: 'MU-003', title: 'ZERO-G', sub: 'NOCTURNE', style: 'nebula', pal: ['#0b0a28', '#6366f1', '#f43f5e', '#c4b5fd'] },
    { code: 'MU-004', title: 'HELIO', sub: 'SPHERE 04', style: 'supernova', pal: ['#190c14', '#ff8c1a', '#ef4444', '#fef3c7'] },
    { code: 'MU-005', title: 'CRYSTAL', sub: 'ORBIT', style: 'armillary', pal: ['#071d26', '#22d3ee', '#a3e635', '#ecfeff'] },
    { code: 'MU-006', title: 'STARLIGHT', sub: 'LULLABY', style: 'constellation', pal: ['#0c1226', '#f59e0b', '#93c5fd', '#f8fafc'] },
    { code: 'S-007', title: 'QUASAR', sub: 'HARMONIC', style: 'waveform', pal: ['#0e081f', '#e879f9', '#38bdf8', '#fdf4ff'] },
    { code: 'S-008', title: 'AURORA', sub: 'SONATA', style: 'aurora', pal: ['#051520', '#34d399', '#60a5fa', '#d1fae5'] },
    { code: 'S-009', title: 'KEPLER', sub: 'NO. 09', style: 'armillary', pal: ['#f0ebe1', '#1a2033', '#e06a00', '#0c8599'] },
    { code: 'S-010', title: 'SOLARIS', sub: 'CORONA', style: 'eclipse', pal: ['#1b0f0a', '#fb923c', '#fde047', '#fffbeb'] },
    { code: 'S-011', title: 'LYRA', sub: 'STRING XI', style: 'constellation', pal: ['#0a1638', '#38bdf8', '#f472b6', '#e0f2fe'] },
    { code: 'S-012', title: 'VORTEX', sub: 'OCTAVE', style: 'pulsar', pal: ['#101219', '#a3e635', '#22d3ee', '#f5f5f4'] },
    { code: 'S-013', title: 'PRISM', sub: 'NEBULA', style: 'supernova', pal: ['#161036', '#ec4899', '#06b6d4', '#fde047'] },
    { code: 'S-014', title: 'AETHER', sub: 'STUDY IV', style: 'waveform', pal: ['#ece6da', '#102a43', '#e0533c', '#0e7490'] },
    { code: 'S-015', title: 'DEEP', sub: 'GRAVITY', style: 'nebula', pal: ['#050816', '#3b82f6', '#8b5cf6', '#e2e8f0'] },
    { code: 'S-016', title: 'ZENITH', sub: 'CHORD', style: 'aurora', pal: ['#0d1f1d', '#5eead4', '#fbbf24', '#f0fdfa'] },
    { code: 'S-017', title: 'NOVA', sub: 'CADENCE', style: 'eclipse', pal: ['#1a0b16', '#fb7185', '#fbbf24', '#fff1f2'] },
    { code: 'S-018', title: 'SILENCE', sub: 'APOGEE', style: 'constellation', pal: ['#e8e4dc', '#181c28', '#3b82f6', '#ffffff'] },
  ];

  const coverLibrary = [];

  function drawStarDust(g, S, seed, tint) {
    g.save();
    let s = seed * 9301 + 49297;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 64; i++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const r = 0.6 + rnd() * 1.9;
      g.fillStyle = tint;
      g.globalAlpha = 0.14 + rnd() * 0.55;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function buildProceduralCover(preset, idx) {
    const S = 512;
    const cv = document.createElement('canvas');
    cv.width = S;
    cv.height = S;
    const g = cv.getContext('2d');
    const [c0, c1, c2, c3] = preset.pal;
    const isLight = (idx === 8 || idx === 13 || idx === 17);

    g.fillStyle = c0;
    g.fillRect(0, 0, S, S);

    if (preset.style === 'eclipse') {
      const rg = g.createRadialGradient(S * 0.5, S * 0.45, 58, S * 0.5, S * 0.45, 255);
      rg.addColorStop(0, c3);
      rg.addColorStop(0.20, c1);
      rg.addColorStop(0.50, c2);
      rg.addColorStop(0.82, c0);
      rg.addColorStop(1, '#02030a');
      g.fillStyle = rg;
      g.fillRect(0, 0, S, S);

      g.save();
      g.translate(S * 0.5, S * 0.45);
      g.rotate(-0.28);
      g.strokeStyle = c3;
      g.globalAlpha = 0.68;
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(0, 0, 196, 44, 0, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 1.2;
      g.globalAlpha = 0.35;
      g.beginPath();
      g.ellipse(0, 0, 224, 54, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();

      g.fillStyle = '#040610';
      g.beginPath();
      g.arc(S * 0.5, S * 0.45, 92, 0, Math.PI * 2);
      g.fill();
      drawStarDust(g, S, idx + 11, c3);
    } else if (preset.style === 'pulsar') {
      const bg = g.createRadialGradient(S * 0.5, S * 0.48, 10, S * 0.5, S * 0.48, S * 0.72);
      bg.addColorStop(0, c0);
      bg.addColorStop(1, '#02040a');
      g.fillStyle = bg;
      g.fillRect(0, 0, S, S);

      const jet = g.createLinearGradient(0, S * 0.1, S, S * 0.85);
      jet.addColorStop(0, 'transparent');
      jet.addColorStop(0.5, c1);
      jet.addColorStop(1, 'transparent');
      g.save();
      g.translate(S * 0.5, S * 0.48);
      g.rotate(-0.55);
      g.fillStyle = jet;
      g.globalAlpha = 0.25;
      g.fillRect(-260, -14, 520, 28);
      g.globalAlpha = 1;

      for (let r = 34; r <= 195; r += 26) {
        g.beginPath();
        g.arc(0, 0, r, 0, Math.PI * 2);
        g.strokeStyle = r % 52 === 8 ? c2 : c1;
        g.globalAlpha = 0.22 + (1 - r / 220) * 0.55;
        g.lineWidth = r === 112 ? 3.5 : 1.5;
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = c3;
      g.beginPath();
      g.arc(0, 0, 14, 0, Math.PI * 2);
      g.fill();
      g.restore();
      drawStarDust(g, S, idx + 3, c3);
    } else if (preset.style === 'nebula') {
      const rg1 = g.createRadialGradient(S * 0.68, S * 0.32, 16, S * 0.55, S * 0.44, S * 0.75);
      rg1.addColorStop(0, c1);
      rg1.addColorStop(0.52, c0);
      rg1.addColorStop(1, '#02030d');
      g.fillStyle = rg1;
      g.fillRect(0, 0, S, S);

      const rg2 = g.createRadialGradient(S * 0.34, S * 0.58, 12, S * 0.38, S * 0.58, S * 0.48);
      rg2.addColorStop(0, c2);
      rg2.addColorStop(0.45, 'rgba(244,63,94,0.28)');
      rg2.addColorStop(1, 'transparent');
      g.fillStyle = rg2;
      g.fillRect(0, 0, S, S);

      for (let k = 0; k < 7; k++) {
        g.beginPath();
        g.moveTo(0, S * (0.36 + k * 0.08));
        g.bezierCurveTo(S * 0.28, S * (0.20 + k * 0.07), S * 0.70, S * (0.68 - k * 0.05), S, S * (0.42 + k * 0.07));
        g.strokeStyle = k % 2 === 0 ? c3 : c2;
        g.globalAlpha = 0.22;
        g.lineWidth = 2;
        g.stroke();
      }
      g.globalAlpha = 1;
      drawStarDust(g, S, idx + 21, c3);
    } else if (preset.style === 'supernova') {
      const lg = g.createRadialGradient(S * 0.5, S * 0.46, 8, S * 0.5, S * 0.46, 260);
      lg.addColorStop(0, c3);
      lg.addColorStop(0.18, c1);
      lg.addColorStop(0.55, c2);
      lg.addColorStop(1, c0);
      g.fillStyle = lg;
      g.fillRect(0, 0, S, S);

      g.save();
      g.translate(S * 0.5, S * 0.46);
      for (let i = 0; i < 24; i++) {
        g.rotate(Math.PI / 12);
        g.fillStyle = i % 2 === 0 ? c3 : c1;
        g.globalAlpha = 0.22;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(185, -8);
        g.lineTo(185, 8);
        g.closePath();
        g.fill();
      }
      g.globalAlpha = 0.9;
      g.strokeStyle = c3;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(0, 0, 128, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    } else if (preset.style === 'armillary') {
      g.save();
      g.translate(S * 0.5, S * 0.46);
      for (let k = 0; k < 5; k++) {
        g.save();
        g.rotate(k * 0.52);
        g.strokeStyle = k === 0 ? c2 : c1;
        g.globalAlpha = k === 0 ? 0.9 : 0.45;
        g.lineWidth = k === 0 ? 3.5 : 1.6;
        g.beginPath();
        g.ellipse(0, 0, 170, 56 + k * 24, 0, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      }
      g.fillStyle = c2;
      g.beginPath();
      g.arc(0, 0, 26, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = isLight ? 'rgba(20,24,38,0.22)' : 'rgba(255,255,255,0.24)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-200, 0); g.lineTo(200, 0);
      g.moveTo(0, -200); g.lineTo(0, 200);
      g.stroke();
      g.restore();
      drawStarDust(g, S, idx + 7, isLight ? c1 : c3);
    } else if (preset.style === 'constellation') {
      const pts = [];
      let s = (idx + 5) * 4177;
      const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      for (let i = 0; i < 11; i++) {
        pts.push({ x: 74 + rnd() * 364, y: 80 + rnd() * 270, r: 3 + rnd() * 5.5 });
      }
      g.strokeStyle = c2;
      g.globalAlpha = 0.48;
      g.lineWidth = 1.6;
      g.beginPath();
      for (let i = 0; i < pts.length - 1; i++) {
        g.moveTo(pts[i].x, pts[i].y);
        g.lineTo(pts[i + 1].x, pts[i + 1].y);
      }
      g.stroke();

      g.globalAlpha = 1;
      pts.forEach((p, k) => {
        g.fillStyle = k % 3 === 0 ? c1 : c2;
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = isLight ? c1 : c3;
        g.globalAlpha = 0.35;
        g.beginPath();
        g.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
        g.stroke();
        g.globalAlpha = 1;
      });
      drawStarDust(g, S, idx + 31, isLight ? c1 : c3);
    } else if (preset.style === 'waveform') {
      g.save();
      for (let row = 0; row < 12; row++) {
        const yBase = 110 + row * 22;
        g.beginPath();
        for (let x = 36; x <= S - 36; x += 6) {
          const norm = (x - S * 0.5) / (S * 0.34);
          const env = Math.exp(-norm * norm * 1.9);
          const wave = Math.sin(x * 0.045 + row * 0.7 + idx) * 28 * env
                     + Math.cos(x * 0.09 - row * 0.4) * 11 * env;
          if (x === 36) g.moveTo(x, yBase - wave);
          else g.lineTo(x, yBase - wave);
        }
        g.strokeStyle = row % 3 === 0 ? c1 : c2;
        g.globalAlpha = 0.35 + (row / 12) * 0.55;
        g.lineWidth = row === 5 ? 3 : 1.5;
        g.stroke();
      }
      g.restore();
      drawStarDust(g, S, idx + 19, isLight ? c1 : c3);
    } else {
      for (let b = 0; b < 5; b++) {
        const ag = g.createLinearGradient(0, 70 + b * 40, S, 360 + b * 24);
        ag.addColorStop(0, 'transparent');
        ag.addColorStop(0.35, b % 2 === 0 ? c1 : c2);
        ag.addColorStop(0.7, c3);
        ag.addColorStop(1, 'transparent');
        g.fillStyle = ag;
        g.globalAlpha = 0.34;
        g.beginPath();
        g.moveTo(0, 140 + b * 36);
        g.bezierCurveTo(S * 0.33, 40 + b * 28, S * 0.66, 260 + b * 20, S, 120 + b * 38);
        g.lineTo(S, 280 + b * 36);
        g.bezierCurveTo(S * 0.64, 380 + b * 18, S * 0.32, 180 + b * 24, 0, 290 + b * 32);
        g.closePath();
        g.fill();
      }
      g.globalAlpha = 1;
      drawStarDust(g, S, idx + 41, c3);
    }

    const fg = isLight ? 'rgba(19,24,38,0.92)' : 'rgba(244,247,255,0.94)';
    const fgMute = isLight ? 'rgba(19,24,38,0.55)' : 'rgba(220,232,255,0.58)';

    g.fillStyle = fgMute;
    g.font = '700 15px ui-monospace, Consolas, monospace';
    g.fillText('MUSICA UNIVERSALIS', 34, 46);
    g.textAlign = 'right';
    g.fillText(preset.code, S - 34, 46);

    g.textAlign = 'left';
    g.fillStyle = fg;
    g.font = '800 48px Inter, system-ui, sans-serif';
    g.fillText(preset.title, 34, S - 64);

    g.fillStyle = fgMute;
    g.font = '600 21px ui-monospace, Consolas, monospace';
    g.fillText(preset.sub, 36, S - 32);

    g.strokeStyle = fgMute;
    g.lineWidth = 1.6;
    g.strokeRect(18, 18, S - 36, S - 36);

    const dataUrl = cv.toDataURL('image/jpeg', 0.88);
    const texture = new THREE.CanvasTexture(cv);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    // Fine-art museum matte material: zero specular reflection glare while preserving true cover colors
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.34,
      side: THREE.FrontSide,
    });
    return { canvas: cv, dataUrl, texture, material };
  }

  COSMOS.COVER_PRESETS = COVER_PRESETS;
  COSMOS.coverLibrary = coverLibrary;

  COSMOS.initCoverLibrary = function () {
    if (coverLibrary.length) return;
    for (let i = 0; i < COVER_PRESETS.length; i++) {
      coverLibrary.push(buildProceduralCover(COVER_PRESETS[i], i));
    }
  };

  COSMOS.createCoverMaterialFromUrl = function (url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
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
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          emissiveMap: tex,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.34,
          side: THREE.FrontSide,
        });
        resolve({ canvas: cv, dataUrl: cv.toDataURL('image/jpeg', 0.88), texture: tex, material: mat });
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  COSMOS.buildVinylDiscTexture = function (coverCanvas, isLight) {
    const S = 512;
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const g = cv.getContext('2d');
    const cx = S * 0.5, cy = S * 0.5;

    const baseGrad = g.createRadialGradient(cx, cy, 40, cx, cy, S * 0.5);
    baseGrad.addColorStop(0, isLight ? '#1c2333' : '#090d1a');
    baseGrad.addColorStop(0.55, isLight ? '#141926' : '#0b1124');
    baseGrad.addColorStop(0.92, isLight ? '#212b42' : '#121d3b');
    baseGrad.addColorStop(1, isLight ? '#c97a28' : '#4ce0ff');
    g.fillStyle = baseGrad;
    g.fillRect(0, 0, S, S);

    g.save();
    g.translate(cx, cy);
    for (let k = 0; k < 2; k++) {
      g.rotate(k * Math.PI);
      const sheen = g.createLinearGradient(-240, -120, 240, 120);
      sheen.addColorStop(0, 'transparent');
      sheen.addColorStop(0.45, isLight ? 'rgba(255,190,120,0.16)' : 'rgba(76,224,255,0.20)');
      sheen.addColorStop(0.55, isLight ? 'rgba(255,255,255,0.22)' : 'rgba(255,157,46,0.18)');
      sheen.addColorStop(1, 'transparent');
      g.fillStyle = sheen;
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, 250, -0.42, 0.32);
      g.closePath();
      g.fill();
    }
    g.restore();

    for (let r = 92; r < 246; r += 3.2) {
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.strokeStyle = (Math.floor(r) % 19 === 0)
        ? (isLight ? 'rgba(255,180,90,0.28)' : 'rgba(76,224,255,0.32)')
        : 'rgba(255,255,255,0.065)';
      g.lineWidth = (Math.floor(r) % 19 === 0) ? 1.4 : 0.85;
      g.stroke();
    }

    g.save();
    g.beginPath();
    g.arc(cx, cy, 82, 0, Math.PI * 2);
    g.closePath();
    g.clip();
    if (coverCanvas) {
      g.drawImage(coverCanvas, cx - 86, cy - 86, 172, 172);
    } else {
      g.fillStyle = '#ff9d2e';
      g.fillRect(cx - 86, cy - 86, 172, 172);
    }
    g.restore();

    g.beginPath();
    g.arc(cx, cy, 82, 0, Math.PI * 2);
    g.strokeStyle = isLight ? '#e06a00' : '#ff9d2e';
    g.lineWidth = 3;
    g.stroke();

    g.beginPath();
    g.arc(cx, cy, 11, 0, Math.PI * 2);
    g.fillStyle = '#03050c';
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)';
    g.lineWidth = 1.5;
    g.stroke();

    const tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  };
})(window);
