// Ringklassen (mit dem versiegelten mystischen Ring) und die 3D-Karte von Giara mit Wappen.
(function () {
  const L = () => (window.ROM_LANG ? window.ROM_LANG() : 'de');

  // ---------- Ringklassen ----------
  const chips = [...document.querySelectorAll('.ring-chip')];
  const stage = document.querySelector('.ring-stage');
  let currentChip = null;
  if (chips.length && stage) {
    const orb = stage.querySelector('.ring-orb');
    const elRare = stage.querySelector('.ring-rare');
    const elName = stage.querySelector('.ring-name');
    const elText = stage.querySelector('.ring-text');
    const mystic = document.querySelector('.ring-mystic');
    if (mystic) mystic.classList.add('sealed');

    function show(chip) {
      currentChip = chip;
      chips.forEach(c => c.setAttribute('aria-selected', c === chip ? 'true' : 'false'));
      stage.style.setProperty('--c', chip.style.getPropertyValue('--c'));
      stage.classList.toggle('is-mystic', chip === mystic);
      orb.classList.remove('pop'); void orb.offsetWidth; orb.classList.add('pop');
      elRare.textContent = (L() === 'en' ? 'Rarity: ' : 'Seltenheit: ') + chip.dataset.rare;
      elName.textContent = chip.dataset.name;
      elText.textContent = chip.dataset.text;
    }
    chips.forEach(c => c.addEventListener('click', () => {
      if (c === mystic && c.classList.contains('sealed')) {
        c.classList.add('unsealing');
        setTimeout(() => {
          c.classList.remove('sealed', 'unsealing');
          c.classList.add('unsealed');
          show(c);
          document.dispatchEvent(new CustomEvent('rom-mystic'));
        }, 900);
        return;
      }
      show(c);
    }));
    show(chips[0]);
    document.addEventListener('langchange', () => { if (currentChip) show(currentChip); });
  }

  // ---------- Wappen als kleine Zeichen ----------
  const ICONS = {
    axes: '<g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><line x1="6" y1="20" x2="16.5" y2="6.5"/><line x1="18" y1="20" x2="7.5" y2="6.5"/></g><path fill="currentColor" d="M14.6 4.4c2.6-1.6 6-.3 6.6 3.4l-3.6.6z"/><path fill="currentColor" d="M9.4 4.4c-2.6-1.6-6-.3-6.6 3.4l3.6.6z"/>',
    bird: '<path fill="currentColor" d="M12 2.5c-1 3-1.2 5.6 0 8.2 1.2-2.6 1-5.2 0-8.2zM12 10.2c-3-2-6.6-2.6-10.2-1.5 3.1 1 5.6 2.6 7.3 5.3L12 20.5l2.9-6.5c1.7-2.7 4.2-4.3 7.3-5.3-3.6-1.1-7.2-.5-10.2 1.5z"/>',
    table: '<circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" stroke-width="1.7"/><g fill="currentColor"><circle cx="12" cy="3.8" r="1.7"/><circle cx="19.8" cy="9.5" r="1.7"/><circle cx="16.8" cy="18.6" r="1.7"/><circle cx="7.2" cy="18.6" r="1.7"/><circle cx="4.2" cy="9.5" r="1.7"/></g>',
    sun: '<path fill="currentColor" d="M5.5 15a6.5 6.5 0 0 1 13 0z"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="3.5"/><line x1="6.8" y1="8.6" x2="5.2" y2="7"/><line x1="17.2" y1="8.6" x2="18.8" y2="7"/><line x1="4" y1="12.6" x2="1.8" y2="12"/><line x1="20" y1="12.6" x2="22.2" y2="12"/></g><path d="M2.5 18.3c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 7 0" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    whale: '<path fill="#e5482c" d="M2.5 13.5c0-3.6 3.6-6.2 8.2-6.2 4.3 0 7.1 2.2 8.1 5l2.7-3.1.3 5.6-2.9 1.1c-1.3 2.4-4.2 3.6-8.2 3.6-4.7 0-8.2-2.4-8.2-6z"/><circle cx="6.6" cy="12.4" r="1" fill="#2a1208"/><g stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><line x1="10" y1="5.6" x2="9" y2="3"/><line x1="11" y1="5.4" x2="12" y2="2.8"/></g>',
    leaf: '<path fill="currentColor" d="M12 1.8c5.2 4 7.2 9.2 3.6 15.3-1.3 2.2-2.6 3.6-3.6 5.1-1-1.5-2.3-2.9-3.6-5.1C4.8 11 6.8 5.8 12 1.8z"/><path d="M12 5c-1.6 3 1.6 5 0 8s1.6 5 0 7.5" fill="none" stroke="#2a1208" stroke-width="1.1"/>',
    none: '<text x="12" y="17.5" text-anchor="middle" font-size="15" font-family="Cinzel, serif" fill="currentColor">?</text>'
  };
  const svg = k => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[k] || ICONS.none) + '</svg>';

  // ---------- Karte ----------
  const wrap = document.querySelector('.map-wrap');
  const list = document.querySelector('.cities');
  if (wrap && list) {
    const pins = wrap.querySelector('.map-pins');
    const elCrest = wrap.querySelector('.map-crest');
    const elName = wrap.querySelector('.map-name');
    const elText = wrap.querySelector('.map-text');
    const elCrestIcon = wrap.querySelector('.map-card-crest');
    const card = wrap.querySelector('.map-card');
    const lis = [...list.querySelectorAll('li')];
    const read = () => lis.map(li => ({
      x: li.dataset.x, y: li.dataset.y, crest: li.dataset.crest, icon: li.dataset.icon,
      lost: li.classList.contains('lost'),
      name: li.querySelector('h4').textContent,
      text: li.querySelector('p').textContent
    }));
    let cities = read();
    let current = 0;
    const btns = cities.map((c, i) => {
      const b = document.createElement('button');
      b.className = 'pin' + (c.lost ? ' pin-lost' : '');
      b.style.left = c.x + '%';
      b.style.top = c.y + '%';
      b.style.setProperty('--d', (i * 0.35) + 's');
      b.setAttribute('aria-label', c.name);
      b.innerHTML = '<span class="beam"></span><span class="crest">' + svg(c.icon) + '<span class="crest-name"></span></span><span class="dot"></span>';
      b.querySelector('.crest-name').textContent = c.name;
      b.addEventListener('click', () => select(i));
      b.addEventListener('mouseenter', () => select(i));
      pins.appendChild(b);
      return b;
    });
    function select(i) {
      current = i;
      const c = cities[i];
      btns.forEach((b, j) => b.classList.toggle('active', j === i));
      card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
      elCrestIcon.innerHTML = svg(c.icon);
      elCrest.textContent = c.crest;
      elName.textContent = c.name;
      elText.textContent = c.text;
    }

    // 3D: die Karte neigt sich zur Maus, ein Lichtschein wandert mit
    const stageEl = wrap.querySelector('.map-stage');
    const map = wrap.querySelector('.map');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && matchMedia('(hover: hover)').matches) {
      stageEl.addEventListener('pointermove', e => {
        const r = stageEl.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        map.style.setProperty('--rx', (24 - py * 14).toFixed(2) + 'deg');
        map.style.setProperty('--ry', ((px - .5) * 14).toFixed(2) + 'deg');
        map.style.setProperty('--sx', (px * 100).toFixed(1) + '%');
        map.style.setProperty('--sy', (py * 100).toFixed(1) + '%');
      });
      stageEl.addEventListener('pointerleave', () => {
        ['--rx', '--ry', '--sx', '--sy'].forEach(p => map.style.removeProperty(p));
      });
    }

    document.addEventListener('langchange', () => {
      cities = read();
      btns.forEach((b, i) => { b.setAttribute('aria-label', cities[i].name); b.querySelector('.crest-name').textContent = cities[i].name; });
      select(current);
    });

    wrap.hidden = false;
    list.hidden = true;
    document.querySelector('.map-hint').hidden = false;
    select(0);
  }
})();
