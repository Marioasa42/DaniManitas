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
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
        const images = Array.from(grid.querySelectorAll('img'));
        grid.querySelectorAll('.gallery-item').forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(images, index));
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
