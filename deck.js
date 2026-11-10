// Kartenstapel für die Monster-Galerie.
// Liest die normale Liste (.gallery) aus und baut daraus einen Stapel.
// Ohne JavaScript bleibt die Liste als Raster sichtbar.
(function () {
  const list = document.querySelector('.gallery');
  const wrap = document.querySelector('.deck-wrap');
  if (!list || !wrap) return;

  const items = [...list.querySelectorAll('.card')].map(li => {
    const img = li.querySelector('img');
    const ps = li.querySelectorAll('p');
    return {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      name: li.querySelector('h3').textContent,
      tag: li.querySelector('.tag').textContent,
      text: ps[ps.length - 1].textContent
    };
  });

  const deck = wrap.querySelector('.deck');
  const thumbs = wrap.querySelector('.thumbs');
  const elCount = wrap.querySelector('.deck-count');
  const elName = wrap.querySelector('.deck-name');
  const elTag = wrap.querySelector('.deck-tag');
  const elText = wrap.querySelector('.deck-text');
  const n = items.length;
  const VISIBLE = 4;
  let order = items.map((_, i) => i);
  let busy = false;

  const cards = items.map((it, i) => {
    const c = document.createElement('div');
    c.className = 'mcard';
    c.innerHTML =
      '<div class="mcard-inner">' +
      '<img src="' + it.src + '" alt="' + it.alt.replace(/"/g, '&quot;') + '" draggable="false"' + (i < VISIBLE ? '' : ' loading="lazy"') + '>' +
      '<span class="mcard-top"></span><span class="mcard-plate"></span><span class="holo"></span></div>';
    c.querySelector('.mcard-top').textContent = it.tag;
    c.querySelector('.mcard-plate').textContent = it.name;
    deck.appendChild(c);
    return c;
  });

  const thumbBtns = items.map((it, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', it.name);
    b.innerHTML = '<img src="' + it.src + '" alt="" loading="lazy">';
    b.addEventListener('click', () => goTo(i));
    thumbs.appendChild(b);
    return b;
  });

  function place(card, p) {
    const hidden = p >= VISIBLE;
    card.style.transform = 'translate(' + p * 14 + 'px,' + p * -10 + 'px) rotate(' + p * 3 + 'deg) scale(' + (1 - p * 0.05) + ')';
    card.style.opacity = hidden ? '0' : '1';
    card.style.filter = 'brightness(' + (1 - p * 0.18) + ')';
    card.style.zIndex = String(n - p);
    card.classList.toggle('is-top', p === 0);
    card.setAttribute('aria-hidden', p === 0 ? 'false' : 'true');
  }

  function layout() {
    order.forEach((idx, p) => place(cards[idx], p));
    const top = order[0];
    const it = items[top];
    elCount.textContent = (top + 1) + ' / ' + n;
    elName.textContent = it.name;
    elTag.textContent = it.tag;
    elText.textContent = it.text;
    thumbBtns.forEach((b, i) => b.setAttribute('aria-selected', i === top ? 'true' : 'false'));
    const active = thumbBtns[top];
    thumbs.scrollTo({ left: active.offsetLeft - thumbs.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
  }

  function next(dir) {
    if (busy) return;
    busy = true;
    holoOff();
    dir = dir || -1;
    const card = cards[order[0]];
    card.style.transform = 'translate(' + dir * 130 + '%, 30px) rotate(' + dir * 18 + 'deg)';
    card.style.opacity = '0';
    setTimeout(() => {
      order.push(order.shift());
      layout();
      busy = false;
    }, 300);
  }

  function prev() {
    if (busy) return;
    order.unshift(order.pop());
    const card = cards[order[0]];
    card.style.transition = 'none';
    card.style.transform = 'translate(-130%, 30px) rotate(-18deg)';
    card.style.opacity = '0';
    card.style.zIndex = String(n + 1);
    void card.offsetWidth;
    card.style.transition = '';
    layout();
  }

  function goTo(i) {
    if (order[0] === i) return;
    while (order[0] !== i) order.push(order.shift());
    layout();
  }

  // Ziehen, Wischen, Antippen
  let startX = 0, dx = 0, dragging = false;
  deck.addEventListener('pointerdown', e => {
    const card = e.target.closest('.mcard');
    if (!card || !card.classList.contains('is-top') || busy) return;
    dragging = true; startX = e.clientX; dx = 0;
    card.classList.add('dragging');
    deck.setPointerCapture(e.pointerId);
  });
  // Holo-Schimmer: oberste Karte neigt sich zur Maus
  const canHover = matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function holo(e) {
    const card = cards[order[0]];
    const inner = card.querySelector('.mcard-inner');
    const r = card.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    inner.classList.add('live');
    inner.style.transform = 'rotateY(' + ((px - .5) * 18).toFixed(2) + 'deg) rotateX(' + ((.5 - py) * 18).toFixed(2) + 'deg)';
    inner.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    inner.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    inner.style.setProperty('--bx', (px * 100).toFixed(1) + '%');
    inner.style.setProperty('--by', (py * 100).toFixed(1) + '%');
  }
  function holoOff() {
    cards.forEach(c => { const inner = c.querySelector('.mcard-inner'); inner.classList.remove('live'); inner.style.transform = ''; });
  }
  if (canHover) deck.addEventListener('pointerleave', holoOff);

  deck.addEventListener('pointermove', e => {
    if (!dragging) { if (canHover && e.target.closest('.mcard.is-top')) holo(e); return; }
    dx = e.clientX - startX;
    const card = cards[order[0]];
    card.style.transform = 'translate(' + dx + 'px, 0) rotate(' + dx / 18 + 'deg)';
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    const card = cards[order[0]];
    card.classList.remove('dragging');
    if (Math.abs(dx) > 70) next(dx < 0 ? -1 : 1);
    else if (Math.abs(dx) < 6) next(-1);
    else place(card, 0);
  }
  deck.addEventListener('pointerup', endDrag);
  deck.addEventListener('pointercancel', endDrag);

  deck.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next(-1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });
  wrap.querySelector('.deck-next').addEventListener('click', () => next(-1));
  wrap.querySelector('.deck-prev').addEventListener('click', prev);

  // Sprache gewechselt: Texte aus der Liste neu lesen
  document.addEventListener('langchange', () => {
    [...list.querySelectorAll('.card')].forEach((li, i) => {
      const ps = li.querySelectorAll('p');
      items[i].tag = li.querySelector('.tag').textContent;
      items[i].text = ps[ps.length - 1].textContent;
      items[i].alt = li.querySelector('img').getAttribute('alt');
      cards[i].querySelector('.mcard-top').textContent = items[i].tag;
      cards[i].querySelector('img').setAttribute('alt', items[i].alt);
    });
    layout();
  });

  wrap.hidden = false;
  list.hidden = true;
  layout();
})();
