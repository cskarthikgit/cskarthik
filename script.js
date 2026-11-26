/* ============================================================
   CSK PORTFOLIO — MAIN SCRIPT
============================================================ */

'use strict';

// ============================================================
// UTILITY
// ============================================================

function $(selector, parent = document) {
  return parent.querySelector(selector);
}
function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

// Debounce helper
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ============================================================
// FOOTER YEAR
// ============================================================

const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================================
// NAVBAR — SCROLL STATE
// ============================================================

const navbar = $('#navbar');

function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run on load

// ============================================================
// MOBILE NAVIGATION
// ============================================================

const hamburger = $('#hamburger');
const navLinks  = $('#nav-links');
const overlay   = $('#mobile-overlay');

function openMobileMenu() {
  navLinks?.classList.add('open');
  overlay?.classList.add('active');
  hamburger?.classList.add('open');
  hamburger?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  navLinks?.classList.remove('open');
  overlay?.classList.remove('active');
  hamburger?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const isOpen = navLinks?.classList.contains('open');
  isOpen ? closeMobileMenu() : openMobileMenu();
});

overlay?.addEventListener('click', closeMobileMenu);

// Close on nav link click
$$('.nav-link, .nav-logo').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ============================================================
// HERO — FADE UP ANIMATIONS
// ============================================================

function initHeroAnimations() {
  const fadeElements = $$('.fade-up');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    fadeElements.forEach(el => el.classList.add('visible'));
    return;
  }

  // Stagger each .fade-up element
  requestAnimationFrame(() => {
    fadeElements.forEach((el, i) => {
      // Use CSS transition-delay if already set via class, else manual
      const hasDelay = el.classList.contains('delay-1') ||
                       el.classList.contains('delay-2') ||
                       el.classList.contains('delay-3') ||
                       el.classList.contains('delay-4') ||
                       el.classList.contains('delay-5') ||
                       el.classList.contains('delay-6');

      if (!hasDelay) {
        el.style.transitionDelay = `${i * 80}ms`;
      }

      setTimeout(() => {
        el.classList.add('visible');
      }, 60);
    });
  });
}

// ============================================================
// SCROLL REVEAL (Intersection Observer)
// ============================================================

function initScrollReveal() {
  // Respect reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReduced) {
    // Make everything visible immediately
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, observerOptions);

  $$('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
// SMOOTH SCROLL — CTA BUTTONS
// ============================================================

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
      const target = $(targetId);
      if (!target) return;
      
      e.preventDefault();
      
      const navHeight = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')) || 72;
      
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
      
      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
}

// ============================================================
// ACTIVE NAV LINK HIGHLIGHT
// ============================================================

function initActiveNavHighlight() {
  const sections = $$('section[id], div[id]').filter(el =>
    ['hero', 'about', 'skills', 'projects', 'education', 'github', 'contact'].includes(el.id)
  );
  
  const navLinkEls = $$('.nav-link');
  if (!sections.length || !navLinkEls.length) return;

  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
  ) || 72;

  function updateActiveLink() {
    const scrollPos = window.scrollY + navHeight + 80;

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = section.id;
      }
    });

    navLinkEls.forEach(link => {
      link.style.color = '';
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.style.color = 'var(--color-text-primary)';
      }
    });
  }

  window.addEventListener('scroll', debounce(updateActiveLink, 50), { passive: true });
  updateActiveLink();
}

// ============================================================
// PROJECT CARD — TILT MICRO-EFFECT
// ============================================================

function initCardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  $$('.project-card, .contact-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width / 2;
      const cy     = rect.height / 2;
      const tiltX  = ((y - cy) / cy) * 3;
      const tiltY  = ((cx - x) / cx) * 3;
      card.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ============================================================
// SKILL CARD — STAGGERED REVEAL
// ============================================================

function initSkillStagger() {
  const cards = $$('.skill-card');
  cards.forEach((card, i) => {
    card.style.setProperty('--delay', `${i * 0.05}s`);
  });
}

// ============================================================
// TYPING EFFECT — HERO SUBTITLE (optional, subtle)
// ============================================================

function initSubtitleBlink() {
  const subtitle = $('.hero-subtitle');
  if (!subtitle) return;

  // Add a subtle cursor blink to the subtitle
  const cursor = document.createElement('span');
  cursor.style.cssText = `
    display: inline-block;
    width: 2px;
    height: 1em;
    background: var(--color-accent);
    margin-left: 4px;
    vertical-align: middle;
    animation: blink 1.1s step-end infinite;
  `;

  // Inject keyframe for blink
  if (!document.getElementById('blink-style')) {
    const style = document.createElement('style');
    style.id = 'blink-style';
    style.textContent = `
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Remove cursor after 3 seconds
  subtitle.appendChild(cursor);
  setTimeout(() => {
    cursor.style.transition = 'opacity 0.5s';
    cursor.style.opacity = '0';
    setTimeout(() => cursor.remove(), 500);
  }, 3000);
}

// ============================================================
// CONTACT CARD — EMAIL COPY FEEDBACK
// ============================================================

function initEmailCopy() {
  const emailCard = $('#contact-email');
  if (!emailCard) return;

  emailCard.addEventListener('click', (e) => {
    // Check if clipboard API is available
    if (!navigator.clipboard) return;

    const email = 'cskarthik25cs@cce.edu.in';
    const href  = emailCard.getAttribute('href');
    
    // Only intercept if no default action needed (ctrl/cmd click)
    if (e.ctrlKey || e.metaKey) return;

    // Show feedback
    const handle = emailCard.querySelector('.contact-handle');
    if (!handle) return;

    const original = handle.textContent;
    
    navigator.clipboard.writeText(email).then(() => {
      handle.textContent = 'Copied!';
      emailCard.style.borderColor = 'var(--color-accent)';
      
      setTimeout(() => {
        handle.textContent = original;
        emailCard.style.borderColor = '';
      }, 2000);
    }).catch(() => {
      // Fallback: let default mailto: action happen
    });
  });
}

// ============================================================
// BACK TO TOP — SMOOTH
// ============================================================

function initBackToTop() {
  const backTop = $('.footer-back-top');
  if (!backTop) return;

  backTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================================
// PERFORMANCE: REQUEST IDLE CALLBACK WRAPPER
// ============================================================

function whenIdle(fn) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 500 });
  } else {
    setTimeout(fn, 100);
  }
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Critical: run immediately
  initHeroAnimations();
  initSmoothScroll();
  initScrollReveal();

  // Non-critical: defer
  whenIdle(() => {
    initActiveNavHighlight();
    initSkillStagger();
    initSubtitleBlink();
    initEmailCopy();
    initBackToTop();
    initCardTilt();
  });
});

// Handle back-forward cache
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    handleNavbarScroll();
  }
});

// Log portfolio info to console (nice touch)
console.log(
  '%c CSK Portfolio ',
  'background: #C0392B; color: white; padding: 4px 10px; font-size: 12px; font-weight: bold; border-radius: 4px;',
);
console.log(
  '%c Built with HTML · CSS · Vanilla JS',
  'color: #5C5A56; font-size: 11px;'
);
console.log(
  '%c GitHub: https://github.com/cskarthikgit',
  'color: #9A9893; font-size: 11px;'
);
