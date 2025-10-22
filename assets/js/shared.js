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

  // ==========================================
  // Switcher S2A <-> BSC (verkürzt)
  (function(){
    const sectionAttr = (document.body.getAttribute('data-section') || '').toLowerCase();
    const path = location.pathname.toLowerCase();
    const isS2A_root = path.endsWith('/s2a/') || path.endsWith('/s2a/index.html');
    const isBSC_root = path.endsWith('/bsc/') || path.endsWith('/bsc/index.html');
    const isS2A = sectionAttr === 'a' || sectionAttr === 's2a' || isS2A_root;
    const isBSC = sectionAttr === 'b' || sectionAttr === 'bsc' || isBSC_root;
    if (!(isS2A || isBSC)) return;

    const targetHref = ROOT + (isS2A ? 'bsc/index.html' : 's2a/index.html');
    const logoSrc    = ROOT + 'assets/img/main/' + (isS2A ? 'tile-b-logo.svg' : 'tile-a-logo.svg');
    const label      = isS2A ? 'Zu Bereich BSC' : 'Zu Bereich S2A';

    let sw = document.querySelector('.brand-switcher');
    if (!sw){
      sw = document.createElement('a');
      sw.className = 'brand-switcher ' + (isS2A ? 'switch--to-b' : 'switch--to-a');
      sw.href = targetHref;
      sw.title = label;
      const img = document.createElement('img');
      img.src = logoSrc;
      img.alt = label;
      sw.appendChild(img);
      document.querySelector('.navbar .container, .navbar .container-fluid')?.appendChild(sw);
    }
  })();
});

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
})();