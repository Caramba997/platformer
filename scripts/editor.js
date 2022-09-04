import { EDITORHTML } from './editorhtml.js';
import { EDITORVALUES } from './editorvalues.js';
import { VALUES } from './values.js';
import { Prop, StaticProp, InteractableProp, MovingProp, Spawner, Finish, Player, Enemy, Coin, Block, Item, Fire, World } from './classes.js';
import { Graphics } from './graphics.js';

export class Editor {
  constructor() {
    this._keyDownListener = this.keyDownListener.bind(this);
    this._keyUpListener = this.keyUpListener.bind(this);
    this.initListeners();
    this.initControls();
    this.initLevelSelector();
    window.dispatchEvent(new CustomEvent('progress:executed'));
  }

  unload() {
    if(this.game) this.game.stop();
    window.removeEventListener('keydown', this._keyDownListener);
    window.removeEventListener('keyup', this._keyUpListener);
  }

  initControls() {
    window.addEventListener('keydown', this._keyDownListener);
    window.addEventListener('keyup', this._keyUpListener);
  }

  keyDownListener(e) {
    if (!this.game || ['INPUT', 'SELECT'].includes(document.activeElement.tagName)) return;
    const control = EDITORVALUES.controls[e.code];
    if (!this.game.running || !control || this.game.activeControls.has(control)) return;
    this.game.activeControls.add(control);
  }

  keyUpListener(e) {
    if (!this.game) return;
    const control = EDITORVALUES.controls[e.code];
    if (!this.game.activeControls.has(control)) return;
    this.game.activeControls.delete(control);
  }

  initPropertiesView(location, id) {
    const propertiesElement = document.querySelector('.Properties .Sidebar__Content'),
          contentElement = propertiesElement.querySelector('.Sidebar__Content--Content');
    function setProperty(property, value) {
      const element = propertiesElement.querySelector('[data-property="' + property + '"]');
      if (element.tagName === 'INPUT') {
        element.value = value;
      }
      else {
        element.innerText = value;
      }
    }
    let thisProp;
    function addProperty(property, value) {
      let type = EDITORVALUES.propertyTypes[property] || 'text';
      if (type === 'checkbox' && value) type += '" checked="checked';
      if (type === 'number' && ['bounceFactor', 'speedFactor', 'speedFactorX', 'speedFactorY'].includes(property)) {
        type += '" step="0.1';
      }
      else if (type === 'number') {
        type += '" step="50';
      }
      let html;
      if (type === 'select') {
        html = EDITORHTML.propertySelect.replaceAll('{{property}}', property);
        let options;
        switch (thisProp.constructor.name) {
          case 'Enemy': {
            options = EDITORVALUES.enemyTypes;
            break;
          }
          case 'Block': {
            options = property === 'type' ? EDITORVALUES.blockTypes : EDITORVALUES.blockItemTypes;
            break;
          }
          case 'Coin': {
            options = EDITORVALUES.coinTypes;
            break;
          }
          case 'World': {
            options = property === 'background' ? EDITORVALUES.backgroundTypes : EDITORVALUES.musicTypes;
            break;
          }
          case 'Player': {
            options = EDITORVALUES.playerStates;
            break;
          }
          case 'Finish': {
            options = EDITORVALUES.finishTypes;
            break;
          }
          case 'Spawner': {
            options = EDITORVALUES.spawnerTypes;
            break;
          }
          default: {
            options = EDITORVALUES.propTypes;
            break;
          }
        }
        let optionsHtml = '';
        options.forEach((option) => {
          const optionValue = option === value ? option + '" selected="selected' : option;
          optionsHtml += EDITORHTML.propertyOption.replaceAll('{{value}}', optionValue).replaceAll('{{text}}', option);
        });
        html = html.replaceAll('{{options}}', optionsHtml);
      }
      else {
        html = EDITORHTML.property.replaceAll('{{property}}', property).replaceAll('{{type}}', type).replaceAll('{{value}}', value);
      }
      contentElement.innerHTML += html;
    }
    addProperty.bind(this);

    propertiesElement.setAttribute('data-location', location);
    propertiesElement.setAttribute('data-id', id);

    contentElement.innerHTML = '';
    const locationObject = location ? this.game.world[location] : this.game.world;
    let prop;
    if (locationObject instanceof Array) {
      for (let item of locationObject) {
        if (item.id === id) {
          prop = item;
          break;
        }
      }
    }
    else {
      prop = locationObject[id];
    }
    if (prop) {
      this.prop = prop;
      thisProp = prop;
      this.game.setCenter(prop);
      if (location) {
        setProperty('id', id);
        setProperty('class', prop.constructor.name);
      }
      else {
        setProperty('id', id);
        setProperty('class', 'World');
      }
      for (let [key, value] of Object.entries(prop)) {
        if (EDITORVALUES.skipProperties.default.includes(key) || (EDITORVALUES.skipProperties[prop.constructor.name] && EDITORVALUES.skipProperties[prop.constructor.name].includes(key))) continue;
        if (value instanceof Object) {
          for (let [subkey, subvalue] of Object.entries(value)) {
            if (!(EDITORVALUES.skipProperties.default.includes(subkey) || (EDITORVALUES.skipProperties[prop.constructor.name] && EDITORVALUES.skipProperties[prop.constructor.name].includes(subkey)))) addProperty(key + '.' + subkey, subvalue);
          }
        }
        else {
          addProperty(key, value);
        }
      }
      if (locationObject instanceof Array) {
        contentElement.innerHTML += window.locales.translateRaw(EDITORHTML.propActions);
        contentElement.querySelector('[data-action="remove-prop"]').addEventListener('click', this.removeProp.bind(this));
        contentElement.querySelector('[data-action="duplicate-prop"]').addEventListener('click', this.duplicateProp.bind(this));
        this.placeButton = contentElement.querySelector('[data-action="place-prop"]');
        this.placeButton.addEventListener('click', () => {
          const active = this.placeButton.getAttribute('data-active') === 'true' ? 'false' : 'true';
          this.placeButton.setAttribute('data-active', active);
        });
      }
    }
    else if (id === 'meta') {
      this.prop = this.game.world;
      thisProp = this.prop;
      setProperty('id', 'meta');
      setProperty('class', 'World');
      addProperty('name', this.game.world.name);
      addProperty('time', this.game.world.time);
      addProperty('background', this.game.world.background);
      addProperty('music', this.game.world.music);
      addProperty('width', this.game.world.width);
      addProperty('height', this.game.world.height);
    }
    contentElement.querySelectorAll('input, select').forEach((input) => {
      input.addEventListener('change', this.updateProperty.bind(this));
    });
  }

