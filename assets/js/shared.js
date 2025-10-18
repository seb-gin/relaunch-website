// shared.js – Navbar-Logo-Link • Back-to-top • Header-Opacity • Switcher • Cookie-Popup
document.addEventListener('DOMContentLoaded', function () {
  const DEBUG = false;
  const log = (...args) => { if (DEBUG) console.log(...args); };

  // © Jahr im Footer
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

  // ===============================
  // Basis-Pfad automatisch erkennen
  // ===============================
  let ROOT = '/';
  const pathParts = window.location.pathname.split('/').filter(Boolean);

  if (window.location.protocol === 'file:') {
    // Lokaler Aufruf (z. B. VS Code Live Server)
    ROOT = './';
  } else if (window.location.hostname.includes('github.io')) {
    // GitHub Pages – Repository automatisch ermitteln
    if (pathParts.length > 0) ROOT = '/' + pathParts[0] + '/';
  } else {
    // Regulärer Server (z. B. Strato)
    ROOT = '/';
  }

  log('[ROOT detected]', ROOT);

  // ===============================
  // Navbar-Logo-Link (immer zur Startseite)
  // ===============================
  try {
    const target = ROOT + 'index.html';
    document.querySelectorAll('a.navbar-brand').forEach(a => {
      a.setAttribute('href', target);
      a.setAttribute('rel', 'home');
      a.setAttribute('aria-label', 'Zur Startseite');
    });
  } catch (e) { log('[brand-link error]', e); }

  // ===============================
  // Back-to-top Button (nur Desktop)
  // ===============================
  try {
    const mqDesktop = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (mqDesktop.matches && !document.querySelector('.to-top')) {
      const btn = document.createElement('button');
      btn.className = 'to-top';
      btn.type = 'button';
      btn.textContent = '↑';
      btn.title = 'Nach oben';
      btn.setAttribute('aria-label', 'Nach oben');
      document.body.appendChild(btn);
      const toggle = () => btn.classList.toggle('is-visible', window.scrollY > 400);
      toggle();
      window.addEventListener('scroll', toggle, { passive: true });
      btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  } catch (e) { log('[to-top error]', e); }

  // ===============================
  // Header-Opacity beim Scrollen
  // ===============================
  try {
    const hdr = document.querySelector('body > header');
    if (hdr) {
      const toggle = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
      toggle();
      window.addEventListener('scroll', toggle, { passive: true });
    }
  } catch (e) { log('[header error]', e); }

  // ===============================
  // Bereichs-Switcher (S2A <-> BSC)
  // ===============================
  try {
    const sectionAttr = (document.body.getAttribute('data-section') || '').trim().toLowerCase();
    const path = (location.pathname || '').toLowerCase();

    const isS2A_root = path.endsWith('/s2a/') || path.endsWith('/s2a/index.html');
    const isBSC_root = path.endsWith('/bsc/') || path.endsWith('/bsc/index.html');
    const isS2A = sectionAttr === 'a' || sectionAttr === 's2a' || isS2A_root;
    const isBSC = sectionAttr === 'b' || sectionAttr === 'bsc' || isBSC_root;

    if (!(isS2A || isBSC)) {
      log('[switcher skipped]');
      return;
    }

    const targetHref = isS2A ? (ROOT + 'bsc/index.html') : (ROOT + 's2a/index.html');
    const logoSrc = isS2A ? (ROOT + 'assets/img/main/tile-b-logo.svg') : (ROOT + 'assets/img/main/tile-a-logo.svg');
    const label = isS2A ? 'Zu Bereich BSC' : 'Zu Bereich S2A';

    let sw = document.querySelector('.brand-switcher');
    if (!sw) {
      sw = document.createElement('a');
      sw.className = 'brand-switcher ' + (isS2A ? 'switch--to-b' : 'switch--to-a');
      sw.href = targetHref;
      sw.title = label;
      sw.setAttribute('aria-label', label);
      const img = document.createElement('img');
      img.className = 'brand-switcher__logo';
      img.src = logoSrc;
      img.alt = label;
      sw.appendChild(img);
    } else {
      sw.href = targetHref;
      const imgInside = sw.querySelector('img');
      if (imgInside) { imgInside.src = logoSrc; imgInside.alt = label; }
    }

    const navbar = document.querySelector('.navbar');
    const container = navbar && (navbar.querySelector('.container') || navbar.querySelector('.container-fluid'));
    const toggler = navbar && navbar.querySelector('.navbar-toggler');
    const collapse = navbar && navbar.querySelector('.navbar-collapse');
    const navList = collapse && collapse.querySelector('.navbar-nav');

    if (!container) return;

    const mqDesktop = window.matchMedia('(min-width: 992px)');
    const place = () => {
      if (mqDesktop.matches) {
        sw.classList.remove('brand-switcher--next-to-toggler');
        let li = sw.closest('li');
        if (!li) { li = document.createElement('li'); li.className = 'nav-item'; li.appendChild(sw); }
        if (navList && li.parentNode !== navList) navList.appendChild(li);
      } else {
        const liNow = sw.closest('li');
        if (liNow) liNow.remove();
        if (sw.parentNode !== container) container.appendChild(sw);
        if (toggler) {
          if (toggler.nextSibling) container.insertBefore(sw, toggler.nextSibling);
          else container.appendChild(sw);
        }
        sw.classList.add('brand-switcher--next-to-toggler');
      }
    };
    place();
    mqDesktop.addEventListener('change', place);
  } catch (e) { log('[switcher error]', e); }

  // ===============================
  // Cookie Overlay (unverändert)
  // ===============================
  (function(){
    const KEY = 'avineo_cookie_consent';
    const overlay = document.getElementById('cookie-overlay');
    const box = document.getElementById('cookie-consent');
    if (!overlay || !box) return;

    const safeSet = val => {
      localStorage.setItem(KEY, JSON.stringify({ value: val, at: Date.now() }));
      const d = new Date(); d.setFullYear(d.getFullYear() + 1);
      document.cookie = `${KEY}=${encodeURIComponent(val)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
    };
    const safeGet = () => {
      try { return JSON.parse(localStorage.getItem(KEY))?.value || null; } catch { return null; }
    };

    const showCookie = () => { overlay.dataset.active = 'true'; box.dataset.visible = 'true'; };
    const hideCookie = () => { delete overlay.dataset.active; delete box.dataset.visible; };

    const current = safeGet();
    if (current === 'accepted' || current === 'rejected') { hideCookie(); return; }
    showCookie();

    box.querySelector('.cookie-accept')?.addEventListener('click', () => { safeSet('accepted'); hideCookie(); });
    box.querySelector('.cookie-decline')?.addEventListener('click', () => { safeSet('rejected'); hideCookie(); });
  })();
});
