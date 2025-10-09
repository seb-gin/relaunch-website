// © Jahr im Footer
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
});
