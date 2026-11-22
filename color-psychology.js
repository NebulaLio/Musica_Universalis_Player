/**
 * MUSICA UNIVERSALIS — Color Psychology & Anti-Glare Cover Harmonization Engine
 *
 * Extracts the perceptual dominant hue from any album cover canvas (procedural or
 * local user artwork) and synthesizes a strictly eye-friendly, non-glaring 3-tier
 * atmospheric palette following color psychology & Rec.709 luminance ceilings.
 */
(function (global) {
  'use strict';

  const COSMOS = (global.COSMOS = global.COSMOS || {});

  /* ---- RGB <-> HSL Helpers ---- */
  function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) * 0.5;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: h * 360, s, l };
  }

  function hslToRgb(hDeg, s, l) {
    const h = (((hDeg % 360) + 360) % 360) / 360;
    const sc = Math.max(0, Math.min(1, s));
    const lc = Math.max(0, Math.min(1, l));
    if (sc === 0) return { r: lc, g: lc, b: lc };
    const q = lc < 0.5 ? lc * (1 + sc) : lc + sc - lc * sc;
    const p = 2 * lc - q;
    const hue2rgb = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return {
      r: hue2rgb(h + 1 / 3),
      g: hue2rgb(h),
      b: hue2rgb(h - 1 / 3),
    };
  }

  /* ---- Perceptual Rec.709 Luminance Limiter (Prevents Glare / Eye Strain) ---- */
  function clampPerceptualLuma(rgb, minLuma, maxLuma) {
    const y = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    if (y > maxLuma && y > 0.0001) {
      const ratio = maxLuma / y;
      return { r: rgb.r * ratio, g: rgb.g * ratio, b: rgb.b * ratio };
    }
    if (y < minLuma) {
      const boost = minLuma - y;
      return {
        r: Math.min(1, rgb.r + boost * 0.85),
        g: Math.min(1, rgb.g + boost * 0.85),
        b: Math.min(1, rgb.b + boost * 0.85),
      };
    }
    return rgb;
  }

  function rgbToHexInt(rgb) {
    const ri = Math.max(0, Math.min(255, Math.round(rgb.r * 255)));
    const gi = Math.max(0, Math.min(255, Math.round(rgb.g * 255)));
    const bi = Math.max(0, Math.min(255, Math.round(rgb.b * 255)));
    return (ri << 16) | (gi << 8) | bi;
  }

  function rgbToCss(rgb, alpha) {
    const ri = Math.max(0, Math.min(255, Math.round(rgb.r * 255)));
    const gi = Math.max(0, Math.min(255, Math.round(rgb.g * 255)));
    const bi = Math.max(0, Math.min(255, Math.round(rgb.b * 255)));
    if (alpha != null) return `rgba(${ri}, ${gi}, ${bi}, ${alpha})`;
    return `rgb(${ri}, ${gi}, ${bi})`;
  }

  /* ---- 8 Curated Color Psychology Archetypes ---- */
  const PSYCH_PROFILES = {
    crimson: {
      key: 'crimson',
      label: { 'zh-TW': '緋紅柔韻 · 溫熱共鳴', 'zh-CN': '绯红柔韵 · 温热共鸣', 'en': 'MUTED ROSE · INTIMATE WARMTH' },
      satMid: 0.46, satDeep: 0.38, satRim: 0.38,
      shiftDeep: -18, shiftRim: 28,
    },
    amber: {
      key: 'amber',
      label: { 'zh-TW': '暖珀微光 · 溫潤療癒', 'zh-CN': '暖珀微光 · 温润疗愈', 'en': 'SOFT AMBER · GROUNDED CALM' },
      satMid: 0.48, satDeep: 0.38, satRim: 0.40,
      shiftDeep: -16, shiftRim: 20,
    },
    ochre: {
      key: 'ochre',
      label: { 'zh-TW': '柔金草木 · 舒緩平靜', 'zh-CN': '柔金草木 · 舒缓平静', 'en': 'WARM OCHRE · ORGANIC EASE' },
      satMid: 0.38, satDeep: 0.30, satRim: 0.34,
      shiftDeep: 22, shiftRim: -18,
    },
    jade: {
      key: 'jade',
      label: { 'zh-TW': '松影青嵐 · 自然平衡', 'zh-CN': '松影青岚 · 自然平衡', 'en': 'SAGE JADE · RESTORATIVE BALANCE' },
      satMid: 0.40, satDeep: 0.32, satRim: 0.34,
      shiftDeep: 18, shiftRim: -22,
    },
    teal: {
      key: 'teal',
      label: { 'zh-TW': '深海靜青 · 澄明冥想', 'zh-CN': '深海静青 · 澄明冥想', 'en': 'GLACIAL TEAL · LUCID CLARITY' },
      satMid: 0.44, satDeep: 0.36, satRim: 0.36,
      shiftDeep: 20, shiftRim: -18,
    },
    indigo: {
      key: 'indigo',
      label: { 'zh-TW': '暮靛夜色 · 沉思專注', 'zh-CN': '暮靛夜色 · 沉思专注', 'en': 'TWILIGHT INDIGO · DEEP FOCUS' },
      satMid: 0.40, satDeep: 0.34, satRim: 0.30,
      shiftDeep: 16, shiftRim: -24,
    },
    amethyst: {
      key: 'amethyst',
      label: { 'zh-TW': '暮紫幻境 · 夢境冥想', 'zh-CN': '暮紫幻境 · 梦境冥想', 'en': 'DUSK LAVENDER · POETIC DREAM' },
      satMid: 0.42, satDeep: 0.36, satRim: 0.34,
      shiftDeep: -22, shiftRim: 24,
    },
    moonstone: {
      key: 'moonstone',
      label: { 'zh-TW': '月白銀灰 · 純粹寂靜', 'zh-CN': '月白银灰 · 纯粹寂静', 'en': 'MOONSTONE · PURE STILLNESS' },
      satMid: 0.13, satDeep: 0.14, satRim: 0.14,
      shiftDeep: 0, shiftRim: 0,
    },
  };

  function classifyPsychProfile(hueDeg, avgChroma) {
    if (avgChroma < 0.085) return PSYCH_PROFILES.moonstone;
    const h = ((hueDeg % 360) + 360) % 360;
    if (h >= 340 || h < 18) return PSYCH_PROFILES.crimson;
    if (h < 52) return PSYCH_PROFILES.amber;
    if (h < 105) return PSYCH_PROFILES.ochre;
    if (h < 168) return PSYCH_PROFILES.jade;
    if (h < 212) return PSYCH_PROFILES.teal;
    if (h < 262) return PSYCH_PROFILES.indigo;
    return PSYCH_PROFILES.amethyst;
  }

  // Reusable 48x48 offscreen sampler to keep extraction instant (< 1ms)
  let sampleCanvas = null;
  let sampleCtx = null;

  function sampleDominantHueFromCanvas(canvas) {
    if (!canvas) return { hue: 215, chroma: 0.35 };
    try {
      if (!sampleCanvas) {
        sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = 48;
        sampleCanvas.height = 48;
        sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      }
      sampleCtx.clearRect(0, 0, 48, 48);
      sampleCtx.drawImage(canvas, 0, 0, 48, 48);
      const data = sampleCtx.getImageData(0, 0, 48, 48).data;

      const BINS = 36;
      const weights = new Float32Array(BINS);
      const hueCos = new Float32Array(BINS);
      const hueSin = new Float32Array(BINS);
      let totalChroma = 0;
      let totalCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue;
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const hsl = rgbToHsl(r, g, b);

        // Mid-luminance Gaussian preference: ignore clipped blacks/whites that carry no emotional color
        const lWeight = Math.exp(-Math.pow((hsl.l - 0.48) / 0.28, 2));
        const chroma = hsl.s * (1 - Math.abs(2 * hsl.l - 1));
        totalChroma += chroma;
        totalCount += 1;

        if (hsl.s < 0.08 || hsl.l < 0.06 || hsl.l > 0.94) continue;

        const w = (0.25 + chroma * 2.4) * lWeight;
        const bin = Math.floor(((hsl.h % 360) / 360) * BINS) % BINS;
        const rad = (hsl.h * Math.PI) / 180;
        weights[bin] += w;
        hueCos[bin] += Math.cos(rad) * w;
        hueSin[bin] += Math.sin(rad) * w;
      }

      const avgChroma = totalCount > 0 ? totalChroma / totalCount : 0;
      let bestBin = 0;
      let bestScore = -1;
      for (let b = 0; b < BINS; b++) {
        // 3-bin neighborhood smoothing so wide analogous tones outrank tiny noisy spikes
        const prev = (b - 1 + BINS) % BINS;
        const next = (b + 1) % BINS;
        const score = weights[b] + 0.45 * (weights[prev] + weights[next]);
        if (score > bestScore) {
          bestScore = score;
          bestBin = b;
        }
      }

      if (bestScore <= 0.001) return { hue: 215, chroma: 0.04 };

      const prev = (bestBin - 1 + BINS) % BINS;
      const next = (bestBin + 1) % BINS;
      const cSum = hueCos[bestBin] + 0.45 * (hueCos[prev] + hueCos[next]);
      const sSum = hueSin[bestBin] + 0.45 * (hueSin[prev] + hueSin[next]);
      let domHue = (Math.atan2(sSum, cSum) * 180) / Math.PI;
      if (domHue < 0) domHue += 360;

      return { hue: domHue, chroma: avgChroma };
    } catch (e) {
      return { hue: 215, chroma: 0.32 };
    }
  }

  /**
   * Builds a complete, eye-friendly Color Psychology Palette for the 3D central core,
   * orbital rings, tether beam, and kinetic HUD typography.
   */
  function analyzeCoverPsychology(canvas, isLightTheme) {
    const { hue, chroma } = sampleDominantHueFromCanvas(canvas);
    const prof = classifyPsychProfile(hue, chroma);
    const baseHue = prof.key === 'moonstone' ? 218 : hue;

    // Preserve cover's true hue while strictly constraining saturation & luminance
    // Dark cosmos: velvety low-glare bioluminescence (luma strictly <= 0.56)
    // Light ether: refined tinted alabaster / ceramic mineral tone
    // Gently brightened translucent pearl luminance — still strictly eye-friendly & glare-free
    const lDeep = isLightTheme ? 0.34 : 0.22;
    const lMid  = isLightTheme ? 0.49 : 0.44;
    const lRim  = isLightTheme ? 0.64 : 0.63;
    const lRing = isLightTheme ? 0.50 : 0.58;
    const lHud  = isLightTheme ? 0.40 : 0.74;

    const deepRgb = clampPerceptualLuma(
      hslToRgb(baseHue + prof.shiftDeep, prof.satDeep, lDeep),
      isLightTheme ? 0.25 : 0.13,
      isLightTheme ? 0.40 : 0.29
    );
    const midRgb = clampPerceptualLuma(
      hslToRgb(baseHue, prof.satMid, lMid),
      isLightTheme ? 0.36 : 0.27,
      isLightTheme ? 0.54 : 0.48
    );
    const rimRgb = clampPerceptualLuma(
      hslToRgb(baseHue + prof.shiftRim, prof.satRim, lRim),
      isLightTheme ? 0.48 : 0.44,
      isLightTheme ? 0.68 : 0.67
    );
    const ringRgb = clampPerceptualLuma(
      hslToRgb(baseHue + prof.shiftRim * 0.55, Math.min(0.48, prof.satMid + 0.04), lRing),
      isLightTheme ? 0.38 : 0.40,
      isLightTheme ? 0.60 : 0.63
    );
    const hudRgb = clampPerceptualLuma(
      hslToRgb(baseHue + prof.shiftRim * 0.4, Math.min(0.50, prof.satMid + 0.06), lHud),
      isLightTheme ? 0.28 : 0.56,
      isLightTheme ? 0.48 : 0.78
    );

    return {
      profileKey: prof.key,
      hue: baseHue,
      labels: prof.label,
      deepHex: rgbToHexInt(deepRgb),
      midHex: rgbToHexInt(midRgb),
      rimHex: rgbToHexInt(rimRgb),
      ringHex: rgbToHexInt(ringRgb),
      hudCss: rgbToCss(hudRgb),
      hudSoftCss: rgbToCss(hudRgb, isLightTheme ? 0.16 : 0.22),
      rimCss: rgbToCss(rimRgb),
      midCss: rgbToCss(midRgb),
    };
  }

  COSMOS.colorPsych = {
    analyzeCoverPsychology,
    getMoodLabel(palette, lang) {
      if (!palette || !palette.labels) return '';
      return palette.labels[lang] || palette.labels['zh-TW'] || palette.labels.en || '';
    },
  };
})(window);
