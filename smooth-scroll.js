/**
 * Smooth Scroll with Soft Inertia
 * + Scroll Reveal (subtle, reading-focused)
 * Focused on reading experience, not interface scrolling
 */

(function () {
    'use strict';

    // Configuration
    const config = {
        // Easing function - cubic bezier for natural deceleration
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        // Duration for anchor scroll (in ms)
        scrollDuration: 900,
        // Offset from top when scrolling to sections (header height)
        scrollOffset: 80,
        // Reveal threshold - how much of element must be visible
        revealThreshold: 0.15
    };

    // Smooth scroll to anchor links
    function initAnchorScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');

                // Skip if it's just "#" or empty
                if (targetId === '#' || !targetId) return;

                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();

                const startPosition = window.pageYOffset;
                const targetPosition = targetElement.getBoundingClientRect().top + startPosition - config.scrollOffset;
                const distance = targetPosition - startPosition;
                let startTime = null;

                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / config.scrollDuration, 1);

                    window.scrollTo(0, startPosition + (distance * config.easing(progress)));

                    if (progress < 1) {
                        requestAnimationFrame(animation);
                    }
                }

                requestAnimationFrame(animation);
            });
        });
    }

    // Scroll reveal - subtle, triggers once
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');

        if (!revealElements.length) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            revealElements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Unobserve after reveal - triggers only once
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: config.revealThreshold,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // Active navigation - subtle scroll-based highlighting
    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.header__nav-link');

        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');

                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('is-active'));

                    // Add active class to matching link
                    const activeLink = document.querySelector(`.header__nav-link[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('is-active');
                    }
                }
            });
        }, {
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    }

    // Ornament slow drift - deep visual layer
    function initOrnamentDrift() {
        const ornament = document.querySelector('.ornament');
        if (!ornament) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Very slow movement factor (5% of scroll)
        const driftFactor = 0.05;
        let currentY = 0;
        let targetY = 0;
        let rafId = null;

        function updatePosition() {
            // Smooth interpolation for gradual movement
            currentY += (targetY - currentY) * 0.03;

            // Apply transform only if there's meaningful change
            if (Math.abs(targetY - currentY) > 0.1) {
                ornament.style.transform = `translateY(calc(-50% + ${currentY}px))`;
                rafId = requestAnimationFrame(updatePosition);
            } else {
                rafId = null;
            }
        }

        window.addEventListener('scroll', () => {
            targetY = window.pageYOffset * driftFactor;

            if (!rafId) {
                rafId = requestAnimationFrame(updatePosition);
            }
        }, { passive: true });
    }

    // Initialize when DOM is ready
    function init() {
        initAnchorScroll();
        initScrollReveal();
        initActiveNav();
        initOrnamentDrift();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
