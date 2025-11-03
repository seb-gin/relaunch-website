// © Jahr im Footer setzen
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});

/* === Avineo: Pillar Reveal (Jump → Pulse → Scroll) =================== */
document.addEventListener('DOMContentLoaded', () => {
  const cta = document.querySelector('[data-pillar-reveal]');
  const columns = document.getElementById('columns');
  if (!cta || !columns) return;

  const tiles = Array.from(columns.querySelectorAll('.tile'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Timings (ms)
  const LIFT_MS   = reduceMotion ? 0   : 800;  // Dauer des Sprungs
  const PULSE_MS  = reduceMotion ? 0   : 1200; // Dauer eines Pulses
  const PULSE_REP = reduceMotion ? 0   : 2;    // Wiederholungen

  function addOutlinePulse(){
    tiles.forEach(t => {
      t.classList.remove('pillar-cta-outline'); // reset für erneuten Klick
      // Reflow zum sicheren Neustart
      void t.offsetWidth;
      t.classList.add('pillar-cta-outline');
    });
  }

  function clearOutlinePulse(){
    tiles.forEach(t => t.classList.remove('pillar-cta-outline'));
  }

  function smoothScrollToColumns(){
    columns.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  cta.addEventListener('click', (e) => {
    // Wir behalten den href="#columns" für Accessibility, aber steuern die Sequenz selbst
    e.preventDefault();

    if (reduceMotion){
      // Barrierearm: kein Springen, nur kurzer vis. Hinweis + direkt scrollen
      addOutlinePulse();
      setTimeout(() => {
        smoothScrollToColumns();
        clearOutlinePulse();
      }, 300);
      return;
    }

    // 1) Säulen springen (verdecken kurzzeitig den Button)
    columns.classList.add('pillars-animate');

    // 2) Nach dem Sprung: Pulse-Outline anzeigen
    setTimeout(() => {
      columns.classList.remove('pillars-animate');
      addOutlinePulse();

      // 3) Nach den Puls-Loops: scrollen
      setTimeout(() => {
        smoothScrollToColumns();
        // Outline nach dem Scroll optional entfernen
        setTimeout(clearOutlinePulse, 800);
      }, PULSE_MS * PULSE_REP);

    }, LIFT_MS);
  });
});
