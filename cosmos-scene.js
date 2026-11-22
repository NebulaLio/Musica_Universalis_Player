/**
 * MUSICA UNIVERSALIS — 3D Music Universe Engine (Three.js r128)
 *
 * v2 Upgrades:
 * - Double-sided Front & Back Album Artwork on all 144 floating orbital capsules
 *   (un-mirrored front image rendered cleanly on both +Z and -Z faces in a single mesh)
 * - Foreground 3D Showcase back face also displays the front cover image
 * - Enhanced central pulsar fill & ambient lighting so inward-facing back covers glow vividly
 */
(function (global) {
  'use strict';

  const COSMOS = (global.COSMOS = global.COSMOS || {});

  /* ---- 6 Concentric Harmonic Orbital Tiers (144 Total Celestial Nodes) ---- */
  const ORBIT_RINGS = [
    { name: 'RING 01 · INNER',   radius: 6.4,  count: 12, tiltX:  0.07, tiltZ: -0.05, yAmp: 0.45, speed:  0.052 },
    { name: 'RING 02 · LYRA',    radius: 9.8,  count: 18, tiltX: -0.09, tiltZ:  0.06, yAmp: 0.72, speed: -0.038 },
    { name: 'RING 03 · KEPLER',  radius: 13.4, count: 24, tiltX:  0.11, tiltZ:  0.08, yAmp: 1.05, speed:  0.028 },
    { name: 'RING 04 · PULSAR',  radius: 17.2, count: 28, tiltX: -0.08, tiltZ: -0.10, yAmp: 1.38, speed: -0.022 },
    { name: 'RING 05 · NEBULA',  radius: 21.2, count: 30, tiltX:  0.13, tiltZ: -0.07, yAmp: 1.65, speed:  0.017 },
    { name: 'RING 06 · APOGEE',  radius: 25.4, count: 32, tiltX: -0.12, tiltZ:  0.09, yAmp: 1.95, speed: -0.013 },
  ];

  const TOTAL_SLOTS = ORBIT_RINGS.reduce((acc, r) => acc + r.count, 0); // 144

  const CAP_W = 2.08;
  const CAP_H = 2.08;
  const CAP_D = 0.14;

  const TRACK_SLOT_ORDER = (function () {
    const order = [];
    for (let i = 0; i < 12; i += 2) order.push(i);
    for (let i = 1; i < 12; i += 2) order.push(i);
    for (let i = 12; i < TOTAL_SLOTS; i++) order.push(i);
    return order;
  })();

  /* ---- Scene Objects & State ---- */
  let scene, camera, renderer, raycaster, pointerNDC;
  let ambientLight, hemiLight, coreLight, keyLight, rimLight, hoverGlowLight;
  let starPoints, starMat, nebulaPoints, nebulaMat;
  let pulsarGroup, pulsarCoreMesh, pulsarCoreMat, pulsarAuraMesh, pulsarAuraMat, pulsarCageMesh, pulsarHaloLine;
  let corePulseKick = 0;

  // Silky-soft multi-band audio envelopes (stronger organic response, zero abrupt jitter)
  const audioEnv = {
    smoothBass: 0,
    smoothMid: 0,
    smoothHigh: 0,
    flowPhase: 0,
  };

  // Smoothly interpolated Color Psychology palette (strictly non-glaring)
  const moodColors = {
    curDeep: new THREE.Color(0x1f263d),
    curMid:  new THREE.Color(0x4c6b8a),
    curRim:  new THREE.Color(0x8eaac4),
    curRing: new THREE.Color(0x6e8fb0),
    tgtDeep: new THREE.Color(0x1f263d),
    tgtMid:  new THREE.Color(0x4c6b8a),
    tgtRim:  new THREE.Color(0x8eaac4),
    tgtRing: new THREE.Color(0x6e8fb0),
  };
  let gyroRings = [];
  let orbitLinesGroup;
  let tetherLine, tetherGeo, tetherMat;
  let pulseRingMesh, pulseRingMat;

  let caseInstMesh, rimInstMesh, crestInstMesh;
  let caseMat, rimMat, crestMat;
  const slots = [];
  const coverMeshes = [];

  // Foreground Transparent 3D Showcase Scene (Hero Record Sleeve + Spinning Vinyl)
  let showcaseScene, showcaseCamera, showcaseRenderer;
  let showcaseGroup, showcaseFrameMat, showcaseRimMat, showcaseCoverMat;
  let showcaseVinylMesh, showcaseVinylMat, showcaseVinylTex = null;
  let showcaseCoverTex = null;
  let showcaseAmbient, showcaseHemi, showcaseKey, showcaseFill, showcaseRim;
  let heroSlotIdx = -1;
  let showcaseHasFrame = false;

  /* ---- Hero Extraction / Retraction Flight Choreography ---- */
  const HERO_OPEN_DUR = 0.64;
  const HERO_CLOSE_DUR = 0.72;
  const HERO_PHASE_SEATED = 0;
  const HERO_PHASE_RISING = 1;
  const HERO_PHASE_SHOWN = 2;
  const HERO_PHASE_DROPPING = 3;

  let heroPhase = HERO_PHASE_SEATED;
  let heroT = 0;
  let heroDur = HERO_OPEN_DUR;
  let heroOverlayOn = false;
  let heroSeatSuppressed = false;
  let heroCanvasOpacity = 0;
  let heroCanvasOpacityApplied = -1;
  let heroFadeFrom = 0;
  let heroFromKind = 'seat';
  let heroRetargetLock = false;

  const heroSeatPos = new THREE.Vector3();
  const heroSeatQuat = new THREE.Quaternion();
  const heroAnchorPos = new THREE.Vector3();
  const heroAnchorQuat = new THREE.Quaternion();
  const heroFromPos = new THREE.Vector3();
  const heroFromQuat = new THREE.Quaternion();
  const heroPosePos = new THREE.Vector3();
  const heroPoseQuat = new THREE.Quaternion();
  const heroStartPos = new THREE.Vector3();
  const heroStartQuat = new THREE.Quaternion();
  const heroPoseCamPos = new THREE.Vector3();
  const heroPoseCamQuat = new THREE.Quaternion();

  const dummy = new THREE.Object3D();
  const tmpVec = new THREE.Vector3();
  const tmpVec2 = new THREE.Vector3();
  const tmpEuler = new THREE.Euler();
  const camInvQuat = new THREE.Quaternion();
  const targetCamPos = new THREE.Vector3();
  const targetCamQuat = new THREE.Quaternion();
  const tiltQuat = new THREE.Quaternion();
  const baseShowcaseLocalQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0.24, -0.02, 'YXZ'));

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const smooth01 = (x) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
  const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3);

  /* ---- Interactive Camera & Inspection Navigation State ---- */
  const camNav = {
    azimuth: 0.65,
    targetAzimuth: 0.65,
    elevation: 0.38,
    targetElevation: 0.38,
    distance: 17.5,
    targetDistance: 17.5,
    lookTarget: new THREE.Vector3(0, 0, 0),
    targetLook: new THREE.Vector3(0, 0, 0),
    autoOrbit: true,
    parallaxX: 0,
    parallaxY: 0,
    isDragging: false,
    dragMoved: false,
    lastX: 0,
    lastY: 0,
    inspectDragging: false,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
  };

  let hoveredSlot = -1;
  let activeSlotIdx = TRACK_SLOT_ORDER[0];
  let detailMode = false;
  let currentTheme = 'cosmos';
  let vinylSpinAngle = 0;

  let domRefs = null;
  let callbacks = {
    onSlotClick: null,
    getTrackByIndex: null,
    isPlaying: () => false,
    onFrameUpdate: null,
  };

  /* =========================================================================
   * DOUBLE-SIDED ALBUM COVER GEOMETRY (FRONT +Z & BACK -Z, UN-MIRRORED)
   * ========================================================================= */
  function createDoubleSidedCoverGeometry(w, h, zOff) {
    const hw = w * 0.5;
    const hh = h * 0.5;
    // 8 vertices: 0..3 front face (+Z), 4..7 back face (-Z, oriented right-side-up when viewed from behind)
    const positions = new Float32Array([
      // Front face (+Z normal)
      -hw,  hh,  zOff,
       hw,  hh,  zOff,
      -hw, -hh,  zOff,
       hw, -hh,  zOff,
      // Back face (-Z normal; +X is viewer-left when viewed from -Z)
       hw,  hh, -zOff,
      -hw,  hh, -zOff,
       hw, -hh, -zOff,
      -hw, -hh, -zOff,
    ]);
    const normals = new Float32Array([
      0, 0,  1,  0, 0,  1,  0, 0,  1,  0, 0,  1,
      0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
    ]);
    const uvs = new Float32Array([
      0, 1,  1, 1,  0, 0,  1, 0,
      0, 1,  1, 1,  0, 0,  1, 0,
    ]);
    const indices = [
      0, 2, 1,  2, 3, 1,
      4, 6, 5,  6, 7, 5,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    g.setIndex(indices);
    return g;
  }

  /* =========================================================================
   * CUSTOM GLSL SHADERS (STARFIELD, NEBULA CLOUD, HARMONIC PULSAR CORE)
   * ========================================================================= */
  function createStarfield() {
    const COUNT = 3400;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x9ed8ff),
      new THREE.Color(0xffd699),
      new THREE.Color(0xc4b5fd),
      new THREE.Color(0x4ce0ff),
    ];

    for (let i = 0; i < COUNT; i++) {
      const r = 34 + Math.random() * 95;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = 1.4 + Math.pow(Math.random(), 2.2) * 5.2;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uOpacity: { value: 0.92 },
        uLightMode: { value: 0.0 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vTwinkle = 0.58 + 0.42 * sin(uTime * 1.9 + aPhase);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (145.0 / max(10.0, -mvPos.z));
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uOpacity;
        uniform float uLightMode;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = pow(1.0 - d * 2.0, 2.2);
          vec3 col = mix(vColor, vec3(0.24, 0.30, 0.45), uLightMode * 0.72);
          gl_FragColor = vec4(col, glow * vTwinkle * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    starPoints = new THREE.Points(geo, starMat);
    scene.add(starPoints);
  }

  function createSpiralNebula() {
    const COUNT = 1600;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    const cInner = new THREE.Color(0xff9d2e);
    const cMid   = new THREE.Color(0x4ce0ff);
    const cOuter = new THREE.Color(0x6366f1);

    const arms = 3;
    for (let i = 0; i < COUNT; i++) {
      const t = Math.pow(Math.random(), 0.78);
      const radius = 3.2 + t * 28.0;
      const arm = i % arms;
      const armAngle = (arm / arms) * Math.PI * 2;
      const spin = radius * 0.23;
      const scatter = (Math.random() - 0.5) * (1.2 + t * 2.8);
      const angle = armAngle + spin + scatter * 0.18;

      positions[i * 3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (1.8 + t * 3.8);
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.4;

      const col = new THREE.Color();
      if (t < 0.42) col.lerpColors(cInner, cMid, t / 0.42);
      else col.lerpColors(cMid, cOuter, (t - 0.42) / 0.58);
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = 10.0 + Math.random() * 24.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    nebulaMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uAlpha: { value: 0.16 },
      },
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uBass;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 p = position;
          float wave = sin(length(p.xz) * 0.25 - uTime * 0.8) * (0.28 + uBass * 0.9);
          p.y += wave;
          vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * (1.0 + uBass * 0.35) * uPixelRatio * (52.0 / max(8.0, -mvPos.z));
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float soft = exp(-d * d * 13.5);
          gl_FragColor = vec4(vColor, soft * uAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    nebulaPoints = new THREE.Points(geo, nebulaMat);
    scene.add(nebulaPoints);
  }

  function createPulsarCore() {
    pulsarGroup = new THREE.Group();
    scene.add(pulsarGroup);

    // 1. Fluid Liquid-Silk Harmonic Core Sphere (stronger soft breathing + slightly brighter pearl glow)
    const coreGeo = new THREE.SphereGeometry(1.52, 64, 64);
    pulsarCoreMat = new THREE.ShaderMaterial({
      uniforms: {
        uFlow: { value: 0 },
        uBass: { value: 0 },
        uMid:  { value: 0 },
        uHigh: { value: 0 },
        uPulseKick: { value: 0 },
        uColorDeep: { value: moodColors.curDeep.clone() },
        uColorMid:  { value: moodColors.curMid.clone() },
        uColorRim:  { value: moodColors.curRim.clone() },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vPos;
        varying float vSwell;
        uniform float uFlow;
        uniform float uBass;
        uniform float uMid;
        uniform float uHigh;
        uniform float uPulseKick;
        void main() {
          // Broad, silky low-order spherical harmonics (fluid & pillowy, never spiky jitter)
          float lobeA = sin(position.x * 1.95 + uFlow * 0.92)
                      * cos(position.y * 1.85 - uFlow * 0.74)
                      * sin(position.z * 1.95 + uFlow * 0.66);
          float lobeB = sin((position.y + position.x * 0.65) * 2.85 - uFlow * 1.25) * 0.55;
          float ripple = cos(position.z * 3.6 + uFlow * 1.55) * sin(position.x * 3.2 - uFlow * 1.1) * 0.30;

          float ampBass = 0.068 + uBass * 0.275 + uPulseKick * 0.13;
          float ampMid  = uMid * 0.145;
          float ampHigh = uHigh * 0.055;
          float disp = lobeA * ampBass + lobeB * (0.04 + ampMid) + ripple * ampHigh;

          vSwell = clamp(disp * 2.4 + 0.5, 0.0, 1.0);
          vec3 displaced = position + normal * disp;
          vPos = displaced;

          vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vPos;
        varying float vSwell;
        uniform float uFlow;
        uniform float uBass;
        uniform float uMid;
        uniform float uHigh;
        uniform float uPulseKick;
        uniform vec3 uColorDeep;
        uniform vec3 uColorMid;
        uniform vec3 uColorRim;
        void main() {
          float ndotv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
          float fresnel = pow(1.0 - ndotv, 2.15);

          // Velvety silk currents gliding across the orb in sync with melody
          float flow = 0.5 + 0.5 * sin(vPos.y * 2.8 - uFlow * 1.05 + sin(vPos.x * 2.0 + uFlow * 0.72));
          float depthMix = smoothstep(0.08, 0.90, flow * 0.52 + vSwell * 0.26 + (1.0 - ndotv) * 0.28);

          vec3 col = mix(uColorDeep, uColorMid, depthMix);
          // Luminous pearl Fresnel rim responding gently to mid/high harmonics
          float rimMask = smoothstep(0.10, 0.92, fresnel);
          col = mix(col, uColorRim, rimMask * (0.64 + uBass * 0.18 + uHigh * 0.16 + uPulseKick * 0.14));

          // Slightly brighter translucent shoulder, still strictly glare-free
          float energy = 1.02 + uBass * 0.18 + uMid * 0.09 + uPulseKick * 0.12;
          col *= energy;
          col = col / (col + vec3(0.35)) * 1.20;
          col = min(col, vec3(0.84));

          gl_FragColor = vec4(col, 0.95);
        }
      `,
      transparent: true,
    });
    pulsarCoreMesh = new THREE.Mesh(coreGeo, pulsarCoreMat);
    pulsarGroup.add(pulsarCoreMesh);

    // 2. Soft Atmospheric Halo Shell (subtle backlit mist around the core)
    const auraGeo = new THREE.SphereGeometry(2.08, 36, 36);
    pulsarAuraMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: moodColors.curRim.clone() },
        uIntensity: { value: 0.24 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        uniform vec3 uColor;
        uniform float uIntensity;
        void main() {
          float rim = clamp(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 0.0, 1.0);
          float soft = pow(rim, 3.2) * uIntensity;
          gl_FragColor = vec4(uColor * 0.78, soft);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    pulsarAuraMesh = new THREE.Mesh(auraGeo, pulsarAuraMat);
    pulsarGroup.add(pulsarAuraMesh);

    // 3. Delicate Geodesic Resonance Cage around Core
    const cageGeo = new THREE.IcosahedronGeometry(2.14, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: moodColors.curRing.clone(),
      wireframe: true,
      transparent: true,
      opacity: 0.17,
    });
    pulsarCageMesh = new THREE.Mesh(cageGeo, cageMat);
    pulsarGroup.add(pulsarCageMesh);

    // 4. Three Tilted Gyroscopic Armillary Rings (harmonized with cover palette)
    const ringSpecs = [
      { r: 2.75, tube: 0.018, rx: 0.45, ry: 0.2,  sx:  0.22, sy:  0.32, op: 0.36 },
      { r: 3.35, tube: 0.015, rx: -0.62, ry: 0.5, sx: -0.17, sy:  0.25, op: 0.30 },
      { r: 4.05, tube: 0.012, rx: 1.05, ry: -0.35, sx: 0.13, sy: -0.20, op: 0.24 },
    ];
    gyroRings = ringSpecs.map((sp) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(sp.r, sp.tube, 12, 96),
        new THREE.MeshBasicMaterial({
          color: moodColors.curRing.clone(),
          transparent: true,
          opacity: sp.op,
        })
      );
      mesh.rotation.set(sp.rx, sp.ry, 0);
      mesh.userData = { sx: sp.sx, sy: sp.sy };
      pulsarGroup.add(mesh);
      return mesh;
    });

    // 5. Live 3D 128-Vertex Audio-Reactive FFT Waveform Ring orbiting the Core
    const HALO_SEG = 128;
    const haloPos = new Float32Array((HALO_SEG + 1) * 3);
    for (let i = 0; i <= HALO_SEG; i++) {
      const a = (i / HALO_SEG) * Math.PI * 2;
      haloPos[i * 3]     = Math.cos(a) * 4.55;
      haloPos[i * 3 + 1] = 0;
      haloPos[i * 3 + 2] = Math.sin(a) * 4.55;
    }
    const haloGeo = new THREE.BufferGeometry();
    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
    const haloMat = new THREE.LineBasicMaterial({
      color: moodColors.curRim.clone(),
      transparent: true,
      opacity: 0.54,
    });
    pulsarHaloLine = new THREE.Line(haloGeo, haloMat);
    pulsarGroup.add(pulsarHaloLine);
  }

  function createOrbitTrajectories() {
    orbitLinesGroup = new THREE.Group();
    scene.add(orbitLinesGroup);

    ORBIT_RINGS.forEach((ring, rIdx) => {
      const segs = 128;
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const x = Math.cos(a) * ring.radius;
        const z = Math.sin(a) * ring.radius;
        const y = Math.sin(a * 2 + rIdx * 1.1) * ring.yAmp * 0.45
                + x * Math.sin(ring.tiltZ)
                + z * Math.sin(ring.tiltX);
        pts.push(new THREE.Vector3(x, y, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: rIdx % 2 === 0 ? 0x4ce0ff : 0xff9d2e,
        transparent: true,
        opacity: rIdx === 0 ? 0.30 : 0.16,
      });
      orbitLinesGroup.add(new THREE.Line(geo, mat));
    });
  }

  function createActiveEffects() {
    const tPos = new Float32Array(24 * 3);
    tetherGeo = new THREE.BufferGeometry();
    tetherGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
    tetherMat = new THREE.LineBasicMaterial({
      color: 0xff9d2e,
      transparent: true,
      opacity: 0.58,
    });
    tetherLine = new THREE.Line(tetherGeo, tetherMat);
    tetherLine.frustumCulled = false;
    scene.add(tetherLine);

    const pGeo = new THREE.RingGeometry(1.38, 1.48, 48);
    pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x4ce0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    pulseRingMesh = new THREE.Mesh(pGeo, pulseRingMat);
    scene.add(pulseRingMesh);
  }

  function createOrbitalCapsules() {
    const caseGeo = new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D);
    caseMat = new THREE.MeshStandardMaterial({
      color: 0x12192c,
      roughness: 0.88,
      metalness: 0.06,
    });
    caseInstMesh = new THREE.InstancedMesh(caseGeo, caseMat, TOTAL_SLOTS);
    caseInstMesh.frustumCulled = false;
    scene.add(caseInstMesh);

    const rimGeo = new THREE.BoxGeometry(CAP_W + 0.08, CAP_H + 0.08, CAP_D * 0.46);
    rimMat = new THREE.MeshStandardMaterial({
      color: 0x4b6288,
      roughness: 0.78,
      metalness: 0.14,
      emissive: 0x14223a,
      emissiveIntensity: 0.32,
    });
    rimInstMesh = new THREE.InstancedMesh(rimGeo, rimMat, TOTAL_SLOTS);
    rimInstMesh.frustumCulled = false;
    scene.add(rimInstMesh);

    const crestGeo = new THREE.CylinderGeometry(CAP_H * 0.44, CAP_H * 0.44, 0.036, 36);
    crestGeo.rotateX(Math.PI / 2);
    crestGeo.translate(CAP_W * 0.34, 0, -0.01);
    crestMat = new THREE.MeshStandardMaterial({
      color: 0x161f34,
      roughness: 0.56,
      metalness: 0.24,
      emissive: 0x0e2236,
      emissiveIntensity: 0.26,
    });
    crestInstMesh = new THREE.InstancedMesh(crestGeo, crestMat, TOTAL_SLOTS);
    crestInstMesh.frustumCulled = false;
    scene.add(crestInstMesh);

    // Double-sided Front (+Z) & Back (-Z) Cover Artwork Geometry
    const coverGeo = createDoubleSidedCoverGeometry(CAP_W - 0.14, CAP_H - 0.14, CAP_D * 0.5 + 0.008);

    const coverLib = COSMOS.coverLibrary;
    let slotIdx = 0;

    ORBIT_RINGS.forEach((ring, rIdx) => {
      for (let k = 0; k < ring.count; k++) {
        const baseAngle = (k / ring.count) * Math.PI * 2 + rIdx * 0.38;
        const coverLibIdx = (rIdx * 5 + k * 3 + (slotIdx % 7)) % coverLib.length;

        const coverMesh = new THREE.Mesh(coverGeo, coverLib[coverLibIdx].material);
        coverMesh.userData.slotIndex = slotIdx;
        scene.add(coverMesh);
        coverMeshes.push(coverMesh);

        slots.push({
          index: slotIdx,
          ringIdx: rIdx,
          ringName: ring.name,
          radius: ring.radius,
          baseAngle: baseAngle,
          angle: baseAngle,
          tiltX: ring.tiltX,
          tiltZ: ring.tiltZ,
          yAmp: ring.yAmp,
          orbitSpeed: ring.speed,
          bobPhase: slotIdx * 0.73,
          worldPos: new THREE.Vector3(),
          worldQuat: new THREE.Quaternion(),
          lift: 0,
          velLift: 0,
          scale: 1,
          coverMesh: coverMesh,
          defaultCoverIdx: coverLibIdx,
          customCoverCanvas: null,
          customCoverMat: null,
          customCoverTex: null,
          customCoverDataUrl: null,
          trackIdx: -1,
        });

        slotIdx += 1;
      }
    });
  }

  /* =========================================================================
   * FOREGROUND DUAL-LAYER SHOWCASE SCENE (HERO SLEEVE + SPINNING 3D VINYL)
   * ========================================================================= */
  function initShowcaseScene() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    showcaseScene = new THREE.Scene();
    showcaseCamera = new THREE.PerspectiveCamera(34, w / h, 0.1, 60);
    showcaseCamera.position.set(0, 0, 0);
    showcaseCamera.lookAt(0, 0, -1);

    showcaseRenderer = new THREE.WebGLRenderer({
      canvas: domRefs.showcaseCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    showcaseRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    showcaseRenderer.setSize(w, h, false);
    showcaseRenderer.setClearColor(0x000000, 0);
    showcaseRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    showcaseRenderer.toneMappingExposure = 1.08;
    showcaseRenderer.outputEncoding = THREE.sRGBEncoding;

    showcaseAmbient = new THREE.AmbientLight(0xdbe8ff, 0.78);
    showcaseScene.add(showcaseAmbient);

    showcaseHemi = new THREE.HemisphereLight(0xf0f6ff, 0x16203a, 0.56);
    showcaseHemi.position.set(0, 10, 4);
    showcaseScene.add(showcaseHemi);

    showcaseKey = new THREE.DirectionalLight(0xfff8ee, 0.78);
    showcaseKey.position.set(-5.0, 5.5, 6.5);
    showcaseScene.add(showcaseKey);

    showcaseFill = new THREE.DirectionalLight(0x4ce0ff, 0.36);
    showcaseFill.position.set(6.5, -2.5, 5.5);
    showcaseScene.add(showcaseFill);

    showcaseRim = new THREE.DirectionalLight(0xff9d2e, 0.44);
    showcaseRim.position.set(1.5, 5.0, -6.0);
    showcaseScene.add(showcaseRim);

    showcaseGroup = new THREE.Group();
    showcaseGroup.visible = false;

    showcaseFrameMat = new THREE.MeshStandardMaterial({
      color: 0x12192c,
      roughness: 0.85,
      metalness: 0.08,
    });
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(CAP_W, CAP_H, CAP_D), showcaseFrameMat);
    showcaseGroup.add(bodyMesh);

    showcaseRimMat = new THREE.MeshStandardMaterial({
      color: 0x5d7aa4,
      roughness: 0.72,
      metalness: 0.16,
    });
    const rimMesh = new THREE.Mesh(
      new THREE.BoxGeometry(CAP_W + 0.08, CAP_H + 0.08, CAP_D * 0.46),
      showcaseRimMat
    );
    showcaseGroup.add(rimMesh);

    // Double-sided fine-art matte cover artwork (zero specular reflection glare!)
    showcaseCoverMat = new THREE.MeshLambertMaterial({
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.26,
      side: THREE.FrontSide,
    });
    const showcaseCoverGeo = createDoubleSidedCoverGeometry(CAP_W - 0.12, CAP_H - 0.12, CAP_D * 0.5 + 0.008);
    showcaseGroup.add(new THREE.Mesh(showcaseCoverGeo, showcaseCoverMat));

    // Partially Slid-Out 3D Grooved Iridescent Vinyl Record Disc (spins when playing!)
    const vinylGeo = new THREE.CylinderGeometry(CAP_H * 0.465, CAP_H * 0.465, 0.032, 64);
    vinylGeo.rotateX(Math.PI / 2);
    showcaseVinylMat = new THREE.MeshStandardMaterial({
      roughness: 0.22,
      metalness: 0.52,
    });
    showcaseVinylMesh = new THREE.Mesh(vinylGeo, showcaseVinylMat);
    showcaseVinylMesh.position.set(CAP_W * 0.44, 0, -0.01);
    showcaseGroup.add(showcaseVinylMesh);

    showcaseScene.add(showcaseGroup);
  }

  function getSlotCoverCanvas(slotIdx) {
    const s = slots[slotIdx];
    if (!s) return COSMOS.coverLibrary[0].canvas;
    if (s.customCoverCanvas) return s.customCoverCanvas;
    return COSMOS.coverLibrary[s.defaultCoverIdx].canvas;
  }

  function updateShowcaseTextures(slotIdx) {
    if (!showcaseCoverMat) return;
    const cv = getSlotCoverCanvas(slotIdx);
    if (!cv) return;

    if (showcaseCoverTex) showcaseCoverTex.dispose();
    showcaseCoverTex = new THREE.CanvasTexture(cv);
    showcaseCoverTex.encoding = THREE.sRGBEncoding;
    showcaseCoverTex.anisotropy = 4;
    showcaseCoverMat.map = showcaseCoverTex;
    showcaseCoverMat.emissiveMap = showcaseCoverTex;
    showcaseCoverMat.needsUpdate = true;

    if (showcaseVinylTex) showcaseVinylTex.dispose();
    showcaseVinylTex = COSMOS.buildVinylDiscTexture(cv, currentTheme === 'ether');
    showcaseVinylMat.map = showcaseVinylTex;
    showcaseVinylMat.needsUpdate = true;
  }

  /* =========================================================================
   * HERO EXTRACTION / RETRACTION FLIGHT CHOREOGRAPHY
   * ========================================================================= */
  function getHeroAnchorPose(outPos, outQuat) {
    const isNarrow = window.innerWidth <= 720;
    if (isNarrow) targetCamPos.set(-0.28, 0.72, -6.5);
    else targetCamPos.set(-1.58, 0.04, -5.65);

    tmpEuler.set(camNav.tiltX, camNav.tiltY, 0, 'YXZ');
    tiltQuat.setFromEuler(tmpEuler);
    targetCamQuat.copy(tiltQuat).multiply(baseShowcaseLocalQuat);

    outPos.copy(targetCamPos).applyMatrix4(camera.matrixWorld);
    outQuat.copy(camera.quaternion).multiply(targetCamQuat);
  }

  function getHeroSeatPose(outPos, outQuat) {
    const s = slots[heroSlotIdx];
    if (!s) return false;
    outPos.copy(s.worldPos);
    outQuat.copy(s.worldQuat);
    return true;
  }

  function resolveHeroStartPose() {
    if (heroFromKind === 'seat') {
      heroStartPos.copy(heroSeatPos);
      heroStartQuat.copy(heroSeatQuat);
    } else {
      heroStartPos.copy(heroFromPos);
      heroStartQuat.copy(heroFromQuat);
    }
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
    getHeroSeatPose(heroPosePos, heroPoseQuat);
    document.body.classList.remove('detail-closing');
  }

  function updateHeroFlight(dt) {
    if (!camera || !showcaseGroup || heroSlotIdx < 0 || !slots[heroSlotIdx]) return;

    getHeroSeatPose(heroSeatPos, heroSeatQuat);
    getHeroAnchorPose(heroAnchorPos, heroAnchorQuat);

    if (heroPhase === HERO_PHASE_SEATED) {
      heroOverlayOn = false;
      heroSeatSuppressed = false;
      heroCanvasOpacity = 0;
      heroPosePos.copy(heroSeatPos);
      heroPoseQuat.copy(heroSeatQuat);
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
      const k = easeOutCubic(u);
      resolveHeroStartPose();
      heroPosePos.copy(heroStartPos).lerp(heroAnchorPos, k);
      heroPosePos.y += Math.sin(Math.PI * k) * 0.55;
      heroPoseQuat.copy(heroStartQuat).slerp(heroAnchorQuat, smooth01(u));
      heroCanvasOpacity = heroFadeFrom + (1 - heroFadeFrom) * smooth01(u * 2.2);

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
      const k = smooth01(u);
      resolveHeroStartPose();
      heroPosePos.copy(heroStartPos).lerp(heroSeatPos, k);
      heroPosePos.y += Math.sin(Math.PI * k) * 0.42;
      heroPoseQuat.copy(heroStartQuat).slerp(heroSeatQuat, k);

      if (u > 0.82) heroSeatSuppressed = false;
      heroCanvasOpacity = u < 0.72 ? 1 : (1 - smooth01((u - 0.72) / 0.28));

      if (u >= 1) setHeroSeated();
    }

    camInvQuat.copy(camera.quaternion).invert();
    heroPoseCamPos.copy(heroPosePos).applyMatrix4(camera.matrixWorldInverse);
    heroPoseCamQuat.copy(camInvQuat).multiply(heroPoseQuat);
  }

  /* =========================================================================
   * POINTER, 360° ORBITAL NAVIGATION, ZOOM & DETAIL DRAG-TO-ROTATE
   * ========================================================================= */
  function bindCanvasInteractions() {
    const canvas = domRefs.threeCanvas;

    function setPointer(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      camNav.parallaxX = pointerNDC.x;
      camNav.parallaxY = pointerNDC.y;
    }

    canvas.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      setPointer(ev.clientX, ev.clientY);
      camNav.lastX = ev.clientX;
      camNav.lastY = ev.clientY;
      camNav.dragMoved = false;

      if (detailMode) {
        camNav.inspectDragging = true;
        canvas.style.cursor = 'grabbing';
      } else {
        camNav.isDragging = true;
        canvas.style.cursor = 'grabbing';
      }
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
    });

    canvas.addEventListener('pointermove', (ev) => {
      setPointer(ev.clientX, ev.clientY);

      if (detailMode) {
        if (camNav.inspectDragging) {
          const dx = ev.clientX - camNav.lastX;
          const dy = ev.clientY - camNav.lastY;
          camNav.lastX = ev.clientX;
          camNav.lastY = ev.clientY;
          camNav.targetTiltY = Math.max(-3.14, Math.min(3.14, camNav.targetTiltY + dx * 0.0085));
          camNav.targetTiltX = Math.max(-0.55, Math.min(0.55, camNav.targetTiltX + dy * 0.0055));
        } else {
          canvas.style.cursor = ev.clientX < window.innerWidth * 0.52 ? 'grab' : 'default';
        }
        return;
      }

      if (camNav.isDragging) {
        const dx = ev.clientX - camNav.lastX;
        const dy = ev.clientY - camNav.lastY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) camNav.dragMoved = true;
        camNav.lastX = ev.clientX;
        camNav.lastY = ev.clientY;

        camNav.targetAzimuth -= dx * 0.0058;
        camNav.targetElevation = Math.max(-0.35, Math.min(1.22, camNav.targetElevation + dy * 0.0046));
        return;
      }

      if (raycaster && camera) {
        raycaster.setFromCamera(pointerNDC, camera);
        const hitCovers = raycaster.intersectObjects(coverMeshes, false);
        if (hitCovers.length > 0) {
          hoveredSlot = hitCovers[0].object.userData.slotIndex;
          canvas.style.cursor = 'pointer';
        } else {
          const hitInst = raycaster.intersectObject(caseInstMesh, false);
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

    canvas.addEventListener('pointerup', () => {
      if (detailMode) {
        camNav.inspectDragging = false;
        camNav.targetTiltX = 0;
        camNav.targetTiltY = 0;
        canvas.style.cursor = 'grab';
        return;
      }

      const wasDrag = camNav.dragMoved;
      camNav.isDragging = false;
      canvas.style.cursor = hoveredSlot >= 0 ? 'pointer' : 'grab';

      if (!wasDrag && hoveredSlot >= 0 && callbacks.onSlotClick) {
        callbacks.onSlotClick(hoveredSlot);
      }
    });

    canvas.addEventListener('pointerleave', () => {
      hoveredSlot = -1;
      camNav.isDragging = false;
      if (camNav.inspectDragging) {
        camNav.inspectDragging = false;
        camNav.targetTiltX = 0;
        camNav.targetTiltY = 0;
      }
    });

    canvas.addEventListener('wheel', (ev) => {
      if (detailMode) return;
      ev.preventDefault();
      camNav.targetDistance = Math.max(8.2, Math.min(40.0, camNav.targetDistance + ev.deltaY * 0.015));
    }, { passive: false });
  }

  /* =========================================================================
   * 3D-TO-2D PROJECTED CELESTIAL STAR-CHART RETICLE CALLOUT
   * ========================================================================= */
  const projCenter = new THREE.Vector3();
  const projTop = new THREE.Vector3();
  const projBot = new THREE.Vector3();

  function project3D(vec) {
    const v = vec.clone().project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * window.innerWidth,
      y: (-v.y * 0.5 + 0.5) * window.innerHeight,
      inFront: v.z >= -1 && v.z <= 1,
    };
  }

  function updateProjectedCallout() {
    if (detailMode || !camera || !slots.length || !domRefs) return;
    const targetIdx = hoveredSlot >= 0 ? hoveredSlot : activeSlotIdx;
    const s = slots[targetIdx];
    if (!s) return;

    const tr = (s.trackIdx >= 0 && callbacks.getTrackByIndex) ? callbacks.getTrackByIndex(s.trackIdx) : null;
    if (tr) {
      domRefs.calloutFileNum.textContent = 'SECTOR // ' + tr.id + ' · ' + s.ringName.split(' ')[1];
      domRefs.calloutTitle.textContent = tr.name;
      domRefs.calloutSub.textContent = (tr.artist || COSMOS.t('source.local')) + ' · ' + (tr.format || 'AUDIO');
    } else {
      const preset = COSMOS.COVER_PRESETS[s.defaultCoverIdx];
      const code = 'S-' + String(s.index + 1).padStart(3, '0');
      domRefs.calloutFileNum.textContent = 'SECTOR // ' + code + ' · ' + s.ringName;
      domRefs.calloutTitle.textContent = preset.title + ' // ' + preset.sub;
      domRefs.calloutSub.textContent = 'CELESTIAL NODE · CLICK TO INSPECT';
    }

    projCenter.copy(s.worldPos);
    projTop.copy(s.worldPos).add(new THREE.Vector3(0, CAP_H * 0.52, 0));
    projBot.copy(s.worldPos).add(new THREE.Vector3(0, -CAP_H * 0.52, 0));

    const pC = project3D(projCenter);
    const pT = project3D(projTop);
    const pB = project3D(projBot);

    if (!pC.inFront || pC.x < 36 || pC.x > window.innerWidth - 36 || pC.y < 64 || pC.y > window.innerHeight - 96) {
      domRefs.calloutAnchor.style.opacity = '0';
      domRefs.dotTL.style.opacity = domRefs.dotBL.style.opacity = domRefs.dotTR.style.opacity = domRefs.dotBR.style.opacity = '0';
      return;
    }

    const boxH = Math.max(46, Math.min(148, Math.abs(pB.y - pT.y)));
    const half = boxH * 0.52;
    const ax = Math.max(96, Math.min(window.innerWidth - 230, pC.x + half + 10));
    const ay = Math.max(106, Math.min(window.innerHeight - 138, pC.y - half * 0.25));

    domRefs.calloutAnchor.style.opacity = '1';
    domRefs.calloutAnchor.style.transform = `translate3d(${ax.toFixed(1)}px, ${ay.toFixed(1)}px, 0)`;

    const lx = pC.x - half;
    const rx = pC.x + half;
    const ty = pC.y - half;
    const by = pC.y + half;

    domRefs.dotTL.style.opacity = domRefs.dotBL.style.opacity = domRefs.dotTR.style.opacity = domRefs.dotBR.style.opacity = '1';
    domRefs.dotTL.style.left = lx.toFixed(1) + 'px'; domRefs.dotTL.style.top = ty.toFixed(1) + 'px';
    domRefs.dotBL.style.left = lx.toFixed(1) + 'px'; domRefs.dotBL.style.top = by.toFixed(1) + 'px';
    domRefs.dotTR.style.left = rx.toFixed(1) + 'px'; domRefs.dotTR.style.top = ty.toFixed(1) + 'px';
    domRefs.dotBR.style.left = rx.toFixed(1) + 'px'; domRefs.dotBR.style.top = by.toFixed(1) + 'px';
  }

  /* =========================================================================
   * DUAL COSMIC THEME ENGINE (DEEP COSMOS vs SOLAR ETHER)
   * ========================================================================= */
  function applyTheme(newTheme) {
    currentTheme = newTheme;
    const isLight = currentTheme === 'ether';
    document.body.classList.toggle('theme-ether', isLight);
    document.body.classList.toggle('theme-cosmos', !isLight);

    if (scene) {
      const bgHex = isLight ? 0xece7de : 0x040610;
      scene.background.setHex(bgHex);
      scene.fog.color.setHex(bgHex);
      scene.fog.density = isLight ? 0.0145 : 0.0135;

      if (isLight) {
        ambientLight.color.setHex(0xf9f5ed);
        ambientLight.intensity = 0.76;
        hemiLight.color.setHex(0xfffdf8);
        hemiLight.groundColor.setHex(0xc8bfb0);
        hemiLight.intensity = 0.58;
        keyLight.color.setHex(0xfff7ea);
        keyLight.intensity = 0.48;
        rimLight.color.setHex(0x0c8599);
        rimLight.intensity = 0.26;

        caseMat.color.setHex(0xf4efe6);
        caseMat.roughness = 0.88;
        caseMat.metalness = 0.04;
        rimMat.color.setHex(0xc08a52);
        rimMat.emissive.setHex(0x281808);
        rimMat.emissiveIntensity = 0.10;
        crestMat.color.setHex(0x1e2536);
        crestMat.emissive.setHex(0x0a1c28);
        crestMat.emissiveIntensity = 0.14;

        starMat.uniforms.uLightMode.value = 1.0;
        starMat.uniforms.uOpacity.value = 0.55;
        starMat.blending = THREE.NormalBlending;
        nebulaMat.uniforms.uAlpha.value = 0.085;
        nebulaMat.blending = THREE.NormalBlending;

        if (pulsarAuraMat) {
          pulsarAuraMat.blending = THREE.NormalBlending;
          pulsarAuraMat.uniforms.uIntensity.value = 0.19;
          pulsarAuraMat.needsUpdate = true;
        }
      } else {
        ambientLight.color.setHex(0x304068);
        ambientLight.intensity = 0.92;
        hemiLight.color.setHex(0x9ec0ec);
        hemiLight.groundColor.setHex(0x11192e);
        hemiLight.intensity = 0.62;
        keyLight.color.setHex(0xfff0dc);
        keyLight.intensity = 0.58;
        rimLight.color.setHex(0x6ec4e8);
        rimLight.intensity = 0.36;

        caseMat.color.setHex(0x12192c);
        caseMat.roughness = 0.88;
        caseMat.metalness = 0.06;
        rimMat.color.setHex(0x4d658c);
        rimMat.emissive.setHex(0x14223a);
        rimMat.emissiveIntensity = 0.30;
        crestMat.color.setHex(0x161f34);
        crestMat.emissive.setHex(0x0e2236);
        crestMat.emissiveIntensity = 0.26;

        starMat.uniforms.uLightMode.value = 0.0;
        starMat.uniforms.uOpacity.value = 0.94;
        starMat.blending = THREE.AdditiveBlending;
        nebulaMat.uniforms.uAlpha.value = 0.165;
        nebulaMat.blending = THREE.AdditiveBlending;

        if (pulsarAuraMat) {
          pulsarAuraMat.blending = THREE.AdditiveBlending;
          pulsarAuraMat.uniforms.uIntensity.value = 0.31;
          pulsarAuraMat.needsUpdate = true;
        }
      }
      starMat.needsUpdate = true;
      nebulaMat.needsUpdate = true;
    }

    if (showcaseScene) {
      if (isLight) {
        showcaseAmbient.color.setHex(0xfcf8f0);
        showcaseAmbient.intensity = 0.72;
        showcaseHemi.color.setHex(0xffffff);
        showcaseHemi.groundColor.setHex(0xc8bfb2);
        showcaseHemi.intensity = 0.56;
        showcaseKey.color.setHex(0xfff9f0);
        showcaseKey.intensity = 0.68;
        showcaseFill.color.setHex(0x0c8599);
        showcaseFill.intensity = 0.26;
        showcaseRim.color.setHex(0xe06a00);
        showcaseRim.intensity = 0.36;
        showcaseFrameMat.color.setHex(0xf4efe6);
        showcaseFrameMat.roughness = 0.86;
        showcaseFrameMat.metalness = 0.04;
        showcaseRimMat.color.setHex(0xc98a4b);
      } else {
        showcaseAmbient.color.setHex(0xdbe8ff);
        showcaseAmbient.intensity = 0.80;
        showcaseHemi.color.setHex(0xf0f6ff);
        showcaseHemi.groundColor.setHex(0x16203a);
        showcaseHemi.intensity = 0.56;
        showcaseKey.color.setHex(0xfff8ee);
        showcaseKey.intensity = 0.78;
        showcaseFill.color.setHex(0x4ce0ff);
        showcaseFill.intensity = 0.38;
        showcaseRim.color.setHex(0xff9d2e);
        showcaseRim.intensity = 0.44;
        showcaseFrameMat.color.setHex(0x10172b);
        showcaseFrameMat.roughness = 0.85;
        showcaseFrameMat.metalness = 0.08;
        showcaseRimMat.color.setHex(0x7aa2d8);
      }
      if (heroSlotIdx >= 0) updateShowcaseTextures(heroSlotIdx);
    }
  }

  /* =========================================================================
   * MAIN 60FPS COSMIC ANIMATION LOOP
   * ========================================================================= */
  let prevNow = 0;

  function animate(nowMs) {
    global.requestAnimationFrame(animate);
    const timeSec = nowMs * 0.001;
    const dt = Math.min(0.05, prevNow ? (nowMs - prevNow) * 0.001 : 0.016);
    prevNow = nowMs;

    const playing = callbacks.isPlaying();
    const { bass, mid, high } = COSMOS.audioEngine.sampleFFT(playing);

    // Dual-stage soft asymmetric envelope smoothing: responsive attack, silky-soft cushioned decay
    const atk = 1 - Math.exp(-6.8 * dt);
    const rel = 1 - Math.exp(-2.8 * dt);
    audioEnv.smoothBass += (bass - audioEnv.smoothBass) * (bass > audioEnv.smoothBass ? atk : rel);
    audioEnv.smoothMid  += (mid  - audioEnv.smoothMid)  * (mid  > audioEnv.smoothMid  ? atk : rel);
    audioEnv.smoothHigh += (high - audioEnv.smoothHigh) * (high > audioEnv.smoothHigh ? atk : rel);
    // Continuous phase integration keeps waves fluid & accelerating organically without ever snapping
    audioEnv.flowPhase += dt * (1.12 + audioEnv.smoothBass * 2.85 + audioEnv.smoothMid * 1.95 + audioEnv.smoothHigh * 0.95);
    const fft = COSMOS.audioEngine.fftData;

    if (callbacks.onFrameUpdate) callbacks.onFrameUpdate(timeSec, bass, mid);
    if (!renderer || !scene || !camera) return;

    starMat.uniforms.uTime.value = timeSec;
    starPoints.rotation.y = timeSec * 0.006;

    nebulaMat.uniforms.uTime.value = timeSec;
    nebulaMat.uniforms.uBass.value = bass;
    nebulaPoints.rotation.y = -timeSec * 0.014;

    // Smoothly morph central orb & orbital harmonics toward active cover's Color Psychology palette
    const cDamp = 1 - Math.exp(-2.1 * dt);
    moodColors.curDeep.lerp(moodColors.tgtDeep, cDamp);
    moodColors.curMid.lerp(moodColors.tgtMid, cDamp);
    moodColors.curRim.lerp(moodColors.tgtRim, cDamp);
    moodColors.curRing.lerp(moodColors.tgtRing, cDamp);

    corePulseKick *= Math.exp(-3.6 * dt);

    const sb = audioEnv.smoothBass;
    const sm = audioEnv.smoothMid;
    const sh = audioEnv.smoothHigh;

    pulsarCoreMat.uniforms.uFlow.value = audioEnv.flowPhase;
    pulsarCoreMat.uniforms.uBass.value = sb;
    pulsarCoreMat.uniforms.uMid.value  = sm;
    pulsarCoreMat.uniforms.uHigh.value = sh;
    pulsarCoreMat.uniforms.uPulseKick.value = corePulseKick;
    pulsarCoreMat.uniforms.uColorDeep.value.copy(moodColors.curDeep);
    pulsarCoreMat.uniforms.uColorMid.value.copy(moodColors.curMid);
    pulsarCoreMat.uniforms.uColorRim.value.copy(moodColors.curRim);

    if (pulsarAuraMat) {
      pulsarAuraMat.uniforms.uColor.value.copy(moodColors.curRim);
      pulsarAuraMesh.scale.setScalar(1 + sb * 0.22 + sm * 0.08 + corePulseKick * 0.18);
    }

    pulsarCageMesh.material.color.copy(moodColors.curRing);
    pulsarHaloLine.material.color.copy(moodColors.curRim);
    tetherMat.color.copy(moodColors.curRing);
    pulseRingMat.color.copy(moodColors.curRim);
    coreLight.color.copy(moodColors.curRim);
    if (hoverGlowLight) hoverGlowLight.color.copy(moodColors.curRim);
    if (gyroRings.length === 3) {
      gyroRings[0].material.color.copy(moodColors.curRim);
      gyroRings[1].material.color.copy(moodColors.curRing);
      gyroRings[2].material.color.copy(moodColors.curMid);
    }

    // Stronger yet velvety-soft breathing expansion on central sphere
    const coreScale = 1 + sb * 0.26 + sm * 0.08 + corePulseKick * 0.09 + Math.sin(timeSec * 1.65) * 0.028;
    pulsarCoreMesh.scale.setScalar(coreScale);
    pulsarCageMesh.rotation.y = timeSec * 0.22 + audioEnv.flowPhase * 0.06;
    pulsarCageMesh.rotation.x = timeSec * 0.12;
    pulsarCageMesh.scale.setScalar(1 + sm * 0.20 + sb * 0.10 + corePulseKick * 0.07);
    // Tamed coreLight intensity prevents washout glare on nearby matte album covers
    coreLight.intensity = (currentTheme === 'ether' ? 1.8 : 2.9) + sb * 1.3 + corePulseKick * 0.8;

    gyroRings.forEach((rg) => {
      rg.rotation.x += rg.userData.sx * dt * (1 + sb * 2.2);
      rg.rotation.y += rg.userData.sy * dt * (1 + sm * 1.9);
    });

    // Update 3D Musical Staves, 3D Notes, Clefs & Rising Harmonic Dust
    if (COSMOS.musicCosmosFx) {
      COSMOS.musicCosmosFx.update(dt, timeSec, audioEnv, moodColors, currentTheme === 'ether', fft, playing);
    }

    const hAttr = pulsarHaloLine.geometry.attributes.position;
    const HALO_SEG = hAttr.count - 1;
    for (let i = 0; i <= HALO_SEG; i++) {
      const idx = i % HALO_SEG;
      const a = (idx / HALO_SEG) * Math.PI * 2;
      let amp = 0;
      if (playing && COSMOS.audioEngine.isAnalyserReady()) {
        const mirrorIdx = idx < HALO_SEG / 2 ? idx : HALO_SEG - idx;
        const bin = Math.min(255, Math.floor((mirrorIdx / (HALO_SEG / 2)) * 120));
        amp = (fft[bin] / 255) * 1.45;
      } else {
        amp = 0.14 * Math.sin(a * 6 + timeSec * 2.0) + 0.08 * Math.cos(a * 12 - timeSec * 1.4);
      }
      const r = 4.55 + amp;
      const y = Math.sin(a * 4 + timeSec * 1.6) * (0.20 + amp * 0.55);
      hAttr.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r);
    }
    hAttr.needsUpdate = true;
    pulsarHaloLine.rotation.y = timeSec * 0.12;

    if (camNav.autoOrbit && !camNav.isDragging && !detailMode) {
      camNav.targetAzimuth += dt * 0.055;
    }

    const damp = 1 - Math.exp(-6.2 * dt);
    camNav.azimuth += (camNav.targetAzimuth - camNav.azimuth) * damp;
    camNav.elevation += (camNav.targetElevation - camNav.elevation) * damp;
    camNav.distance += (camNav.targetDistance - camNav.distance) * damp;
    camNav.lookTarget.lerp(camNav.targetLook, damp);
    camNav.tiltX += (camNav.targetTiltX - camNav.tiltX) * (1 - Math.exp(-10 * dt));
    camNav.tiltY += (camNav.targetTiltY - camNav.tiltY) * (1 - Math.exp(-10 * dt));

    const az = camNav.azimuth + (detailMode ? 0 : camNav.parallaxX * 0.035);
    const elv = camNav.elevation - (detailMode ? 0 : camNav.parallaxY * 0.025);
    const horiz = camNav.distance * Math.cos(elv);

    camera.position.set(
      camNav.lookTarget.x + Math.sin(az) * horiz,
      camNav.lookTarget.y + Math.sin(elv) * camNav.distance,
      camNav.lookTarget.z + Math.cos(az) * horiz
    );
    camera.lookAt(camNav.lookTarget);
    camera.updateMatrixWorld();

    const stiff = 13.0;
    const sDamp = Math.pow(0.76, dt * 60);
    const orbitSpeedMul = (detailMode || hoveredSlot >= 0) ? 0.15 : 1.0;

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const s = slots[i];
      s.angle += s.orbitSpeed * dt * orbitSpeedMul;

      const x = Math.cos(s.angle) * s.radius;
      const z = Math.sin(s.angle) * s.radius;
      const baseWaveY = Math.sin(s.angle * 2 + s.ringIdx * 1.1) * s.yAmp * 0.45
                      + x * Math.sin(s.tiltZ)
                      + z * Math.sin(s.tiltX)
                      + Math.sin(timeSec * 1.15 + s.bobPhase) * 0.24;

      const isHov = (!detailMode && i === hoveredSlot);
      const isAct = (i === activeSlotIdx);
      let targetLift = 0;
      let targetScale = 1.0;

      if (isHov) {
        targetLift = 1.25;
        targetScale = 1.20;
      } else if (isAct) {
        targetLift = playing ? (0.85 + bass * 0.55) : 0.58;
        targetScale = playing ? (1.14 + bass * 0.09) : 1.10;
      }

      s.velLift = (s.velLift + (targetLift - s.lift) * stiff * dt) * sDamp;
      s.lift += s.velLift * dt;
      s.scale += (targetScale - s.scale) * (1 - Math.exp(-10 * dt));

      s.worldPos.set(x, baseWaveY + s.lift, z);

      dummy.position.copy(s.worldPos);
      if (isHov || isAct) {
        dummy.lookAt(camera.position);
      } else {
        tmpVec.set(x * 1.6, baseWaveY + s.lift + 0.15, z * 1.6);
        dummy.lookAt(tmpVec);
      }
      s.worldQuat.copy(dummy.quaternion);
    }

    updateHeroFlight(dt);

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const s = slots[i];

      if (i === heroSlotIdx && heroSeatSuppressed) {
        dummy.position.copy(s.worldPos);
        dummy.quaternion.copy(s.worldQuat);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        caseInstMesh.setMatrixAt(i, dummy.matrix);
        rimInstMesh.setMatrixAt(i, dummy.matrix);
        crestInstMesh.setMatrixAt(i, dummy.matrix);
        s.coverMesh.visible = false;
        continue;
      }

      s.coverMesh.visible = true;
      s.coverMesh.position.copy(s.worldPos);
      s.coverMesh.quaternion.copy(s.worldQuat);
      s.coverMesh.scale.setScalar(s.scale);

      dummy.position.copy(s.worldPos);
      dummy.quaternion.copy(s.worldQuat);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      caseInstMesh.setMatrixAt(i, dummy.matrix);
      rimInstMesh.setMatrixAt(i, dummy.matrix);
      crestInstMesh.setMatrixAt(i, dummy.matrix);
    }

    caseInstMesh.instanceMatrix.needsUpdate = true;
    rimInstMesh.instanceMatrix.needsUpdate = true;
    crestInstMesh.instanceMatrix.needsUpdate = true;

    const activeSlot = slots[activeSlotIdx];
    if (activeSlot) {
      const tAttr = tetherGeo.attributes.position;
      const segs = tAttr.count - 1;
      for (let k = 0; k <= segs; k++) {
        const u = k / segs;
        tmpVec2.set(0, 0, 0).lerp(activeSlot.worldPos, u);
        const env = Math.sin(u * Math.PI);
        tmpVec2.y += Math.sin(u * 12 - timeSec * 5.2) * env * (0.14 + bass * 0.52);
        tAttr.setXYZ(k, tmpVec2.x, tmpVec2.y, tmpVec2.z);
      }
      tAttr.needsUpdate = true;
      tetherMat.opacity = detailMode ? 0.12 : (playing ? 0.72 : 0.34);

      pulseRingMesh.position.copy(activeSlot.worldPos);
      pulseRingMesh.quaternion.copy(activeSlot.worldQuat);
      const pulsePhase = (timeSec * (playing ? 0.95 : 0.38)) % 1.0;
      const pScale = 1.0 + pulsePhase * (playing ? 0.85 + bass * 0.6 : 0.42);
      pulseRingMesh.scale.setScalar(pScale);
      pulseRingMat.opacity = detailMode ? 0.0 : (1.0 - pulsePhase) * (playing ? 0.75 : 0.32);
    }

    const lightSlot = slots[(!detailMode && hoveredSlot >= 0) ? hoveredSlot : activeSlotIdx];
    if (lightSlot && hoverGlowLight) {
      tmpVec.copy(lightSlot.worldPos).add(new THREE.Vector3(0, 0.7, 0.8));
      hoverGlowLight.position.lerp(tmpVec, 0.16);
      hoverGlowLight.intensity = (detailMode ? 0.6 : 1.5) * (1 + sb * 0.35);
    }

    renderer.render(scene, camera);

    if (showcaseRenderer && showcaseScene && showcaseCamera && showcaseGroup) {
      if (domRefs.showcaseCanvas && Math.abs(heroCanvasOpacity - heroCanvasOpacityApplied) > 0.002) {
        heroCanvasOpacityApplied = heroCanvasOpacity;
        domRefs.showcaseCanvas.style.opacity = heroCanvasOpacity >= 0.999 ? '1' : heroCanvasOpacity.toFixed(3);
      }

      if (heroOverlayOn && heroCanvasOpacity > 0.002) {
        showcaseGroup.position.copy(heroPoseCamPos);
        showcaseGroup.quaternion.copy(heroPoseCamQuat);
        showcaseGroup.visible = true;

        if (playing) {
          vinylSpinAngle -= dt * 1.45;
        } else {
          vinylSpinAngle -= dt * 0.14;
        }
        showcaseVinylMesh.rotation.z = vinylSpinAngle;

        const targetVinylX = playing ? (CAP_W * 0.47 + bass * 0.05) : (CAP_W * 0.41);
        showcaseVinylMesh.position.x += (targetVinylX - showcaseVinylMesh.position.x) * (1 - Math.exp(-6 * dt));

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

  /* =========================================================================
   * PUBLIC SCENE CONTROLLER API
   * ========================================================================= */
  function init(refs, cbs) {
    domRefs = refs;
    callbacks = Object.assign(callbacks, cbs || {});

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040610);
    scene.fog = new THREE.FogExp2(0x040610, 0.0135);

    const w = window.innerWidth;
    const h = window.innerHeight;
    camera = new THREE.PerspectiveCamera(34, w / h, 0.2, 220);

    renderer = new THREE.WebGLRenderer({
      canvas: domRefs.threeCanvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Balanced Cosmic Lighting Rig (illuminates both outward front covers and inward back covers)
    ambientLight = new THREE.AmbientLight(0x2c3c68, 1.12);
    scene.add(ambientLight);

    hemiLight = new THREE.HemisphereLight(0x98c2ff, 0x0d152a, 0.84);
    hemiLight.position.set(0, 24, 0);
    scene.add(hemiLight);

    coreLight = new THREE.PointLight(0xffc985, 4.8, 56, 1.35);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    keyLight = new THREE.DirectionalLight(0xffe8c8, 1.15);
    keyLight.position.set(16, 22, 14);
    scene.add(keyLight);

    rimLight = new THREE.DirectionalLight(0x4ce0ff, 0.82);
    rimLight.position.set(-18, -8, -16);
    scene.add(rimLight);

    hoverGlowLight = new THREE.PointLight(0x4ce0ff, 3.4, 11.0, 1.7);
    scene.add(hoverGlowLight);

    createStarfield();
    createSpiralNebula();
    createPulsarCore();
    createOrbitTrajectories();
    createActiveEffects();
    createOrbitalCapsules();
    if (COSMOS.musicCosmosFx) COSMOS.musicCosmosFx.init(scene);

    raycaster = new THREE.Raycaster();
    pointerNDC = new THREE.Vector2(-10, -10);

    initShowcaseScene();
    bindCanvasInteractions();
    applyTheme('cosmos');

    global.addEventListener('resize', handleResize);
    global.requestAnimationFrame(animate);
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
    if (starMat) starMat.uniforms.uPixelRatio.value = dpr;
    if (nebulaMat) nebulaMat.uniforms.uPixelRatio.value = dpr;
    if (COSMOS.musicCosmosFx) COSMOS.musicCosmosFx.handleResize(dpr);
  }

  function focusSlot(slotIdx) {
    const s = slots[slotIdx];
    if (!s) return;
    activeSlotIdx = slotIdx;
    const targetAz = Math.atan2(s.worldPos.x, s.worldPos.z) + 0.16;
    const diff = ((targetAz - camNav.targetAzimuth + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    camNav.targetAzimuth += diff;
    camNav.targetDistance = Math.min(26, Math.max(12.5, s.radius + 9.2));
  }

  function openShowcase(slotIdx) {
    const wasInDetail = detailMode;
    detailMode = true;

    if (!wasInDetail) {
      if (heroPhase === HERO_PHASE_SEATED) {
        heroSlotIdx = slotIdx;
        beginHeroFlight(HERO_PHASE_RISING, 'seat');
        heroDur = HERO_OPEN_DUR;
      } else {
        heroSlotIdx = slotIdx;
        beginHeroFlight(HERO_PHASE_RISING, 'pose');
        heroDur = HERO_OPEN_DUR * 0.72;
      }
      updateShowcaseTextures(slotIdx);
    } else {
      retargetHeroSlot(slotIdx);
    }

    document.body.classList.remove('detail-closing');
    camNav.tiltX = camNav.targetTiltX = 0;
    camNav.tiltY = camNav.targetTiltY = 0;
  }

  function retargetHeroSlot(slotIdx) {
    if (heroRetargetLock) return;
    if (heroSlotIdx === slotIdx) {
      updateShowcaseTextures(slotIdx);
      return;
    }
    heroSlotIdx = slotIdx;
    updateShowcaseTextures(slotIdx);

    if (heroPhase !== HERO_PHASE_RISING && heroPhase !== HERO_PHASE_DROPPING) return;
    if (heroFromKind === 'seat' && heroT === 0) return;

    const phase = heroPhase;
    beginHeroFlight(phase, 'pose');
    heroDur = phase === HERO_PHASE_RISING ? HERO_OPEN_DUR * 0.72 : HERO_CLOSE_DUR * 0.9;
  }

  function closeShowcase() {
    if (!detailMode) return;
    detailMode = false;
    camNav.targetTiltX = 0;
    camNav.targetTiltY = 0;
    camNav.inspectDragging = false;

    if (heroPhase === HERO_PHASE_RISING && heroT <= 0) {
      setHeroSeated();
      return;
    }
    if (heroPhase === HERO_PHASE_SHOWN || heroPhase === HERO_PHASE_RISING) {
      beginHeroFlight(HERO_PHASE_DROPPING, 'pose');
      heroDur = HERO_CLOSE_DUR;
      document.body.classList.add('detail-closing');
    }
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
    if (slotIdx === heroSlotIdx) updateShowcaseTextures(slotIdx);
  }

  function resetSlotCover(slotIdx) {
    const s = slots[slotIdx];
    if (!s) return;
    s.trackIdx = -1;
    s.customCoverCanvas = null;
    if (s.customCoverTex) { s.customCoverTex.dispose(); s.customCoverTex = null; }
    if (s.customCoverMat) { s.customCoverMat.dispose(); s.customCoverMat = null; }
    s.customCoverDataUrl = null;
    s.coverMesh.material = COSMOS.coverLibrary[s.defaultCoverIdx].material;
    if (slotIdx === heroSlotIdx) updateShowcaseTextures(slotIdx);
  }

  COSMOS.scene3d = {
    TOTAL_SLOTS,
    TRACK_SLOT_ORDER,
    slots,
    init,
    applyTheme,
    focusSlot,
    openShowcase,
    retargetHeroSlot,
    closeShowcase,
    setSlotCover,
    resetSlotCover,
    getHeroSlotIdx: () => heroSlotIdx,
    getActiveSlotIdx: () => activeSlotIdx,
    setActiveSlotIdx: (i) => { activeSlotIdx = i; },
    setRetargetLock: (flag) => { heroRetargetLock = !!flag; },
    getTheme: () => currentTheme,
    toggleAutoOrbit: () => {
      camNav.autoOrbit = !camNav.autoOrbit;
      return camNav.autoOrbit;
    },
    resetCamera: () => {
      camNav.targetAzimuth = 0.65;
      camNav.targetElevation = 0.38;
      camNav.targetDistance = 17.5;
      camNav.targetLook.set(0, 0, 0);
    },
    nudgeAzimuth: (delta) => {
      camNav.targetAzimuth += delta;
    },
    getSlotCoverCanvas,
    setMoodPalette: (pal) => {
      if (!pal) return;
      moodColors.tgtDeep.setHex(pal.deepHex);
      moodColors.tgtMid.setHex(pal.midHex);
      moodColors.tgtRim.setHex(pal.rimHex);
      moodColors.tgtRing.setHex(pal.ringHex);
    },
    triggerCorePulse: () => {
      corePulseKick = 1.0;
    },
  };
})(window);
