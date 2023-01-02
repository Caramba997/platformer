(function() {
  const userData = window.ps.load('user')
  if (!userData) return;

  let highscores, levels;

  function getLevelName(id) {
    for (let i = 0; i < levels.length; i++) {
      if (levels[i]._id === id) return levels[i].name;
    }
    if (id.includes('level')) return id;
    return '???';
  }

  function showHighscores() {
    const level = document.querySelector('select[name="level"]').value,
          type = document.querySelector('select[name="type"]').value,
          table = document.querySelector('#highscores');

    table.querySelectorAll('tr.Score').forEach((score) => {
      score.remove();
    });

    if (level === 'none') return;

    for (let i = 0; i < highscores.length; i++) {
      if (highscores[i].level === level) {
        const scores = highscores[i][type];
        for (let k = 0; k < scores.length; k++) {
          const score = (type === 'points') ? `${scores[k].score} ${window.locales.getTranslation('points')}` : `${Math.floor(scores[k].score / 1000)}.${scores[k].score % 1000} s`;
          table.innerHTML += `<tr class="Score"><td>${k+1}</td><td>${scores[k].user}</td><td>${score}</td></tr>`;
        }
        break;
      }
    }
  }

  window.api.get('getAllHighscores', (result) => {
    highscores = result;
    window.api.get('getAllLevels', (result) => {
      levels = result;
      const levelSelector = document.querySelector('select[name="level"]'),
            typeSelector = document.querySelector('select[name="type"]');
      highscores.forEach((highscore) => {
        if (highscore.level.includes('level')) return;
        levelSelector.innerHTML += `<option value="${highscore.level}">${getLevelName(highscore.level, levels)}</option>`;
      });

      levelSelector.addEventListener('change', showHighscores);
      typeSelector.addEventListener('change', showHighscores);
    
      window.dispatchEvent(new CustomEvent('progress:executed'));
    }, (error) => {
      console.error(error);
      window.dispatchEvent(new CustomEvent('progress:executed'));
    });
  }, (error) => {
    console.error(error);
    window.dispatchEvent(new CustomEvent('progress:executed'));
  });
})();