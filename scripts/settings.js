(function() {
  const soundButton = document.querySelector('[data-action="toggle-sound"]');
  if (window.ps.load('sounds')) soundButton.setAttribute('data-sounds', window.ps.load('sounds'));
  soundButton.addEventListener('click', (e) => {
    if (e.target.getAttribute('data-sounds') === 'on') {
      window.ps.save('sounds', 'off');
      e.target.setAttribute('data-sounds', 'off');
    }
    else {
      window.ps.save('sounds', 'on');
      e.target.setAttribute('data-sounds', 'on');
    }
  });

  const languageSelector = document.querySelector('select[name="language"]');
  if (window.ps.load('language') !== languageSelector.value) {
    languageSelector.value = window.ps.load('language');
  }
  languageSelector.addEventListener('change', (e) => {
    if (e.target.value !== window.ps.load('language')) {
      window.locales.changeLanguage(e.target.value);
      window.locales.translatePage(document);
    }
  });

  const countdownButton = document.querySelector('[data-action="toggle-countdown"]');
  if (window.ps.load('countdown')) countdownButton.checked = (window.ps.load('countdown') === 'true') ? true : false;
  countdownButton.addEventListener('click', (e) => {
    if (e.target.checked) {
      window.ps.save('countdown', 'true');
    }
    else {
      window.ps.save('countdown', 'false');
    }
  });

  window.dispatchEvent(new CustomEvent('progress:executed'));
})();