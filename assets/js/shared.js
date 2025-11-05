// shared.js – Navbar-Logo-Link • Back-to-top • Header-Opacity • Switcher (s2a <-> bsc) • Cookie-Popup (Landscape mobile)
// Dynamische Root-Erkennung für lokale Tests, GitHub Pages & Server-Hosting

document.addEventListener('DOMContentLoaded', function () {
  var DEBUG = (typeof window.DEBUG === 'boolean') ? window.DEBUG : false;
  function log(){ if(DEBUG) try{ console.log.apply(console, arguments); }catch(_e){} }

  // © Jahr im Footer setzen
  try {
    document.querySelectorAll('#year').forEach(function(el){
      el.textContent = new Date().getFullYear();
    });
  } catch(_e){}

  // ==========================================
  // ROOT dynamisch bestimmen – funktioniert lokal, auf GitHub Pages & Server
  // ==========================================
  var ROOT = window.location.pathname.includes('/relaunch-website/')
    ? '/relaunch-website/'
    : '/';

  log('[root]', ROOT);

  // ==========================================
  // Navbar-Logo -> immer zur Startseite verlinken
  // ==========================================
  (function(){
    try{
      var target = ROOT + 'index.html';
      document.querySelectorAll('a.navbar-brand').forEach(function(a){
        a.setAttribute('href', target);
        a.setAttribute('rel', 'home');
        a.setAttribute('aria-label', 'Zur Startseite');
        a.addEventListener('click', function(ev){
          var hrefNow = a.getAttribute('href') || '';
          if (!/\/(index\.html)?$/.test(hrefNow)) {
            ev.preventDefault();
            window.location.href = target;
          }
        }, { capture:true });
      });
      log('[brand->home]', target);
    }catch(e){ log('[brand->home][err]', e); }
  })();

    /* === Orientation Nudge (tiny GIF hint) — v3 final ============ */
(function(){
  // 0) Seiteneinstellung
  console.log('[nudge] init');
  const prefer = (document.body.getAttribute('data-orientation-prefer') || '').toLowerCase(); // 'portrait'|'landscape'
  if(!prefer) return;
  // nur auf Phones aktivieren (kein Hover, grober Pointer, schmale Breite)
  const IS_PHONE = window.matchMedia('(hover: none) and (pointer: coarse) and (max-width: 600px)').matches;
  if(!IS_PHONE) return;


  const DEBUG  = document.body.getAttribute('data-nudge-debug') === '1';
  const corner = (document.body.getAttribute('data-nudge-corner') || 'br').toLowerCase();

  // 1) Pfad robust (Root oder Unterordner)
  function rootPrefix(){
  const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
  const isFile = parts.length && /\.[a-z0-9]{2,8}$/i.test(parts[parts.length-1]);
  const depth  = isFile ? (parts.length - 1) : parts.length; // nur Verzeichnisse zählen
  return depth > 0 ? '../'.repeat(depth) : '';
}

  const gifUrl = document.body.getAttribute('data-orientation-gif')
               || (rootPrefix() + 'assets/img/global/rotate_portrait.gif');

  // 2) Timings & State
  const SHOW_DELAY_MS = 300;   // kleine Verzögerung gegen Flackern
  let showTimer = null;
  let hideTimer = null;

  // 3) Snooze pro falscher Orientierung (z. B. nur für Landscape “stumm”)
  const LS_KEY = 'av_orient_nudge_snooze_v2';
  const SNOOZE_MIN = 120; // 120 Minuten
  function lsGet(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch(_e){ return null; } }
  function lsSet(v){ try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch(_e){} }
  function currentBadOrientation(){
    return (prefer === 'portrait') ? 'landscape' : (prefer === 'landscape') ? 'portrait' : '';
  }
  function snoozed(forState){
    const v = lsGet(); if(!v) return false;
    const fresh = (Date.now() - v.ts) < (SNOOZE_MIN*60*1000);
    return fresh && v.for === forState;
  }

  // 4) Orientation-Erkennung
  function isLandscapeMedia(){
    try { return window.matchMedia('(orientation: landscape)').matches; } catch(_e){ return null; }
  }
  function isLandscapeGeom(){ return (window.innerWidth||0) > (window.innerHeight||0); }
  function isLandscape(){
    const mm = isLandscapeMedia();
    return (mm === true || mm === false) ? mm : isLandscapeGeom();
  }
  function mismatch(){
    if (DEBUG) return true;
    const land = isLandscape();
    if(prefer === 'portrait')  return land;   // Seite will Portrait, Gerät ist Landscape
    if(prefer === 'landscape') return !land;  // Seite will Landscape, Gerät ist Portrait
    return false;
  }

  // 5) DOM nur 1x erzeugen (idempotent)
  let nudge = document.getElementById('orientation-nudge');
  if(!nudge){
    nudge = document.createElement('div');
    nudge.id = 'orientation-nudge';
    nudge.setAttribute('data-corner', ['tl','tr','bl','br'].includes(corner) ? corner : 'br');
    const debugLabel = DEBUG ? `<div style="position:absolute; inset:auto 0 -14px 0; text-align:center; font:600 10px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Arial; color:#000; opacity:.6;">debug</div>` : '';
    nudge.innerHTML = `<img src="${gifUrl}" alt="Ausrichtungshinweis" decoding="async" loading="lazy">${debugLabel}`;
    document.body.appendChild(nudge);
  } else {
    // falls aus Tests vorhanden: Bildquelle aktualisieren
    const img = nudge.querySelector('img');
    if(img && img.getAttribute('src') !== gifUrl) img.setAttribute('src', gifUrl);
  }

  // 6) Show/Hide + Scheduling (mit iOS-Delay)
  function hide(){
    clearTimeout(hideTimer);
    nudge.classList.remove('show');
  }
  function show(){
    nudge.classList.add('show');
    clearTimeout(hideTimer);
  }
 function schedule(){
  clearTimeout(showTimer);
  const bad = currentBadOrientation();
  if (mismatch() && !snoozed(bad)) {
    showTimer = setTimeout(show, SHOW_DELAY_MS);
  } else {
    hide();
  }
}

  function scheduleSoon(){
    clearTimeout(showTimer);
    // optionales Debug-Log – zum Testen aktiv lassen, später gern entfernen:
    console.log('[nudge] scheduleSoon fired');
    setTimeout(schedule, 220); // iOS braucht kurzen Delay nach Dreh
  }

  // 7) Tap = Snooze setzen
  nudge.addEventListener('click', function(){
    hide();
    lsSet({ ts: Date.now(), for: currentBadOrientation() });
  }, { passive: true });

  // 8) Listener + initialer Trigger (delayed!)
  window.addEventListener('resize',            scheduleSoon);
  window.addEventListener('orientationchange', scheduleSoon);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) scheduleSoon(); });
  window.addEventListener('pageshow',          scheduleSoon);
  scheduleSoon();
})();

  // ==================================
  // Back-to-top Button (nur Desktop)
  // ==================================
  (function(){
    try {
      var mqDesktop = window.matchMedia('(hover: hover) and (pointer: fine)');
      if (mqDesktop.matches && !document.querySelector('.to-top')) {
        var btn = document.createElement('button');
        btn.className = 'to-top';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Nach oben');
        btn.title = 'Nach oben';
        btn.textContent = '↑';
        document.body.appendChild(btn);

        var toggle = function () {
          if (window.scrollY > 400) btn.classList.add('is-visible');
          else btn.classList.remove('is-visible');
        };
        toggle();
        window.addEventListener('scroll', toggle, { passive: true });

        btn.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        mqDesktop.addEventListener && mqDesktop.addEventListener('change', function (ev) {
          if (!ev.matches) btn.remove();
        });
        log('[to-top] aktiviert');
      } else {
        log('[to-top] ausgelassen (mobil oder existiert schon)');
      }
    } catch (e) { log('[to-top][err]', e); }
  })();

  // ==========================================
  // Header-Opacity beim Scrollen togglen
  // ==========================================
  (function(){
    try {
      var hdr = document.querySelector('body > header');
      if (!hdr) return;
      var toggleHeader = function(){
        if (window.scrollY > 8) hdr.classList.add('is-scrolled');
        else hdr.classList.remove('is-scrolled');
      };
      toggleHeader();
      window.addEventListener('scroll', toggleHeader, { passive: true });
      log('[header opacity] aktiv');
    } catch (e) { log('[header opacity][err]', e); }
  })();

  // ====================================================
  // Switcher: verbindet /s2a/ <-> /bsc/
  // ====================================================
  (function(){
    try {
      var sectionAttr = (document.body.getAttribute('data-section') || '').trim().toLowerCase();
      var path = (location.pathname || '').toLowerCase();

      var isS2A_root = path.endsWith('/s2a/') || path.endsWith('/s2a/index.html');
      var isBSC_root = path.endsWith('/bsc/') || path.endsWith('/bsc/index.html');

      var isS2A = sectionAttr === 'a' || sectionAttr === 's2a' || isS2A_root;
      var isBSC = sectionAttr === 'b' || sectionAttr === 'bsc' || isBSC_root;

      if (!(isS2A || isBSC)) { 
        console.log && console.log('[switcher] übersprungen (nicht root / nicht data-section a|b)');
        return; 
      }

      var targetHref = ROOT + (isS2A ? 'bsc/index.html' : 's2a/index.html');
      var logoSrc    = ROOT + 'assets/img/main/' + (isS2A ? 'tile-b-logo.svg' : 'tile-a-logo.svg');
      var label      = isS2A ? 'Zu Bereich BSC' : 'Zu Bereich S2A';

      var sw = document.querySelector('.brand-switcher');
      if (!sw) {
        sw = document.createElement('a');
        sw.className = 'brand-switcher ' + (isS2A ? 'switch--to-b' : 'switch--to-a');
        sw.href = targetHref;
        sw.title = label;
        sw.setAttribute('aria-label', label);
        var img = document.createElement('img');
        img.className = 'brand-switcher__logo';
        img.src = logoSrc;
        img.alt = label;
        sw.appendChild(img);
      } else {
        sw.href = targetHref;
        var imgInside = sw.querySelector('img');
        if (imgInside) { imgInside.src = logoSrc; imgInside.alt = label; }
        sw.classList.remove('switch--to-a','switch--to-b');
        sw.classList.add(isS2A ? 'switch--to-b' : 'switch--to-a');
      }

      var navbar    = document.querySelector('.navbar');
      var container = navbar && (navbar.querySelector('.container') || navbar.querySelector('.container-fluid'));
      var toggler   = navbar && navbar.querySelector('.navbar-toggler');
      var collapse  = navbar && navbar.querySelector('.navbar-collapse');
      var navList   = collapse && collapse.querySelector('.navbar-nav');

      if (!container) { console.warn('[switcher] kein Navbar-Container'); return; }

      var mqDesktop = window.matchMedia('(min-width: 992px)');
      function place() {
        if (mqDesktop.matches) {
          sw.classList.remove('brand-switcher--next-to-toggler');
          var li = sw.closest('li');
          if (!li) { li = document.createElement('li'); li.className = 'nav-item'; li.appendChild(sw); }
          if (navList && li.parentNode !== navList) navList.appendChild(li);
          else if (!navList && li.parentNode !== container) container.appendChild(li);
        } else {
          var liNow = sw.closest('li');
          if (liNow) liNow.remove();
          if (sw.parentNode !== container) container.appendChild(sw);
          if (toggler) {
            if (toggler.nextSibling) container.insertBefore(sw, toggler.nextSibling);
            else container.appendChild(sw);
          }
          sw.classList.add('brand-switcher--next-to-toggler');
        }
      }
      place();
      mqDesktop.addEventListener ? mqDesktop.addEventListener('change', place)
                                 : window.addEventListener('resize', place);

      try { new MutationObserver(place).observe(container, { childList:true, subtree:true }); } catch(_e){}

      console.log && console.log('[switcher] aktiv (', isS2A ? 's2a' : 'bsc', '→', isS2A ? 'bsc' : 's2a', ')');
    } catch (e) { console.error && console.error('[switcher][err]', e); }
  }); // Ende DOMContentLoaded

