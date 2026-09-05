const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    const toggleNav = () => {
        nav.classList.toggle('nav-active');

        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        burger.classList.toggle('toggle');
    };

    burger.addEventListener('click', toggleNav);
    burger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleNav();
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('nav-active')) toggleNav();
        });
    });
};

const navLinkFade = `
@keyframes navLinkFade {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = navLinkFade;
document.head.appendChild(styleSheet);

navSlide();

// Sticky header state
window.addEventListener('scroll', () => {
    const header = document.querySelector('#header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Scroll reveal
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

// Smooth scroll (Lenis) + GSAP scroll-driven effects
let lenis = null;

if (!prefersReducedMotion && window.Lenis && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Hero background parallax
    gsap.to('#hero', {
        backgroundPosition: '50% 30%',
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
    });

    // Staggered entrance for grid-based sections
    const staggerGroups = ['.services-grid', '.process-grid'];
    staggerGroups.forEach((selector) => {
        const container = document.querySelector(selector);
        if (!container) return;
        gsap.from(container.children, {
            opacity: 0,
            y: 28,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.12,
            scrollTrigger: {
                trigger: container,
                start: 'top 82%',
            },
        });
    });
}

// Smooth-scroll internal nav links (works with or without Lenis)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
            lenis.scrollTo(target, { offset: -80 });
        } else {
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
    });
});

// Portfolio filter tabs
(() => {
    const tabs = document.querySelectorAll('.filter-tab');
    const grid = document.querySelector('.gallery-grid[data-gallery="portfolio"]');
    const emptyState = document.querySelector('[data-empty="reparaciones"]');
    if (!tabs.length || !grid) return;

    const items = Array.from(grid.querySelectorAll('.gallery-item'));

    const applyFilter = (filter) => {
        if (filter === 'reparaciones') {
            grid.hidden = true;
            if (emptyState) emptyState.hidden = false;
            return;
        }

        grid.hidden = false;
        if (emptyState) emptyState.hidden = true;

        const toShow = [];
        items.forEach((item) => {
            const match = filter === 'all' || item.dataset.category === filter;
            item.style.display = match ? '' : 'none';
            if (match) toShow.push(item);
        });

        if (!prefersReducedMotion && window.gsap) {
            gsap.fromTo(
                toShow,
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out' }
            );
        }
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            applyFilter(tab.dataset.filter);
        });
    });
})();

// Lightbox
(() => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    let currentGallery = [];
    let currentIndex = 0;

    const openLightbox = (galleryImages, index) => {
        currentGallery = galleryImages;
        currentIndex = index;
        updateLightboxImage();
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
    };

    const updateLightboxImage = () => {
        const img = currentGallery[currentIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    };

    const closeLightbox = () => {
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.style.overflow = '';
    };

    const showNext = () => {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateLightboxImage();
    };

    const showPrev = () => {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateLightboxImage();
    };

    document.querySelectorAll('.gallery-grid').forEach((grid) => {
        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (!item || item.style.display === 'none') return;

            const visibleItems = Array.from(grid.querySelectorAll('.gallery-item')).filter(
                (i) => i.style.display !== 'none'
            );
            const images = visibleItems.map((i) => i.querySelector('img'));
            const index = visibleItems.indexOf(item);

            openLightbox(images, index);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
})();
