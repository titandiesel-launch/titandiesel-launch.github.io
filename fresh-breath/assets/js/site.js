(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WIDE = matchMedia('(min-width: 821px)').matches;
  const HAS = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (HAS) gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!RM && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1 }); window.__lenis = lenis;
    if (HAS) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }

  /* header */
  const top = $('#top'); let last = 0;
  const onScroll = () => { const y = scrollY; top.classList.toggle('solid', y > 40); top.classList.toggle('hide', y > last && y > 300); last = y; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const play = v => { if (!v) return; if (!v.src && v.dataset.src) v.src = v.dataset.src; const p = v.play(); if (p) p.catch(() => {}); };

  /* logo animation: plays once each time it comes into view */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.ended || v.currentTime === 0 || v.paused) { try { v.currentTime = 0; } catch (x) {} play(v); } }
  }), { threshold: 0.5 }) : null;
  ['#logoV', '#logoV2'].forEach(s => { const v = $(s); if (v && io) io.observe(v); else if (v) play(v); });

  /* chapter clocks light up */
  if (HAS && !RM) $$('.chap .clock').forEach(c => ScrollTrigger.create({ trigger: c, start: 'top 75%', onEnter: () => c.classList.add('on'), onLeaveBack: () => c.classList.remove('on') }));
  else $$('.chap .clock').forEach(c => c.classList.add('on'));

  /* grey to green wipe */
  const wipe = $('#wipe');
  if (wipe) {
    const clean = $('.clean', wipe), edge = $('.edge', wipe), a = $('.cap .a', wipe), b = $('.cap .b', wipe);
    const set = p => { const r = 100 - p * 100; clean.style.clipPath = `inset(0 0 0 ${r}%)`; edge.style.left = r + '%'; edge.style.opacity = p > 0.002 && p < 0.998 ? 1 : 0; a.style.opacity = 1 - p * 0.75; b.style.opacity = 0.25 + p * 0.75; };
    if (HAS && !RM && WIDE) ScrollTrigger.create({ trigger: wipe, start: 'top top', end: '+=160%', pin: true, scrub: 0.5, onUpdate: s => set(s.progress) });
    else if (HAS && !RM) ScrollTrigger.create({ trigger: wipe, start: 'top 70%', end: 'bottom 30%', scrub: 0.5, onUpdate: s => set(s.progress) });
    else set(0.5);
  }

  /* stage sequence */
  const seq = $('#seq');
  if (seq && HAS && !RM && WIDE) {
    const imgs = $$('img', seq), steps = $$('.steps div', seq);
    imgs.forEach(i => i.style.transition = 'opacity .7s ease');
    const show = k => { imgs.forEach((im, j) => im.classList.toggle('on', j === k)); steps.forEach((s, j) => s.classList.toggle('on', j === k)); };
    ScrollTrigger.create({ trigger: seq, start: 'top top', end: '+=260%', pin: true, onUpdate: s => show(Math.min(3, Math.floor(s.progress * 4))) });
  }

  /* lightbox */
  const lb = $('#lb'), lbI = $('#lbImg'), lbC = $('#lbCap'); let set = [], idx = 0, lastF = null;
  const show = () => { const im = set[idx]; lbI.src = im.dataset.full || im.currentSrc || im.src; lbI.alt = im.alt; lbC.textContent = im.dataset.cap || im.alt; };
  const openLb = im => { set = $$(`img[data-lb="${im.dataset.lb}"]`); idx = set.indexOf(im); show(); lastF = document.activeElement; lb.hidden = false; lenis && lenis.stop(); $('.lbx', lb).focus(); };
  const closeLb = () => { lb.hidden = true; lenis && lenis.start(); lastF && lastF.focus(); };
  document.addEventListener('click', e => { const b = e.target.closest('.zb'); if (!b) return; const im = $('img', b); if (im) openLb(im); });
  $('.lbx', lb).onclick = closeLb; $('.lbp', lb).onclick = () => { idx = (idx - 1 + set.length) % set.length; show(); }; $('.lbn', lb).onclick = () => { idx = (idx + 1) % set.length; show(); };
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  /* teaser */
  const fm = $('#fm'), fv = $('#fmV');
  const closeFm = () => { fm.hidden = true; fv.pause(); lenis && lenis.start(); };
  $$('[data-film]').forEach(b => b.addEventListener('click', () => { fm.hidden = false; lenis && lenis.stop(); play(fv); $('.fmx', fm).focus(); }));
  if (fm) { $('.fmx', fm).onclick = closeFm; fm.addEventListener('click', e => { if (e.target === fm) closeFm(); }); }

  document.addEventListener('keydown', e => {
    if (!lb.hidden) { if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') $('.lbp', lb).click(); if (e.key === 'ArrowRight') $('.lbn', lb).click(); }
    else if (fm && !fm.hidden && e.key === 'Escape') closeFm();
  });

  addEventListener('load', () => HAS && ScrollTrigger.refresh());
})();
