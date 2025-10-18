// shared.js – Navbar-Logo-Link • Back-to-top • Header-Opacity • Switcher (s2a <-> bsc) • Cookie-Popup (Landscape mobile)
// Angepasst für absolute Pfade: Root = '/'

document.addEventListener('DOMContentLoaded', function () {
  var DEBUG = (typeof window.DEBUG === 'boolean') ? window.DEBUG : false;
  function log(){ if(DEBUG) try{ console.log.apply(console, arguments); }catch(_e){} }

  // © Jahr im Footer setzen
  try {
    document.querySelectorAll('#year').forEach(function(el){
      el.textContent = new Date().getFullYear();
    });
  } catch(_e){}

  // -----------------------
  // ROOT (absolute path)
  // -----------------------
  // Da deine Seite jetzt absolute Pfade nutzt, setzen wir ROOT hart auf '/'
  var ROOT = '../';
  log('[root]', ROOT);

  // ==========================================
  // Navbar-Logo -> immer zur Startseite (/index.html) verlinken
  // ==========================================
  (function(){
  try{
    // Root-Pfade definieren
    var path = location.pathname.toLowerCase();
    var isRoot = path === '/' || path === '/index.html' || path === '/s2a/index.html' || path === '/bsc/index.html';
    if(!isRoot) return; // Unterseiten überspringen!

    var target = ROOT + 'index.html';
    document.querySelectorAll('a.navbar-brand').forEach(function(a){
      a.setAttribute('href', target);
      a.setAttribute('rel', 'home');
      a.setAttribute('aria-label', 'Zur Startseite');
    });
    log('[brand->home]', target);
  }catch(e){ log('[brand->home][err]', e); }
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
// Nur anzeigen auf den Bereichs-Übersichtsseiten oder wenn body[data-section] explizit 'a'/'b' ist.
// Verhindert Anzeige auf Unterseiten wie /s2a/features/1.html
// ====================================================
(function(){
  try {
    var sectionAttr = (document.body.getAttribute('data-section') || '').trim().toLowerCase();

    // current path (klein geschrieben)
    var path = (location.pathname || '').toLowerCase();

    // Erkenne echte Root-Pfade (nur diese sollen den Switcher zeigen)
    var isS2A_root = path === '/s2a' || path === '/s2a/' || path === '/s2a/index.html';
    var isBSC_root = path === '/bsc' || path === '/bsc/' || path === '/bsc/index.html';

    // Wenn die Seite explizit signalisiert, dass sie Bereich A/B ist, respektiere das.
    var isS2A = sectionAttr === 'a' || sectionAttr === 's2a' || isS2A_root;
    var isBSC = sectionAttr === 'b' || sectionAttr === 'bsc' || isBSC_root;

    // Auf Feature-/Detailseiten solltest du besser data-section="feature" setzen.
    // Wenn weder A noch B zutrifft -> überspringen
    if (!(isS2A || isBSC)) { 
      console.log && console.log('[switcher] übersprungen (nicht root / nicht data-section a|b)');
      return; 
    }

    var targetHref = isS2A ? ('/bsc/index.html') : ('/s2a/index.html');
    var logoSrc    = isS2A ? ('/assets/img/main/tile-b-logo.svg') : ('/assets/img/main/tile-a-logo.svg');
    var label      = isS2A ? 'Zu Bereich BSC' : 'Zu Bereich S2A';

    // Element erstellen oder aktualisieren
    var sw = document.querySelector('.brand-switcher');
    if (!sw) {
      sw = document.createElement('a');
      sw.className = 'brand-switcher ' + (isS2A ? 'switch--to-b' : 'switch--to-a');
      sw.href = targetHref;
      sw.title = label;
      sw.setAttribute('aria-label', label);
      var img = document.createElement('img');
      img.className = 'brand-switcher__logo';
      img.src = logoSrc; img.alt = label;
      sw.appendChild(img);
    } else {
      sw.href = targetHref;
      var imgInside = sw.querySelector('img');
      if (imgInside) { imgInside.src = logoSrc; imgInside.alt = label; }
      sw.classList.remove('switch--to-a','switch--to-b');
      sw.classList.add(isS2A ? 'switch--to-b' : 'switch--to-a');
    }

    // Platzierung: Desktop -> als letztes Nav-Item; Mobile -> rechts neben Burger
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
})();
}); // Ende DOMContentLoaded

// ================= COOKIE CORNER + overlay click-catcher =================
(function(){
  var KEY = 'avineo_cookie_consent';
  var overlay = document.getElementById('cookie-overlay');
  var box = document.getElementById('cookie-consent');
  var content = box && box.querySelector('.cookie-consent__content');
  var acceptBtn, declineBtn;
  var clickCount = 0;

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
    if(window.avineoConsent && typeof window.avineoConsent.accept === 'function'){
      try { window.avineoConsent.accept(categories); return; } catch(e) {}
    }
    // fallback: activate scripts marked with type="text/plain" and matching data-cookie-consent
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
    overlay.setAttribute('data-active','true');   // captures clicks
    overlay.setAttribute('aria-hidden','false');
    box.setAttribute('data-visible','true');
    box.setAttribute('aria-hidden','false');
    // attach handlers lazily
    attachHandlers();
  }
  function hideCookie(){
    if(!overlay || !box) return;
    overlay.removeAttribute('data-active');
    overlay.setAttribute('aria-hidden','true');
    box.removeAttribute('data-visible');
    box.setAttribute('aria-hidden','true');
  }

  function visualHint(){
  if(!content) return;
  // remove any previous animation classes
  content.classList.remove('is-shaking','is-pulsing');
  void content.offsetWidth; // reflow to restart animation
  // always shake once
  content.classList.add('is-shaking');
  // remove class after animation duration (match CSS ~420-480ms)
  setTimeout(function(){ content.classList.remove('is-shaking'); }, 480);
}

  function attachHandlers(){
    if(!box) return;
    if(attachHandlers._done) return;
    attachHandlers._done = true;

    acceptBtn = box.querySelector('.cookie-accept');
    declineBtn = box.querySelector('.cookie-decline');

    acceptBtn && acceptBtn.addEventListener('click', function(e){
      e.stopPropagation();
      safeSet('accepted');
      // default allowed categories (you can change)
      loadAllowedScripts(['analytics','marketing','performance']);
      hideCookie();
    });

    declineBtn && declineBtn.addEventListener('click', function(e){
      e.stopPropagation();
      safeSet('rejected');
      hideCookie();
    });

    // clicks on the overlay should trigger visual hint (and not close anything)
    overlay && overlay.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      visualHint();
    });

    // capture any click in document: if overlay active, prevent action unless inside box
    document.addEventListener('click', function(e){
      if(!overlay) return;
      if(!overlay.hasAttribute('data-active')) return; // not blocking
      // allow clicks inside the box (buttons etc)
      if(e.target.closest && e.target.closest('#cookie-consent')) return;
      // otherwise prevent and hint
      e.preventDefault();
      e.stopPropagation();
      visualHint();
    }, true); // capture phase preempts other listeners

    // keyboard: trap focus to cookie box while overlay active
    document.addEventListener('keydown', function(e){
      if(!overlay || !overlay.hasAttribute('data-active')) return;
      if(e.key === 'Tab'){
        var focusable = box.querySelectorAll('button, [href], input, select, textarea');
        if(!focusable || focusable.length === 0){ e.preventDefault(); return; }
        var first = focusable[0], last = focusable[focusable.length-1];
        var active = document.activeElement;
        if(e.shiftKey && active === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && active === last){ e.preventDefault(); first.focus(); }
      }
      // enter outside box -> hint
      if(e.key === 'Enter' && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('#cookie-consent'))){
        e.preventDefault(); e.stopPropagation(); visualHint();
      }
    }, true);
  }

  // init on DOM ready
  function init(){
    if(!overlay || !box) {
      overlay = document.getElementById('cookie-overlay');
      box = document.getElementById('cookie-consent');
      content = box && box.querySelector('.cookie-consent__content');
    }
    var current = safeGet();
    if(current === 'accepted'){
      // already accepted -> load allowed scripts and do nothing visible
      loadAllowedScripts(['analytics','marketing','performance']);
      hideCookie();
      return;
    }
    if(current === 'rejected'){ hideCookie(); return; }
    // no decision -> show overlay + cookie box that blocks clicks
    showCookie();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
