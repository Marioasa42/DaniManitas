import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------------
   Scroll reveal fallback for plain `.reveal` elements (services, headers,
   process steps). Lightweight IntersectionObserver, no GSAP needed here.
--------------------------------------------------------------------- */
const revealTargets = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------------------------------------------------------------------
   Lenis smooth scroll, wired to GSAP's ticker + ScrollTrigger.
--------------------------------------------------------------------- */
let lenis = null;

if (!prefersReducedMotion) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -76 });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

/* ---------------------------------------------------------------------
   Circuit line — draws down the page as you scroll, "plugs in" near
   the contact section.
--------------------------------------------------------------------- */
const circuitPath = document.getElementById('circuitPath');
const circuitPlug = document.getElementById('circuitPlug');

if (circuitPath && !prefersReducedMotion) {
  gsap.to(circuitPath, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: (self) => {
        circuitPlug?.classList.toggle('is-live', self.progress > 0.92);
      },
    },
  });
} else if (circuitPath) {
  circuitPath.style.strokeDashoffset = '0';
}

/* ---------------------------------------------------------------------
   Iluminación gallery — cursor spotlight (motivated by the service).
--------------------------------------------------------------------- */
const spotlightGrid = document.querySelector('.spotlight-grid');
if (spotlightGrid && window.matchMedia('(hover: hover)').matches) {
  spotlightGrid.addEventListener('pointerenter', () => spotlightGrid.classList.add('is-active'));
  spotlightGrid.addEventListener('pointerleave', () => spotlightGrid.classList.remove('is-active'));
  spotlightGrid.addEventListener('pointermove', (e) => {
    const rect = spotlightGrid.getBoundingClientRect();
    spotlightGrid.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    spotlightGrid.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
}

/* ---------------------------------------------------------------------
   Reformas gallery — pinned horizontal pan on desktop, plain scroll-snap
   on smaller screens (handled purely by CSS below the breakpoint).
--------------------------------------------------------------------- */
const panWrap = document.querySelector('.pan-wrap');
const panTrack = document.querySelector('.pan-track');

if (panWrap && panTrack) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const distance = () => panTrack.scrollWidth - panWrap.clientWidth;
    const tween = gsap.to(panTrack, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: panWrap,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    return () => tween.scrollTrigger?.kill();
  });
}

/* ---------------------------------------------------------------------
   Reformas swipe dots — highlight the visible slide and let taps jump
   to a slide, so the mobile carousel reads as obviously interactive.
--------------------------------------------------------------------- */
document.querySelectorAll('.pan-dots').forEach((dotsEl) => {
  const track = dotsEl.previousElementSibling;
  if (!track || !track.classList.contains('pan-track')) return;

  const slides = Array.from(track.querySelectorAll('.pan-slide'));
  const dots = Array.from(dotsEl.querySelectorAll('.pan-dot'));
  if (!slides.length || !dots.length) return;

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      slides[i].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = slides.indexOf(entry.target);
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      });
    },
    { root: track, threshold: 0.6 }
  );
  slides.forEach((slide) => observer.observe(slide));
});

/* ---------------------------------------------------------------------
   Magnetic primary CTAs.
--------------------------------------------------------------------- */
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 18;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      xTo((relX / rect.width) * strength);
      yTo((relY / rect.height) * strength);
    });

    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}
