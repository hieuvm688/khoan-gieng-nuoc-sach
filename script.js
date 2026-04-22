/* =============================================
   KHOAN GIẾNG SẠCH – SCRIPT.JS
   Loader, Scroll FX, Header, Mobile Nav
   ============================================= */

'use strict';

// ─── LOADER ───────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    // trigger hero fade-in after loader
    document.querySelectorAll('#hero .fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 150);
    });
  }, 800);
});

// ─── SCROLL PROGRESS ──────────────────────────
const progressBar = document.getElementById('scroll-progress');
function updateScrollProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

// ─── HEADER SCROLL ────────────────────────────
const header = document.getElementById('header');
function updateHeader() {
  if (!header) return;
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// ─── FADE-IN ON SCROLL ────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');

// Skip hero elements (handled separately after loader)
const heroFades = document.querySelectorAll('#hero .fade-in');
const heroFadeSet = new Set(heroFades);

const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !heroFadeSet.has(entry.target)) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

fadeEls.forEach(el => {
  if (!heroFadeSet.has(el)) fadeObserver.observe(el);
});

// ─── HAMBURGER / MOBILE NAV ──────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

function closeMobileNav() {
  if (!mobileNav || !hamburger) return;
  mobileNav.classList.remove('open');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

// Close nav when clicking outside
document.addEventListener('click', (e) => {
  if (
    mobileNav?.classList.contains('open') &&
    !mobileNav.contains(e.target) &&
    !hamburger?.contains(e.target)
  ) {
    closeMobileNav();
  }
});

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const headerH = header?.offsetHeight || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── SCROLL EVENT HANDLER ────────────────────
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateHeader();
      updateScrollProgress();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// init on load
updateHeader();
updateScrollProgress();

// ─── COUNTER ANIMATION ───────────────────────
// Animate numbers when stat cards come into view
const statNums = document.querySelectorAll('.stat-num');
statNums.forEach(el => {
  const targetText = el.textContent.trim();
  const match = targetText.match(/(\d+)/);
  if (!match) return;
  const targetNum = parseInt(match[1], 10);

  const statObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounter(el, targetNum, targetText);
      statObserver.disconnect();
    }
  }, { threshold: 0.5 });
  statObserver.observe(el);
});

function animateCounter(el, target, originalText) {
  let start = 0;
  const duration = 1500;
  const startTime = performance.now();
  const prefix = originalText.replace(/[\d%+]+/, '').trim();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);
    el.textContent = current + (originalText.includes('%') ? '%' : originalText.includes('+') ? '+' : '');
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = originalText; // restore original
  }
  requestAnimationFrame(update);
}

// ─── GALLERY LIGHTBOX (simple) ──────────────
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay span')?.textContent || '';
    if (!img) return;

    // Create lightbox
    const lb = document.createElement('div');
    lb.style.cssText = `
      position: fixed; inset: 0; z-index: 9998;
      background: rgba(0,0,0,0.92); display: flex;
      flex-direction: column; align-items: center;
      justify-content: center; padding: 2rem; cursor: zoom-out;
      animation: fadeIn 0.25s ease;
    `;
    const lbImg = document.createElement('img');
    lbImg.src = img.src;
    lbImg.style.cssText = `max-width: 90vw; max-height: 80vh; border-radius: 12px; object-fit: contain;`;
    const lbCaption = document.createElement('p');
    lbCaption.textContent = caption;
    lbCaption.style.cssText = `color: rgba(255,255,255,0.8); margin-top: 1rem; font-size: 0.9rem; font-family: 'Be Vietnam Pro', sans-serif;`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute; top: 1.5rem; right: 2rem;
      background: none; border: none; color: white;
      font-size: 2.5rem; cursor: pointer; line-height: 1;
      font-family: sans-serif;
    `;
    closeBtn.setAttribute('aria-label', 'Đóng');
    lb.appendChild(lbImg);
    lb.appendChild(lbCaption);
    lb.appendChild(closeBtn);

    const close = () => { document.body.removeChild(lb); document.body.style.overflow = ''; };
    lb.addEventListener('click', close);
    lbImg.addEventListener('click', e => e.stopPropagation());
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });

    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';
  });
});

// ─── PHONE NUMBER CLICK TRACKING ─────────────
document.querySelectorAll('a[href^="tel:"]').forEach(el => {
  el.addEventListener('click', () => {
    console.log('[CTA] Phone call initiated:', el.href);
  });
});

// ─── EXPOSE closeMobileNav GLOBALLY ──────────
window.closeMobileNav = closeMobileNav;
