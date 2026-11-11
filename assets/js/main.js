(function () {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PORT = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- page transitions: a pulse-line curtain between pages ---------- */
  const curtain = $('#curtain');
  const reveal = () => { if (curtain) { curtain.classList.add('out'); setTimeout(() => curtain.classList.remove('in', 'out', 'go'), 900); } };
  if (curtain) { curtain.classList.add('in'); requestAnimationFrame(() => setTimeout(reveal, 60)); }
  window.addEventListener('pageshow', e => { if (e.persisted && curtain) curtain.classList.remove('in', 'go', 'out'); });
  $$('a[href$=".html"]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    e.preventDefault(); const href = a.getAttribute('href');
    if (!curtain || RM) { location.href = href; return; }
    curtain.classList.remove('out'); curtain.classList.add('in', 'go');
    setTimeout(() => { location.href = href; }, 620);
  }));

  /* ---------- preloader (landing page, once per visit) ---------- */
  const pre = $('#pre');
  const finish = () => { if (!pre || pre.classList.contains('done')) return; pre.classList.add('done'); document.body.classList.remove('loading'); window.dispatchEvent(new Event('pre:done')); };
  let seen = false; try { seen = sessionStorage.getItem('tdPre') === '1'; sessionStorage.setItem('tdPre', '1'); } catch (e) {}
  if (pre) {
    const pp = $('#preP'), pn = $('#preN');
    if (pp && !RM && !seen) {
      const pl = pp.getTotalLength(); pp.style.strokeDasharray = pl; pp.style.strokeDashoffset = pl;
      const o = { v: 0 };
      gsap.to(o, { v: 1, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { pp.style.strokeDashoffset = pl * (1 - o.v); pn.textContent = String(Math.round(o.v * 100)).padStart(2, '0'); },
        onComplete: () => { pre.classList.add('lit'); setTimeout(finish, 650); } });
      setTimeout(finish, 5000);
    } else setTimeout(finish, 0);
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!RM && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $('#burger').addEventListener('click', () => $('#menu').classList.toggle('open'));

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const solid = () => nav.classList.toggle('solid', window.scrollY > 60);
  window.addEventListener('scroll', solid, { passive: true }); solid();

  /* ---------- ECG progress line ---------- */
  const p = $('#ecgp');
  if (p) {
    let d = 'M0 12'; const beats = 7;
    for (let i = 0; i < beats; i++) { const x = i * (1000 / beats); d += ` L${x + 40} 12 L${x + 52} 12 L${x + 58} 2 L${x + 66} 22 L${x + 72} 8 L${x + 78} 12`; }
    d += ' L1000 12'; p.setAttribute('d', d);
    const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { p.style.strokeDashoffset = L * (1 - s.progress); } });
  }

  /* ---------- mood follows the story ---------- */
  $$('main [data-mood]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: s => { if (s.isActive) document.body.dataset.mood = el.dataset.mood; } }));

  /* ---------- hero (landing) ---------- */
  if ($('.hero')) {
    if (!RM) {
      const t1 = gsap.timeline({ paused: true });
      t1.from('.hero h1 .l > span', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: .12 })
        .from('.hero .kick, .hero .row', { opacity: 0, y: 20, duration: 1.2, ease: 'power3.out', stagger: .1 }, .5);
      if (document.body.classList.contains('loading')) window.addEventListener('pre:done', () => t1.play(), { once: true }); else t1.play();
      if (!PORT) gsap.to('.hero video, .hero .poster', { scale: 1.12, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero .in', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '90% top', scrub: true } });
    }
    const hv = $('#heroV'); if (hv) hv.play().catch(() => {});
  }

  /* ---------- page header ---------- */
  if ($('.ph') && !RM) {
    gsap.from('.ph h1, .ph .lead, .ph .eyebrow', { opacity: 0, y: 40, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .35 });
    const bg = $('.ph .phbg'); if (bg && !PORT) gsap.to(bg, { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.ph', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- generic reveals ---------- */
  if (!RM) ScrollTrigger.batch('.rv', { start: 'top 90%', once: true, onEnter: b => gsap.fromTo(b, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .08 }) });
  else $$('.rv').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });

  /* ---------- statement ---------- */
  const ws = $$('#state .w');
  if (ws.length) { if (!RM) gsap.to(ws, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '#state', start: 'top 80%', end: 'bottom 45%', scrub: true } }); else ws.forEach(w => w.style.opacity = 1); }

  /* ---------- name ---------- */
  const beat = $('#beat');
  if (beat) { const bl = beat.getTotalLength(); beat.style.strokeDasharray = bl; beat.style.strokeDashoffset = bl;
    gsap.to(beat, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: beat, start: 'top 90%', end: 'top 40%', scrub: true } }); }
  if ($('.name') && !RM) gsap.from('.name h2 span', { xPercent: i => (i % 2 ? 5 : -3), ease: 'none', scrollTrigger: { trigger: '.name', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- chapter openers ---------- */
  $$('.chap').forEach(c => {
    if (RM) return;
    if (!PORT) gsap.fromTo(c.querySelector('.bgi'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (c.classList.contains('first')) gsap.from(c.querySelectorAll('.in > *'), { opacity: 0, y: 40, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .35 });
    gsap.from(c.querySelector('.num'), { y: 30, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .5 });
  });

  /* ---------- scrollytelling: each step swaps the film and the caption ---------- */
  $$('.scrolly').forEach(sec => {
    const vids = $$('video', sec), items = $$('.cap .item', sec), dots = $$('.rail b', sec);
    let cur = -1, loaded = false;
    const load = () => { if (loaded) return; loaded = true; vids.forEach(v => { v.src = v.dataset.src; }); };
    const set = j => {
      if (j === cur) return; cur = j;
      vids.forEach((v, k) => { if (k === j) { v.classList.add('on'); try { v.currentTime = 0; } catch (e) {} v.play().catch(() => {}); } else { v.classList.remove('on'); v.pause(); } });
      items.forEach((it, k) => it.classList.toggle('on', k === j));
      dots.forEach((b, k) => b.classList.toggle('on', k === j));
    };
    ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: s => { if (!s.isActive) vids.forEach(v => v.pause()); else if (cur >= 0) vids[cur].play().catch(() => {}); } });
    $$('.st', sec).forEach((st, j) => ScrollTrigger.create({ trigger: st, start: 'top 60%', end: 'bottom 60%', onToggle: s => { if (s.isActive) set(j); } }));
    load(); set(0);
  });

  /* ---------- carousels: native horizontal scroll, arrows and drag — never tied to page scroll ---------- */
  $$('.car').forEach(car => {
    const s = $('.strip', car), pv = $('.pv', car), nx = $('.nx', car);
    const step = () => { const f = s.firstElementChild; return f ? f.getBoundingClientRect().width + 16 : 400; };
    const upd = () => { pv.disabled = s.scrollLeft < 8; nx.disabled = s.scrollLeft > s.scrollWidth - s.clientWidth - 8; };
    pv.addEventListener('click', () => s.scrollBy({ left: -step(), behavior: 'smooth' }));
    nx.addEventListener('click', () => s.scrollBy({ left: step(), behavior: 'smooth' }));
    s.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    let down = false, sx = 0, sl = 0, moved = 0;
    s.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = s.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 6) s.classList.add('drag'); s.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => s.classList.remove('drag'), 0); });
    s.addEventListener('click', e => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
    s.addEventListener('dragstart', e => e.preventDefault());
  });

  /* ---------- lightbox: tap any image to see it large, caption on the image ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbN = $('#lbN');
  let group = [], gi = 0;
  const show = i => { gi = (i + group.length) % group.length; const im = group[gi];
    lbImg.classList.remove('in'); const src = im.dataset.full || im.currentSrc || im.src;
    const t = new Image(); t.onload = () => { lbImg.src = src; requestAnimationFrame(() => lbImg.classList.add('in')); }; t.src = src;
    lbCap.textContent = im.dataset.cap || im.alt || ''; lbN.textContent = group.length > 1 ? `${String(gi + 1).padStart(2, '0')} / ${String(group.length).padStart(2, '0')}` : '';
    lb.classList.toggle('single', group.length < 2); };
  const openLb = (img, list) => { group = list; show(Math.max(0, list.indexOf(img))); lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); };
  const closeLb = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); if (!$('.modal.on')) lenis && lenis.start(); };
  document.addEventListener('click', e => {
    const zb = e.target.closest('.zb'); const img = zb ? $('[data-lb]', zb) : e.target.closest('img[data-lb]');
    if (!img) return; e.preventDefault();
    const g = img.dataset.lb; openLb(img, g === 'modal' ? $$('#mbody [data-lb="modal"]') : $$(`[data-lb="${g}"]`));
  });
  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', () => show(gi - 1));
  $('#lbNx').addEventListener('click', () => show(gi + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lbi')) closeLb(); });
  let tx = 0; lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50 && group.length > 1) show(gi + (dx < 0 ? 1 : -1)); }, { passive: true });

  /* ---------- run of show ---------- */
  const ax = $('#axis');
  if (ax) gsap.to(ax, { width: '100%', ease: 'none', scrollTrigger: { trigger: '.ros', start: 'top 80%', end: 'bottom 60%', scrub: true } });

  /* ---------- materials tabs ---------- */
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    $$('.panel').forEach(p => p.classList.toggle('on', p.dataset.p === b.dataset.t));
    ScrollTrigger.refresh();
  }));

  /* ---------- modals ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const open = id => { $('#' + id).classList.add('on'); lenis && lenis.stop(); };
  const close = () => { $$('.modal').forEach(m => m.classList.remove('on')); $$('.modal video').forEach(v => v.pause()); lenis && lenis.start(); };
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-close')) close(); }));
  document.addEventListener('keydown', e => {
    if (lb.classList.contains('on')) { if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') show(gi + 1); if (e.key === 'ArrowLeft') show(gi - 1); return; }
    if (e.key === 'Escape') close();
  });
  $$('.case').forEach(b => b.addEventListener('click', () => {
    const c = window.CASES[+b.dataset.i];
    const li = a => a.filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('');
    const cap = k => `${esc(c.brand)} — photo ${k + 1} of ${c.imgs.length}. ${esc(c.cred)}`;
    $('#mbody').innerHTML =
      `<div class="eyebrow">Case ${esc(c.num)}</div><p class="mut" style="margin-top:14px;font-size:14px">${esc(c.brand)}</p><h3>${esc(c.title)}</h3>
       <div class="mgal n${c.imgs.length}">${c.imgs.map((u, k) => `<button class="zb${k ? '' : ' big'}"><img src="${u}" alt="" data-lb="modal" data-cap="${cap(k)}"><i>⤢</i></button>`).join('')}</div>
       <div class="g"><div><div class="lb2">What they did</div>${c.did.map(x => `<p style="margin-bottom:12px">${esc(x)}</p>`).join('')}
       ${c.diff ? `<div class="lb2">What made it different</div><p>${esc(c.diff)}</p>` : ''}</div>
       <div><div class="lb2">Strengths</div><ul>${li(c.good)}</ul><div class="lb2">Limits</div><ul>${li(c.bad)}</ul></div></div>
       <div class="ls"><div class="lb2" style="margin-top:0">Lesson for Titan Diesel</div><p>${esc(c.lesson)}</p></div>${c.cred ? `<p class="cr">${esc(c.cred)} · full photo sources on the Next steps page</p>` : ''}`;
    $('#modal .box').scrollTop = 0;
    open('modal');
  }));

  /* ---------- before / after ---------- */
  const ba = $('#ba'), baR = $('#baR');
  if (ba) { baR.addEventListener('input', () => ba.style.setProperty('--x', baR.value + '%'));
    if (!RM) ScrollTrigger.create({ trigger: ba, start: 'top 70%', once: true, onEnter: () => { const o = { v: 82 }; gsap.to(o, { v: 50, duration: 1.8, ease: 'expo.inOut', onUpdate: () => { ba.style.setProperty('--x', o.v + '%'); baR.value = o.v; } }); } }); }

  /* ---------- the night in one film ---------- */
  const fv = $('#filmV');
  $$('[data-film]').forEach(b => b.addEventListener('click', () => { $('#menu').classList.remove('open'); if (!fv.src) fv.src = fv.dataset.src; open('filmmodal'); try { fv.currentTime = 0; } catch (e) {} fv.play().catch(() => {}); }));
  if ($('.film') && !RM && !PORT) gsap.to('.film .fp', { scale: 1, yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.film', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- next-chapter banner ---------- */
  $$('.nextch').forEach(n => { if (!RM && !PORT) gsap.fromTo(n.querySelector('img'), { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: n, start: 'top bottom', end: 'bottom top', scrub: true } }); });

  /* ---------- closing film ---------- */
  const cv = $('#closeV');
  if (cv) ScrollTrigger.create({ trigger: '.close', start: 'top bottom', end: 'bottom top', onToggle: s => { if (s.isActive) { if (!cv.src) cv.src = cv.dataset.src; cv.play().catch(() => {}); } else cv.pause(); } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