// ================= COOKIE CORNER + overlay click-catcher =================
(function(){
  var KEY = 'avineo_cookie_consent';
  var overlay = document.getElementById('cookie-overlay');
  var box = document.getElementById('cookie-consent');
  var content = box && box.querySelector('.cookie-consent__content');
  var acceptBtn, declineBtn;

  function safeSet(val){
    try {
      localStorage.setItem(KEY, JSON.stringify({value: val, at: Date.now()}));
      var d = new Date(); d.setFullYear(d.getFullYear() + 1);
      document.cookie = KEY + '=' + encodeURIComponent(val) + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
    } catch(e){}
  }
  function safeGet(){
    try {
      var raw = localStorage.getItem(KEY);
      if(!raw) return null;
      var o = JSON.parse(raw);
      return o && o.value ? o.value : null;
    } catch(e){ return null; }
  }

  function loadAllowedScripts(categories){
    document.querySelectorAll('script[type="text/plain"][data-cookie-consent]').forEach(function(n){
      var cat = (n.getAttribute('data-cookie-consent')||'').trim();
      if(categories.indexOf(cat) === -1) return;
      if(n.getAttribute('data-activated')) return;
      var s = document.createElement('script');
      if(n.dataset.type) s.type = n.dataset.type;
      if(n.dataset.async !== undefined) s.async = true;
      if(n.dataset.defer !== undefined) s.defer = true;
      if(n.src) s.src = n.src;
      else s.text = n.textContent || n.innerText || '';
      document.head.appendChild(s);
      n.setAttribute('data-activated','1');
    });
  }

  function showCookie(){
    if(!overlay || !box) return;
    overlay.setAttribute('data-active','true');
    box.setAttribute('data-visible','true');
    attachHandlers();
  }
  function hideCookie(){
    if(!overlay || !box) return;
    overlay.removeAttribute('data-active');
    box.removeAttribute('data-visible');
  }

  function visualHint(){
    if(!content) return;
    content.classList.remove('is-shaking');
    void content.offsetWidth;
    content.classList.add('is-shaking');
    setTimeout(function(){ content.classList.remove('is-shaking'); }, 480);
  }

  function attachHandlers(){
    if(!box || attachHandlers._done) return;
    attachHandlers._done = true;

    acceptBtn = box.querySelector('.cookie-accept');
    declineBtn = box.querySelector('.cookie-decline');

    acceptBtn && acceptBtn.addEventListener('click', function(e){
      e.stopPropagation();
      safeSet('accepted');
      loadAllowedScripts(['analytics','marketing','performance']);
      hideCookie();
    });

    declineBtn && declineBtn.addEventListener('click', function(e){
      e.stopPropagation();
      safeSet('rejected');
      hideCookie();
    });

    overlay && overlay.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      visualHint();
    });
  }

  function init(){
    var current = safeGet();
    if(current === 'accepted'){
      loadAllowedScripts(['analytics','marketing','performance']);
      hideCookie();
      return;
    }
    if(current === 'rejected'){ hideCookie(); return; }
    showCookie();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* === Rotate-Overlay Display Control (Portrait only) === */
(function(){
  const overlay = document.getElementById('rotate-overlay');
  if (!overlay) return;

  function toggleOverlay() {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Sichtbarkeit nur bei Mobile + Portrait
    overlay.style.display = (isMobile && isPortrait) ? 'grid' : 'none';
  }

  document.addEventListener('DOMContentLoaded', toggleOverlay);
  window.addEventListener('resize', toggleOverlay);
  window.addEventListener('orientationchange', () => setTimeout(toggleOverlay,150));
})();




// JS-Fallback: sorgt dafür, dass #rotate-hint definitiv sichtbar wird (bei Portrait auf Mobile)
(function(){
  function showIfPortrait(){
    var el = document.getElementById('rotate-hint');
    if (!el) return;
    var isPortrait = window.matchMedia('(orientation: portrait)').matches;
    var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && isPortrait){
      el.style.display = 'grid';
      el.style.visibility = 'visible';
      // ensure inner image visible
      var img = el.querySelector('.rotate-gif');
      if (img) img.style.display = 'block';
    } else {
      el.style.display = '';
      el.style.visibility = '';
      if (el.querySelector('.rotate-gif')) el.querySelector('.rotate-gif').style.display = '';
    }
  }
  document.addEventListener('DOMContentLoaded', showIfPortrait);
  window.addEventListener('resize', showIfPortrait);
  window.addEventListener('orientationchange', function(){ setTimeout(showIfPortrait, 150); });
})();

