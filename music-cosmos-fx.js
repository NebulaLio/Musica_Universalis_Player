/**
 * MUSICA UNIVERSALIS — 3D Musical Universe Elements Engine
 *
 * Renders:
 * 1. Dual interwoven 3D orbital 5-line musical staves (立體三維五線譜帶) with
 *    dynamic audio-breathing wave undulation & vertical 3D measure barlines (小節線)
 * 2. 48 traveling 3D musical notes (立體音符：傾斜橢圓符頭 + 符幹) pitched precisely
 *    across the 5 lines & 4 spaces of each 3D stave, gliding & pulsing softly with FFT
 * 3. Glowing celestial musical glyphs (𝄞, 𝄢, ♪, ♫, ♯) floating gracefully along the score
 * 4. 180 rising harmonic stardust motes drifting upward from the central core & staves
 */
(function (global) {
  'use strict';

  const COSMOS = (global.COSMOS = global.COSMOS || {});

  const STAVE_CONFIGS = [
    {
      radius: 8.15,
      lineGap: 0.21,
      tiltX: 0.24,
      tiltZ: -0.15,
      yOffset: 0.35,
      waveAmp: 0.62,
      waveFreq: 2,
      speed: 0.042,
      noteCount: 22,
      glyphs: ['𝄞', '♪', '♫', '♪', '♯', '♫'],
      segments: 160,
    },
    {
      radius: 15.35,
      lineGap: 0.26,
      tiltX: -0.19,
      tiltZ: 0.16,
      yOffset: -0.25,
      waveAmp: 1.05,
      waveFreq: 3,
      speed: -0.026,
      noteCount: 26,
      glyphs: ['𝄢', '♫', '♪', '𝄞', '♭', '♪', '♫'],
      segments: 180,
    },
  ];

  const NOTE_STEPS = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]; // 5 lines + 4 spaces

  let rootGroup = null;
  let staveSystems = [];
  let noteHeadInst = null;
  let noteStemInst = null;
  let noteMat = null;
  let noteItems = [];
  let glyphSprites = [];
  let glyphMaterials = [];
  let harmonicDust = null;
  let harmonicDustMat = null;
  let dustPositions = null;
  let dustSeeds = null;

  const dummy = new THREE.Object3D();
  const tmpPos = new THREE.Vector3();
  const tmpNext = new THREE.Vector3();
  const tmpTan = new THREE.Vector3();
  const tmpUp = new THREE.Vector3(0, 1, 0);
  const tmpSide = new THREE.Vector3();
  const tmpNormal = new THREE.Vector3();
  const tmpMat4 = new THREE.Matrix4();

  /* ---- Compute a point on a 3D orbital musical stave ---- */
  function evalStavePoint(cfg, angle, lineOffsetUnits, timeSec, smoothBass, smoothMid, out) {
    const breathe = Math.sin(angle * cfg.waveFreq + timeSec * 0.72) * (cfg.waveAmp + smoothBass * 0.55);
    const shimmer = Math.cos(angle * 5 - timeSec * 1.1) * (0.06 + smoothMid * 0.18);
    const r = cfg.radius + Math.sin(angle * 3 + timeSec * 0.45) * (0.28 + smoothBass * 0.22);

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const baseY = cfg.yOffset + breathe + shimmer
                + x * Math.sin(cfg.tiltZ)
                + z * Math.sin(cfg.tiltX);

    out.set(x, baseY + lineOffsetUnits * cfg.lineGap, z);
    return out;
  }

  /* ---- Create Crisp Luminous Musical Symbol Texture (𝄞, 𝄢, ♪, ♫, ♯, ♭) ---- */
  function createGlyphTexture(symbol) {
    const S = 128;
    const cv = document.createElement('canvas');
    cv.width = S;
    cv.height = S;
    const g = cv.getContext('2d');

    // Soft radial back-glow
    const rg = g.createRadialGradient(S * 0.5, S * 0.5, 4, S * 0.5, S * 0.5, S * 0.44);
    rg.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
    rg.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    rg.addColorStop(1, 'transparent');
    g.fillStyle = rg;
    g.fillRect(0, 0, S, S);

    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = 'rgba(255, 255, 255, 0.65)';
    g.shadowBlur = 12;
    g.fillStyle = '#ffffff';
    const fontSize = (symbol === '𝄞' || symbol === '𝄢') ? 74 : 62;
    g.font = `400 ${fontSize}px "Apple Symbols", "Segoe UI Symbol", "Noto Music", "Cormorant Garamond", Georgia, serif`;
    g.fillText(symbol, S * 0.5, S * 0.54);

    const tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function buildStaves() {
    staveSystems = STAVE_CONFIGS.map((cfg, sIdx) => {
      const lines = [];
      const lineMats = [];

      // 5 parallel lines per musical staff (-2, -1, 0, +1, +2)
      for (let l = -2; l <= 2; l++) {
        const pos = new Float32Array((cfg.segments + 1) * 3);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        // Center & outer lines subtly differentiated for authentic sheet-music clarity
        const isMid = (l === 0);
        const mat = new THREE.LineBasicMaterial({
          color: 0x9ec4e8,
          transparent: true,
          opacity: isMid ? 0.34 : 0.24,
        });
        const line = new THREE.Line(geo, mat);
        line.frustumCulled = false;
        rootGroup.add(line);
        lines.push({ line, geo, offset: l });
        lineMats.push(mat);
      }

      // Vertical 3D Measure Barlines (小節線) connecting line -2 to line +2
      const barCount = sIdx === 0 ? 12 : 16;
      const barPos = new Float32Array(barCount * 2 * 3);
      const barGeo = new THREE.BufferGeometry();
      barGeo.setAttribute('position', new THREE.BufferAttribute(barPos, 3));
      const barMat = new THREE.LineBasicMaterial({
        color: 0xbcd8f4,
        transparent: true,
        opacity: 0.30,
      });
      const barLines = new THREE.LineSegments(barGeo, barMat);
      barLines.frustumCulled = false;
      rootGroup.add(barLines);

      return { cfg, lines, lineMats, barLines, barGeo, barMat, barCount, phase: sIdx * 1.2 };
    });
  }

  function build3DNotes() {
    const totalNotes = STAVE_CONFIGS.reduce((acc, c) => acc + c.noteCount, 0);

    // 1. Sleek inclined 3D elliptical notehead (符頭)
    const headGeo = new THREE.SphereGeometry(0.115, 14, 12);
    headGeo.scale(1.32, 0.88, 0.62);
    headGeo.rotateZ(0.32);

    // 2. Slender 3D note stem (符幹) rising from right edge of notehead
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.68, 8);
    stemGeo.translate(0.115, 0.34, 0);

    noteMat = new THREE.MeshBasicMaterial({
      color: 0xc2dcf2,
      transparent: true,
      opacity: 0.78,
    });

    noteHeadInst = new THREE.InstancedMesh(headGeo, noteMat, totalNotes);
    noteHeadInst.frustumCulled = false;
    rootGroup.add(noteHeadInst);

    noteStemInst = new THREE.InstancedMesh(stemGeo, noteMat, totalNotes);
    noteStemInst.frustumCulled = false;
    rootGroup.add(noteStemInst);

    noteItems = [];
    let idx = 0;
    STAVE_CONFIGS.forEach((cfg, sIdx) => {
      for (let k = 0; k < cfg.noteCount; k++) {
        // Organic melodic contour across the 5 staff lines & 4 spaces
        const angle = (k / cfg.noteCount) * Math.PI * 2 + sIdx * 0.5;
        const stepIdx = Math.floor((Math.sin(k * 1.15 + sIdx * 2.1) * 0.5 + 0.5) * NOTE_STEPS.length) % NOTE_STEPS.length;
        const staffPitch = NOTE_STEPS[stepIdx];
        noteItems.push({
          index: idx++,
          staveIdx: sIdx,
          angle,
          staffPitch,
          stemDown: staffPitch > 0.5, // Standard music engraving rule: notes above middle line stem down!
          fftBin: Math.min(180, 6 + ((k * 7 + sIdx * 19) % 110)),
          bobSeed: k * 0.9 + sIdx * 3.1,
        });
      }
    });
  }

  function buildFloatingGlyphs() {
    const texCache = {};
    glyphSprites = [];
    glyphMaterials = [];

    STAVE_CONFIGS.forEach((cfg, sIdx) => {
      cfg.glyphs.forEach((sym, gIdx) => {
        if (!texCache[sym]) texCache[sym] = createGlyphTexture(sym);
        const mat = new THREE.SpriteMaterial({
          map: texCache[sym],
          color: 0xcce4ff,
          transparent: true,
          opacity: (sym === '𝄞' || sym === '𝄢') ? 0.72 : 0.58,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const sprite = new THREE.Sprite(mat);
        const baseScale = (sym === '𝄞' || sym === '𝄢') ? 1.38 : 0.88;
        sprite.scale.setScalar(baseScale);
        rootGroup.add(sprite);
        glyphMaterials.push(mat);
        glyphSprites.push({
          sprite,
          mat,
          staveIdx: sIdx,
          angle: (gIdx / cfg.glyphs.length) * Math.PI * 2 + sIdx * 0.4,
          pitchOffset: (sym === '𝄞' || sym === '𝄢') ? 0.0 : ((gIdx % 3) - 1) * 1.1,
          baseScale,
          baseOpacity: mat.opacity,
          phase: gIdx * 1.4 + sIdx * 2.2,
        });
      });
    });
  }

  function buildHarmonicDust() {
    const COUNT = 180;
    dustPositions = new Float32Array(COUNT * 3);
    dustSeeds = [];

    for (let i = 0; i < COUNT; i++) {
      const r = 2.6 + Math.random() * 19.5;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 9.0;
      dustPositions[i * 3]     = Math.cos(a) * r;
      dustPositions[i * 3 + 1] = y;
      dustPositions[i * 3 + 2] = Math.sin(a) * r;
      dustSeeds.push({
        r,
        a,
        y,
        vy: 0.16 + Math.random() * 0.28,
        va: (Math.random() > 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.08),
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    harmonicDustMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xb8d4f0) },
        uAlpha: { value: 0.42 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uBass: { value: 0 },
      },
      vertexShader: `
        uniform float uPixelRatio;
        uniform float uBass;
        varying float vEdge;
        void main() {
          vEdge = 1.0 - smoothstep(2.5, 5.2, abs(position.y));
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (2.6 + uBass * 2.2) * uPixelRatio * (68.0 / max(8.0, -mvPos.z));
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uAlpha;
        varying float vEdge;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float soft = pow(1.0 - d * 2.0, 2.0);
          gl_FragColor = vec4(uColor, soft * uAlpha * vEdge);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    harmonicDust = new THREE.Points(geo, harmonicDustMat);
    rootGroup.add(harmonicDust);
  }

  function init(scene) {
    rootGroup = new THREE.Group();
    scene.add(rootGroup);
    buildStaves();
    build3DNotes();
    buildFloatingGlyphs();
    buildHarmonicDust();
  }

  function update(dt, timeSec, audioEnv, moodColors, isLight, fftData, isPlaying) {
    if (!rootGroup) return;
    const { smoothBass, smoothMid, smoothHigh } = audioEnv;
    const flowMul = 1.0 + smoothBass * 0.85 + smoothMid * 0.45;

    // 1. Update 3D 5-line Musical Staves & Measure Barlines
    staveSystems.forEach((sys, sIdx) => {
      sys.phase += sys.cfg.speed * dt * flowMul;
      const segs = sys.cfg.segments;
      const staveCol = sIdx === 0 ? moodColors.curRim : moodColors.curRing;

      sys.lines.forEach((ln, idx) => {
        const attr = ln.geo.attributes.position;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2 + sys.phase;
          evalStavePoint(sys.cfg, a, ln.offset, timeSec, smoothBass, smoothMid, tmpPos);
          attr.setXYZ(i, tmpPos.x, tmpPos.y, tmpPos.z);
        }
        attr.needsUpdate = true;
        sys.lineMats[idx].color.copy(staveCol);
        sys.lineMats[idx].opacity = (isLight ? 0.34 : 0.22)
          + (ln.offset === 0 ? 0.08 : 0.0)
          + smoothMid * 0.14;
      });

      // Vertical barlines every measure
      const bAttr = sys.barGeo.attributes.position;
      for (let b = 0; b < sys.barCount; b++) {
        const a = (b / sys.barCount) * Math.PI * 2 + sys.phase;
        evalStavePoint(sys.cfg, a, -2.0, timeSec, smoothBass, smoothMid, tmpPos);
        bAttr.setXYZ(b * 2, tmpPos.x, tmpPos.y, tmpPos.z);
        evalStavePoint(sys.cfg, a, 2.0, timeSec, smoothBass, smoothMid, tmpPos);
        bAttr.setXYZ(b * 2 + 1, tmpPos.x, tmpPos.y, tmpPos.z);
      }
      bAttr.needsUpdate = true;
      sys.barMat.color.copy(moodColors.curRim);
      sys.barMat.opacity = (isLight ? 0.36 : 0.28) + smoothBass * 0.16;
    });

    // 2. Update 48 Traveling 3D Musical Notes along the 5-line Staves
    if (noteHeadInst && noteStemInst && noteMat) {
      noteMat.color.copy(moodColors.curRim);
      noteMat.opacity = (isLight ? 0.80 : 0.76) + smoothHigh * 0.14;

      for (let i = 0; i < noteItems.length; i++) {
        const n = noteItems[i];
        const sys = staveSystems[n.staveIdx];
        const a = n.angle + sys.phase * 1.45;

        const fftEnergy = (isPlaying && fftData) ? (fftData[n.fftBin] / 255) : 0;
        const softBob = Math.sin(timeSec * 1.8 + n.bobSeed) * 0.06 + fftEnergy * 0.18;

        evalStavePoint(sys.cfg, a, n.staffPitch, timeSec, smoothBass, smoothMid, tmpPos);
        tmpPos.y += softBob;

        evalStavePoint(sys.cfg, a + 0.02, n.staffPitch, timeSec, smoothBass, smoothMid, tmpNext);
        tmpTan.subVectors(tmpNext, tmpPos).normalize();
        tmpSide.crossVectors(tmpUp, tmpTan).normalize();
        tmpNormal.crossVectors(tmpTan, tmpSide).normalize();
        tmpMat4.makeBasis(tmpTan, tmpNormal, tmpSide);

        const s = 1.0 + smoothBass * 0.14 + fftEnergy * 0.18;
        dummy.position.copy(tmpPos);
        dummy.quaternion.setFromRotationMatrix(tmpMat4);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        noteHeadInst.setMatrixAt(i, dummy.matrix);

        // Stem flips down for higher-pitched notes (authentic musical notation)
        if (n.stemDown) {
          dummy.scale.set(s, -s, s);
          dummy.updateMatrix();
        }
        noteStemInst.setMatrixAt(i, dummy.matrix);
      }
      noteHeadInst.instanceMatrix.needsUpdate = true;
      noteStemInst.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Glowing Musical Glyph Sprites (𝄞, 𝄢, ♪, ♫, ♯)
    glyphSprites.forEach((g) => {
      const sys = staveSystems[g.staveIdx];
      const a = g.angle + sys.phase * 1.15;
      evalStavePoint(sys.cfg, a, g.pitchOffset, timeSec, smoothBass, smoothMid, tmpPos);
      tmpPos.y += Math.sin(timeSec * 1.4 + g.phase) * 0.14;
      g.sprite.position.copy(tmpPos);

      const pulse = 1.0 + smoothBass * 0.14 + smoothHigh * 0.12;
      g.sprite.scale.setScalar(g.baseScale * pulse);
      g.mat.color.copy(isLight ? moodColors.curDeep : moodColors.curRim);
      g.mat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      g.mat.opacity = g.baseOpacity * (isLight ? 0.72 : (0.85 + smoothHigh * 0.25));
    });

    // 4. Update Rising Harmonic Stardust Motes
    if (harmonicDust && harmonicDustMat) {
      const attr = harmonicDust.geometry.attributes.position;
      for (let i = 0; i < dustSeeds.length; i++) {
        const d = dustSeeds[i];
        d.a += d.va * dt * (1 + smoothMid * 1.6);
        d.y += d.vy * dt * (1 + smoothBass * 2.2);
        if (d.y > 5.0) d.y = -4.6;
        attr.setXYZ(i, Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r);
      }
      attr.needsUpdate = true;
      harmonicDustMat.uniforms.uColor.value.copy(isLight ? moodColors.curMid : moodColors.curRim);
      harmonicDustMat.uniforms.uAlpha.value = isLight ? 0.26 : (0.38 + smoothMid * 0.22);
      harmonicDustMat.uniforms.uBass.value = smoothBass;
      harmonicDustMat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
    }
  }

  function handleResize(dpr) {
    if (harmonicDustMat) harmonicDustMat.uniforms.uPixelRatio.value = dpr;
  }

  COSMOS.musicCosmosFx = {
    init,
    update,
    handleResize,
  };
})(window);
