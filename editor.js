import { VALUES } from '/values.js';
import { EDITORHTML } from '/editorhtml.js';
import { EDITORVALUES } from '/editorvalues.js';
import { Prop, StaticProp, InteractableProp, MovingProp, Finish, Player, Enemy, Coin, Block, Item, Fire, World } from '/classes.js';
import { Graphics } from '/graphics.js';

class Editor {
  constructor() {
    this.initListeners();
    this.initControls();
    this.initLevelSelector();
  }

  initControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.game) return;
      const control = EDITORVALUES.controls[e.code];
      if (!this.game.running || !control || this.game.activeControls.has(control)) return;
      this.game.activeControls.add(control);
    });
    window.addEventListener('keyup', (e) => {
      if (!this.game) return;
      const control = EDITORVALUES.controls[e.code];
      if (!this.game.activeControls.has(control)) return;
      this.game.activeControls.delete(control);
    });
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
    function addProperty(property, value) {
      let type = EDITORVALUES.propertyTypes[property] || 'text';
      if (type === 'checkbox' && value) type += '" checked="checked"';
      const html = EDITORHTML.property.replaceAll('{{property}}', property).replaceAll('{{type}}', type).replaceAll('{{value}}', value);
      contentElement.innerHTML += html;
    }

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
        if (value instanceof Object) {
          for (let [subkey, subvalue] of Object.entries(value)) {
            if (!EDITORVALUES.skipProperties.includes(subkey)) addProperty(key + '.' + subkey, subvalue);
          }
        }
        else {
          if (!EDITORVALUES.skipProperties.includes(key)) addProperty(key, value);
        }
      }
      if (locationObject instanceof Array) {
        contentElement.innerHTML += EDITORHTML.removeProp;
        contentElement.querySelector('[data-action="remove-prop"]').addEventListener('click', this.removeProp.bind(this));
      }
    }
    else {
      if (id === 'world') {
        setProperty('id', 'world');
        setProperty('class', 'World');
        addProperty('width', this.game.world.width);
        addProperty('height', this.game.world.height);
      }
      else if (id === 'meta') {
        setProperty('id', 'meta');
        setProperty('class', 'World');
        addProperty('name', this.game.world.name);
        addProperty('time', this.game.world.time);
      }
    }
    contentElement.querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', this.updateProperty.bind(this));
    });
  }

  updateProperty(e) {
    const sidebarContent = e.target.closest('.Sidebar__Content'),
          location = sidebarContent.getAttribute('data-location'),
          id = sidebarContent.getAttribute('data-id'),
          property = e.target.name,
          type = e.target.type,
          value = type === 'checkbox' ? e.target.checked : type === 'number' ? parseInt(e.target.value) : e.target.value,
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
    prop[property] = value;
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
    const coinsOutline = outline.querySelector('[data-outline="coins"] .Outline__Item--Content');
    coinsOutline.innerHTML = '';
    for (let prop of world.coinProps) {
      addPropHeading(coinsOutline, 'coinProps', prop.id, prop.constructor.name);
    }
    outline.querySelectorAll('[data-action="show-properties"]').forEach((button) => {
      button.addEventListener('click', (e) => {
        const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
        this.initPropertiesView(button.getAttribute('data-location'), button.getAttribute('data-id'));
      });
    });
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
        playButton.href = playButton.getAttribute('data-href') + this.game.world.id;
        this.initOutline();
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
      document.querySelector('[data-data="level"]').innerText = 'New level';
      e.target.closest('.Popup').querySelector('[data-action="close-popup"]').click();
    });
    // Save level
    document.querySelector('[data-control="save"]').addEventListener('click', () => {
      const levelData = JSON.stringify(this.createLevelJson());
      document.querySelector('[data-text="level"]').innerText = levelData;
    });
    // Copy level data
    document.querySelector('[data-action="copy-level"]').addEventListener('click', () => {
      const levelData = JSON.stringify(this.createLevelJson());
      navigator.clipboard.writeText(levelData);
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
      const select = document.querySelector('select[name="level"]');
      this.createProp(select.value);
    });
  }

  createProp(type) {
    const outline = document.querySelector('.Outline');
    // TODO

    // switch (type) {
    //   case 'prop': {
    //     const defaults = EDITORVALUES.propDefaults.prop;
    //     const id = defaults.type + Date.now();
    //     const prop = new StaticProp(id, defaults.x, defaults.y, defaults.width, defaults.height, defaults.type, defaults.solid, defaults.ground);
    //     this.game.world.props.push(prop);
    //     const propsOutline = outline.querySelector('[data-outline="props"] .Outline__Item--Content');
    //     const html = EDITORHTML.outlineProp.replaceAll('{{location}}', props).replaceAll('{{id}}', id).replaceAll('{{class}}', propClass);
    //     element.innerHTML += html;
    //     break;
    //   }
    // }
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
          view = this.game.world.view,
          x = view.width / canvasRect.width * clickX + view.x,
          y = view.height - (view.height / canvasRect.height * clickY) + view.y,
          prop = checkPointInProps(this.game, x, y),
          outline = document.querySelector('.Outline');
    if (!prop) return;
    const propButton = outline.querySelector('[data-id="' + prop.id + '"]'),
          outlineItem = propButton.closest('.Outline__Item'),
          outlineButton = outlineItem.querySelector('.Button--Outline');
    if (outlineItem.getAttribute('data-expanded') === 'false') outlineButton.click();
    propButton.scrollIntoView();
    propButton.click();
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
        time: world.time
      },
      world: {
        width: world.width,
        height: world.height
      },
      player: {
        x: world.player.x,
        y: world.player.y
      },
      finish: {
        x: world.finish.x,
        y: world.finish.y
      },
      staticProps: [],
      coins: [],
      enemies: []
    }
    for (let prop of world.props) {
      const propJson = { id: prop.id, class: prop.constructor.name };
      for (let [key, value] of Object.entries(prop)) {
        if (!EDITORVALUES.skipProperties.includes(key)) {
          propJson[key] = value;
        }
      }
      this.levelJson.staticProps.push(propJson);
    }
    for (let prop of world.enemies) {
      const propJson = { id: prop.id };
      for (let [key, value] of Object.entries(prop)) {
        if (!EDITORVALUES.skipProperties.includes(key)) {
          propJson[key] = value;
        }
      }
      this.levelJson.enemies.push(propJson);
    }
    for (let prop of world.coinProps) {
      const propJson = { id: prop.id, class: prop.constructor.name };
      for (let [key, value] of Object.entries(prop)) {
        if (!EDITORVALUES.skipProperties.includes(key)) {
          propJson[key] = value;
        }
      }
      this.levelJson.coins.push(propJson);
    }
    return this.levelJson;
  }
}