(function() {
  const hint = document.getElementById('rotate-hint');
  if (!hint) return;

  function toggleHint() {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && isPortrait) {
      hint.style.display = 'grid';
      hint.style.visibility = 'visible';
      document.body.style.overflow = 'hidden';
    } else {
      hint.style.display = 'none';
      hint.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('DOMContentLoaded', toggleHint);
  window.addEventListener('resize', toggleHint);
  window.addEventListener('orientationchange', () => setTimeout(toggleHint, 200));
})();

// ==========================================
// NAVBAR SCROLL / SHRINK / HIDE (Desktop + Mobile)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const headerEl = document.querySelector('body > header');
  if (!headerEl) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const HIDE_THRESHOLD = 100;      // ab wann sie auf Mobile verschwindet
  const REAPPEAR_DISTANCE = 120;   // wie weit man hochscrollen muss, bis sie wieder erscheint
  const BREAKPOINT = 991;          // mobile Grenze
  const BOTTOM_MARGIN = 60;        // Abstand zum Seitenende

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }

  function handleScroll() {
    const currentScroll = window.scrollY;
    const ww = window.innerWidth;

    // ===== Desktop: Shrink + Blur =====
// Desktop-Hysterese gegen Flackern
const SCROLL_ADD = 120;   // ab hier schrumpfen
const SCROLL_REMOVE = 40; // erst ab hier wieder groß

if (window.innerWidth >= 992) {
  if (!headerEl.classList.contains('shrink') && currentScroll > SCROLL_ADD) {
    headerEl.classList.add('shrink');
  }
  if (headerEl.classList.contains('shrink') && currentScroll < SCROLL_REMOVE) {
    headerEl.classList.remove('shrink');
  }
}

    // ===== Mobile: Hide on Scroll Down / Show on Scroll Up =====
    if (ww <= BREAKPOINT) {
      const scrollDown = currentScroll > lastScrollY;
      const scrollUp = currentScroll < lastScrollY;

      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const atBottom =
        window.innerHeight + currentScroll >= docHeight - BOTTOM_MARGIN;

      if (scrollDown && currentScroll > HIDE_THRESHOLD && !atBottom) {
        headerEl.classList.add('hide-on-scroll');
        headerEl.dataset.lastHideY = String(currentScroll);
      }

      if (scrollUp) {
        const lastHideY = parseInt(headerEl.dataset.lastHideY || '0', 10);
        const scrolledUpEnough =
          lastHideY - currentScroll > REAPPEAR_DISTANCE;
        if (scrolledUpEnough || currentScroll < HIDE_THRESHOLD) {
          headerEl.classList.remove('hide-on-scroll');
        }
      }
    }

    lastScrollY = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
});

