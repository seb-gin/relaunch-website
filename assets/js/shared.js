// shared.js – Navbar-Link, Switcher, Cookie, Rotate-Overlay (Blur)
// funktioniert lokal, auf GitHub Pages & Server

document.addEventListener('DOMContentLoaded', function () {
  // ==========================================
  // Jahr im Footer
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

  // ==========================================
  // Navbar Brand → Startseite
  const ROOT = window.location.pathname.includes('/relaunch-website/') ? '/relaunch-website/' : '/';
  document.querySelectorAll('a.navbar-brand').forEach(a => {
    const target = ROOT + 'index.html';
    a.href = target;
    a.rel = 'home';
    a.setAttribute('aria-label','Zur Startseite');
  });

  // ==========================================
  // Header Scroll-Opacity
  const hdr = document.querySelector('body > header');
  if (hdr){
    const toggleHeader = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    toggleHeader();
    window.addEventListener('scroll', toggleHeader, { passive: true });
  }

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


/* === Rotate-Blur Overlay (mobile portrait) === */
(function(){
  function ensureOverlay(){
    let overlay = document.getElementById('rotate-blur');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'rotate-blur';
    overlay.setAttribute('role','presentation');
    overlay.setAttribute('aria-hidden','true');
    overlay.style.display = 'none';

    const inner = document.createElement('div');
    inner.className = 'rotate-inner';

    const img = document.createElement('img');
    img.className = 'rotate-gif';
    img.alt = 'Bitte Gerät drehen';
    img.src = 'rotate.gif'; // gleiches Verzeichnis wie zuvor

    const text = document.createElement('div');
    text.className = 'rotate-text';
    text.textContent = 'Bitte Gerät ins Querformat drehen, um die Seite zu sehen.';

    inner.appendChild(img);
    inner.appendChild(text);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    return overlay;
  }

  const overlay = ensureOverlay();

  function isMobile(){
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function toggle(){
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    if (isMobile() && portrait){
      overlay.style.display = 'grid';
      requestAnimationFrame(()=> overlay.classList.add('is-active'));
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      overlay.classList.remove('is-active');
      setTimeout(()=>{
        overlay.style.display = 'none';
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      },200);
    }
  }

  document.addEventListener('DOMContentLoaded', toggle);
  window.addEventListener('resize', ()=>setTimeout(toggle,80));
  window.addEventListener('orientationchange', ()=>setTimeout(toggle,150));
  window.addEventListener('focus', ()=>setTimeout(toggle,120));
})()});