class Game {
  constructor(level) {
    this.graphics = new Graphics();
    this.loadLevel(level);
    this.activeControls = new Set();
  }

  loadLevel(level) {
    window.addEventListener('world:loaded', () => {
      this.setCenter(this.world.player);
      this.start();
    }, { once: true });
    this.world = new World(level);
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
    this.center = { ...prop};
    this.offset = { x: 0, y: 0 };
    this.center.type = 'default';
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
    }
    if (this.activeControls.has('left')) {
      this.offset = {
        x: this.offset.x - this.deltaTime * speed,
        y: this.offset.y
      }
    }
    if (this.activeControls.has('up')) {
      this.offset = {
        x: this.offset.x,
        y: this.offset.y + this.deltaTime * speed
      }
    }
    if (this.activeControls.has('down')) {
      this.offset = {
        x: this.offset.x,
        y: this.offset.y - this.deltaTime * speed
      }
    }
    if (this.center.x + this.offset.x < 0) this.offset.x = -this.center.x;
    if (this.center.x + this.offset.x > this.world.width) this.offset.x = this.world.width - this.center.x;
    if (this.center.y + this.offset.y < 0) this.offset.y = -this.center.y;
    if (this.center.y + this.offset.y > this.world.height) this.offset.y = this.world.height - this.center.y;

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
    graphics.drawProp(this.center);
    graphics.drawProp({
      x: this.center.x + this.offset.x,
      y: this.center.y + this.offset.y,
      width: 10,
      height: 10,
      type: 'default'
    })
  }
}

window.editor = new Editor();