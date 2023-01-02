(function() {
  const levels = [ 'level1', 'level2', 'level3', 'level4' ];
  const levelHtml = `<a class="Level" data-href="game">
    <div class="Level__Content" data-name="{{name}}" data-complete="false" style="background-image: url(/images/{{image}}.png);">
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
        userData = window.ps.load('user');
  let progress = null;
  if (userData) {
    const user = JSON.parse(userData);
    progress = JSON.parse(user.progress);
  }
  levels.forEach((level) => {
    levelContainer.innerHTML += window.locales.translateRaw(levelHtml.replaceAll('{{name}}', level).replaceAll('{{image}}', level));
  });
  levels.forEach((level) => {
    fetch('/levels/' + level + '.json')
    .then(raw => raw.json())
    .then((data) => {
      const levelElement = levelContainer.querySelector('[data-name="' + level + '"]');
      levelElement.querySelector('.Level__Name').innerText = data.meta.name;
      if (progress && progress[level]) {
        levelElement.setAttribute('data-complete', 'true');
        levelElement.querySelector('[data-stats="points"]').innerText = progress[level].points;
        levelElement.querySelector('[data-stats="time"]').innerText = window.formatter.formatTime(progress[level].time);
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

  if (window.ps.load('user')) {
    const createdLoadingSpinner = document.querySelector('[data-header="createdLevels"] .loading'),
          communityLoadingSpinner = document.querySelector('[data-header="communityLevels"] .loading');
    createdLoadingSpinner.classList.remove('dn');
    communityLoadingSpinner.classList.remove('dn');
    window.api.get('userAllLevels', (result) => {
      const { createdLevels, savedLevels } = result,
            createdContainer = document.querySelector('#created-levels'),
            savedContainer = document.querySelector('#saved-levels');
  
      createdLevels.forEach((level) => {
        createdContainer.innerHTML += window.locales.translateRaw(levelHtml.replaceAll('{{name}}', level._id).replaceAll('{{image}}', 'nothumbnail'));
      });
      createdLevels.forEach((level) => {
        const levelElement = createdContainer.querySelector('[data-name="' + level._id + '"]');
        if (level.thumbnail) levelElement.style.backgroundImage = `url(${level.thumbnail})`;
        if (level.name) levelElement.querySelector('.Level__Name').innerText = level.name;
        if (progress && progress[level._id]) {
          levelElement.setAttribute('data-complete', 'true');
          levelElement.querySelector('[data-stats="points"]').innerText = progress[level._id].points;
          levelElement.querySelector('[data-stats="time"]').innerText = window.formatter.formatTime(progress[level._id].time);
        }
        levelElement.closest('a').addEventListener('click', (e) => {
          let levelName;
          if (e.target.tagName === 'A') {
            levelName = e.target.querySelector('[data-name]').getAttribute('data-name');
          }
          else if (e.target.hasAttribute('data-name')) {
            levelName = e.target.getAttribute('data-name');
          }
          else {
            levelName = e.target.closest('[data-name]').getAttribute('data-name');
          }
          window.ps.save('level', levelName);
        });
      });
      createdLoadingSpinner.classList.add('dn');
      savedLevels.forEach((level) => {
        savedContainer.innerHTML += window.locales.translateRaw(levelHtml.replaceAll('{{name}}', level._id).replaceAll('{{image}}', 'nothumbnail'));
      });
      savedLevels.forEach((level) => {
        const levelElement = savedContainer.querySelector('[data-name="' + level._id + '"]');
        if (level.thumbnail) levelElement.style.backgroundImage = `url(${level.thumbnail})`;
        if (level.name) levelElement.querySelector('.Level__Name').innerHTML = `${level.name} <span class="Level__Author--Menu" data-t="by">${window.locales.getTranslation('by')} ${level.creator}</span>`;
        if (progress && progress[level._id]) {
          levelElement.setAttribute('data-complete', 'true');
          levelElement.querySelector('[data-stats="points"]').innerText = progress[level._id].points;
          levelElement.querySelector('[data-stats="time"]').innerText = window.formatter.formatTime(progress[level._id].time);
        }
        levelElement.closest('a').addEventListener('click', (e) => {
          let levelName;
          if (e.target.tagName === 'A') {
            levelName = e.target.querySelector('[data-name]').getAttribute('data-name');
          }
          else if (e.target.hasAttribute('data-name')) {
            levelName = e.target.getAttribute('data-name');
          }
          else {
            levelName = e.target.closest('[data-name]').getAttribute('data-name');
          }
          window.ps.save('level', levelName);
        });
      });
      communityLoadingSpinner.classList.add('dn');
      window.pwa.initLinks();
    }, (error) => {
      console.error(error);
      createdLoadingSpinner.classList.add('dn');
      communityLoadingSpinner.classList.add('dn');
    });
  }

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

  const fullscreenButton = document.querySelector('[data-action="toggle-fullscreen"]');
  if (window.ps.load('fullscreen')) fullscreenButton.setAttribute('data-fullscreen', window.ps.load('fullscreen'));
  fullscreenButton.addEventListener('click', (e) => {
    if (e.target.getAttribute('data-fullscreen') === 'on') {
      window.ps.save('fullscreen', 'off');
      e.target.setAttribute('data-fullscreen', 'off');
      window.pwa.toggleFullscreen(false);
    }
    else {
      window.ps.save('fullscreen', 'on');
      e.target.setAttribute('data-fullscreen', 'on');
      window.pwa.toggleFullscreen(true);
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

  if (userData && window.ps.getCookie(window.api.loginStatusCookie) != '') {
    document.querySelector('a[data-href="highscores"]').classList.remove('dn');
    document.querySelector('a[data-href="profile"]').classList.remove('dn');
    document.querySelector('a[data-href="editor"]').classList.remove('dn');
    document.querySelector('[data-t="browseLevels"]').classList.remove('dn');
  }
  else {
    document.querySelector('a[data-href="login"]').classList.remove('dn');
    document.querySelector('[data-t="loginForMoreLevels"]').classList.remove('dn');
  }
  window.dispatchEvent(new CustomEvent('progress:executed'));
})();