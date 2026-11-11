// Die gemalte Weltkarte von Giara, ganz leicht belebt:
// feiner, langsamer Schnee im Norden, sehr ruhiges Wasser, Rauch über dem Vulkan,
// sanftes Licht und kleine Glanzpunkte auf dem Meer.
// Desktop (Maus): die Karte steht still, Darüberfahren zeigt die Stadtinfo.
// Handy/Tablet: Antippen fährt hinein und zeigt die Info darunter, noch einmal Tippen fährt wieder hinaus.
// Beim Darüberfahren leuchtet die Stadt auf, ihr Wappen erscheint unten in der Stadtinfo.
(function () {
  const wrap = document.querySelector('.map-wrap');
  if (!wrap) return;
  const stage = wrap.querySelector('.map-stage');
  const oldMap = wrap.querySelector('.map');
  const pinLayer = wrap.querySelector('.map-pins');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = () => (window.ROM_LANG && window.ROM_LANG() === 'en' ? 'en' : 'de');
  const TXT = {
    de: { zin: 'Hineinzoomen', zout: 'Herauszoomen', reset: 'Ganze Karte', hint: 'Eine Stadt antippen fährt hinein, noch einmal Tippen fährt hinaus', hintDesk: 'Fahr mit der Maus über eine Stadt' },
    en: { zin: 'Zoom in', zout: 'Zoom out', reset: 'Whole map', hint: 'Tap a city to fly in, tap again to fly out', hintDesk: 'Hover over a city' }
  };
  // Maus mit Hover = Desktop: keine Kamerafahrt, damit die Stadtinfo unten immer sichtbar bleibt
  const DESK = matchMedia('(hover: hover) and (pointer: fine)');
  let isStatic = DESK.matches;

  // ---------- Aufbau ----------
  const g = document.createElement('div');
  g.className = 'gmap';
  g.innerHTML =
    '<div class="gmap-view">' +
      '<div class="gmap-world">' +
        '<img class="gmap-img" src="img/karte.webp" alt="" draggable="false">' +
        (reduce ? '' : '<img class="gmap-sea" src="img/karte.webp" alt="" aria-hidden="true" draggable="false">') +
        '<div class="gmap-water"></div>' +
        '<div class="gmap-light"></div>' +
        '<canvas class="gmap-fx"></canvas>' +
      '</div>' +
    '</div>' +
    '<div class="gmap-ui"><div class="gmap-zoom"><button data-z="in">+</button><button data-z="out">−</button><button data-z="reset">⤢</button></div></div>' +
    '<div class="gmap-hint"></div>' +
    // langsam wabernder Rauschfilter, der die gemalten Wellen sanft verzieht
    '<svg class="gmap-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="seaWarp" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="2" seed="4" result="n">' +
        '<animate attributeName="baseFrequency" dur="14s" values="0.006 0.018;0.0078 0.023;0.0066 0.02;0.006 0.018" repeatCount="indefinite"/>' +
      '</feTurbulence>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>' +
    '</filter></svg>';
  stage.prepend(g);
  oldMap.style.display = 'none';
  const view = g.querySelector('.gmap-view');
  const world = g.querySelector('.gmap-world');
  world.appendChild(pinLayer);
  wrap.classList.add('is-2d');
  const img = g.querySelector('.gmap-img');
  img.setAttribute('alt', oldMap.querySelector('img').getAttribute('alt') || '');

  function setTexts() {
    const t = TXT[L()];
    g.querySelector('[data-z="in"]').setAttribute('aria-label', t.zin);
    g.querySelector('[data-z="out"]').setAttribute('aria-label', t.zout);
    g.querySelector('[data-z="reset"]').setAttribute('aria-label', t.reset);
    g.querySelector('.gmap-hint').textContent = isStatic ? t.hintDesk : t.hint;
  }
  setTexts();
  document.addEventListener('langchange', setTexts);
  setTimeout(() => g.querySelector('.gmap-hint').classList.add('gone'), 7000);

  // ---------- Wassermaske (für das ruhige Schimmern und die Glanzpunkte) ----------
  const MW = 362, MH = 272;
  const NO_WAVE = [[.755, .485, .895, .565]];   // Bereich des Schriftzugs „Zanaos“ (Anteile der Karte)
  let waterMask = null;
  function buildWaterMask() {
    const c = document.createElement('canvas'); c.width = MW; c.height = MH;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, MW, MH);
    const d = x.getImageData(0, 0, MW, MH), p = d.data;
    waterMask = new Uint8Array(MW * MH);
    for (let i = 0; i < MW * MH; i++) {
      const r = p[i * 4] / 255, gg = p[i * 4 + 1] / 255, b = p[i * 4 + 2] / 255;
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), sat = mx > 0 ? (mx - mn) / mx : 0;
      const isWater = b > r * 1.25 && b > gg * 1.02 && sat > .3;
      // Schriftzüge über dem Wasser bleiben scharf (Zanaos)
      const u = (i % MW) / MW, v = ((i / MW) | 0) / MH;
      const onLabel = NO_WAVE.some(([u0, v0, u1, v1]) => u >= u0 && u <= u1 && v >= v0 && v <= v1);
      waterMask[i] = isWater && !onLabel ? 1 : 0;
      p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = 255; p[i * 4 + 3] = waterMask[i] ? 255 : 0;
    }
    x.putImageData(d, 0, 0);
    const out = document.createElement('canvas'); out.width = MW; out.height = MH;
    const o = out.getContext('2d'); o.filter = 'blur(1.2px)'; o.drawImage(c, 0, 0);
    const url = 'url(' + out.toDataURL('image/png') + ')';
    const water = g.querySelector('.gmap-water');
    water.style.webkitMaskImage = water.style.maskImage = url;
    // die wogende Kopie nur über dem offenen Meer rechts zeigen
    const sea = g.querySelector('.gmap-sea');
    if (sea) {
      const m = url + ', linear-gradient(to right, transparent 52%, #000 64%)';
      sea.style.webkitMaskImage = sea.style.maskImage = m;
      sea.style.webkitMaskComposite = 'source-in';
      sea.style.maskComposite = 'intersect';
    }
  }
  if (img.complete && img.naturalWidth) buildWaterMask(); else img.addEventListener('load', buildWaterMask);
  const isWaterAt = (u, v) => waterMask && waterMask[Math.min(MH - 1, (v * MH) | 0) * MW + Math.min(MW - 1, (u * MW) | 0)] === 1;

  // ---------- Effekt-Ebene: Schnee, Vulkanrauch, Glanzpunkte ----------
  const fx = g.querySelector('.gmap-fx');
  const cx = fx.getContext('2d');
  let W = 0, H = 0, flakes = [], puffs = [], glints = [];
  const VENTS = [[.255, .655], [.29, .675], [.232, .7]];    // Krater am Vulkan
  const SNOW = { x0: .05, x1: .3, y1: .2 };                  // Gebiet um Norhol Kull
  function sizeFx() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = world.offsetWidth; H = world.offsetHeight;
    fx.width = W * dpr; fx.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Schnee nur rund um Norhol Kull (oben links)
    flakes = Array.from({ length: 40 }, () => ({ x: SNOW.x0 + Math.random() * (SNOW.x1 - SNOW.x0), y: Math.random() * SNOW.y1, s: .35 + Math.random() * .55, v: .00006 + Math.random() * .0001, ph: Math.random() * 6 }));
  }
  // kleine Schwaden, die nur kurz über den Kratern stehen und sich kaum entfernen
  function spawnPuff() {
    const [u, v] = VENTS[(Math.random() * VENTS.length) | 0];
    puffs.push({ x: u + (Math.random() - .5) * .006, y: v, r: .004, life: 1, vx: (Math.random() - .3) * .000006, vy: -.000012 - Math.random() * .00001 });
  }
  function spawnGlint() {
    for (let k = 0; k < 20; k++) {
      const u = Math.random(), v = Math.random();
      if (isWaterAt(u, v)) { glints.push({ x: u, y: v, life: 0, dur: 2.5 + Math.random() * 3 }); return; }
    }
  }

  // ---------- Verschieben und Zoomen ----------
  let s = 1, tx = 0, ty = 0, ts = 1, ttx = 0, tty = 0;
  const MIN = 1, MAX = 3.2;
  function clampTarget() {
    const vw = view.clientWidth, vh = view.clientHeight;
    ttx = Math.min(0, Math.max(vw - vw * ts, ttx));
    tty = Math.min(0, Math.max(vh - vh * ts, tty));
  }
  function zoomAt(factor, px, py) {
    const ns = Math.min(MAX, Math.max(MIN, ts * factor)), k = ns / ts;
    ttx = px - (px - ttx) * k; tty = py - (py - tty) * k; ts = ns;
    clampTarget();
  }
  function flyTo(u, v, zoom) {
    const vw = view.clientWidth, vh = view.clientHeight;
    ts = zoom; ttx = vw / 2 - u * vw * ts; tty = vh / 2 - v * vh * ts;
    clampTarget();
  }
  const home = () => { ts = 1; ttx = 0; tty = 0; };
  function applyMode() {
    isStatic = DESK.matches;
    wrap.classList.toggle('map-static', isStatic);
    if (isStatic) home();
    setTexts();
  }
  applyMode();
  DESK.addEventListener('change', applyMode);
  g.querySelector('.gmap-zoom').addEventListener('click', e => {
    if (isStatic) return;
    const b = e.target.closest('button'); if (!b) return;
    const vw = view.clientWidth, vh = view.clientHeight;
    if (b.dataset.z === 'in') zoomAt(1.5, vw / 2, vh / 2);
    else if (b.dataset.z === 'out') zoomAt(1 / 1.5, vw / 2, vh / 2);
    else { ts = 1; ttx = 0; tty = 0; }
  });
  view.addEventListener('dblclick', e => { if (isStatic) return; const r = view.getBoundingClientRect(); zoomAt(1.8, e.clientX - r.left, e.clientY - r.top); });
  view.addEventListener('wheel', e => {
    if (isStatic || !(e.ctrlKey || e.metaKey)) return;     // ohne Strg scrollt die Seite normal weiter
    e.preventDefault();
    const r = view.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  const pts = new Map();
  let lastDist = 0, dragMoved = 0, pinched = false;
  view.addEventListener('pointerdown', e => {
    if (e.target.closest('.pin')) { if (!pts.size) dragMoved = 0; return; }
    if (isStatic || e.target.closest('.gmap-ui')) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    view.setPointerCapture(e.pointerId);
    if (pts.size === 1) { dragMoved = 0; pinched = false; }
    if (pts.size === 2) { pinched = true; const [a, b] = [...pts.values()]; lastDist = Math.hypot(a.x - b.x, a.y - b.y); }
    view.classList.add('grab');
  });
  view.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1 && (ts > 1.01 || e.pointerType === 'mouse')) {
      ttx += e.clientX - prev.x; tty += e.clientY - prev.y;
      dragMoved += Math.abs(e.clientX - prev.x) + Math.abs(e.clientY - prev.y);
      clampTarget(); tx = ttx; ty = tty;
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), r = view.getBoundingClientRect();
      if (lastDist) zoomAt(d / lastDist, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      lastDist = d;
    }
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId); if (pts.size < 2) lastDist = 0;
    if (!pts.size) {
      view.classList.remove('grab');
      // kurzes Tippen auf die hineingefahrene Karte fährt wieder hinaus
      if (e.type === 'pointerup' && e.pointerType !== 'mouse' && !pinched && dragMoved < 8 && ts > 1.01) home();
    }
  };
  view.addEventListener('pointerup', up);
  view.addEventListener('pointercancel', up);

  // Antippen einer Stadt fährt hinein, noch einmal Tippen fährt hinaus
  // (giara.js zeigt Wappen und Text unten in der Stadtinfo)
  const lis = [...document.querySelectorAll('.cities li')];
  const card = wrap.querySelector('.map-card');
  [...pinLayer.querySelectorAll('.pin')].forEach((pin, i) => {
    pin.addEventListener('click', () => {
      if (isStatic || dragMoved > 8) return;
      if (ts > 1.01) { home(); return; }
      flyTo(+lis[i].dataset.x / 100, +lis[i].dataset.y / 100, 2.2);
      if (card) setTimeout(() => card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }), 300);
    });
  });

  // ---------- Takt ----------
  let visible = true, last = performance.now(), puffClock = 0, glintClock = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(tick); } }, { threshold: 0 }).observe(stage);
  new ResizeObserver(() => { sizeFx(); clampTarget(); }).observe(view);
  sizeFx();

  function tick(now) {
    if (!visible) return;
    const dt = Math.min(64, now - last); last = now;
    s += (ts - s) * .12; tx += (ttx - tx) * .12; ty += (tty - ty) * .12;
    world.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
    g.style.setProperty('--zoom', s.toFixed(3));
    view.style.touchAction = ts > 1.01 ? 'none' : 'pan-y';

    if (!reduce) {
      cx.clearRect(0, 0, W, H);
      const t = now / 1000;
      // feiner, langsamer Schnee über den Bergen im Norden
      cx.fillStyle = '#fff';
      flakes.forEach(f => {
        f.y += f.v * dt; if (f.y > SNOW.y1) { f.y = 0; f.x = SNOW.x0 + Math.random() * (SNOW.x1 - SNOW.x0); }
        const edge = Math.min(f.x - SNOW.x0, SNOW.x1 - f.x) / .04;
        const a = Math.min(1, edge, f.y > SNOW.y1 - .05 ? (SNOW.y1 - f.y) / .05 : f.y / .03);
        cx.globalAlpha = a * .7;
        cx.beginPath(); cx.arc((f.x + Math.sin(t * .35 + f.ph) * .003) * W, f.y * H, f.s, 0, Math.PI * 2); cx.fill();
      });
      // Rauch über dem Vulkan: weiche Schwaden, die langsam steigen und vergehen
      puffClock += dt; if (puffClock > 520) { puffClock = 0; spawnPuff(); }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += .0000012 * dt; p.life -= .00018 * dt;
        if (p.life <= 0) { puffs.splice(i, 1); continue; }
        const R = p.r * W, gr = cx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, R);
        const a = Math.min(1, (1 - p.life) * 6) * p.life * .38;
        gr.addColorStop(0, 'rgba(70,64,62,' + a + ')'); gr.addColorStop(1, 'rgba(70,64,62,0)');
        cx.globalAlpha = 1; cx.fillStyle = gr;
        cx.beginPath(); cx.arc(p.x * W, p.y * H, R, 0, Math.PI * 2); cx.fill();
      }
      // kleine Glanzpunkte auf dem Meer, die kurz aufblitzen
      glintClock += dt; if (glintClock > 260) { glintClock = 0; spawnGlint(); }
      cx.globalCompositeOperation = 'lighter';
      for (let i = glints.length - 1; i >= 0; i--) {
        const q = glints[i];
        q.life += dt / 1000; if (q.life > q.dur) { glints.splice(i, 1); continue; }
        const a = Math.sin(Math.PI * q.life / q.dur) * .55, gx = q.x * W, gy = q.y * H;
        const gr = cx.createRadialGradient(gx, gy, 0, gx, gy, 4);
        gr.addColorStop(0, 'rgba(255,250,230,' + a + ')'); gr.addColorStop(1, 'rgba(255,250,230,0)');
        cx.globalAlpha = 1; cx.fillStyle = gr;
        cx.beginPath(); cx.arc(gx, gy, 4, 0, Math.PI * 2); cx.fill();
      }
      cx.globalCompositeOperation = 'source-over';
      cx.globalAlpha = 1;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