  duplicateProp(e) {
    const sidebarContent = e.target.closest('.Sidebar__Content'),
          location = sidebarContent.getAttribute('data-location'),
          locationObject = location ? this.game.world[location] : this.game.world,
          clone = Object.assign(Object.create(Object.getPrototypeOf(this.prop)), this.prop);
    clone.x += 50;
    clone.id = clone.type + Date.now();
    locationObject.push(clone);
    const propsOutline = document.querySelector('.Outline [data-outline="' + location + '"] .Outline__Item--Content'),
          html = EDITORHTML.outlineProp.replaceAll('{{location}}', location).replaceAll('{{id}}', clone.id).replaceAll('{{class}}', clone.constructor.name);
    const temp = document.createElement('DIV');
    temp.innerHTML = html;
    temp.firstChild.addEventListener('click', this.outlinePropClickListener.bind(this));
    propsOutline.appendChild(temp.firstChild);
    this.selectPropInOutline(clone.id);
  }

  updateProperty(e) {
    const sidebarContent = e.target.closest('.Sidebar__Content'),
          location = sidebarContent.getAttribute('data-location'),
          id = sidebarContent.getAttribute('data-id'),
          property = e.target.name,
          type = e.target.type,
          value = type === 'checkbox' ? e.target.checked : type === 'number' && e.target.step.includes('.') ? parseFloat(e.target.value) : type === 'number' ? parseInt(e.target.value) : e.target.value,
          locationObject = location ? this.game.world[location] : this.game.world;
    if (!this.checkValueValidity(value, type)) return;
    let prop;
    if (locationObject instanceof Array) {
      for (let item of locationObject) {
        if (item.id === id) {
          prop = item;
          break;
        }
      }
    }
    else {
      prop = locationObject[id];
    }
    if (!prop) {
      prop = locationObject;
    }
    let locationFixed, propertyFixed;
    if (property.includes('.')) {
      const arr = property.split('.');
      locationFixed = prop;
      for (let i = 0; i < arr.length - 1; i++) {
        locationFixed = locationFixed[arr[i]];
      }
      propertyFixed = arr[arr.length - 1];
    }
    else {
      locationFixed = prop;
      propertyFixed = property;
    }
    locationFixed[propertyFixed] = value;
    if (id === 'player' && property === 'state') {
      locationFixed.width = value === VALUES.playerStates.normal ? VALUES.playerWidth : VALUES.playerWidthSuper;
      locationFixed.height = value === VALUES.playerStates.normal ? VALUES.playerHeight : VALUES.playerHeightSuper;
    }
    else if (property === 'initialForward') {
      locationFixed.forward = value;
    }
    else if (property === 'id') {
      const outlineButton = document.querySelector('[data-action="show-properties"][data-id="' + id + '"]');
      outlineButton.querySelector('span:first-of-type').innerText = value;
      outlineButton.setAttribute('data-id', value);
      sidebarContent.setAttribute('data-id', value);
    }
    if (prop !== this.game.world) this.game.setCenter(prop);
  }

