/* The Atlantic View brochure: behaviour. Vanilla JS with GSAP ScrollTrigger and Lenis when available. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const html = document.documentElement;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  html.classList.toggle('no-anim', reduce);

  const CAPTIONS = {
    'arrival-day': 'Signature entrance by day', 'arrival-night': 'Signature entrance at night',
    'lawn': 'Lawns and informal seating at the foot of a block', 'promenade': 'Palm-lined promenade to the water',
    'court': 'Enclosed multi-use sports court', 'marina-day': 'The marina and boat club',
    'marina-aerial': 'Marina docks and beach from above', 'park-aerial': 'The central park and children’s play',
    'lobby-corner': 'Block entrance and lobby', 'porte-cochere': 'Covered drop-off beneath the balconies',
    'rooftops': 'Roof terraces and balcony pools from above', 'drop-off': 'Resident drop-off',
    'parking': 'Covered parking', 'balcony-pool': 'Private balcony infinity pool',
    'playground': 'Children’s play environment', 'facade-pools': 'Balcony pools facing the water',
    'gym': 'Gym and fitness area', 'balcony-view': 'Terrace outlook across the estate',
    'marina-dusk': 'The marina at dusk', 'facade-night': 'Balcony pools at night', 'park-dusk': 'The park at dusk',
    'balcony-night': 'Evening from a private terrace',
    'block-garden': 'Gardens and parking around a block', 'beach': 'The beach below the residences',
    'marina-dock': 'The marina boardwalk', 'bath-1': 'Bathroom with a walk-in shower', 'bath-2': 'Bathroom with a window to the water',
    'bath-3': 'Bathroom with a rain shower', 'kitchen-1': 'Kitchen with a marble island', 'kitchen-2': 'Kitchen with island seating',
    'living-1': 'Living room with terrace', 'living-2': 'Living room opening to the balcony',
    'bedroom-1': 'Bedroom over the water', 'bedroom-2': 'Bedroom with a seating corner',
    'o2-aerial-beach': 'Option 2: the estate from above, beach side', 'o2-aerial-marina': 'Option 2: the estate from above, marina side',
    'o2-court': 'Option 2: the sports court and playground', 'o2-blocks-palms': 'Option 2: blocks among the palms', 'o2-block': 'Option 2: a block with white balconies',
    'o2-playground': 'Option 2: the playground', 'o2-beach-marina': 'Option 2: the beach and marina', 'o2-marina-dock': 'Option 2: yachts at the dock',
    'o2-gateway': 'Option 2: the gateway', 'o2-lobby': 'Option 2: a block entrance', 'o2-porte-cochere': 'Option 2: covered drop-off along the street',
    'o2-clubhouse-pool': 'Option 2: the clubhouse and pool', 'o2-pool-pavilion': 'Option 2: the pool pavilion', 'o2-beach-blocks': 'Option 2: the blocks from the water',
    'lobby-1': 'The entrance lobby', 'lobby-2': 'The lobby lounge', 'lobby-3': 'The lobby reception', 'o2-pools': 'Option 2: infinity pools on the balconies',
    'iso-ground': 'The ground floor in three dimensions', 'iso-typical': 'A typical floor, Levels 2 to 8, in three dimensions', 'iso-pent': 'Level 9 in three dimensions',
    'assets/iso/block.png': 'One block, from the water: wings coloured by home type'
  };
  // resolve an asset path; the single-file preview build defines window.__AV with inlined data URIs
  const A = p => {
    const m = window.__AV;
    if (!m) return p;
    if (m[p]) return m[p];
    const slug = (p.match(/\/([\w-]+)\.jpg$/) || [])[1];
    const el = slug && document.querySelector('img[data-full="' + slug + '"]');
    return el ? el.getAttribute('src') : p;
  };
  const full = slug => A(slug.includes('/') ? slug : slug.startsWith('iso-') ? 'assets/plan/iso/' + slug.slice(4) + '.jpg' : 'assets/r/' + slug + '.jpg');
  const store = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } } };

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis && hasGsap) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = target => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('[data-go]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || !id.startsWith('#')) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id === '#top' ? document.body : id);
    history.replaceState(null, '', id);
  }));

  /* ---------- veil and hero ---------- */
  const veil = $('#veil');
  const hero = $('#hero');
  const heroIn = () => hero.classList.add('in');
  const open = () => {
    veil.classList.add('off');
    document.body.classList.remove('locked');
    if (lenis) lenis.start();
    heroIn();
    setTimeout(() => veil.remove(), 1000);
  };
  if (reduce || store.get('av-seen')) {
    veil.remove();
    heroIn();
  } else {
    store.set('av-seen', '1');
    document.body.classList.add('locked');
    if (lenis) lenis.stop();
    setTimeout(open, 1500);
  }
  if (hasGsap && !reduce) {
    gsap.to('.hero .bg', { yPercent: 22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }
  // background videos: seamless loops; the still image beneath stays as poster and fallback.
  // Safari rejects play() until the clip is really ready (and iPhones in Low Power Mode until a touch), so every
  // play goes through a retrier that tries again on canplaythrough, after short delays, and on the first gesture.
  const saveData = navigator.connection && navigator.connection.saveData;
  const gestureQueue = [];
  const onGesture = () => { gestureQueue.splice(0).forEach(fn => fn()); };
  ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(ev => addEventListener(ev, onGesture, { passive: true, once: false }));
  const tryPlay = (v, attempt = 0) => {
    if (!v || !v.src) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {
      if (attempt === 0) {
        v.addEventListener('canplaythrough', () => tryPlay(v, 1), { once: true });
        gestureQueue.push(() => { if (v.paused) tryPlay(v, 9); });
      }
      if (attempt < 6) setTimeout(() => { if (v.paused) tryPlay(v, attempt + 1); }, 400 * (attempt + 1));
    });
  };
  const videoTier = () => { const devW = innerWidth * (devicePixelRatio || 1); return window.__AV ? '-720.mp4' : devW >= 1100 ? '-1080.mp4' : '-720.mp4'; };
  const bgVideo = (vid, base) => {
    if (!vid || vid.src || reduce || saveData || !vid.canPlayType('video/mp4')) return;
    vid.src = A('assets/video/' + base + videoTier());
    vid.addEventListener('playing', () => vid.classList.add('on'), { once: true });
    vid.addEventListener('error', () => vid.remove(), { once: true });
    vid.addEventListener('loadeddata', () => tryPlay(vid), { once: true });
    vid.load();
    document.addEventListener('visibilitychange', () => { if (document.hidden) vid.pause(); else if (vid.src) tryPlay(vid); });
  };
  // hero: two clips played one after the other, crossfading at each handover
  const heroA = $('#herovid'), heroB = $('#herovid2');
  if (heroA && heroB && !reduce && !saveData && heroA.canPlayType('video/mp4')) {
    const LEAD = 1.2;
    let switching = false;
    heroA.src = A('assets/video/close' + videoTier()); heroB.src = A('assets/video/hero' + videoTier());   // Option 2's beach first, then Option 1's marina
    heroA.addEventListener('playing', () => { heroA.classList.add('on'); heroB.load(); }, { once: true });
    heroA.addEventListener('loadeddata', () => tryPlay(heroA), { once: true });
    heroA.addEventListener('timeupdate', () => {
      if (!switching && heroA.duration && heroA.duration - heroA.currentTime < LEAD) {
        switching = true; heroB.currentTime = 0; tryPlay(heroB);
      }
    });
    heroB.addEventListener('playing', () => { if (switching) heroB.classList.add('on'); });
    heroB.addEventListener('timeupdate', () => {
      if (switching && heroB.duration && heroB.duration - heroB.currentTime < LEAD) {
        switching = false; heroA.currentTime = 0; tryPlay(heroA); heroB.classList.remove('on');
        setTimeout(() => { if (!switching) heroB.pause(); }, 1600);
      }
    });
    heroA.addEventListener('ended', () => { if (!switching) { heroA.currentTime = 0; tryPlay(heroA); } });
    heroB.addEventListener('ended', () => { if (switching) { switching = false; heroB.classList.remove('on'); heroA.currentTime = 0; tryPlay(heroA); } });
    [heroA, heroB].forEach(v => v.addEventListener('error', () => { heroA.classList.remove('on'); heroB.classList.remove('on'); }, { once: true }));
    heroA.load();
    document.addEventListener('visibilitychange', () => { if (document.hidden) { heroA.pause(); heroB.pause(); } else { tryPlay(switching ? heroB : heroA); } });
  }
  const closevid = $('#closevid');
  if (closevid) {
    const cio = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { bgVideo(closevid, 'close'); cio.disconnect(); } }), { rootMargin: '900px 0px' });
    cio.observe(closevid);
  }

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const burger = $('#burger');
  const menuOpen = () => document.body.classList.contains('menu-open');
  const closeMenu = () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); if (lenis && !veil.isConnected) lenis.start(); };
  burger.addEventListener('click', () => {
    if (menuOpen()) return closeMenu();
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
  });
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;height:120px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => nav.classList.toggle('solid', !e.isIntersecting)).observe(sentinel);
  const links = $$('.nav .lnk');
  const secs = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  const aio = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(s => aio.observe(s));
  if (hasGsap) {
    const prog = $('#prog');
    ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: self => { prog.style.transform = 'scaleX(' + self.progress + ')'; } });
  }

  /* ---------- reveals ---------- */
  const rv = $$('[data-rv]');
  const vh = innerHeight;
  rv.forEach(el => { if (el.getBoundingClientRect().top < vh * 0.85) el.classList.add('in'); });
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('rv')));
  const rio = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  rv.forEach(el => rio.observe(el));

  /* ---------- counters ---------- */
  const fmt = n => Math.round(n).toLocaleString('en-GB');
  const cio = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, target = +el.dataset.count;
    if (reduce) { el.textContent = fmt(target); return; }
    const t0 = performance.now(), dur = 1700;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * k);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- two design options ---------- */
  const optSeg = $('#options .seg');
  if (optSeg) {
    let opt = '1';
    const setOpt = o => {
      opt = o;
      $$('button', optSeg).forEach(b => { const on = b.dataset.opt === o; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      $$('[data-opt-copy]').forEach(p => { p.hidden = p.dataset.optCopy !== o; });
      $$('#pairs img').forEach(im => im.classList.toggle('on', im.dataset.o === o));
    };
    $$('button', optSeg).forEach(b => b.addEventListener('click', () => setOpt(b.dataset.opt)));
    setOpt('1');
  }

  /* ---------- waterfront swipe strip ---------- */
  const track = $('#track');
  if (track) {
    const prev = $('#pan-prev'), next = $('#pan-next');
    const step = () => { const p = $('.panel', track); return p ? p.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 24) : 400; };
    const update = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { next.click(); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { prev.click(); e.preventDefault(); }
    });
    // drag to scroll with a mouse; touch uses the native scroll
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    track.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('drag'); track.setPointerCapture(e.pointerId); }
      if (moved) track.scrollLeft = sl - dx;
    });
    const release = () => { if (!down) return; down = false; if (moved) { track.classList.remove('drag'); setTimeout(() => { moved = false; }, 0); } };
    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    track.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
    if (lenis) { track.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }, { passive: true }); }
  }

  /* ---------- interiors sticky stack ---------- */
  const icards = $$('#icards .icard');
  if (icards.length && hasGsap && !reduce) {
    const mm2 = gsap.matchMedia();
    mm2.add('(min-width: 861px)', () => {
      const tweens = icards.slice(0, -1).map((card, i) => gsap.to(card, {
        scale: 0.95, ease: 'none',
        scrollTrigger: { trigger: icards[i + 1], start: 'top bottom', end: 'top 120px', scrub: true }
      }));
      return () => { tweens.forEach(tw => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); }); gsap.set(icards, { clearProps: 'all' }); };
    });
  }

  /* ---------- architecture scrolly ---------- */
  const steps = $$('#steps .step');
  const stickImgs = $$('#stick img');
  stickImgs.forEach(im => { if (im.src.includes('/o2-')) im.classList.add('land'); });
  const sio = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const i = steps.indexOf(e.target);
    steps.forEach((s, j) => s.classList.toggle('on', j === i));
    stickImgs.forEach((im, j) => im.classList.toggle('on', j === i));
  }), { rootMargin: '-42% 0px -42% 0px' });
  steps.forEach(s => sio.observe(s));

  /* ---------- shared marker helper (master plan) ---------- */
  const PD = window.PLAN_DATA || {};
  const makeSpot = (s, cls) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hs ' + (cls || '');
    b.style.left = s.x + '%';
    b.style.top = s.y + '%';
    b.dataset.kind = s.kind;
    b.setAttribute('aria-label', s.name + (s.detail ? ', ' + s.detail : ''));
    b.innerHTML = '<span class="tip"><b>' + s.name + '</b>' + (s.detail ? '<small>' + s.detail + '</small>' : '') + '</span>';
    b.addEventListener('click', e => { e.stopPropagation(); const was = b.classList.contains('open'); $$('.hs.open').forEach(x => x.classList.remove('open')); if (!was) b.classList.add('open'); });
    return b;
  };
  document.addEventListener('click', () => $$('.hs.open').forEach(x => x.classList.remove('open')));

  /* ---------- location maps ---------- */
  const PL = window.PLACES;
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k])); if (parent) parent.appendChild(e); return e; };
  const PIN = 'M0-30c-8.3 0-15 6.7-15 15 0 11 15 24 15 24s15-13 15-24c0-8.3-6.7-15-15-15zm0 21a6 6 0 110-12 6 6 0 010 12z';
  const drawOutline = (box, place, site, label) => {
    if (!box || !place) return;
    const pts = place.parts.flat();
    const cosL = Math.cos(site.lat * Math.PI / 180);
    const xs = pts.map(p => p[0] * cosL), ys = pts.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const span = Math.max(x1 - x0, y1 - y0), S = 300, pad = 46;
    const k = (S - 2 * pad) / span;
    const ox = pad + ((S - 2 * pad) - (x1 - x0) * k) / 2, oy = pad + ((S - 2 * pad) - (y1 - y0) * k) / 2;
    const X = lon => ox + (lon * cosL - x0) * k, Y = lat => oy + (y1 - lat) * k;
    const svg = svgEl('svg', { viewBox: '0 0 ' + S + ' ' + S });
    place.parts.forEach(part => svgEl('path', { class: 'outline', d: 'M' + part.map(p => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L') + 'Z' }, svg));
    const sx = X(site.lon), sy = Y(site.lat);
    svgEl('ellipse', { class: 'glow', cx: sx, cy: sy + 2, rx: 16, ry: 9 }, svg);
    svgEl('path', { class: 'pin', d: PIN, transform: 'translate(' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ') scale(.78)' }, svg);
    box.appendChild(svg);
  };
  if (PL) {
    drawOutline($('#map-lagos'), PL.lagos, PL.site, 'Ikoyi');
    drawOutline($('#map-local'), PL.local, PL.site, 'Parkview Estate');
    const ae = $('#map-aerial');
    if (ae && PL.aerial) {
      const img = $('img', ae), [px, py] = PL.aerial.site_px, [w, h] = PL.aerial.size, Z = 1.4;
      img.style.left = 'calc(50% - ' + (px / w * Z * 100).toFixed(2) + '%)';
      img.style.top = 'calc(50% - ' + (py / h * Z * 100).toFixed(2) + '%)';
    }
  }

  /* ---------- location map: Leaflet, loaded when the map comes near (after the Heights 777 brochure) ---------- */
  (function () {
    var wrap = $('#lmwrap'), list = $('#lmlist'), panel = $('#lmpanel'); if (!wrap || !('IntersectionObserver' in window)) return;
    var coarse = matchMedia('(pointer:coarse)').matches, booted = false;
    function fail() { $('#lmfallback').hidden = false; wrap.classList.add('failed'); }
    if (window.__AV) { fail(); return; }   // the single-file preview cannot load map tiles
    function loadScript(src, cb) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = cb; s.onerror = fail; document.head.appendChild(s); }
    function boot() {
      if (booted) return; booted = true;
      var pending = 3; function done() { if (--pending === 0) { if (window.L && window.AV_MAP) { try { initMap(); } catch (e) { fail(); if (window.console) console.error(e); } } else fail(); } }
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'assets/leaflet/leaflet.css'; css.onload = done; css.onerror = fail; document.head.appendChild(css);
      loadScript('assets/leaflet/leaflet.js', done); loadScript('assets/map-data.js', done);
    }
    var lio = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { boot(); lio.disconnect(); } }, { rootMargin: '900px 0px' }); lio.observe(wrap);

    function initMap() {
      var D = window.AV_MAP, C = { ink: '#1f2227', timber: '#c7955f', deep: '#7d5428', sea: '#6f8f98', bone: '#f6f6f4' };
      var GROUPS = { estate: { n: 'The estate' }, ikoyi: { n: 'Ikoyi', t: '10' }, vi: { n: 'Victoria Island', t: '15' }, island: { n: 'Lagos Island', t: '15' }, lekki: { n: 'Lekki', t: '15' }, airport: { n: 'The airport', t: '40' } };
      var FAR = { site: 1, marina: 1, lekki1: 1, airport: 1, eko: 1 }, LEFT = { falomo: 1, marina: 1, ikoyiclub: 1 };
      var map = L.map('lmap', { zoomControl: false, scrollWheelZoom: false, dragging: !coarse, zoomSnap: .5, minZoom: 10, maxZoom: 20, attributionControl: true, worldCopyJump: false });
      map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
      L.control.zoom({ position: 'topleft', zoomInTitle: 'Zoom in', zoomOutTitle: 'Zoom out' }).addTo(map);
      L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 130 }).addTo(map);
      var OSM = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
      var streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxNativeZoom: 19, maxZoom: 20, attribution: OSM });
      var aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 19, maxZoom: 20, attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics' });
      streets.addTo(map);
      function label(ll, text, cls, transform) { return L.marker(ll, { icon: L.divIcon({ className: 'lm-st ' + cls, html: '<span style="transform:' + transform + '">' + text + '</span>', iconSize: [0, 0] }), interactive: false, keyboard: false }).addTo(map); }
      function m2ll(ll, dxm, dym) { return [ll[0] + dym / 111320, ll[1] + dxm / 110620]; }
      [1000, 2000, 5000].forEach(function (r) {
        L.circle(D.site, { radius: r, color: C.ink, weight: 1, opacity: .3, dashArray: '2 7', fill: false, interactive: false, className: 'lm-ring-l' }).addTo(map);
        label(m2ll(D.site, 0, r), (r / 1000) + ' km', 'ring', 'translate(-50%,-50%)');
      });
      var ST = { main: { color: C.ink, weight: 3, opacity: .5 }, local: { color: C.ink, weight: 2, opacity: .36 }, bridge: { color: C.sea, weight: 3.5, opacity: .95 } };
      var LABPOS = { bourdillon: [6.4530, 3.4360], osborne: [6.4600, 3.4160], alfred: [6.4480, 3.4160], awolowo: [6.4450, 3.4080], falomo: [6.4410, 3.4190], ozumba: [6.4350, 3.4350], ahmadu: [6.4300, 3.4250], adeola: [6.4300, 3.4200], third: [6.4800, 3.4000], eko: [6.4620, 3.3810], carter: [6.4740, 3.3860], ikorodu: [6.5100, 3.3700], agege: [6.5400, 3.3550], gerrard: [6.4560, 3.4330], glover: [6.4520, 3.4430], banana: [6.4610, 3.4460] };
      D.streets.forEach(function (s) {
        s.s.forEach(function (seg) { L.polyline(seg, L.extend({ interactive: false, lineCap: 'round', lineJoin: 'round', className: 'lm-' + s.c }, ST[s.c])).addTo(map); });
        var pref = LABPOS[s.k]; if (!pref) return;
        var best = null, bd = 1e9, ang = 0;
        s.s.forEach(function (seg) { for (var i = 0; i < seg.length; i++) { var p = seg[i], dd = Math.hypot((p[0] - pref[0]) * 111320, (p[1] - pref[1]) * 110620); if (dd < bd) { bd = dd; best = p; var q = seg[i + 1] || seg[i - 1] || p; ang = -Math.atan2((q[0] - p[0]) * 111320, (q[1] - p[1]) * 110620) * 180 / Math.PI; } } });
        if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
        label(best, s.n, (s.c === 'main' || s.c === 'bridge') ? '' : 'near', 'translate(-50%,-50%) rotate(' + ang.toFixed(1) + 'deg) translateY(-11px)');
      });
      L.polygon(D.plot, { color: C.deep, weight: 1.5, dashArray: '4 4', fillColor: C.timber, fillOpacity: .22, className: 'lm-plot', interactive: false }).addTo(map);
      var byId = {}, markers = {}, rows = {}, n = 0, routeLayer = null, caseLayer = null;
      function popupHTML(Lm) {
        var isSite = Lm.id === 'site', G = GROUPS[Lm.g];
        var k = isSite ? 'The site' : (Lm.num + ' · ' + G.n);
        var meta = isSite ? '<span><b>48,520</b>m² plot</span><span><b>322</b>residences</span>' : (Lm.km ? '<span><b>' + Lm.km.toFixed(1) + '</b>km by road</span>' : '') + (G.t ? '<span><b>' + G.t + '</b>min off-peak</span>' : '');
        var href = isSite ? 'https://www.google.com/maps/search/?api=1&query=' + D.site[0] + '%2C' + D.site[1] : 'https://www.google.com/maps/dir/?api=1&origin=' + D.site[0] + '%2C' + D.site[1] + '&destination=' + Lm.ll[0] + '%2C' + Lm.ll[1] + '&travelmode=driving';
        return '<div class="lm-pop"><span class="k">' + k + '</span><span class="n">' + Lm.n + '</span><span class="s">' + Lm.s + '</span><div class="m">' + meta + '</div><a class="a" href="' + href + '" target="_blank" rel="noopener">' + (isSite ? 'Open in Google Maps' : 'Directions from the site') + ' ↗</a></div>';
      }
      D.landmarks.forEach(function (Lm) {
        var isSite = Lm.id === 'site'; Lm.num = isSite ? '' : String(++n).padStart(2, '0'); byId[Lm.id] = Lm;
        var icon = L.divIcon({ className: 'lm-pin' + (isSite ? ' lm-site' : '') + (FAR[Lm.id] ? ' far' : '') + (LEFT[Lm.id] ? ' l' : ''), html: '<i>' + Lm.num + '</i><b>' + Lm.n + '</b>', iconSize: [0, 0] });
        var m = L.marker(Lm.ll, { icon: icon, alt: Lm.n, riseOnHover: true, zIndexOffset: isSite ? 1000 : 0 }).addTo(map);
        m.bindPopup(popupHTML(Lm), { offset: [0, -16], maxWidth: Math.min(300, wrap.clientWidth - 56), minWidth: 200, autoPanPadding: [28, 64], className: 'lm-popw' });
        m.on('click', function () { select(Lm.id, false); });
        m.on('mouseover', function () { hi(Lm.id, true); }); m.on('mouseout', function () { hi(Lm.id, false); });
        markers[Lm.id] = m;
      });
      var lastG = null, ri = 0;
      D.landmarks.forEach(function (Lm) {
        if (Lm.g !== lastG) { lastG = Lm.g; var G = GROUPS[Lm.g], g = document.createElement('li'); g.className = 'g'; g.innerHTML = '<span>' + G.n + '</span>' + (G.t ? '<b>' + G.t + '<small>min</small></b>' : ''); list.appendChild(g); }
        var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button'; b.className = 'lm-row' + (Lm.id === 'site' ? ' site' : ''); b.dataset.id = Lm.id; b.setAttribute('aria-pressed', 'false'); b.style.setProperty('--i', ri++);
        var dist = Lm.id === 'site' ? '<span class="d">48,520<small>m²</small></span>' : (Lm.km ? '<span class="d">' + Lm.km.toFixed(1) + '<small>km</small></span>' : '');
        b.innerHTML = '<span class="i">' + Lm.num + '</span><span class="t">' + Lm.n + '<small>' + Lm.s + '</small></span>' + dist;
        b.addEventListener('click', function () { select(Lm.id, true); });
        b.addEventListener('mouseenter', function () { hi(Lm.id, true); }); b.addEventListener('mouseleave', function () { hi(Lm.id, false); });
        b.addEventListener('focus', function () { hi(Lm.id, true); }); b.addEventListener('blur', function () { hi(Lm.id, false); });
        li.appendChild(b); list.appendChild(li); rows[Lm.id] = b;
      });
      function hi(id, on) { var e = markers[id].getElement(); if (e) e.classList.toggle('hi', on); rows[id].classList.toggle('hi', on); }
      function clearAnim() { [routeLayer, caseLayer].forEach(function (l) { var p = l && l._path; if (p) { p.style.transition = 'none'; p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; } }); }
      function animatePath(l, dur) { var p = l && l._path; if (!p || !p.getTotalLength) return; var len = p.getTotalLength(); p.style.transition = 'none'; p.style.strokeDasharray = len + ' ' + len; p.style.strokeDashoffset = len; void p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset ' + dur + 's cubic-bezier(.16,.84,.24,1)'; p.style.strokeDashoffset = '0'; }
      function drawRoute(id) {
        if (routeLayer) { map.removeLayer(routeLayer); map.removeLayer(caseLayer); routeLayer = caseLayer = null; }
        var R = D.routes[id]; if (!R) return;
        caseLayer = L.polyline(R.pts, { color: C.bone, weight: 7, opacity: .92, interactive: false, lineCap: 'round', lineJoin: 'round', className: 'lm-case' }).addTo(map);
        routeLayer = L.polyline(R.pts, { color: C.deep, weight: 3, opacity: 1, interactive: false, lineCap: 'round', lineJoin: 'round', className: 'lm-route' }).addTo(map);
        if (!reduce) { var dur = R.km > 10 ? 2.2 : 1.5; animatePath(caseLayer, dur); animatePath(routeLayer, dur); setTimeout(clearAnim, dur * 1000 + 100); }
      }
      map.on('zoomstart', clearAnim);
      function select(id, fly) {
        var Lm = byId[id];
        for (var k in rows) { rows[k].classList.toggle('on', k === id); rows[k].setAttribute('aria-pressed', k === id); var e = markers[k].getElement(); if (e) e.classList.toggle('on', k === id); }
        var row = rows[id]; if (row) list.scrollTop = Math.max(0, row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2);
        if (!fly) { drawRoute(id); return; }
        map.closePopup();
        var R = D.routes[id], b;
        if (id === 'site') b = null; else if (R) b = L.latLngBounds(R.pts).extend(Lm.ll).extend(D.site); else b = L.latLngBounds([Lm.ll, D.site]);
        var after = function () { drawRoute(id); markers[id].openPopup(); };
        if (reduce) { if (b) map.fitBounds(b, { padding: [56, 56], maxZoom: 16.5 }); else map.setView(D.site, 17); after(); return; }
        map.once('moveend', after);
        if (b) map.flyToBounds(b, { padding: [56, 56], maxZoom: 16.5, duration: 1.4 }); else map.flyTo(D.site, 17, { duration: 1.4 });
      }
      function zclass() { var z = map.getZoom(); wrap.classList.toggle('z-far', z < 14); wrap.classList.toggle('z-mid', z >= 14 && z < 16); wrap.classList.toggle('z-near', z >= 16); }
      map.on('zoomend', zclass);
      var IKOYI = D.landmarks.filter(function (l) { return ['site', 'banana', 'ikoyiclub', 'falomo', 'linkbridge'].indexOf(l.id) >= 0; }).map(function (l) { return l.ll; });
      var ALL = D.landmarks.map(function (l) { return l.ll; });
      var VIEWS = {
        close: function (a) { a ? map.flyToBounds(L.latLngBounds(D.plot), { padding: [60, 60], duration: 1.6 }) : map.fitBounds(L.latLngBounds(D.plot), { padding: [60, 60] }); },
        ikoyi: function (a) { var o = { padding: [40, 40] }; a ? map.flyToBounds(L.latLngBounds(IKOYI), L.extend({ duration: 1.6 }, o)) : map.fitBounds(L.latLngBounds(IKOYI), o); },
        city: function (a) { var o = { padding: [36, 36] }; a ? map.flyToBounds(L.latLngBounds(ALL), L.extend({ duration: 1.8 }, o)) : map.fitBounds(L.latLngBounds(ALL), o); }
      };
      $$('[data-view]').forEach(function (x) { x.addEventListener('click', function () { map.closePopup(); VIEWS[x.dataset.view](!reduce); }); });
      function setBase(b) {
        if (b === 'aerial') { map.removeLayer(streets); aerial.addTo(map); } else { map.removeLayer(aerial); streets.addTo(map); }
        wrap.classList.toggle('aerial', b === 'aerial');
        $$('[data-base]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.base === b); });
      }
      $$('[data-base]').forEach(function (x) { x.addEventListener('click', function () { setBase(x.dataset.base); }); });
      var hint = $('#lmhint');
      map.on('click focus', function () { map.scrollWheelZoom.enable(); hint.classList.add('off'); });
      setTimeout(function () { hint.classList.add('off'); }, 8000);
      map.on('blur', function () { map.scrollWheelZoom.disable(); });
      wrap.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });
      var lock = $('#lmlock');
      lock.addEventListener('click', function () { var on = !map.dragging.enabled(); if (on) map.dragging.enable(); else map.dragging.disable(); lock.setAttribute('aria-pressed', on); lock.textContent = on ? 'Done exploring' : 'Touch to explore'; });
      VIEWS.ikoyi(false); zclass();
      map.whenReady(function () { requestAnimationFrame(function () { wrap.classList.add('ready'); panel.classList.add('in'); map.invalidateSize(); }); });
      addEventListener('load', function () { map.invalidateSize(); });
    }
  })();

  /* ---------- residences: the architects' unit sheets, plus the whole lower and pent floors ---------- */
  const SH = PD.sheets || {};
  const UNITS = {
    b1: { sheet: 'b1' }, b2: { sheet: 'b2' }, b3: { sheet: 'b3' }, l9w: { sheet: 'l9w' }, l9e: { sheet: 'l9e' },
    lower: { plan: 'typical', title: 'Lower Floors', level: 'Levels 2 to 8, the typical floor. A 1 bedroom and a 2 bedroom apartment on the right, a 3 bedroom + BQ apartment on the left, around the elevator lobby.',
      facts: [['1 Bedroom', '109 sq m'], ['2 Bedroom', '208 sq m'], ['3 Bedroom + BQ', '331 sq m'], ['Elevator lobby', '79 sq m'], ['Lifts', '4']],
      rooms: [['l1', 1], ['k1', 2], ['s11', 3], ['bal19', 4], ['l2', 5], ['k2', 6], ['s21', 7], ['s22', 8], ['p2', 9], ['bal17', 10], ['l3', 11], ['k3', 12], ['s31', 13], ['s32', 14], ['s33', 15], ['bq3', 16], ['p3', 17], ['bal18', 18], ['yard3', 19], ['el', 20]],
      legend: [[1, '1 Bed living and dining'], [2, '1 Bed kitchen'], [3, '1 Bed suite'], [4, '1 Bed balcony'], [5, '2 Bed living room'], [6, '2 Bed kitchen'], [7, '2 Bed suite 1'], [8, '2 Bed suite 2'], [9, '2 Bed infinity pool'], [10, '2 Bed balcony'], [11, '3 Bed living room'], [12, '3 Bed kitchen'], [13, '3 Bed suite 1'], [14, '3 Bed suite 2'], [15, '3 Bed suite 3'], [16, 'BQ'], [17, '3 Bed infinity pool'], [18, '3 Bed balcony'], [19, 'Backyard'], [20, 'Elevator lobby']] },
    pent: { plan: 'pent', title: 'Pent Floor', level: 'Level 9, the top floor. Two 3 bedroom + BQ apartments, West and East, one on either side of the entrance lobby.',
      facts: [['Level 9 West', '378 sq m'], ['Level 9 East', '336 sq m'], ['Entrance lobby', '76 sq m'], ['Lifts', '4']],
      rooms: [['lv1', 1], ['kt1', 2], ['bd00', 3], ['bd01', 4], ['bd02', 5], ['bq', 6], ['pp1', 7], ['yard', 8], ['bal15', 9], ['bal16', 9], ['lv2', 10], ['kt2', 11], ['bd10', 12], ['bd11', 13], ['bd12', 14], ['pp2', 15], ['bal17', 16], ['bal18', 16], ['el', 17]],
      legend: [[1, 'West living room'], [2, 'West kitchen'], [3, 'West bedroom 1'], [4, 'West bedroom 2'], [5, 'West bedroom 3'], [6, 'West BQ'], [7, 'West infinity pool'], [8, 'West backyard'], [9, 'West balconies'], [10, 'East living room'], [11, 'East kitchen'], [12, 'East bedroom 1'], [13, 'East bedroom 2'], [14, 'East bedroom 3'], [15, 'East infinity pool'], [16, 'East balconies'], [17, 'Entrance lobby']] }
  };
  const view = $('#sh2-view');
  const plane = $('#sh2-plan');
  const plan2 = $('#plan2');
  const key2 = $('#key2');
  const planName = { typical: 'Typical floor plan, Levels 2 to 8', pent: 'Level 9 floor plan' };
  const LAYERS = {};
  ['typical', 'pent'].forEach(key => {
    const layer = document.createElement('div');
    layer.className = 'layer';
    layer.hidden = true;
    const base = new Image(); base.className = 'base'; base.src = A('assets/plan/' + key + '.png'); base.alt = planName[key]; base.loading = 'lazy';
    layer.appendChild(base);
    (PD[key] ? PD[key].spots : []).forEach(sp => {
      const n = document.createElement('span');
      n.className = 'num'; n.dataset.id = sp.id; n.style.left = sp.x + '%'; n.style.top = sp.y + '%';
      layer.appendChild(n);
    });
    view.appendChild(layer);
    LAYERS[key] = { el: layer, base };
  });
  view.classList.add('whole');
  let unit = 'b1';
  const fitFloor = key => {
    const L = LAYERS[key];
    const W = plane.clientWidth, H = plane.clientHeight;
    const ar = L.base.naturalWidth ? L.base.naturalWidth / L.base.naturalHeight : (PD[key] ? PD[key].w / PD[key].h : 1.88);
    const iw = W, ih = W / ar, pad = 0.03;
    const sc = Math.min(W / (iw * (1 + 2 * pad)), H / (ih * (1 + 2 * pad)));
    view.style.transform = 'translate(' + ((W - iw * sc) / 2) + 'px,' + ((H - ih * sc) / 2) + 'px) scale(' + sc + ')';
    view.style.setProperty('--ms', (Math.max(20, W * 0.02) / sc).toFixed(2) + 'px');
  };
  const showUnit = key => {
    unit = key;
    const u = UNITS[key];
    $$('#utabs .tab').forEach(t => { const on = t.dataset.unit === key; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    const sh = u.sheet ? SH[u.sheet] : null;
    view.hidden = !!sh;
    plan2.classList.toggle('on', !!sh);
    $('img', key2).hidden = !sh;
    $('#u-legend').hidden = !!sh;
    if (sh) {
      plan2.src = A('assets/plan/sheets/' + u.sheet + '-m.png');
      plan2.alt = sh.title + (sh.subtitle ? ', ' + sh.subtitle : '') + ' floor plan';
      $('img', key2).src = A('assets/plan/sheets/' + u.sheet + '-key.png');
      $('#u-title').textContent = sh.title + (sh.subtitle ? ', ' + sh.subtitle.replace(/\s*–\s*/, ' ') : '');
      $('#u-level').textContent = sh.meta.join('. ') + '.';
      $('#u-facts').innerHTML = sh.facts.map(f => '<div class="' + (f[0] === 'Total' ? 'tot' : '') + '"><dt>' + (f[0] === 'Total' ? 'Total area' : f[0] + ' area') + '</dt><dd>' + f[1] + '</dd></div>').join('');
      return;
    }
    Object.keys(LAYERS).forEach(k => { LAYERS[k].el.hidden = k !== u.plan; });
    const L = LAYERS[u.plan];
    $('#u-title').textContent = u.title;
    $('#u-level').textContent = u.level;
    $('#u-facts').innerHTML = u.facts.map(f => '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>').join('');
    $('#u-legend').innerHTML = u.legend.map(l => '<li><b>' + l[0] + '</b>' + l[1] + '</li>').join('');
    $$('.num', L.el).forEach(n => { n.classList.remove('on'); n.textContent = ''; });
    u.rooms.forEach(([id, n]) => { const el = $$('.num', L.el).find(x => x.dataset.id === id); if (el) { el.textContent = n; el.classList.add('on'); } });
    fitFloor(u.plan);
  };
  $$('#utabs .tab').forEach(t => t.addEventListener('click', () => showUnit(t.dataset.unit)));
  showUnit('b1');
  addEventListener('resize', () => { if (!UNITS[unit].sheet) fitFloor(UNITS[unit].plan); });
  Object.keys(LAYERS).forEach(k => LAYERS[k].base.addEventListener('load', () => { if (UNITS[unit].plan === k) fitFloor(k); }));
  $('#openplan').addEventListener('click', () => {
    const u = UNITS[unit];
    if (u.sheet) openLightbox([{ src: A('assets/plan/sheets/' + u.sheet + '.png'), cap: SH[u.sheet].title + (SH[u.sheet].subtitle ? ', ' + SH[u.sheet].subtitle : ''), sub: 'Drag to pan, scroll or pinch to zoom' }], 0, true);
    else openLightbox([{ src: A('assets/plan/' + u.plan + '.png'), cap: planName[u.plan], sub: 'Drag to pan, scroll or pinch to zoom' }], 0, true);
  });

  /* ---------- inside a block: program schematic ---------- */
  const prog = PD.program, fp = PD.footprint;
  const COL = { b1: '#d9c48e', b2: '#a7b7a0', b3: '#c7955f', pent: '#5d7f8a', core: '#dcdcd8', ground: '#ecece8', bsm: '#4b5563' };
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return 'rgb(' + [16, 8, 0].map(sh => Math.round(((n >> sh) & 255) * f)).join(',') + ')'; };
  const buildStack = (box, gap) => {
    if (!box || !prog || !fp) return;
    const K = 0.5, CA = Math.cos(Math.PI / 4), SA = Math.sin(Math.PI / 4), depth = fp.d, T = 2.6;
    const P = (x, y, z) => [x + K * (depth - y) * CA, -z - K * (depth - y) * SA];
    const slabs = [];
    let z = 0;
    const add = (zones, h) => { slabs.push({ z0: z, z1: z + h, zones }); z += h + gap; };
    add([{ t: 'ground', pts: fp.points }], T * 1.5);
    const typ = [['b3', prog.typical.b3], ['b2', prog.typical.b2], ['b1', prog.typical.b1], ['core', prog.typical.core]].filter(zn => zn[1].length).map(zn => ({ t: zn[0], pts: zn[1] }));
    for (let i = 0; i < 7; i++) add(typ, T);
    add([['b3', prog.pent.pl], ['b3', prog.pent.pr], ['core', prog.pent.core]].filter(zn => zn[1].length).map(zn => ({ t: zn[0], pts: zn[1] })), T);
    const svg = document.createElementNS(NS, 'svg');
    const all = [];
    const d = r => 'M' + r.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z';
    slabs.forEach(sl => {
      const zones = sl.zones.slice().sort((a, b) => (a.pts.reduce((s, p) => s + p[1], 0) / a.pts.length) - (b.pts.reduce((s, p) => s + p[1], 0) / b.pts.length));
      zones.forEach(zn => {
        const g = svgEl('g', { class: 'zone', 'data-t': zn.t }, svg);
        const col = COL[zn.t];
        const edges = zn.pts.map((p, i) => [p, zn.pts[(i + 1) % zn.pts.length]]).sort((a, b) => (a[0][1] + a[1][1]) - (b[0][1] + b[1][1]));
        edges.forEach(([p, q]) => svgEl('path', { d: d([P(p[0], p[1], sl.z0), P(q[0], q[1], sl.z0), P(q[0], q[1], sl.z1), P(p[0], p[1], sl.z1)]), fill: shade(col, 0.74) }, g));
        const top = zn.pts.map(p => P(p[0], p[1], sl.z1));
        svgEl('path', { d: d(top), fill: col }, g);
        all.push(...top, ...zn.pts.map(p => P(p[0], p[1], sl.z0)));
      });
    });
    const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const mx = Math.min(...xs) - 1, Mx = Math.max(...xs) + 1, my = Math.min(...ys) - 1, My = Math.max(...ys) + 1;
    svg.setAttribute('viewBox', [mx, my, Mx - mx, My - my].join(' '));
    box.appendChild(svg);
    return svg;
  };
  const svgs = [buildStack($('#stack-compact'), 0), buildStack($('#stack'), 4.2)].filter(Boolean);
  $$('#legend li').forEach(li => {
    const on = () => { $$('#legend li').forEach(x => x.classList.toggle('on', x === li)); svgs.forEach(sv => { sv.classList.add('hl'); $$('.zone', sv).forEach(g => g.classList.toggle('on', g.dataset.t === li.dataset.type)); }); };
    const off = () => { li.classList.remove('on'); svgs.forEach(sv => { sv.classList.remove('hl'); $$('.zone.on', sv).forEach(g => g.classList.remove('on')); }); };
    li.addEventListener('mouseenter', on); li.addEventListener('focus', on);
    li.addEventListener('mouseleave', off); li.addEventListener('blur', off);
    li.addEventListener('click', () => { if (li.classList.contains('on')) off(); else on(); });
  });

  /* ---------- parallax full-bleed images ---------- */
  if (hasGsap && !reduce) {
    ['#clubfull', '#quotefull'].forEach(sel => {
      const box = $(sel); if (!box) return;
      gsap.fromTo($('img', box), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- day / night compare sliders ---------- */
  $$('.cmp').forEach(cmp => {
    const knob = $('button', cmp);
    let p = 50, down = false;
    const set = v => { p = Math.max(0, Math.min(100, v)); cmp.style.setProperty('--p', p + '%'); knob.setAttribute('aria-valuenow', Math.round(p)); };
    const fromEvent = e => { const r = cmp.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    cmp.addEventListener('pointerdown', e => { down = true; cmp.setPointerCapture(e.pointerId); fromEvent(e); });
    cmp.addEventListener('pointermove', e => { if (down) fromEvent(e); });
    cmp.addEventListener('pointerup', () => { down = false; });
    cmp.addEventListener('pointercancel', () => { down = false; });
    knob.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { set(p - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(p + 4); e.preventDefault(); }
    });
    if (!reduce && hasGsap) {
      ScrollTrigger.create({ trigger: cmp, start: 'top 70%', once: true, onEnter: () => gsap.to({ v: 50 }, { v: 62, duration: 1.6, ease: 'power2.inOut', yoyo: true, repeat: 1, onUpdate() { if (!down) set(this.targets()[0].v); } }) });
    }
  });

  /* ---------- master plan ---------- */
  const mapb = $('#mapb');
  const mcard = $('#mcard');
  const KIND_LABEL = { block: 'Residences', marina: 'Marina', green: 'Parks and gardens', leisure: 'Clubhouse', arrival: 'Arrival' };
  const home = mcard.innerHTML;
  /* the vector site plan draws itself on when it scrolls into view, then traces the arrival route */
  const sp = $('#siteplan');
  const hl = id => { if (!sp) return; $$('.on', sp).forEach(x => x.classList.remove('on')); if (id) $$('[data-id="' + id + '"]', sp).forEach(x => x.classList.add('on')); };
  if (sp && mapb) {
    const motion = $('#spmotion');
    const DRAW_MS = 3600;
    let timer;
    const play = () => {
      clearTimeout(timer);
      sp.classList.remove('in', 'route'); mapb.classList.remove('drawn');
      void sp.getBoundingClientRect();
      if (reduce) { sp.classList.add('in', 'route'); mapb.classList.add('drawn'); return; }
      sp.classList.add('in');
      timer = setTimeout(() => {
        mapb.classList.add('drawn'); sp.classList.add('route');
        try { motion && motion.beginElement(); } catch (e) { /* SMIL unavailable: the route still draws */ }
      }, DRAW_MS);
    };
    if ('IntersectionObserver' in window) {
      const spio = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { play(); spio.disconnect(); } }, { threshold: .3 });
      spio.observe(mapb);
    } else play();
    const rp = $('#spreplay');
    if (rp) rp.addEventListener('click', play);
  }
  if (mapb && PD.master) {
    PD.master.spots.forEach(s => {
      if (s.kind === 'label') {
        const l = document.createElement('span');
        l.className = 'lbl'; l.textContent = s.name; l.style.left = s.x + '%'; l.style.top = s.y + '%';
        mapb.appendChild(l); return;
      }
      const b = makeSpot(s, s.kind === 'block' ? 'b' : '');
      b.dataset.id = s.id;
      if (s.kind === 'block') b.insertAdjacentText('afterbegin', s.id.replace('b', '').replace(/^0/, ''));
      const show = () => { hl(s.id); mcard.innerHTML = '<div class="cnt">' + (s.detail.match(/^[\d,]+ sqm/) ? s.detail.match(/^[\d,]+ sqm/)[0] : (s.kind === 'block' ? '8 floors' : KIND_LABEL[s.kind] || '')) + '</div><h3>' + s.name + '</h3><p>' + s.detail + '</p>'; };
      b.addEventListener('mouseenter', show);
      b.addEventListener('focus', show);
      b.addEventListener('click', () => { $$('.hs.sel', mapb).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); show(); });
      mapb.appendChild(b);
    });
    mapb.addEventListener('mouseleave', () => { const sel = $('.hs.sel', mapb); hl(sel ? sel.dataset.id : null); if (!sel) mcard.innerHTML = home; });
    $$('#mfilters .tab').forEach(t => t.addEventListener('click', () => {
      const kind = t.dataset.kind;
      $$('#mfilters .tab').forEach(x => x.classList.toggle('on', x === t));
      $$('.hs', mapb).forEach(h => h.classList.toggle('dim', kind !== 'all' && h.dataset.kind !== kind));
      if (sp) { if (kind === 'all') sp.removeAttribute('data-focus'); else sp.dataset.focus = kind; }
      const n = PD.master.spots.filter(s => s.kind === kind).length;
      const sum = { block: 'Fourteen blocks of eight floors, 23 residences each. 322 homes.', marina: 'The marina and boat club, the main marina and dock area, the creek dock for small boats and four marina access points.', green: 'Park and sports area, garden and leisure areas and the park garden: about 5,400 sqm of named green space, with landscape around every block.', leisure: 'The 2,000 sqm clubhouse sits at the centre of the plan, a short walk from every block.', arrival: 'The entrance plaza with three floors of commercial and facility space at the south-west corner.' };
      mcard.innerHTML = kind === 'all' ? home : '<div class="cnt">' + n + '</div><h3>' + KIND_LABEL[kind] + '</h3><p>' + sum[kind] + '</p>';
    }));
  }

  /* ---------- experience index ---------- */
  const prev = $('#prev'), prev2 = $('#prev2');
  const xl = $$('#xl li');
  if (prev) {
    xl.forEach((li, i) => {
      [[prev, li.dataset.img], [prev2, li.dataset.img2]].forEach(([box, slug]) => {
        if (!box || !slug) return;
        const im = new Image();
        im.src = A('assets/m/' + slug + '.jpg'); im.alt = ''; im.loading = 'lazy';
        if (!window.__AV) { im.srcset = 'assets/s/' + slug + '.jpg 1100w, assets/m/' + slug + '.jpg 2000w, assets/r/' + slug + '.jpg 2560w'; im.sizes = '(max-width: 900px) 100vw, 40vw'; }
        if (i === 0) im.classList.add('on');
        box.appendChild(im);
      });
      const on = () => { xl.forEach(x => x.classList.toggle('on', x === li)); [prev, prev2].forEach(box => box && $$('img', box).forEach((x, j) => x.classList.toggle('on', j === i))); };
      li.addEventListener('mouseenter', on);
      li.addEventListener('click', on);
    });
    xl[0].classList.add('on');
  }

  /* ---------- quote scrub ---------- */
  const q = $('#qtext');
  if (q) {
    q.innerHTML = q.textContent.trim().split(/\s+/).map(w => '<span class="w">' + w + '</span>').join('');
    const words = $$('.w', q);
    if (hasGsap && !reduce) {
      gsap.to(words, { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: '#quote', start: 'top 55%', end: 'bottom 85%', scrub: true } });
    } else {
      $('#quote').classList.add('plain');
    }
  }

  /* ---------- gallery ---------- */
  const items = $$('#ggrid .it');
  const KINDS = { '1': ['all', 'arrival', 'architecture', 'living', 'marina', 'parks', 'interiors'], '2': ['all', 'aerial', 'arrival', 'architecture', 'marina', 'parks', 'clubhouse'] };
  let scheme = '1', gkind = 'all';
  const applyGallery = () => {
    items.forEach(it => it.classList.add('fade'));
    setTimeout(() => {
      items.forEach(it => {
        const s = it.dataset.scheme || '1';
        const show = s === scheme && (gkind === 'all' || it.dataset.kind === gkind);
        it.classList.toggle('hide', !show);
        it.hidden = false;
      });
      requestAnimationFrame(() => items.forEach(it => it.classList.remove('fade')));
      if (hasGsap) ScrollTrigger.refresh();
    }, 260);
  };
  $$('#gfilters .tab').forEach(t => t.addEventListener('click', () => {
    gkind = t.dataset.kind;
    $$('#gfilters .tab').forEach(x => x.classList.toggle('on', x === t));
    applyGallery();
  }));
  $$('#gscheme button').forEach(b => b.addEventListener('click', () => {
    scheme = b.dataset.scheme; gkind = 'all';
    $$('#gscheme button').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    $$('#gfilters .tab').forEach(x => { x.hidden = !KINDS[scheme].includes(x.dataset.kind); x.classList.toggle('on', x.dataset.kind === 'all'); });
    applyGallery();
  }));
  items.forEach(it => { if ((it.dataset.scheme || '1') !== '1') it.classList.add('hide'); it.hidden = false; });

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), stage = $('#lb-stage');
  let list = [], idx = 0, zoom = false, scale = 1, tx = 0, ty = 0;
  const apply = () => { lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')'; };
  const show = i => {
    idx = (i + list.length) % list.length;
    const it = list[idx];
    lbImg.src = it.src; lbImg.alt = it.cap || '';
    lbCap.innerHTML = '<b>' + (it.cap || '') + '</b>' + (it.sub || (list.length > 1 ? (idx + 1) + ' of ' + list.length : ''));
    scale = 1; tx = 0; ty = 0; apply();
  };
  function openLightbox(arr, i, z) {
    list = arr; zoom = !!z;
    lb.hidden = false;
    lb.classList.toggle('zoom', zoom);
    requestAnimationFrame(() => lb.classList.add('on'));
    show(i);
    document.body.classList.add('locked');
    if (lenis) lenis.stop();
  }
  const closeLightbox = () => {
    lb.classList.remove('on');
    document.body.classList.remove('locked');
    if (lenis) lenis.start();
    setTimeout(() => { lb.hidden = true; lbImg.src = ''; }, 450);
  };
  $('#lb-x').addEventListener('click', closeLightbox);
  $('#lb-prev').addEventListener('click', () => show(idx - 1));
  $('#lb-next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === stage) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (!zoom && e.key === 'ArrowLeft') show(idx - 1);
    if (!zoom && e.key === 'ArrowRight') show(idx + 1);
  });
  // swipe, drag and pinch
  const pts = new Map();
  let startDist = 0, startScale = 1, sx = 0, sy = 0, stx = 0, sty = 0;
  stage.addEventListener('pointerdown', e => {
    pts.set(e.pointerId, e);
    stage.setPointerCapture(e.pointerId);
    if (pts.size === 1) { sx = e.clientX; sy = e.clientY; stx = tx; sty = ty; lbImg.classList.add('drag'); }
    if (pts.size === 2) { const [a, b] = [...pts.values()]; startDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); startScale = scale; }
  });
  stage.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, e);
    if (pts.size === 2 && zoom) {
      const [a, b] = [...pts.values()];
      scale = Math.max(1, Math.min(5, startScale * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / startDist));
      apply();
    } else if (pts.size === 1 && zoom && scale > 1) {
      tx = stx + (e.clientX - sx); ty = sty + (e.clientY - sy); apply();
    }
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    pts.delete(e.pointerId);
    if (pts.size === 0) lbImg.classList.remove('drag');
    if (!zoom && pts.size === 0 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? idx + 1 : idx - 1);
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => {
    if (!zoom) return;
    e.preventDefault();
    scale = Math.max(1, Math.min(5, scale * (e.deltaY < 0 ? 1.12 : 0.89)));
    if (scale === 1) { tx = 0; ty = 0; }
    apply();
  }, { passive: false });
  stage.addEventListener('dblclick', () => { if (!zoom) return; scale = scale > 1 ? 1 : 2.5; if (scale === 1) { tx = 0; ty = 0; } apply(); });

  // any image with data-full opens the lightbox; gallery items navigate within the visible set
  $$('img[data-full]').forEach(img => {
    img.addEventListener('click', () => {
      const fig = img.closest('#ggrid');
      if (fig) {
        const vis = items.filter(it => !it.classList.contains('hide'));
        const arr = vis.map(it => { const s = $('img', it).dataset.full; return { src: full(s), cap: CAPTIONS[s] }; });
        openLightbox(arr, vis.indexOf(img.closest('.it')), false);
      } else if (img.closest('#pairs')) {
        const vis = $$('#pairs img.on');
        openLightbox(vis.map(c => ({ src: full(c.dataset.full), cap: CAPTIONS[c.dataset.full] })), vis.indexOf(img), false);
      } else if (img.closest('.iso-grid')) {
        const cells = $$('.iso-grid img[data-full]');
        openLightbox(cells.map(c => ({ src: full(c.dataset.full), cap: CAPTIONS[c.dataset.full] })), cells.indexOf(img), false);
      } else if (img.closest('.lgrid')) {
        const cells = $$('.lgrid .ct img[data-full]');
        openLightbox(cells.map(c => ({ src: full(c.dataset.full), cap: CAPTIONS[c.dataset.full] })), cells.indexOf(img), false);
      } else if (img.closest('.bento')) {
        const cells = $$('.bento img[data-full]');
        openLightbox(cells.map(c => ({ src: full(c.dataset.full), cap: CAPTIONS[c.dataset.full] })), cells.indexOf(img), false);
      } else {
        openLightbox([{ src: full(img.dataset.full), cap: CAPTIONS[img.dataset.full] }], 0, false);
      }
    });
    img.style.cursor = 'zoom-in';
  });

  /* ---------- refresh after images ---------- */
  if (hasGsap) { addEventListener('load', () => ScrollTrigger.refresh()); }
})();
