// Sprachumschaltung DE / EN.
// Deutsch steht direkt im HTML. Hier liegen nur die englischen Texte.
// Beim Umschalten werden Texte und Attribute getauscht, danach meldet die Seite „langchange“.
(function () {
  const EN = {
    'nav.monster': 'Monsters',
    'nav.rings': 'Rings',
    'nav.book': 'Novel',
    'hero.h1': 'Monsters live in rings.<br>Champions are made in arenas.',
    'foot.tag': 'Monsters live in rings. Champions are made in arenas.',
    'hero.sub':'Harry Potter meets Pokémon, in a world walled in by mist.',
    'hero.cta': 'Come to Giara',
    'hero.cta2': 'See the monsters',
    'alt.logo': 'A glowing ring in the snow, inside it the silhouette of Neko with his two tails',
    'aria.scroll': 'On to the monsters',
    'monster.kicker': 'Bestiary of Giara',
    'monster.h2': 'Which monster do you summon?',
    'aria.deck': 'Monster cards, use the arrow keys to browse',
    'aria.prev': 'Previous card',
    'aria.next': 'Next card',
    'aria.thumbs': 'All monsters',
    'deck.hint': 'Tap the card or swipe it away',

    'm.leviathan.alt': 'The Leviathan, a whale-sized colossus of horn plates, floating in the mist above Norhol Kull',
    'm.leviathan.tag': 'Wind ring · Level 7',
    'm.leviathan.text': 'A summoner called him out of the ring outside the arena, just to see if she could. He hung over Norhol Kull like a whale in the sky and breathed. Her KAI lasted ten breaths.',
    'm.eikthyrnir.alt': 'Eikthyrnir, a giant stag with antlers of flowering birch branches, in a meadow full of flowers',
    'm.eikthyrnir.tag': 'Life ring · Level 5',
    'm.eikthyrnir.text': 'A summoner calls him onto a dead field, and where the glowing dew drips from his antlers, the grass shoots up. Afterwards the summoner stays in bed for two days.',
    'm.tauloeffel.alt': 'The Taulöffel, a stocky desert hare with two ears of milky glass, sitting by a tent at the edge of the dunes',
    'm.tauloeffel.tag': 'Wind ring · Level 1',
    'm.tauloeffel.text': 'Call him out of the ring in the desert and you get water: overnight his glass ears fill up. In the morning he goes back into the ring, and his summoner is a little thinner.',
    'm.baku.alt': 'The Baku, a bear-sized creature with a trunk, standing at a window in a village lane at night',
    'm.baku.tag': 'Earth ring · Level 4',
    'm.baku.text': 'His summoner calls him to a child’s window at night, and he drinks the nightmares through the gap. What he carries back into the ring, nobody knows.',
    'm.neko.alt': 'Neko, a round, fire-red furry creature with two bushy tails, standing on a fence in the snow with his arms crossed',
    'm.neko.tag': 'Absolutely not a cat',
    'm.neko.text': 'Fire-red, round as a fresh loaf and thoroughly offended whenever anyone calls him a cat. He only leaves the ring when called, and won’t go back until he’s been proven right.',
    'm.wetterorgel.alt': 'The Wetterorgel, a heavy black stork-like bird with a fan of horn pipes instead of tail feathers, by a lighthouse above the sea',
    'm.wetterorgel.tag': 'Wind ring · Level 2',
    'm.wetterorgel.text': 'Call her out of the ring and her eleven horn pipes start humming long before the storm shows in the sky. The fishermen in the bay pay her summoner to call her once every morning.',
    'm.glutschlaefer.alt': 'The Glutschläfer, a lizard that looks like charred wood with embers in its cracks, curled up in a hearth',
    'm.glutschlaefer.tag': 'Fire ring · Level 3',
    'm.glutschlaefer.text': 'Every winter an innkeeper calls him into the hearth, and as long as his KAI holds, the fire never goes out. What it costs him shows on his face in spring.',
    'm.kurma.alt': 'Kurma, a giant tortoise with a shell of mossy rock, standing in front of a farm in the snow',
    'm.kurma.tag': 'Giant tortoise',
    'm.kurma.text': 'Call her out of the ring and you bring a hill of moss, fir trees and stone onto the field. She blinks once, and her summoner has to sit down.',
    'm.golem.alt': 'The Golem, a hunched figure of wet mud, standing in a field at night next to a lantern',
    'm.golem.tag': 'Earth ring · Level 2',
    'm.golem.text': 'His summoner calls him at night, and he digs the ditches without a sound. His mud face keeps trying to copy his summoner’s face. The longer the night, the better it works.',
    'm.kraken.alt': 'Huge arms rise from the water between the boats of a snowy harbour at night',
    'm.kraken.tag': 'Water ring · Level 8',
    'm.kraken.text': 'Level 8. A summoner once called him in the harbour, and all anyone saw were arms taller than the masts and, deep below, an eye like a sunken lantern. The summoner was never found.',
    'insta.more': 'More monsters on Instagram',
    'insta.p': 'Even more monsters from Giara:',

    'rings.kicker': 'The nine ring classes',
    'rings.h2': 'Which ring suits you?',
    'aria.rings': 'Ring classes',
    'rare.vc': 'very common', 'rare.c': 'common', 'rare.r': 'rare', 'rare.vr': 'very rare', 'rare.u': 'one of a kind',
    'r.fire': 'Fire', 'r.fire.name': 'Fire ring',
    'r.fire.text': 'With most people’s KAI it’s just enough to warm your hands. With a great deal of KAI it’s enough for a fire tornado.',
    'r.water': 'Water', 'r.water.name': 'Water ring',
    'r.water.text': 'Cools, soaks, puts out. Anyone who wants to move a whole lake with it needs a lot of KAI and even more patience.',
    'r.earth': 'Earth', 'r.earth.name': 'Earth ring',
    'r.earth.text': 'Makes the ground tremble, which is why miners love it and potters very much don’t.',
    'r.stone': 'Stone', 'r.stone.name': 'Stone ring',
    'r.stone.text': 'Hardens whatever you touch with it. Far too heavy for jewellery, unbeatable as a paperweight.',
    'r.wind': 'Wind', 'r.wind.name': 'Wind ring',
    'r.wind.text': 'The lightest ring of all. They say some people could once fly with it, but they also say Eskil was clever.',
    'r.light': 'Light', 'r.light.name': 'Light ring',
    'r.light.text': 'Glows all by itself, and in the big cities there are people who can never have enough of them on their fingers.',
    'r.dark': 'Darkness', 'r.dark.name': 'Dark ring',
    'r.dark.text': 'Swallows the light around it. Hardly anyone wears one, though, because over time it turns your skin black, and not the kind that washes off.',
    'r.life': 'Life', 'r.life.name': 'Life ring',
    'r.life.text': 'Heals small wounds and makes fields grow faster. It costs accordingly at the market, and people haggle anyway.',
    'r.death': 'Death', 'r.death.name': 'Death ring',
    'r.death.text': 'A ring that devours you. Faster than any other.',
    'r.sealed': 'Sealed', 'r.mystic': 'Mystic', 'r.mystic.name': 'Mystic ring',
    'r.mystic.text': 'Some rings fit no class at all. Each one exists exactly once, and so does the monster inside it, once in all of Giara. Whoever finds one is either very lucky or about to have a great many visitors.',

    'alt.banner': 'A boy with a shield and a goat walk towards a snowy village, behind them a huge wall of mist towers into the sky',
    'world.kicker': 'The World',
    'world.p1': 'All around Giara stands the Veil, a wall of mist that won’t move an inch, not even in the fiercest storm. Where it touches the ground, nothing grows, and whoever walks in never comes out again.',
    'world.p2': 'So nobody likes to go anywhere near the Veil.',
    'world.p3': 'Monsters live in the rings: the Albmare. Whoever calls one is a summoner, and every Albmar drinks from the strength of the one who called it, until one of them cuts the bond. Fights happen in the arena. Outside it, summoning is strictly forbidden, and of course everyone sticks to that.',
    'world.cities': 'The six cities',
    'world.hint': 'Hover over a city or tap it.',
    'alt.map': 'Map of Giara with the six cities, surrounded by mist',
    'c.norhol.crest': 'Crest: the two axes of Kull',
    'c.norhol.text': 'Icebergs, mead, fur coats and exactly one longhouse. Not two. One.',
    'c.sol.crest': 'Crest: the firebird',
    'c.sol.text': 'The capital, with the most beautiful stadium in the world. Once a year, the final is fought here.',
    'c.elex.crest': 'Crest: the table of the five gods of wealth',
    'c.elex.text': 'The trading city doesn’t grow upwards. It grows downwards, storey by storey, into the earth.',
    'c.tobu.crest': 'Crest: Asahi’s rising sun',
    'c.tobu.text': 'An imperial palace on the cliff, waterfalls, and smiths who set rings into swords.',
    'c.zanaos.crest': 'Crest: Umkomo, the red whale',
    'c.zanaos.text': 'The island city with the biggest harbour, and on the neighbouring islands live people you’d better not lend anything to.',
    'c.oel.crest': 'Crest: the leaf of the serpent tree',
    'c.oel.text': 'Mud bricks, a desert without end, and workshops that are already smoking.',
    'c.lost.name': 'The Forgotten City',
    'c.lost.crest': 'Crest: unknown',
    'c.lost.text': 'Where you end up when you’re allowed nowhere else. No tournaments, and visitors aren’t exactly welcome either.',

    'alt.arena': 'An empty wooden arena at dusk, torches burning at the gates',
    'book.kicker': 'The Book',
    'book.h2': 'The novel of Ring of Monsters.',
    'book.p1': 'A farm boy with a “useless” ring swears to win the greatest tournament in the world, to save his father.',
    'book.p2': 'Because his father is ill, and not the kind of ill that tea and bed rest will fix. He sleeps and sleeps, and moss is growing on his skin. Nobody can cure it. Probably only the Wishing Ring can, and only whoever wins the final in Sol Thalea gets a wish.',
    'book.quote': '“Different. Yes. That’s the word.”',
    'book.cite': 'Hannek, the second-best ringsmith in Norhol Kull, about the useless ring',

    'pat.h2': 'Come along to Giara.',
    'pat.p': 'On Patreon you’ll find stories from Giara, new monsters and a look behind the scenes, and some of it you won’t find anywhere else. Following is free.',
    'pat.cta': 'Go to Patreon',
    'foot.imprint': 'Imprint',
    'foot.privacy': 'Privacy',
    'aria.neko': 'Poke Neko',
    'aria.nekoclose': 'Send Neko away'
  };

  const originals = new Map();
  let lang = 'de';
  try {
    const saved = localStorage.getItem('rom-lang');
    if (saved === 'de' || saved === 'en') lang = saved;
    else lang = (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch (e) {
    lang = (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
  }

  function remember() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      originals.set(el, { html: el.innerHTML });
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const o = originals.get(el) || {};
      o.attrs = {};
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const name = pair.split('=')[0].trim();
        o.attrs[name] = el.getAttribute(name);
      });
      originals.set(el, o);
    });
  }

  function apply(next) {
    lang = next;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.innerHTML = lang === 'en' && EN[key] ? EN[key] : originals.get(el).html;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [name, key] = pair.split('=').map(s => s.trim());
        const val = lang === 'en' && EN[key] ? EN[key] : originals.get(el).attrs[name];
        if (val != null) el.setAttribute(name, val);
      });
    });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'));
    try { localStorage.setItem('rom-lang', lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  window.ROM_LANG = () => lang;

  document.addEventListener('DOMContentLoaded', () => {
    remember();
    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => apply(b.dataset.lang)));
    if (lang !== 'de') apply(lang);
    else document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === 'de' ? 'true' : 'false'));
  });
})();
