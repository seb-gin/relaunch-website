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

  // -----------------------
  // DYNAMISCHE ROOT-ERKENNUNG
  // -----------------------
  var ROOT = (function() {
    try {
      var path = window.location.pathname; // z. B. /projektname/s2a/index.html
      var parts = path.split('/').filter(Boolean);
      // Wenn dein Projekt in einem Unterordner liegt (z. B. GitHub Pages)
      if (parts.length > 1) {
        return '/' + parts[0] + '/';
      }
    } catch(e){}
    return '/';
  })();

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
  })();
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
