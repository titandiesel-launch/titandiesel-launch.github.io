(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WIDE = matchMedia('(min-width: 900px)').matches;
  const HAS = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (HAS) gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  let lenis = null;
  if (!RM && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1 }); window.__lenis = lenis;
    if (HAS) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }

  /* header: hide on scroll down, menu on small screens */
  const top = $('#top'); let last = 0;
  addEventListener('scroll', () => { const y = scrollY; top.classList.toggle('hide', y > last && y > 200 && !top.classList.contains('open')); last = y; }, { passive: true });
  const burger = $('#burger');
  burger.addEventListener('click', () => { const o = top.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.textContent = o ? 'Close' : 'Menu'; });

  /* videos: load and play only when on screen */
  const load = v => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; } };
  const play = v => { load(v); const p = v.play(); if (p) p.catch(() => {}); };
  const stop = v => { if (!v.paused) v.pause(); };
  const vids = $$('video.bgv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (e.intersectionRatio > 0.35) play(e.target); else load(e.target); }
      else stop(e.target);
    }), { threshold: [0, 0.35, 0.6], rootMargin: '0px 30% 0px 30%' });
    vids.forEach(v => io.observe(v));
  } else vids.forEach(play);

  /* hero letterbox opens as you scroll */
  const hero = $('.hero');
  if (hero && HAS && !RM && WIDE) {
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=70%', scrub: true, pin: true, invalidateOnRefresh: true } })
      .to('.hero-t', { opacity: 0, ease: 'none', duration: 0.35 }, 0)
      .to('.hero .screen', { height: () => innerHeight, ease: 'none', duration: 1 }, 0);
  }

  /* the big idea: words light up while reading */
  const said = $('#said');
  if (said) {
    const ws = $$('.w', said);
    if (HAS && !RM) ScrollTrigger.create({ trigger: said, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n)); } });
    else ws.forEach(w => w.classList.add('on'));
  }

  /* reels: horizontal scenes, pinned, on wide screens */
  $$('.reel').forEach(reel => {
    const track = $('.track', reel), shots = $$('.shot', reel), ticks = $$('.ticks i', reel);
    const mark = i => { ticks.forEach((t, k) => t.classList.toggle('on', k === i)); shots.forEach((s, k) => { const v = $('video', s); if (!v) return; if (k === i) play(v); else if (Math.abs(k - i) === 1) load(v); else stop(v); }); };
    mark(0);
    if (!(HAS && WIDE && !RM) || shots.length < 2) return;
    reel.classList.add('h');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
      trigger: reel, start: 'top top', end: () => '+=' + dist() * 1.1, pin: true, scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: s => mark(Math.round(s.progress * (shots.length - 1))) } });
  });

  /* lightbox */
  const lb = $('#lb'), lbI = $('#lbImg'), lbC = $('#lbCap'); let set = [], idx = 0, lastFocus = null;
  const show = () => { const im = set[idx]; lbI.src = im.currentSrc || im.src; lbI.alt = im.alt; lbC.textContent = im.dataset.cap || im.alt || ''; };
  const openLb = im => { set = $$(`img[data-lb="${im.dataset.lb}"]`); idx = set.indexOf(im); show(); lastFocus = document.activeElement; lb.hidden = false; lenis && lenis.stop(); $('#lbX').focus(); };
  const closeLb = () => { lb.hidden = true; lenis && lenis.start(); lastFocus && lastFocus.focus(); };
  document.addEventListener('click', e => { const b = e.target.closest('.zb'); if (!b) return; const im = $('img', b); if (im) openLb(im); });
  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', () => { idx = (idx - 1 + set.length) % set.length; show(); });
  $('#lbN').addEventListener('click', () => { idx = (idx + 1) % set.length; show(); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  /* modals */
  const openM = id => { const m = $('#' + id); lastFocus = document.activeElement; m.hidden = false; lenis && lenis.stop(); const x = $('.x', m); x && x.focus(); };
  const closeM = m => { m.hidden = true; lenis && lenis.start(); const v = $('video', m); v && v.pause(); lastFocus && lastFocus.focus(); };
  $$('.modal').forEach(m => { m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeM(m); }); });
  document.addEventListener('keydown', e => {
    if (!lb.hidden) { if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') $('#lbP').click(); if (e.key === 'ArrowRight') $('#lbN').click(); return; }
    if (e.key === 'Escape') $$('.modal').forEach(m => { if (!m.hidden) closeM(m); });
  });

  /* the night in one film */
  const fv = $('#filmV');
  $$('[data-film]').forEach(b => b.addEventListener('click', () => {
    top.classList.remove('open'); burger.setAttribute('aria-expanded', false); burger.textContent = 'Menu';
    load(fv); openM('filmmodal'); try { fv.currentTime = 0; } catch (e) {} const p = fv.play(); if (p) p.catch(() => {});
  }));

  /* case studies */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  $$('.case').forEach(b => b.addEventListener('click', () => {
    const c = window.CASES[+b.dataset.i];
    const li = a => (a || []).filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('');
    $('#mbody').innerHTML = `<p style="color:var(--amber);font-weight:600">Case ${esc(c.num)}</p><p style="color:var(--dim);font-size:14px">${esc(c.brand)}</p><h3>${esc(c.title)}</h3>
      <div class="mg">${c.imgs.map((u, k) => `<button class="zb" aria-label="Enlarge photo ${k + 1}"><img src="${u}" alt="${esc(c.brand)}, photo ${k + 1}" data-lb="case" data-cap="${esc(c.brand)}. ${esc(c.cred)}"></button>`).join('')}</div>
      <div class="g"><div><h4>What they did</h4>${(c.did || []).map(x => `<p>${esc(x)}</p>`).join('')}${c.diff ? `<h4>What made it different</h4><p>${esc(c.diff)}</p>` : ''}</div>
      <div><h4>Strengths</h4><ul>${li(c.good)}</ul><h4>Limits</h4><ul>${li(c.bad)}</ul></div></div>
      <div class="les"><h4>Lesson for Titan Diesel</h4><p>${esc(c.lesson)}</p></div><p class="cr">${esc(c.cred)}. Full photo sources are on the Next steps page.</p>`;
    $('#casemodal .mbox').scrollTop = 0; openM('casemodal');
  }));

  /* before and after */
  const ba = $('#ba'), baR = $('#baR');
  if (ba) {
    baR.addEventListener('input', () => ba.style.setProperty('--x', baR.value + '%'));
    if (HAS && !RM) ScrollTrigger.create({ trigger: ba, start: 'top 70%', once: true, onEnter: () => { const o = { v: 85 }; gsap.to(o, { v: 50, duration: 1.6, ease: 'expo.inOut', onUpdate: () => { ba.style.setProperty('--x', o.v + '%'); baR.value = o.v; } }); } });
  }

  /* material tabs */
  const tabs = $$('[role=tab]');
  tabs.forEach((t, k) => t.addEventListener('click', () => {
    tabs.forEach((u, j) => { u.setAttribute('aria-selected', j === k); $('#pn' + j).hidden = j !== k; });
    HAS && ScrollTrigger.refresh();
  }));

  /* next band parallax */
  if (HAS && !RM) $$('.nextband img').forEach(im => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));

  addEventListener('load', () => HAS && ScrollTrigger.refresh());
})();