  removeProp(e) {
    const sidebarContent = e.target.closest('.Sidebar__Content'),
          outline = document.querySelector('.Outline'),
          location = sidebarContent.getAttribute('data-location'),
          id = sidebarContent.getAttribute('data-id'),
          locationObject = this.game.world[location];
    for (let i = locationObject.length -1; i >= 0; i--) {
      const item = locationObject[i];
      if (item.id === id) {
        locationObject.splice(i, 1);
        break;
      }
    }
    sidebarContent.querySelector('.Sidebar__Content--Content').innerHTML = '';
    outline.querySelector('[data-id="' + id + '"]').remove();
  }

  checkValueValidity(value, type) {
    if (type === 'text' && value === '') return false;
    if (type === 'number' && value === NaN) return false;
    return true;
  }

  initOutline() {
    const outline = document.querySelector('.Outline'),
          world = this.game.world;
    function addPropHeading(element, location, id, propClass) {
      const html = EDITORHTML.outlineProp.replaceAll('{{location}}', location).replaceAll('{{id}}', id).replaceAll('{{class}}', propClass);
      element.innerHTML += html;
    }

    const propsOutline = outline.querySelector('[data-outline="props"] .Outline__Item--Content');
    propsOutline.innerHTML = '';
    for (let prop of world.props) {
      addPropHeading(propsOutline, 'props', prop.id, prop.constructor.name);
    }
    const enemiesOutline = outline.querySelector('[data-outline="enemies"] .Outline__Item--Content');
    enemiesOutline.innerHTML = '';
    for (let prop of world.enemies) {
      addPropHeading(enemiesOutline, 'enemies', prop.id, prop.constructor.name);
    }
    const coinsOutline = outline.querySelector('[data-outline="coinProps"] .Outline__Item--Content');
    coinsOutline.innerHTML = '';
    for (let prop of world.coinProps) {
      addPropHeading(coinsOutline, 'coinProps', prop.id, prop.constructor.name);
    }
    outline.querySelectorAll('[data-action="show-properties"]').forEach((button) => {
      button.addEventListener('click', this.outlinePropClickListener.bind(this));
    });
  }

  selectPropInOutline(id) {
    const outlineButton = document.querySelector('.Outline [data-id="' + id + '"]'),
          outlineContainer = outlineButton.closest('.Outline__Item');
    if (outlineContainer.getAttribute('data-expanded') === 'false') outlineContainer.querySelector('.Button--Outline').click();
    outlineButton.scrollIntoView();
    outlineButton.click();
  }

  outlinePropClickListener(e) {
    const activeButton = document.querySelector('.Outline button[data-active="true"]');
    if (activeButton) activeButton.removeAttribute('data-active');
    const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
    button.setAttribute('data-active', 'true');
    this.initPropertiesView(button.getAttribute('data-location'), button.getAttribute('data-id'));
  }

