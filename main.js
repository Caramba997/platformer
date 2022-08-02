class Values {
  static blockSize = 50;
  static coinSize = 30;
  static controls = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'Space': 'jump',
    'KeyA': 'left',
    'KeyD': 'right',
    'KeyW': 'jump',
    'ShiftLeft': 'run'
  }
  static defaultColor = '#0000FF';
  static devMode = true;
  static finishGroundHeight = 50;
  static finishHeight = 400;
  static finishHitboxWidth = 10;
  static finishWidth = 100;
  static jumpTime = 300.0;
  static maxJumpHeight = 220.0;
  static maxPlayerRunSpeed = 1.0;
  static maxPlayerSpeedY = -1.3;
  static maxPlayerWalkSpeed = 0.6;
  static playerHeight = 100;
  static playerSpeedGrowthX = 0.002;
  static playerSpeedGrowthY = 0.1;
  static playerWidth = 50;
  static propDefault = 'default';
  static viewRatioX = 0.5;
  static viewRatioY = 0.4;
  static viewWidth = 1600;
  static viewHeight = 900;
}

class Prop {
  constructor(id, x, y, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class StaticProp extends Prop {
  constructor(id, x, y, width, height, type, solid, ground) {
    super(id, x, y, width, height);
    this.id = id;
    this.type = type;
    this.solid = solid;
    this.ground = ground;
  }
}

class InteractableProp extends Prop {
  constructor(id, x, y, width, height, hitx, hity, hitwidth, hitheight) {
    super(id, x, y, width, height);
    this.hitbox = {
      x: hitx,
      y: hity,
      width: hitwidth,
      height: hitheight
    };
  }
}

class Finish extends InteractableProp {
  constructor(x, y) {
    super('finish', x, y, Values.finishWidth, Values.finishHeight);
    this.hitbox = {
      x: x + ((Values.finishWidth - Values.finishHitboxWidth) / 2),
      y: y,
      width: Values.finishHitboxWidth,
      height: Values.finishHeight
    };
    this.type = 'finishflag';
  }
}

class Player extends Prop {
  constructor(x, y) {
    super('player', x, y, Values.playerWidth, Values.playerHeight);
    this.lastY = 0;
    this.speedX = 0.0;
    this.speedY = 0.0;
    this.grounded = false;
    this.ground = null;
    this.forward = true;
  }
}

class Coin extends InteractableProp {
  constructor(id, x, y) {
    super(id, x, y, Values.blockSize, Values.blockSize, x + (Values.blockSize - Values.coinSize) / 2, y + (Values.blockSize - Values.coinSize) / 2, Values.coinSize, Values.coinSize);
  }
}

class Block extends StaticProp {
  constructor(id, x, y, type, breakable, hasCoin) {
    super(id, x, y, Values.blockSize, Values.blockSize, type, true, true);
    this.breakable = breakable;
    this.hit = false;
    this.hasCoin = hasCoin;
  }
}

class World {
  constructor(level) {
    fetch(level + '.json')
    .then(result => result.json())
    .then((data) => {
      this.name = data.meta.name;
      this.width = data.world.width;
      this.height = data.world.height;
      this.props = [];
      for (let prop of data.staticProps) {
        const type = prop.type || Values.propDefault;
        if (prop.class === 'Block') {
          this.props.push(new Block(prop.id, prop.x, prop.y, type, prop.breakable, prop.hasCoin));
        }
        else {
          this.props.push(new StaticProp(prop.id, prop.x, prop.y, prop.width, prop.height, type, prop.solid, prop.ground));
        }
      }
      this.coins = [];
      for (let coin of data.coins) {
        this.coins.push(new Coin(coin.id, coin.x, coin.y));
      }
      this.finish = new Finish(data.finish.x, data.finish.y + Values.finishGroundHeight);
      this.props.push(new StaticProp('finishground', data.finish.x, data.finish.y, Values.finishWidth, Values.finishGroundHeight, 'finishground', true, true));
      this.player = new Player(data.player.x, data.player.y);
      this.view = {
        width: Values.viewWidth,
        height: Values.viewHeight
      };
      this.calcViewPosition();
      window.dispatchEvent(new CustomEvent('world:loaded'));
    });
  }

  calcViewPosition() {
    this.view.x = Math.max(0, Math.floor(this.player.x) - Values.viewRatioX * Values.viewWidth);
    this.view.y = Math.max(0, Math.floor(this.player.y) - Values.viewRatioY * Values.viewHeight);
  }
}

class Game {
  constructor() {
    this.graphics = new Graphics();
    this.stats = new Stats();
    this.calcJumpParameters();
    this.initControls();
    this.loadLevel(1);
  }

  calcJumpParameters() {
    const gradient = 2 * Values.maxJumpHeight / (Values.jumpTime * Values.jumpTime);
    this.playerInitialJumpSpeed = gradient * Values.jumpTime;
    this.playerSpeedShrinkY = gradient;
  }

  loadLevel(level) {
    this.world = new World("level" + level);
    this.coins = 0;
    this.activeControls = new Set();
    window.addEventListener('world:loaded', () => {
      this.stats.setLevel(this.world.name);
      this.stats.setCoins(0);
      this.start();
    }, { once: true });
  }

  processInput() {
    const player = this.world.player;
    let maxSpeedX = this.activeControls.has('run') ? Values.maxPlayerRunSpeed : Values.maxPlayerWalkSpeed;
    if (this.activeControls.has('right')) {
      if (player.speedX > maxSpeedX) maxSpeedX = player.speedX - this.deltaTime * Values.playerSpeedGrowthX;
      player.speedX = Math.min(maxSpeedX, player.speedX + this.deltaTime * Values.playerSpeedGrowthX);
    }
    else {
      if (player.speedX > 0) {
        player.speedX = Math.max(0.0, player.speedX - this.deltaTime * Values.playerSpeedGrowthX);
      }
    }
    if (this.activeControls.has('left')) {
      if (player.speedX > maxSpeedX) maxSpeedX = player.speedX - this.deltaTime * Values.playerSpeedGrowthX;
      player.speedX = Math.max(-maxSpeedX, player.speedX - this.deltaTime * Values.playerSpeedGrowthX);
    }
    else {
      if (player.speedX < 0) {
        player.speedX = Math.min(0.0, player.speedX + this.deltaTime * Values.playerSpeedGrowthX);
      }
    }
    if (this.activeControls.has('jump')) {
      if (player.grounded) {
        player.speedY = this.playerInitialJumpSpeed;
        player.grounded = false;
      }
    }
  }

  processPhysics() {
    const player = this.world.player;
    player.lastY = player.y;
    player.x += player.speedX * this.deltaTime;
    player.y += player.speedY * this.deltaTime;
    if (player.forward && player.speedX < 0) {
      player.forward = false;
    }
    else if (!player.forward && player.speedX > 0) {
      player.forward = true;
    }
    // Check if player is still on the same ground
    if (player.grounded) {
      const prop = player.ground;
      if (prop.x > player.x + player.width || prop.x + prop.width < player.x) {
        player.grounded = false;
      }
    }
    let groundResult = null;
    // Check if a ground is reached in fall of player
    if (!player.grounded) {
      if (player.y + player.height < 0) {
        this.gameOver();
        return;
      }
      player.speedY = Math.max(Values.maxPlayerSpeedY, player.speedY - this.deltaTime * this.playerSpeedShrinkY);
      for (let prop of this.world.props) {
        if (!prop.ground) continue;
        if (player.speedY < 0 && prop.y + prop.height <= player.lastY && prop.x <= player.x + player.width && prop.x + prop.width >= player.x && prop.y + prop.height >= player.y && prop.y <= player.y) {
          groundResult = {
            valid: true,
            speedY: 0.0,
            grounded: true,
            ground: prop,
            y: prop.y + prop.height + 1
          }
          break;
        }
      }
    }
    // Check world boundaries
    if (player.x < 0) {
      player.speedX = 0.0;
      player.x = 0;
    }
    else if (player.x + player.width > this.world.width) {
      player.speedX = 0.0;
      player.x = this.world.width - player.width;
    }
    // Check for collisions with solid props
    else {
      const blocks = {
        oldY: player.y,
        oldSpeedY: player.speedY,
        hits: []
      };
      let breakLoop = false;
      for (let prop of this.world.props) {
        if (!prop.solid) continue;
        if (groundResult && groundResult.ground == prop) continue;
        const collision = breakLoop ? this.checkCollision({ x: player.x, y: blocks.oldY, width: player.width, height: player.height }, prop) : this.checkPlayerCollision(prop);
        if (!collision) continue;
        // Top collision
        if (blocks.oldSpeedY > 0 && prop.y > player.lastY + player.height && prop instanceof Block && !prop.hit) blocks.hits.push(prop);
        if (breakLoop) continue;
        if (player.speedY > 0 && prop.y > player.lastY + player.height) {
          player.speedY = 0.0;
          player.y = prop.y - player.height - 1;
          breakLoop = true;
          continue;
        }
        // X-axis collisions
        if (player.speedX > 0) { // Player is going forward
          player.speedX = 0.0;
          player.x = prop.x - player.width - 1;
          if (groundResult && !this.checkPlayerCollision(groundResult.ground)) groundResult.valid = false;
          breakLoop = true;
        }
        else if (player.speedX < 0) { // Player is going backward
          player.speedX = 0.0;
          player.x = prop.x + prop.width + 1;
          if (groundResult && !this.checkPlayerCollision(groundResult.ground)) groundResult.valid = false;
          breakLoop = true;
        }
      }
      if (blocks.hits.length > 0) {
        const playerCenter = player.x + (player.width / 2);
        let hit = null,
            distance = 1000; // Big number as starting point
        for (let i = 0; i < blocks.hits.length; i++) {
          const blockCenter = blocks.hits[i].x + (blocks.hits[i].width / 2),
                blockDistance = Math.abs(playerCenter - blockCenter);
          if (blockDistance < distance) {
            hit = blocks.hits[i];
            distance = blockDistance;
          }
        }
        this.handleBlockCollision(hit);
      }
    }
    if (groundResult && groundResult.valid) {
      player.speedY = groundResult.speedY;
      player.grounded = groundResult.grounded;
      player.ground = groundResult.ground;
      player.y = groundResult.y;
    }
  }

  processInteractions() {
    let removeCoins = [];
    for (let coin of this.world.coins) {
      if (this.checkPlayerCollision(coin.hitbox)) {
        removeCoins.push(this.world.coins.indexOf(coin));
        this.coins++;
      }
    }
    if (removeCoins.length > 0) {
      removeCoins = removeCoins.reverse();
      for (let index of removeCoins) {
        this.world.coins.splice(index, 1);
      }
      this.stats.setCoins(this.coins);
    }
  }

  checkPlayerCollision(prop) {
    const player = this.world.player;
    return this.checkCollision(player, prop);
  }

  checkCollision(p1, p2) {
    return p1.x <= p2.x + p2.width && p1.x + p1.width >= p2.x && p1.y <= p2.y + p2.height && p1.y + p1.height >= p2.y;
  }

  handleBlockCollision(block) {
    if (block.breakable) {
      block.remove = true;
    }
    else {
      if (block.hasCoin) {
        this.coins++;
        this.stats.setCoins(this.coins);
      }
      block.hit = true;
    }
  }

  garbageCollection() {
    const staticProps = this.world.props;
    for (let i = staticProps.length - 1; i >= 0; i--) {
      const prop = staticProps[i];
      if (prop.remove) {
        staticProps.splice(staticProps.indexOf(prop), 1);
      }
    }
  }

  render() {
    const graphics = this.graphics;
    graphics.clear();
    graphics.setView(this.world.view);
    for (let prop of this.world.props) {
      graphics.drawProp(prop);
    }
    graphics.drawProp(this.world.finish);
    for (let coin of this.world.coins) {
      graphics.drawCoin(coin);
    }
    graphics.drawPlayer(this.world.player);
  }

  start() {
    this.oldTime = window.performance.now();
    this.running = true;
    window.requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }

  gameOver() {
    this.stop();
    this.loadLevel(1);
  }

  loop() {
    if (!this.running) return;
    this.newTime = window.performance.now();
    this.deltaTime = this.newTime - this.oldTime;
    this.oldTime = this.newTime;
    this.processInput();
    this.processPhysics();
    if (!this.running) return;
    this.processInteractions();
    this.garbageCollection();
    this.world.calcViewPosition();
    this.render();
    this.stats.setFps(this.deltaTime);
    window.requestAnimationFrame(this.loop.bind(this));
  }

  initControls() {
    window.addEventListener('keydown', (e) => {
      const control = Values.controls[e.code];
      if (!this.running || !control || this.activeControls.has(control)) return;
      this.activeControls.add(control);
    });
    window.addEventListener('keyup', (e) => {
      const control = Values.controls[e.code];
      if (!this.activeControls.has(control)) return;
      this.activeControls.delete(control);
    });
  }
}

class Graphics {
  constructor() {
    this.canvas = document.getElementById('canvas'),
    this.context = canvas.getContext('2d');
    const images = document.querySelectorAll('[data-texture]');
    this.textures = new Map();
    for (let image of images) {
      this.textures.set(image.getAttribute('data-texture'), image);
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setView(view) {
    this.view = view;
  }

  transformToView(prop) {
    const result = {};
    result.x = prop.x - this.view.x;
    result.y = this.view.height - (prop.y - this.view.y + prop.height);
    return result;
  }

  getTexture(type) {
    return this.textures.get(type);
  }

  drawProp(prop) {
    const {x, y} = this.transformToView(prop);
    if (prop.type === Values.propDefault) {
      this.context.fillStyle = Values.defaultColor;
      this.context.fillRect(x, y, prop.width, prop.height);
    }
    else {
      const texture = prop.hit ? this.getTexture(prop.type + 'hit') : this.getTexture(prop.type);
      for (let ix = 0; ix < prop.width; ix += texture.width) {
        for (let iy = 0; iy < prop.height; iy += texture.height) {
          const tx = Math.min(100, prop.width - ix),
                ty = Math.min(100, prop.height - iy);
          this.context.drawImage(texture, 0, 0, texture.getAttribute('data-width'), texture.getAttribute('data-height'), x + ix, y + iy, texture.width - tx % texture.width, texture.height - ty % texture.height);
        }
      }
    }
    if (Values.devMode) {
      this.context.font = '16px Courier New';
      this.context.fillStyle = '#FFFFFF';
      this.context.fillText(prop.id, x, y + prop.height - 5);
    }
  }

  drawPlayer(player) {
    let {x, y} = this.transformToView(player);
    x = Math.floor(x);
    y = Math.floor(y);
    const texture = this.getTexture('player');
    if (player.forward) {
      this.context.drawImage(texture, 0, 0, 100, 200, x, y, player.width, player.height);
    }
    else {
      this.context.save();
      this.context.scale(-1, 1);
      this.context.drawImage(texture, 0, 0, 100, 200, -x - player.width, y, player.width, player.height);
      this.context.restore();
      this.context.scale(1, 1);
    }
  }

  drawCoin(coin) {
    const {x, y} = this.transformToView(coin.hitbox);
    const texture = this.getTexture('coin');
    this.context.drawImage(texture, 0, 0, 100, 100, x, y, coin.hitbox.width, coin.hitbox.height);
    if (Values.devMode) {
      this.context.font = '16px Courier New';
      this.context.fillStyle = '#FFFFFF';
      this.context.fillText(coin.id, x, y + coin.height - 5);
    }
  }
}

class Stats {
  constructor() {
    this.fpsElement = document.getElementById('fps');
    this.levelElement = document.getElementById('level');
    this.coinElement = document.getElementById('coins');
    this.fps = 0;
  }

  setFps(deltaTime) {
    const newFps = Math.round(1000.0 / deltaTime);
    if (Math.abs(this.fps - newFps) < 2) return;
    this.fps = newFps;
    this.fpsElement.innerText = this.fps;
  }

  setCoins(coins) {
    this.coinElement.innerText = coins;
  }

  setLevel(level) {
    this.levelElement.innerText = level;
  }
}

window.game = new Game();