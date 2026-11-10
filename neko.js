// Neko als Pixel-Begleiter: läuft beim Scrollen am unteren Rand mit,
// kommentiert die Abschnitte und meckert, wenn man ihn anklickt.
(function () {
  const root = document.querySelector('.neko');
  if (!root) return;
  const cv = root.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const bubble = root.querySelector('.neko-bubble');
  const body = root.querySelector('.neko-body');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Pixelbild (32 × 32), aus runden Formen gerastert ----------
  const S = 32;
  const COL = {
    O: '#2a1208', R: '#e0521f', D: '#a63417', L: '#f7843a', Y: '#ffc27a',
    B: '#ffe2bd', E: '#ffc23a', P: '#2a1208', N: '#5a1a0a', W: '#fff6dc'
  };
  let grid;
  const set = (x, y, k) => { if (x >= 0 && y >= 0 && x < S && y < S) grid[y * S + x] = k; };
  const get = (x, y) => (x < 0 || y < 0 || x >= S || y >= S) ? 0 : grid[y * S + x];
  function ellipse(cx, cy, rx, ry, k, shade) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x + .5 - cx) / rx, ny = (y + .5 - cy) / ry;
        if (nx * nx + ny * ny > 1) continue;
        let key = k;
        if (shade) {
          if (nx * .45 + ny * .9 > .62) key = 'D';
          else if (-nx * .45 - ny * .9 > .6) key = 'L';
        }
        set(x, y, key);
      }
    }
  }
  function tri(a, b, c, k) {
    const minX = Math.floor(Math.min(a[0], b[0], c[0])), maxX = Math.ceil(Math.max(a[0], b[0], c[0]));
    const minY = Math.floor(Math.min(a[1], b[1], c[1])), maxY = Math.ceil(Math.max(a[1], b[1], c[1]));
    const s = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const p = [x + .5, y + .5];
      const d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a);
      const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(neg && pos)) set(x, y, k);
    }
  }
  function tail(p0, p1, p2) {
    for (let t = 0; t <= 1.0001; t += 0.035) {
      const u = 1 - t;
      const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
      const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
      const r = 2.2 + Math.sin(t * Math.PI) * 1.1 - t * 0.6;
      ellipse(x, y, r, r, t > .72 ? 'Y' : 'R', t <= .72);
    }
  }

  function draw(opts) {
    grid = new Array(S * S).fill(0);
    const wag = opts.wag ? 1.6 : 0;
    const lift = opts.feet === 'stepA' || opts.feet === 'stepB' ? 1 : 0;
    // zwei Schwänze, links und rechts, hinter dem Körper
    tail([12, 26], [1, 28], [3.5 - wag, 17]);
    tail([20, 26], [31, 25], [28.5 + wag, 20.5]);
    // Körper, Bauch, verschränkte Arme
    ellipse(16, 21.5 - lift * .5, 7.6, 6.8, 'R', true);
    ellipse(16, 23, 4.6, 4.4, 'B', false);
    ellipse(16, 18.6, 6.4, 1.7, 'L', false);
    for (let x = 11; x <= 21; x++) { set(x, 17, 'D'); set(x, 20, 'D'); }
    set(16, 18, 'D'); set(16, 19, 'D');
    // Füße
    ellipse(12, 28.6 - (opts.feet === 'stepA' ? 1 : 0), 2.6, 1.5, 'L', false);
    ellipse(20, 28.6 - (opts.feet === 'stepB' ? 1 : 0), 2.6, 1.5, 'L', false);
    // Kopf mit Backenfell, Ohren
    const hy = 11 - lift * .5;
    tri([8.4, 8.5], [9.8, 2.6], [13.6, 5.6], 'R');
    tri([23.6, 8.5], [22.2, 2.6], [18.4, 5.6], 'R');
    ellipse(16, hy, 8.4, 6.6, 'R', true);
    ellipse(8.6, hy + 2.4, 1.8, 1.5, 'L', false);
    ellipse(23.4, hy + 2.4, 1.8, 1.5, 'R', false);
    tri([10.2, 6.4], [10.5, 4.3], [12.3, 5.7], 'B');
    tri([21.8, 6.4], [21.5, 4.3], [19.7, 5.7], 'B');
    ellipse(16, hy + 2.6, 3.8, 2.2, 'L', false);
    // Gesicht: schwere Lider, Bernsteinaugen, kleine Nase, Mundwinkel nach unten
    const ey = Math.round(hy);
    if (opts.blink) {
      for (const x of [11, 12, 13, 18, 19, 20]) set(x, ey, 'O');
    } else {
      for (const x of [11, 12, 13, 18, 19, 20]) set(x, ey - 1, 'O');
      set(11, ey, 'E'); set(12, ey, 'E'); set(13, ey, 'P');
      set(18, ey, 'P'); set(19, ey, 'E'); set(20, ey, 'E');
      set(11, ey, 'W');
    }
    set(15, ey + 2, 'N'); set(16, ey + 2, 'N');
    set(14, ey + 4, 'O'); set(15, ey + 3, 'O'); set(16, ey + 3, 'O'); set(17, ey + 4, 'O');
    // Kontur außen herum
    const out = grid.slice();
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (get(x, y)) continue;
      if (get(x + 1, y) || get(x - 1, y) || get(x, y + 1) || get(x, y - 1)) out[y * S + x] = 'O';
    }
    ctx.clearRect(0, 0, S, S);
    for (let i = 0; i < out.length; i++) {
      if (!out[i]) continue;
      ctx.fillStyle = COL[out[i]];
      ctx.fillRect(i % S, Math.floor(i / S), 1, 1);
    }
  }
  // ---------- Sprüche ----------
  const LINES = {
    de: {
      top: 'Ich bin keine Katze. Nur damit das gleich geklärt ist.',
      monster: 'Klick ruhig weiter. Ich warte. Ich hab ja sonst nichts vor.',
      ringe: 'Feuer ist die beste Klasse. Das sage ich völlig unparteiisch.',
      welt: 'Norhol Kull. Kalt, laut, ein Langhaus. Man gewöhnt sich dran.',
      buch: 'Ja, ich komm da auch vor. Nein, ich verrate nichts.',
      patreon: 'Komm mit. Dann hab ich wenigstens jemanden zum Anmeckern.',
      mystic: 'Das hast du nicht von mir.',
      bye: 'Schluss jetzt. Ich geh.',
      poke: ['ZÄHL. DIE. SCHWÄNZE.', 'Streicheln kostet extra.', 'Was? Ich gucke immer so.',
        'Zwei Schwänze. Hat eine Katze zwei Schwänze? Eben.', 'Noch einmal, und ich setz mich auf deine Tastatur.']
    },
    en: {
      top: 'I am not a cat. Just so we’re clear.',
      monster: 'Go on, keep clicking. I’ll wait. It’s not like I have plans.',
      ringe: 'Fire is the best class. I say that with complete impartiality.',
      welt: 'Norhol Kull. Cold, loud, one longhouse. You get used to it.',
      buch: 'Yes, I’m in it. No, I’m not telling you anything.',
      patreon: 'Come along. Then at least I’ll have someone to grumble at.',
      mystic: 'You didn’t hear that from me.',
      bye: 'That’s it. I’m off.',
      poke: ['COUNT. THE. TAILS.', 'Petting costs extra.', 'What? This is just my face.',
        'Two tails. Does a cat have two tails? Exactly.', 'Once more and I’m sitting on your keyboard.']
    }
  };
  const T = () => LINES[window.ROM_LANG && window.ROM_LANG() === 'en' ? 'en' : 'de'];
  document.addEventListener('rom-mystic', () => setTimeout(() => say(T().mystic), 400));
  let hideTimer, pokeCount = 0, pokeIdx = 0;
  function say(text, ms) {
    bubble.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { bubble.hidden = true; }, ms || 4500);
  }

  body.addEventListener('click', () => {
    pokeCount++;
    root.classList.remove('hop'); void root.offsetWidth; root.classList.add('hop');
    if (pokeCount >= 6) { say(T().bye); setTimeout(() => root.classList.add('away'), 1600); return; }
    const p = T().poke;
    say(p[pokeIdx++ % p.length]);
  });
  root.querySelector('.neko-close').addEventListener('click', () => {
    root.classList.add('away');
  });

  // ---------- Abschnitte kommentieren ----------
  const seen = new Set();
  const sections = ['top', 'monster', 'ringe', 'welt', 'buch', 'patreon']
    .map(id => ({ id, el: id === 'top' ? document.querySelector('.hero') : document.getElementById(id) }))
    .filter(s => s.el);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const s = sections.find(s => s.el === e.target);
        if (s && !seen.has(s.id)) {
          seen.add(s.id);
          setTimeout(() => say(T()[s.id]), s.id === 'top' ? 1400 : 300);
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(s => io.observe(s.el));
  }

  // ---------- Mitlaufen ----------
  let lastY = scrollY, walking = 0, step = 0, facing = 1, x = 0, targetX = 0;
  // Auf schmalen Bildschirmen rutscht Neko beim Anmeldefeld an den Rand und linst nur herein
  const signup = document.querySelector('.signup-box');
  function computeTarget() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    const size = root.offsetWidth;
    let peek = false;
    if (signup && innerWidth < 760) {
      const r = signup.getBoundingClientRect();
      peek = r.top < innerHeight - 40 && r.bottom > 80;
    }
    targetX = peek ? innerWidth - size * 0.45 : 12 + p * (innerWidth - size - 24);
  }
  window.addEventListener('scroll', () => {
    const dy = scrollY - lastY;
    lastY = scrollY;
    if (Math.abs(dy) > 0) { walking = 12; facing = dy > 0 ? 1 : -1; }
    computeTarget();
  }, { passive: true });
  window.addEventListener('resize', computeTarget);
  computeTarget();
  x = targetX;

  let tick = 0, blinkUntil = 0, wagUntil = 0;
  function loop(now) {
    tick++;
    if (!reduce) x += (targetX - x) * 0.08; else x = targetX;
    root.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    cv.style.transform = 'scaleX(' + facing + ')';
    const bw = bubble.hidden ? 260 : bubble.offsetWidth;
    root.classList.toggle('flip', x + bw > innerWidth - 8);

    if (walking > 0 && !reduce) {
      walking--;
      if (tick % 8 === 0) step++;
      draw({ feet: step % 2 ? 'stepA' : 'stepB' });
    } else {
      if (now > blinkUntil + 3200 && Math.random() < 0.01) blinkUntil = now + 140;
      if (now > wagUntil + 2500 && Math.random() < 0.008) wagUntil = now + 600;
      const wag = now < wagUntil && Math.floor(now / 150) % 2 === 0;
      draw({ blink: now < blinkUntil, wag });
    }
    requestAnimationFrame(loop);
  }
  draw({});
  requestAnimationFrame(loop);
})();
