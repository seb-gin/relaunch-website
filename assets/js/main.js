// © Jahr im Footer setzen
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});

/* === Avineo: Pillar Reveal (Jump → Scroll → Pulse until click) ======= */
document.addEventListener('DOMContentLoaded', () => {
  const cta = document.querySelector('[data-pillar-reveal]');
  const columns = document.getElementById('columns');
  if (!cta || !columns) return;

  const tiles = Array.from(columns.querySelectorAll('.tile'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Timings (ms)
  const LIFT_MS = reduceMotion ? 0 : 1150; // Sprungdauer (CSS 1.15s)
  const AFTER_SCROLL_WAIT = reduceMotion ? 0 : 150; // kurze Layout-Stabi nach Scroll

  function startPulse() {
    tiles.forEach(t => {
      t.classList.remove('pillar-cta-outline'); // reset
      void t.offsetWidth; // Reflow zum Neustart
      t.classList.add('pillar-cta-outline');    // endlose Puls-Outline
    });
  }
  function stopPulse() {
    tiles.forEach(t => t.classList.remove('pillar-cta-outline'));
  }
  function smoothScrollToColumns() {
    columns.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  // Stoppe den Puls, sobald eine Säule geklickt wird
  tiles.forEach(t => {
    t.addEventListener('click', stopPulse, { passive: true });
  });

  cta.addEventListener('click', (e) => {
    e.preventDefault(); // wir steuern die Reihenfolge manuell

    if (reduceMotion){
      // Barrierearm: direkt scrollen, dann (statisch) hervorheben bis Klick
      smoothScrollToColumns();
      startPulse();
      return;
    }

    // 1) Säulen springen
    columns.classList.add('pillars-animate');

    // 2) Nach dem Sprung: sofort scrollen
    setTimeout(() => {
      columns.classList.remove('pillars-animate');
      smoothScrollToColumns();

      // 3) Nach kurzer Stabilisierung: Puls starten (läuft bis Klick)
      setTimeout(() => {
        startPulse();
      }, AFTER_SCROLL_WAIT);

    }, LIFT_MS);
  });
});