/* === Avineo: Return-to-Scroll (compact) ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const LS_PATH   = 'av_return_path';
  const LS_SCROLL = 'av_return_scroll';
  const LS_FLAG   = 'av_restore_on_load';

  // 1) Auf Übersichtsseiten: Klick auf Feature-Links speichert Kontext
  const featureLinks = document.querySelectorAll(
    'a[href$="1.html"], a[href$="2.html"], a[href$="3.html"], a[href$="4.html"]'
  );
  featureLinks.forEach(a => {
    a.addEventListener('click', () => {
      sessionStorage.setItem(LS_PATH,   location.pathname);
      sessionStorage.setItem(LS_SCROLL, String(window.scrollY));
    }, { passive: true });
  });

  // 2) Auf Feature-Seiten: "Zurück"-Button verdrahten
  const backBtn = document.querySelector('[data-back]');
  if (backBtn) {
    const savedPath = sessionStorage.getItem(LS_PATH);
    const fallback  = backBtn.getAttribute('data-fallback') || '../index.html';
    backBtn.setAttribute('href', savedPath || fallback);

    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem(LS_FLAG, '1');
      location.href = savedPath || fallback;
    });
  }

  // 3) Auf Zielseite: Scrollposition wiederherstellen
  if (sessionStorage.getItem(LS_FLAG) === '1') {
    const savedPath = sessionStorage.getItem(LS_PATH);
    if (savedPath === location.pathname) {
      const y = Number(sessionStorage.getItem(LS_SCROLL) || 0);
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'smooth' });
        sessionStorage.removeItem(LS_FLAG);
      });
    }
  }
});})