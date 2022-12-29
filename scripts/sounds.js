export class Sounds {
  constructor() {
    if (!window.ps.load('sounds')) window.ps.save('sounds', 'on');
    this.on = window.ps.load('sounds') === 'on';
    this.sounds = {};
    document.querySelectorAll('#sounds audio').forEach((audio) => {
      this.sounds[audio.getAttribute('data-sound')] = audio;
    });
  }

  play(type) {
    if (!this.on) return;
    const sound = this.sounds[type];
    if (sound) {
      if (sound.paused) {
        const tryPlay = () => {
          sound.play().catch(() => {
            setTimeout(tryPlay, 200);
          });
        }
        tryPlay();
      }
      else {
        sound.currentTime = 0;
      }
    }
    else {
      console.warn('Unknown sound cannot be played', type);
    }
  }

  pause(type) {
    if (!this.on) return;
    const sound = this.sounds[type];
    if (sound) {
      if (!sound.paused) sound.pause();
    }
    else {
      console.warn('Unknown sound cannot be paused', type);
    }
  }

  stop(type) {
    if (!this.on) return;
    const sound = this.sounds[type];
    if (sound) {
      sound.currentTime = 0;
      if (!sound.paused) {
        sound.pause();
      }
    }
    else {
      console.warn('Unknown sound cannot be stopped', type);
    }
  }
}