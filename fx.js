// Bewegung: Glutfunken und Schnee im Hero, Einblenden beim Scrollen, Parallaxe.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Einblenden ----------
  const targets = document.querySelectorAll('.section-head, .deck-wrap, .rings, .prose, .map-wrap, .cities-title, .book-img, .book-text, .signup-box, .social');
  if ('IntersectionObserver' in window && !reduce) {
    targets.forEach(t => t.classList.add('reveal'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    targets.forEach(t => io.observe(t));
  }

  // ---------- Lesefortschritt + aktiver Menüpunkt ----------
  const bar = document.querySelector('.progress');
  const navLinks = [...document.querySelectorAll('.topbar nav a:not(.nav-cta)')];
  const navTargets = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScrollUI() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    let current = null;
    navTargets.forEach((t, i) => { if (t.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === current));
  }
  window.addEventListener('scroll', onScrollUI, { passive: true });
  onScrollUI();

  // ---------- Hero bleibt stehen, Inhalt schiebt sich darüber ----------
  const band = document.querySelector('.hero-band');
  const heroEl = document.querySelector('.hero-band .hero');
  function placeBand() {
    if (!band) return;
    // Ist der Hero höher als der Bildschirm (Handy), darf er erst zu Ende scrollen, bevor er stehen bleibt
    band.style.setProperty('--hero-top', Math.min(0, innerHeight - band.offsetHeight) + 'px');
  }
  placeBand();
  window.addEventListener('resize', placeBand);

  if (reduce) return;

  if (heroEl) {
    let raf = 0;
    const fade = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.9)));
      heroEl.style.opacity = (1 - p).toFixed(3);
      heroEl.style.visibility = p >= 1 ? 'hidden' : '';
      heroEl.style.transform = 'translateY(' + (p * -50).toFixed(1) + 'px) scale(' + (1 - p * 0.07).toFixed(3) + ')';
      heroEl.style.filter = p > 0.02 ? 'blur(' + (p * 4).toFixed(1) + 'px)' : '';
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(fade); }, { passive: true });
    fade();
  }

  // ---------- Glut-Spur am Mauszeiger, in den Farben der Ringklassen ----------
  if (matchMedia('(hover: hover)').matches) {
    const tc = document.createElement('canvas');
    tc.className = 'ember-trail';
    tc.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tc);
    const tx = tc.getContext('2d');
    const RING = ['255,90,42', '255,170,60', '255,216,74', '127,211,90', '60,196,176', '58,141,255', '138,77,255', '255,120,60'];
    let embers = [], running = false, lastX = 0, lastY = 0, hue = 0;
    const tdpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => { tc.width = innerWidth * tdpr; tc.height = innerHeight * tdpr; tx.setTransform(tdpr, 0, 0, tdpr, 0, 0); };
    size(); addEventListener('resize', size);
    // Nur ab und zu ein kleiner Funkenspritzer: kurze, helle Funken, die wegspringen und fallen
    let moved = 0;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      moved += Math.hypot(dx, dy);
      if (moved < 140 || Math.random() > .35) return;
      moved = 0;
      const n = 3 + ((Math.random() * 4) | 0);
      hue = (hue + 1) % RING.length;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, sp = 1.6 + Math.random() * 2.4;
        embers.push({
          x: e.clientX, y: e.clientY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, decay: .03 + Math.random() * .03,
          c: Math.random() < .6 ? RING[hue] : '255,236,200'
        });
      }
      if (embers.length > 80) embers.splice(0, embers.length - 80);
      if (!running) { running = true; requestAnimationFrame(trail); }
    }, { passive: true });
    function trail() {
      tx.clearRect(0, 0, innerWidth, innerHeight);
      tx.globalCompositeOperation = 'lighter';
      tx.lineCap = 'round';
      for (let i = embers.length - 1; i >= 0; i--) {
        const p = embers[i];
        p.x += p.vx; p.y += p.vy; p.vy += .12; p.vx *= .97; p.life -= p.decay;
        if (p.life <= 0) { embers.splice(i, 1); continue; }
        tx.strokeStyle = 'rgba(' + p.c + ',' + p.life + ')';
        tx.lineWidth = 1.6;
        tx.beginPath(); tx.moveTo(p.x, p.y); tx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); tx.stroke();
      }
      tx.globalCompositeOperation = 'source-over';
      if (embers.length) requestAnimationFrame(trail);
      else { running = false; tx.clearRect(0, 0, innerWidth, innerHeight); }
    }
  }

  // ---------- Zauberknopf: Funken beim Darüberfahren ----------
  const SPARK_COLORS = ['#ff5a2a', '#ffd84a', '#7fd35a', '#3cc4b0', '#3a8dff', '#8a4dff', '#ffffff'];
  document.querySelectorAll('.magic-btn').forEach(btn => {
    let last = 0;
    btn.addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      for (let i = 0; i < 2; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.style.left = (e.clientX - 3) + 'px';
        s.style.top = (e.clientY - 3) + 'px';
        const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 40;
        s.style.setProperty('--tx', Math.cos(a) * d + 'px');
        s.style.setProperty('--ty', Math.sin(a) * d - 20 + 'px');
        s.style.setProperty('--sc', SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0]);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 950);
      }
    });
  });

  // ---------- Hero-Ring neigt sich zur Maus ----------
  const hero = document.querySelector('.hero');
  const tilt = document.querySelector('.hero-ring .tilt');
  if (hero && tilt && matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = tilt.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      tilt.style.transform = 'rotateY(' + (dx * 22).toFixed(2) + 'deg) rotateX(' + (-dy * 22).toFixed(2) + 'deg)';
    });
    hero.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  }

  // ---------- Parallaxe Banner ----------
  const banner = document.querySelector('.world-banner img');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (banner) {
        const r = banner.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          banner.style.transform = 'translateY(' + (p * 40).toFixed(1) + 'px) scale(1.08)';
        }
      }
      ticking = false;
    });
  }, { passive: true });

  // ---------- Funken + Schnee ----------
  const cv = document.getElementById('embers');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let w, h, parts = [], running = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, w / 14));
    parts = Array.from({ length: count }, () => spawn(true));
  }
  function spawn(anywhere) {
    const ember = Math.random() < 0.45;
    return {
      ember,
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : (ember ? h + 10 : -10),
      r: ember ? 0.8 + Math.random() * 1.8 : 0.6 + Math.random() * 1.6,
      vy: ember ? -(0.25 + Math.random() * 0.7) : 0.2 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      t: Math.random() * 100,
      a: 0.3 + Math.random() * 0.6
    };
  }
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.t += 0.02;
      p.x += p.vx + Math.sin(p.t) * (p.ember ? 0.35 : 0.25);
      p.y += p.vy;
      if (p.y < -12 || p.y > h + 12 || p.x < -12 || p.x > w + 12) { parts[i] = spawn(false); continue; }
      if (p.ember) {
        const flick = 0.6 + Math.sin(p.t * 6) * 0.4;
        ctx.fillStyle = 'rgba(255,' + (120 + Math.floor(flick * 60)) + ',60,' + (p.a * flick) + ')';
        ctx.shadowColor = 'rgba(255,110,40,.9)';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = 'rgba(220,232,245,' + p.a * 0.7 + ')';
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  // Nur animieren, solange der Hero zu sehen ist
  new IntersectionObserver(es => {
    const vis = es[0].isIntersecting;
    if (vis && !running) { running = true; requestAnimationFrame(frame); }
    if (!vis) running = false;
  }).observe(cv);
  requestAnimationFrame(frame);
})();