  initListeners() {
    // Sidebar toggles
    document.querySelectorAll('[data-action="toggle-sidebar"]').forEach((opener) => {
      opener.addEventListener('click', (e) => {
        const sidebar = e.target.closest('.Sidebar'),
              newExpanded = sidebar.getAttribute('data-expanded') === 'true' ? false : true;
              sidebar.setAttribute('data-expanded', newExpanded);
      });
    });
    // Popup openers
    document.querySelectorAll('[data-action="open-popup"]').forEach((opener) => {
      opener.addEventListener('click', (e) => {
        const popup = document.querySelector('[data-popup="' + e.target.getAttribute('data-control') + '"]'),
              overlay = document.querySelector('.PageOverlay');
        popup.setAttribute('data-visible', true);
        overlay.setAttribute('data-visible', true);
      });
    });
    // Popup closers
    document.querySelectorAll('[data-action="close-popup"]').forEach((opener) => {
      opener.addEventListener('click', (e) => {
        const popup = e.target.closest('.Popup'),
              overlay = document.querySelector('.PageOverlay');
        popup.setAttribute('data-visible', false);
        overlay.setAttribute('data-visible', false);
      });
    });
    // Load level
    document.querySelector('[data-action="load-level"]').addEventListener('click', (e) => {
      const select = document.querySelector('select[name="level"]');
      if (select.value === 'none') return;
      if (this.game) {
        this.game.stop();
      }
      window.addEventListener('world:loaded', () => {
        const playButton = document.querySelector('a[data-action="play"]');
        playButton.href = '?page=game&level=' + this.game.world.id;
        this.initOutline();
        this.selectPropInOutline('player');
      }, { once: true });
      this.game = new Game(select.value);
      document.querySelector('[data-data="level"]').innerText = select.value;
      e.target.closest('.Popup').querySelector('[data-action="close-popup"]').click();
    });
    // New level
    document.querySelector('[data-action="new-level"]').addEventListener('click', (e) => {
      if (this.game) {
        this.game.stop();
      }
      this.game = new Game(null);
      this.selectPropInOutline('player');
      document.querySelector('[data-data="level"]').innerText = 'New level';
      e.target.closest('.Popup').querySelector('[data-action="close-popup"]').click();
      const playButton = document.querySelector('a[data-action="play"]');
      playButton.href = '?page=game&level=' + this.game.world.id;
      this.initOutline();
    });
    // Save level
    document.querySelector('[data-control="save"]').addEventListener('click', () => {
      const levelData = JSON.stringify(this.createLevelJson());
      document.querySelector('[data-text="level"]').value = levelData;
    });
    // Copy level data
    document.querySelector('[data-action="copy-level"]').addEventListener('click', (e) => {
      const levelData = JSON.stringify(this.createLevelJson()),
            button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
      button.classList.add('loading');
      button.disabled = 'disabled';
      navigator.clipboard.writeText(levelData).then(() => {
        setTimeout(() => {
          button.classList.remove('loading');
          button.disabled = '';
        }, 500);
      });
    });
    // Create level thumbnail
    document.querySelector('[data-action="create-thumbnail"]').addEventListener('click', () => {
      const downloadButton = document.querySelector('#download-thumbnail');
      this.game.pictureMode = true;
      this.game.render();
      downloadButton.href = this.game.graphics.canvas.toDataURL('png');
      downloadButton.download = this.game.world.id + '.png';
      downloadButton.click();
      this.game.pictureMode = false;
    });
    // Outline toggles
    document.querySelectorAll('.Button--Outline').forEach((button) => {
      button.addEventListener('click', (e) => {
        const closestItem = e.target.closest('.Outline__Item');
        if (closestItem.getAttribute('data-expanded') === 'true') {
          closestItem.setAttribute('data-expanded', false);
        }
        else {
          e.target.closest('.Sidebar__Content--Content').querySelectorAll('.Outline__Item').forEach((item) => {
            item.setAttribute('data-expanded', false);
          });
          closestItem.setAttribute('data-expanded', true);
        }
      });
    });
    // Prop selector
    document.querySelector('#canvas').addEventListener('click', (e) => {
      this.selectProp(e);
    });
    // Create new prop
    document.querySelector('[data-action="create-prop"]').addEventListener('click', (e) => {
      const select = document.querySelector('select[name="prop"]');
      this.createProp(select.value);
      e.target.closest('.Popup').querySelector('[data-action="close-popup"]').click();
    });
    document.querySelector('.Sidebar__Content--Header input[name="id"]').addEventListener('change', this.updateProperty.bind(this));
    // Center position updates
    document.querySelectorAll('input[name^="center"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        if (e.target.name === 'centerX') {
          this.game.offset.x = e.target.value - this.game.center.x;
        }
        else if (e.target.name === 'centerY') {
          this.game.offset.y = e.target.value - this.game.center.y;
        }
      });
    });
    // Keep center checkbox
    document.querySelector('[name="keepCenter"]').addEventListener('change', (e) => {
      this.game.keepCenter = e.target.checked ? true : false;
    });
  }

  createProp(type) {
    const outline = document.querySelector('.Outline'),
          defaults = EDITORVALUES.propDefaults[type],
          id = type + Date.now();
    let propsOutline, html, prop;

    switch (type) {
      case 'staticprop': {
        prop = new StaticProp(id, defaults.x, defaults.y, defaults.width, defaults.height, defaults.type, defaults.solid, defaults.ground, defaults.bounce, defaults.bounceFactor);
        this.game.world.props.push(prop);
        propsOutline = outline.querySelector('[data-outline="props"] .Outline__Item--Content');
        html = EDITORHTML.outlineProp.replaceAll('{{location}}', 'props').replaceAll('{{id}}', id).replaceAll('{{class}}', 'StaticProp');
        break;
      }
      case 'movingprop': {
        prop = new MovingProp(id, defaults.x, defaults.y, defaults.width, defaults.height, defaults.type, defaults.solid, defaults.ground, defaults.bounce, defaults.bounceFactor, defaults.speedFactorX, defaults.speedFactorY, defaults.endX, defaults.endY);
        this.game.world.props.push(prop);
        propsOutline = outline.querySelector('[data-outline="props"] .Outline__Item--Content');
        html = EDITORHTML.outlineProp.replaceAll('{{location}}', 'props').replaceAll('{{id}}', id).replaceAll('{{class}}', 'MovingProp');
        break;
      }
      case 'block': {
        prop = new Block(id, defaults.x, defaults.y, defaults.type, defaults.breakable, defaults.hasCoin, defaults.invisible, defaults.item);
        this.game.world.props.push(prop);
        propsOutline = outline.querySelector('[data-outline="props"] .Outline__Item--Content');
        html = EDITORHTML.outlineProp.replaceAll('{{location}}', 'props').replaceAll('{{id}}', id).replaceAll('{{class}}', 'Block');
        break;
      }
      case 'enemy': {
        prop = new Enemy(id, defaults.x, defaults.y, defaults.width, defaults.height, defaults.hitx, defaults.hity, defaults.hitwidth, defaults.hitheight, defaults.type, defaults.invincible, defaults.jumpable, defaults.moving, defaults.initialForward, defaults.speedFactor, defaults.stayOnGround, defaults.physics, defaults.removeOnCollision);
        this.game.world.enemies.push(prop);
        propsOutline = outline.querySelector('[data-outline="enemies"] .Outline__Item--Content');
        html = EDITORHTML.outlineProp.replaceAll('{{location}}', 'enemies').replaceAll('{{id}}', id).replaceAll('{{class}}', 'Enemy');
        break;
      }
      case 'coin': {
        prop = new Coin(id, defaults.x, defaults.y);
        this.game.world.coinProps.push(prop);
        propsOutline = outline.querySelector('[data-outline="coinProps"] .Outline__Item--Content');
        html = EDITORHTML.outlineProp.replaceAll('{{location}}', 'coinProps').replaceAll('{{id}}', id).replaceAll('{{class}}', 'Coin');
        break;
      }
      case 'spawner': {
        prop = new Spawner(id, defaults.x, defaults.y, defaults.width, defaults.height, defaults.type, defaults.solid, defaults.ground, defaults.speedFactor, defaults.forward, defaults.spawnRate);
        this.game.world.props.push(prop);
        propsOutline = outline.querySelector('[data-outline="props"] .Outline__Item--Content');
        html = EDITORHTML.outlineProp.replaceAll('{{location}}', 'props').replaceAll('{{id}}', id).replaceAll('{{class}}', 'Spawner');
        break;
      }
    }
    prop.x = Math.ceil(this.game.center.x + this.game.offset.x);
    prop.x = prop.x - prop.x % 50;
    prop.y = Math.ceil(this.game.center.y + this.game.offset.y);
    prop.y = prop.y - prop.y % 50;
    const temp = document.createElement('DIV');
    temp.innerHTML = html;
    temp.firstChild.addEventListener('click', this.outlinePropClickListener.bind(this));
    propsOutline.appendChild(temp.firstChild);
    this.selectPropInOutline(id);
  }

  selectProp(e) {
    if (!this.game) return;

    function checkPointInProp(x, y, prop) {
      return x >= prop.x && x <= prop.x + prop.width && y >= prop.y && y <= prop.y + prop.height;
    }
    function checkPointInProps(game, x, y) {
      if (checkPointInProp(x, y, world.player)) {
        return world.player;
      }
      if (checkPointInProp(x, y, world.finish)) {
        return world.finish;
      }
      for (let prop of world.enemies) {
        if (prop.id === game.center.id) continue;
        if (checkPointInProp(x, y, prop)) {
          return prop;
        }
      }
      for (let prop of world.coinProps) {
        if (prop.id === game.center.id) continue;
        if (checkPointInProp(x, y, prop)) {
          return prop;
        }
      }
      for (let prop of world.props) {
        if (prop.id === game.center.id) continue;
        if (checkPointInProp(x, y, prop)) {
          return prop;
        }
      }
    }
    const canvas = document.querySelector('#canvas'),
          canvasRect = canvas.getBoundingClientRect(),
          clickX = e.offsetX,
          clickY = e.offsetY,
          world = this.game.world,
          view = world.view,
          x = Math.ceil(view.width / canvasRect.width * clickX + view.x),
          y = Math.ceil(view.height - (view.height / canvasRect.height * clickY) + view.y);
    if (this.placeButton && this.placeButton.getAttribute('data-active') === 'true') {
      const propertiesElement = this.placeButton.closest('.Properties');
      this.prop.x = x - x % 10;
      this.prop.y = y - y % 10;
      propertiesElement.querySelector('[name="x"]').value = x - x % 10;
      propertiesElement.querySelector('[name="y"]').value = y - y % 10;
      this.game.setCenter(this.prop);
    }
    else {
      const prop = checkPointInProps(this.game, x, y);
      if (!prop) return;
      this.selectPropInOutline(prop.id);
    }
  }

  initLevelSelector() {
    const select = document.querySelector('select[name="level"]');
    for (let level of EDITORVALUES.levels) {
      let html = EDITORHTML.leveloption;
      html = html.replaceAll('{{level}}', level);
      select.innerHTML += html;
    }
  }

  createLevelJson() {
    const world = this.game.world;
    this.levelJson = {
      meta: {
        name: world.name,
        time: world.time,
        background: world.background,
        music: world.music,
        width: world.width,
        height: world.height
      },
      player: {
        x: world.player.x,
        y: world.player.y,
        state: world.player.state
      },
      finish: {
        x: world.finish.x,
        y: world.finish.y
      },
      staticProps: [],
      coins: [],
      enemies: []
    }
    function convertProps(worldLocation, jsonLocation) {
      for (let prop of worldLocation) {
        const propJson = { id: prop.id, class: prop.constructor.name };
        for (let [key, value] of Object.entries(prop)) {
          if (!EDITORVALUES.skipProperties.default.includes(key)) {
            propJson[key] = value;
          }
        }
        jsonLocation.push(propJson);
      }
    }
    convertProps(world.props, this.levelJson.staticProps);
    convertProps(world.enemies, this.levelJson.enemies);
    convertProps(world.coinProps, this.levelJson.coins);
    return this.levelJson;
  }
}

