(function() {
  const language = window.ps.load('language'),
        translatedElement = document.querySelector('[data-translation="' + language + '"]');
  if (translatedElement) translatedElement.classList.remove('dn');
  window.dispatchEvent(new CustomEvent('progress:executed'));
})();