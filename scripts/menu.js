(function() {
  const levels = [ 'level1', 'level2', 'level3', 'level4' ];
  const levelHtml = `<a class="Level" data-href="game">
    <div class="Level__Content" data-name="{{name}}" data-complete="false" style="background-image: url(/images/{{name}}.png);">
      <div class="Level__Text">
        <div class="Level__Name"></div>
        <div class="Level__Complete" data-t="completed">{{t:completed}}</div>
      </div>
      <div class="Level__Text">
        <div class="Level__Stats--Points"><span data-t="points">{{t:points}}</span>: <span data-stats="points"></span></div>
        <div class="Level__Stats--Time"><span data-t="time">{{t:time}}</span>: <span data-stats="time"></span></div>
      </div>
    </div>
  </a>`;

  const levelContainer = document.querySelector('#levels'),
        storageProgress = window.ps.load('progress'),
        progress = storageProgress ? JSON.parse(storageProgress) : {};
  levels.forEach((level) => {
    levelContainer.innerHTML += window.locales.translateRaw(levelHtml.replaceAll('{{name}}', level));
  });
  levels.forEach((level) => {
    fetch('/levels/' + level + '.json')
    .then(raw => raw.json())
    .then((data) => {
      const levelElement = levelContainer.querySelector('[data-name="' + level + '"]');
      levelElement.querySelector('.Level__Name').innerText = data.meta.name;
      if (progress[level]) {
        levelElement.setAttribute('data-complete', 'true');
        levelElement.querySelector('[data-stats="points"]').innerText = progress[level].points;
        levelElement.querySelector('[data-stats="time"]').innerText = progress[level].time;
      }
      levelElement.closest('a').addEventListener('click', (e) => {
        let level;
        if (e.target.tagName === 'A') {
          level = e.target.querySelector('[data-name]').getAttribute('data-name');
        }
        else if (e.target.hasAttribute('data-name')) {
          level = e.target.getAttribute('data-name');
        }
        else {
          level = e.target.closest('[data-name]').getAttribute('data-name');
        }
        window.ps.save('level', level);
      });
    });
  });

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

  const user = window.ps.load('user');
  if (user && window.ps.getCookie(window.api.tokenCookieName) != '') {
    document.querySelector('a[data-href="profile"]').classList.remove('dn');
  }
  else {
    document.querySelector('a[data-href="login"]').classList.remove('dn');
  }
  window.dispatchEvent(new CustomEvent('progress:executed'));
})();