class Game {
  constructor(level) {
    this.graphics = new Graphics();
    this.loadLevel(level);
    this.activeControls = new Set();
    this.pictureMode = false;
    this.keepCenter = false;
  }

  loadLevel(level) {
    if (level) {
      window.addEventListener('world:loaded', () => {
        this.setCenter(this.world.player);
        this.start();
        document.querySelector('input[name="centerX"]').setAttribute('max', this.world.width);
        document.querySelector('input[name="centerY"]').setAttribute('max', this.world.height);
      }, { once: true });
      this.world = new World(level);
    }
    else {
      this.world = new World(level);
      this.setCenter(this.world.player);
      this.start();
      document.querySelector('input[name="centerX"]').setAttribute('max', this.world.width);
      document.querySelector('input[name="centerY"]').setAttribute('max', this.world.height);
    }
    this.activeControls = new Set();
  }

  calcHitbox(prop) {
    return {
      id: prop.id,
      x: prop.x + prop.hitbox.x,
      y: prop.y + prop.hitbox.y,
      width: prop.hitbox.width,
      height: prop.hitbox.height,
      type: prop.type
    }
  }

  setCenter(prop) {
    if (this.keepCenter) {
      this.offset = { x: (this.center.x + this.offset.x) - prop.x, y: (this.center.y + this.offset.y) - prop.y };
    }
    else {
      this.offset = { x: 0, y: 0 };
    }
    this.center = { ...prop };
    this.center.type = 'default';
    this.refreshCenter();
  }

