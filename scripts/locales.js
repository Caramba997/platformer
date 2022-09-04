const locales = {
  DE: {
    undefined: '???',
    fps: 'FPS',
    level: 'Level',
    time: 'Zeit',
    coins: 'Münzen',
    points: 'Punkte',
    selectLevel: 'Level wählen',
    save: 'Speichern',
    play: 'Spielen',
    newProp: 'Neues Objekt',
    outline: 'Explorer',
    world: 'Welt',
    meta: 'Meta',
    player: 'Spieler',
    finish: 'Ziel',
    props: 'Objekte',
    enemies: 'Gegner',
    chooseLevel: 'Wähle ein Level zum Bearbeiten',
    load: 'Laden',
    or: 'oder',
    new: 'Neu',
    createNewProp: 'Neues Objekt erstellen',
    staticProp: 'Statisches Objekt',
    movingProp: 'Bewegliches Objekt',
    block: 'Block',
    enemy: 'Gegner',
    coin: 'Münze',
    create: 'Erstellen',
    saveLevel: 'Level Speichern',
    copy: 'Kopieren',
    duplicate: 'Duplizieren',
    remove: 'Entfernen',
    place: 'Platzieren',
    editor: 'Editor',
    confirm: 'Bestätigen',
    backToStart: 'Zurück zum Hauptmenü',
    sureBackToStart: 'Bist du sicher dass du zum Hauptmenü zurückkehren möchtest? Nicht gespeicherte Fortschritte gehen verloren.',
    backToMainMenu: 'Möchtest du zum Hauptmenü zurückkehren?',
    mainMenu: 'Hauptmenü',
    completed: 'Abgeschlossen',
    gameOver: 'Game over',
    gameOverText: 'Möchtest du es erneut versuchen?',
    replay: 'Neustart',
    pause: 'Pause',
    levelComplete: 'Level geschafft',
    levelCompleteText: 'Herzlichen Glückwunsch, du hast das Level gemeistert!',
    centerPosition: 'Marker-Position',
    spawner: 'Spawner',
    thumbnail: 'Vorschaubild generieren',
    loading: 'Lade...',
    statusInit: 'Initialisierung',
    statusTextures: 'Lade Texturen',
    statusSounds: 'Lade Sounds',
    statusScripts: 'Lade Scripte',
    statusExecution: 'Scripts ausführen',
    statusLoaded: 'Laden erfolgreich',
    keepCenter: 'Marker-Position behalten'
  },
  EN: {
    undefined: '???',
    fps: 'FPS',
    level: 'Level',
    time: 'Time',
    coins: 'Coins',
    points: 'Points',
    selectLevel: 'Select level',
    save: 'Save',
    play: 'Play',
    newProp: 'New Prop',
    outline: 'Explorer',
    world: 'World',
    meta: 'Meta',
    player: 'Player',
    finish: 'Finish',
    props: 'Props',
    enemies: 'Enemies',
    chooseLevel: 'Choose a level to edit',
    load: 'Load',
    or: 'or',
    new: 'New',
    createNewProp: 'Create new prop',
    staticProp: 'Static Prop',
    movingProp: 'Moving Prop',
    block: 'Block',
    enemy: 'Enemy',
    coin: 'Coin',
    create: 'Create',
    saveLevel: 'Save level',
    copy: 'Copy',
    duplicate: 'Duplicate',
    remove: 'Remove',
    place: 'Place',
    editor: 'Editor',
    confirm: 'Confirm',
    backToStart: 'Back to main menu',
    sureBackToStart: 'Are you sure you want to return to main menu? Save your progress beforehand or it will be lost.',
    backToMainMenu: 'Do you want to return to main menu?',
    mainMenu: 'Main menu',
    completed: 'Completed',
    gameOver: 'Game over',
    gameOverText: 'You died. Do you want to try again?',
    replay: 'Play again',
    pause: 'Pause',
    levelComplete: 'Level complete',
    levelCompleteText: 'Congratulations, you finished the level!',
    centerPosition: 'Center position',
    spawner: 'Spawner',
    thumbnail: 'Create thumbnail',
    loading: 'Loading...',
    statusInit: 'Initialization',
    statusTextures: 'Loading textures',
    statusSounds: 'Loading sounds',
    statusScripts: 'Loading scripts',
    statusExecution: 'Executing scripts',
    statusLoaded: 'Loading successfull',
    keepCenter: 'Keep center position'
  }
}

class Locales {
  constructor() {
    this.locales = locales;
    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'DE');
    }
    this.language = localStorage.getItem('language');
    this.t = this.locales[this.language];
  }

  changeLanguage(language) {
    localStorage.setItem('language', language);
    this.language = language;
    this.t = this.locales[this.language];
  }

  translatePage(container) {
    container.querySelectorAll('[data-t]').forEach((element) => {
      element.innerText = this.getTranslation(element.getAttribute('data-t'));
    });
  }

  translateRaw(raw) {
    const shortcodes = raw.match(/{{\s*t:\w+\s*}}/g);
    let result = raw;
    if (shortcodes) {
      shortcodes.forEach((shortcode) => {
        const word = shortcode.replace(/{{\s*t:/, '').replace(/\s*}}/, '');
        result = result.replace(shortcode, this.getTranslation(word));
      });
    }
    return result;
  }

  getTranslation(word) {
    return this.t[word] ? this.t[word] : this.t['undefined'];
  }
}

window.locales = new Locales();