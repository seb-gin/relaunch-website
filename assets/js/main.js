// © Jahr im Footer setzen
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});