  start() {
    this.oldTime = window.performance.now();
    this.running = true;
    window.requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  processInput() {
    const speed = EDITORVALUES.moveSpeed;
    if (this.activeControls.has('right')) {
      this.offset = {
        x: this.offset.x + this.deltaTime * speed,
        y: this.offset.y
      }
      this.refreshCenter();
    }
    if (this.activeControls.has('left')) {
      this.offset = {
        x: this.offset.x - this.deltaTime * speed,
        y: this.offset.y
      }
      this.refreshCenter();
    }
    if (this.activeControls.has('up')) {
      this.offset = {
        x: this.offset.x,
        y: this.offset.y + this.deltaTime * speed
      }
      this.refreshCenter();
    }
    if (this.activeControls.has('down')) {
      this.offset = {
        x: this.offset.x,
        y: this.offset.y - this.deltaTime * speed
      }
      this.refreshCenter();
    }
    if (this.center.x + this.offset.x < 0) this.offset.x = -this.center.x;
    if (this.center.x + this.offset.x > this.world.width) this.offset.x = this.world.width - this.center.x;
    if (this.center.y + this.offset.y < 0) this.offset.y = -this.center.y;
    if (this.center.y + this.offset.y > this.world.height) this.offset.y = this.world.height - this.center.y;

  }

  refreshCenter() {
    document.querySelector('input[name="centerX"]').value = Math.ceil(this.center.x + this.offset.x);
    document.querySelector('input[name="centerY"]').value = Math.ceil(this.center.y + this.offset.y);
  }

  loop() {
    if (!this.running) return;
    this.newTime = window.performance.now();
    this.deltaTime = this.newTime - this.oldTime;
    this.oldTime = this.newTime;
    this.processInput();
    this.world.calcViewPosition({ x: this.center.x + this.offset.x, y: this.center.y + this.offset.y });
    this.render();
    window.requestAnimationFrame(this.loop.bind(this));
  }

  render() {
    const graphics = this.graphics;
    graphics.clear();
    graphics.setView(this.world.view);
    graphics.drawBackground(this.world);
    graphics.drawProp(this.world.finish);
    for (let prop of this.world.props) {
      graphics.drawProp(prop);
    }
    for (let coin of this.world.coinProps) {
      graphics.drawProp(this.calcHitbox(coin));
    }
    for (let enemy of this.world.enemies) {
      graphics.drawMoving(enemy);
    }
    graphics.drawMoving(this.world.player);
    if (!this.pictureMode) {
      graphics.drawProp(this.center);
      graphics.drawProp({
        x: this.center.x + this.offset.x,
        y: this.center.y + this.offset.y,
        width: 10,
        height: 10,
        type: 'default'
      });
    }
  }
}