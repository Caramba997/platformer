const VALUES = {
  blockSize: 50,
  coinSize: 30,
  controls: {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'jump',
    'Space': 'jump',
    'KeyA': 'left',
    'KeyD': 'right',
    'KeyW': 'jump',
    'KeyF': 'shoot',
    'ShiftLeft': 'run',
    'Enter': 'shoot'
  },
  defaultColor: '#0000FF',
  devMode: false,
  finishGroundHeight: 50,
  finishHeight: 400,
  finishHitboxWidth: 10,
  finishWidth: 100,
  fireSize: 30,
  fireSpeed: 1.0,
  fireStart: {
    x: 20,
    y: 20
  },
  gravity: 0.001,
  invincibleOpacity: 0.5,
  invincibleTime: 1500,
  items: {
    mushroom: {
      powerup: 'super',
      moving: true
    },
    flower: {
      powerup: 'fire',
      moving: false
    }
  },
  itemDefault: 'default',
  itemSize: 50,
  itemSpeed: 0.1,
  itemStates: {
    spawn: 0,
    move: 1
  },
  jumpTime: 300.0,
  maxEnemySpeed: 0.1,
  maxJumpHeight: 220.0,
  maxPlayerRunSpeed: 0.8,
  maxFallSpeed: -1.3,
  maxPlayerWalkSpeed: 0.5,
  parallaxFactor: 0.5,
  playerHeight: 60,
  playerHeightSuper: 100,
  playerSpeedGrowth: 0.002,
  playerStates: {
    normal: 0,
    super: 1,
    fire: 2
  },
  playerWidth: 30,
  playerWidthSuper: 50,
  points: {
    coin: 10,
    enemy: 100,
    item: 1000
  },
  propDefault: 'default',
  shotCooldown: 1000,
  trashCans: ['props', 'items', 'shots', 'coinProps', 'enemies'],
  viewRatioX: 0.5,
  viewRatioY: 0.4,
  viewWidth: 1600,
  viewHeight: 900
};

class Prop {
  constructor(id, x, y, width, height, type) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }
}

class StaticProp extends Prop {
  constructor(id, x, y, width, height, type, solid, ground) {
    super(id, x, y, width, height, type);
    this.id = id;
    this.solid = solid;
    this.ground = ground;
  }
}

class InteractableProp extends Prop {
  constructor(id, x, y, width, height, hitx, hity, hitwidth, hitheight, type) {
    super(id, x, y, width, height, type);
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
    super('finish', x, y, VALUES.finishWidth, VALUES.finishHeight, ((VALUES.finishWidth - VALUES.finishHitboxWidth) / 2), 0, VALUES.finishHitboxWidth, VALUES.finishHeight, 'finishflag');
  }
}

class Player extends Prop {
  constructor(x, y) {
    super('player', x, y, VALUES.playerWidthSuper, VALUES.playerHeightSuper, 'player');
    this.lastY = 0;
    this.speedX = 0.0;
    this.speedY = 0.0;
    this.grounded = false;
    this.ground = null;
    this.forward = true;
    this.state = VALUES.playerStates.super;
    this.invincible = 0;
    this.shotCooldown = 0;
  }
}

class Enemy extends InteractableProp {
  constructor(id, x, y, width, height, hitx, hity, hitwidth, hitheight, type, invincible, jumpable, moving, initialForward, speedFactor) {
    super(id, x, y, width, height, hitx, hity, hitwidth, hitheight, type);
    this.invincible = invincible;
    this.jumpable = jumpable;
    this.moving = moving;
    this.initialForward = initialForward;
    this.speedFactor = speedFactor;
    this.lastY = 0;
    this.speedX = initialForward ? speedFactor * VALUES.maxEnemySpeed : -speedFactor * VALUES.maxEnemySpeed;
    this.speedY = 0.0;
    this.grounded = false;
    this.ground = null;
    this.forward = initialForward;
  }
}

class Coin extends InteractableProp {
  constructor(id, x, y) {
    super(id, x, y, VALUES.blockSize, VALUES.blockSize, (VALUES.blockSize - VALUES.coinSize) / 2, (VALUES.blockSize - VALUES.coinSize) / 2, VALUES.coinSize, VALUES.coinSize, 'coin');
  }
}

class Block extends StaticProp {
  constructor(id, x, y, type, breakable, hasCoin, invisible, item) {
    super(id, x, y, VALUES.blockSize, VALUES.blockSize, type, true, true);
    this.breakable = breakable;
    this.hit = false;
    this.hasCoin = hasCoin;
    this.invisible = invisible;
    this.item = item;
  }
}

class Item extends InteractableProp {
  constructor(id, x, y, type, moving, powerup, block) {
    super(id, x, y, VALUES.itemSize, VALUES.itemSize, 0, 0, VALUES.itemSize, VALUES.itemSize, type);
    this.moving = moving;
    this.powerup = powerup;
    this.state = VALUES.itemStates.spawn;
    this.block = block;
    this.lastY = 0;
    this.speedX = VALUES.itemSpeed;
    this.speedY = 0.0;
  }
}

class Fire extends InteractableProp {
  constructor(id, x, y, forward) {
    super(id, x, y, VALUES.itemSize, VALUES.itemSize, (VALUES.blockSize - VALUES.fireSize) / 2, (VALUES.blockSize - VALUES.fireSize) / 2, VALUES.fireSize, VALUES.fireSize, 'fire');
    this.forward = forward;
    this.lastY = y;
    this.speedX = forward ? VALUES.fireSpeed : -VALUES.fireSpeed;
    this.speedY = 0.0;
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
        const type = prop.type || VALUES.propDefault;
        if (prop.class === 'Block') {
          this.props.push(new Block(prop.id, prop.x, prop.y, type, prop.breakable, prop.hasCoin, prop.invisible, prop.item));
        }
        else {
          this.props.push(new StaticProp(prop.id, prop.x, prop.y, prop.width, prop.height, type, prop.solid, prop.ground));
        }
      }
      this.coinProps = [];
      for (let coin of data.coins) {
        this.coinProps.push(new Coin(coin.id, coin.x, coin.y));
      }
      this.enemies = [];
      for (let enemy of data.enemies) {
        this.enemies.push(new Enemy(enemy.id, enemy.x, enemy.y, enemy.width, enemy.height, enemy.hitx, enemy.hity, enemy.hitwidth, enemy.hitheight, enemy.type, enemy.invincible, enemy.jumpable, enemy.moving, enemy.initialForward, enemy.speedFactor));
      }
      this.items = [];
      this.shots = [];
      this.finish = new Finish(data.finish.x, data.finish.y);
      this.props.push(new StaticProp('finishground', data.finish.x, data.finish.y, VALUES.finishWidth, VALUES.finishGroundHeight, 'finishground', true, true));
      this.player = new Player(data.player.x, data.player.y);
      this.view = {
        width: VALUES.viewWidth,
        height: VALUES.viewHeight
      };
      this.calcViewPosition();
      this.coins = 0;
      this.points = 0;
      this.time = data.time;
      window.dispatchEvent(new CustomEvent('world:loaded'));
    });
  }

  calcViewPosition() {
    this.view.x = Math.max(0, Math.floor(this.player.x) - VALUES.viewRatioX * VALUES.viewWidth);
    this.view.y = Math.max(0, Math.floor(this.player.y) - VALUES.viewRatioY * VALUES.viewHeight);
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
    const gradient = 2 * VALUES.maxJumpHeight / (VALUES.jumpTime * VALUES.jumpTime);
    this.playerInitialJumpSpeed = gradient * VALUES.jumpTime;
    this.playerSpeedShrinkY = gradient;
  }

  loadLevel(level) {
    this.world = new World("level" + level);
    this.activeControls = new Set();
    window.addEventListener('world:loaded', () => {
      this.stats.setLevel(this.world.name);
      this.stats.setCoins(this.world.coins);
      this.stats.setTime(this.world.time);
      this.stats.setPoints(this.world.points);
      this.start();
    }, { once: true });
  }

  processInput() {
    const player = this.world.player;
    let maxSpeedX = this.activeControls.has('run') ? VALUES.maxPlayerRunSpeed : VALUES.maxPlayerWalkSpeed;
    if (this.activeControls.has('right')) {
      if (player.speedX > maxSpeedX) maxSpeedX = player.speedX - this.deltaTime * VALUES.playerSpeedGrowth;
      player.speedX = Math.min(maxSpeedX, player.speedX + this.deltaTime * VALUES.playerSpeedGrowth);
    }
    else {
      if (player.speedX > 0) {
        player.speedX = Math.max(0.0, player.speedX - this.deltaTime * VALUES.playerSpeedGrowth);
      }
    }
    if (this.activeControls.has('left')) {
      if (player.speedX > maxSpeedX) maxSpeedX = player.speedX - this.deltaTime * VALUES.playerSpeedGrowth;
      player.speedX = Math.max(-maxSpeedX, player.speedX - this.deltaTime * VALUES.playerSpeedGrowth);
    }
    else {
      if (player.speedX < 0) {
        player.speedX = Math.min(0.0, player.speedX + this.deltaTime * VALUES.playerSpeedGrowth);
      }
    }
    if (this.activeControls.has('jump')) {
      if (player.grounded) {
        player.speedY = this.playerInitialJumpSpeed;
        player.grounded = false;
      }
    }
    if (player.state === VALUES.playerStates.fire && this.activeControls.has('shoot') && player.shotCooldown === 0) {
      this.world.shots.push(new Fire('fire' + Date.now(), player.x + VALUES.fireStart.x, player.y + VALUES.fireStart.y, player.forward));
      player.shotCooldown = VALUES.shotCooldown;
    }
    else if (player.shotCooldown > 0) {
      player.shotCooldown = Math.max(0, player.shotCooldown - this.deltaTime);
    }
  }

  processPlayerPhysics() {
    const player = this.world.player;
    player.lastY = player.y;
    player.x += player.speedX * this.deltaTime;
    player.y += player.speedY * this.deltaTime;
    player.invincible = Math.max(0, player.invincible - this.deltaTime);
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
      player.speedY = Math.max(VALUES.maxFallSpeed, player.speedY - this.deltaTime * this.playerSpeedShrinkY);
      if (player.invincible === 0) {
        for (let enemy of this.world.enemies) {
          if (player.speedY < 0 && enemy.y + enemy.height <= player.lastY && enemy.x <= player.x + player.width && enemy.x + enemy.width >= player.x && enemy.y + enemy.height >= player.y && enemy.y <= player.y) {
            if (enemy.jumpable) {
              enemy.remove = true;
              player.y = enemy.y + enemy.height + 1;
              player.speedY = this.activeControls.has('jump') ? this.playerInitialJumpSpeed * 1.1 : this.playerInitialJumpSpeed / 2;
              this.world.points += VALUES.points.enemy;
              this.stats.setPoints(this.world.points);
            }
            else {
              this.playerDamage();
              if (!this.running) return;
            }
            break;
          }
        }
      }
      for (let prop of this.world.props) {
        if (!prop.ground || prop.invisible) continue;
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
    else {
      // Check for collisions with solid props
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
        if (prop.invisible) continue;
        // X-axis collisions
        if (groundResult && groundResult.ground.y + groundResult.ground.height === prop.y + prop.height) continue;
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

  processPropActions() {
    for (let item of this.world.items) {
      if (item.state === VALUES.itemStates.spawn) {
        item.y += this.deltaTime * VALUES.itemSpeed;
        if (!this.checkCollision(item, item.block)) {
          item.state = VALUES.itemStates.move;
        }
      }
      else if (!item.moving) {
        continue;
      }
      else {
        this.processPropPhysics(item);
      }
    }
    for (let shot of this.world.shots) {
      shot.x += this.deltaTime * shot.speedX;
      if (shot.x < 0 || shot.x > this.world.width) {
        shot.remove = true;
        continue;
      }
      const shotHitbox = this.calcHitbox(shot);
      for (let prop of this.world.props) {
        if (!prop.solid || prop.invisible) continue;
        if (this.checkCollision(shotHitbox, prop)) {
          shot.remove = true;
          break;
        }
      }
      if (shot.remove) continue;
      for (let enemy of this.world.enemies) {
        if (this.checkCollision(shotHitbox, enemy)) {
          shot.remove = true;
          if (!enemy.invincible) enemy.remove = true;
          break;
        }
      }
    }
    for (let enemy of this.world.enemies) {
      if (!enemy.moving || enemy.remove) continue;
      this.processPropPhysics(enemy);
    }
  }

  processPropPhysics(thisProp) {
    thisProp.lastY = thisProp.y;
    thisProp.x += thisProp.speedX * this.deltaTime;
    thisProp.y += thisProp.speedY * this.deltaTime;
    if (thisProp.forward && thisProp.speedX < 0) {
      thisProp.forward = false;
    }
    else if (!thisProp.forward && thisProp.speedX > 0) {
      thisProp.forward = true;
    }
    // Check if thisProp is still on the same ground
    if (thisProp.grounded) {
      const prop = thisProp.ground;
      if (prop.x > thisProp.x + thisProp.width || prop.x + prop.width < thisProp.x) {
        thisProp.grounded = false;
      }
    }
    let groundResult = null;
    // Check if a ground is reached in fall of thisProp
    if (!thisProp.grounded) {
      if (thisProp.y + thisProp.height < 0) {
        thisProp.remove = true;
        return;
      }
      thisProp.speedY = Math.max(VALUES.maxFallSpeed, thisProp.speedY - this.deltaTime * VALUES.gravity);
      for (let prop of this.world.props) {
        if (!prop.ground || prop.invisible) continue;
        if (thisProp.speedY < 0 && prop.y + prop.height <= thisProp.lastY && prop.x <= thisProp.x + thisProp.width && prop.x + prop.width >= thisProp.x && prop.y + prop.height >= thisProp.y && prop.y <= thisProp.y) {
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
    if (thisProp.x < 0) {
      thisProp.speedX *= -1;
      thisProp.x = 0;
    }
    else if (thisProp.x + thisProp.width > this.world.width) {
      thisProp.speedX *= -1;
      thisProp.x = this.world.width - thisProp.width;
    }
    else {
      if (thisProp instanceof Enemy) {
        // Check for collisions with other enemies
        for (let enemy of this.world.enemies) {
          if (enemy.remove || enemy.id === thisProp.id) continue;
          if (this.checkCollision(thisProp, enemy)) {
            thisProp.x = thisProp.speedX > 0 ? enemy.x - thisProp.width : enemy.x + enemy.width;
            thisProp.speedX *= -1;
          }
        }
      }
      // Check for collisions with solid props
      for (let prop of this.world.props) {
        if (!prop.solid || prop.invisible) continue;
        if (groundResult && groundResult.ground == prop) continue;
        const collision = this.checkCollision(thisProp, prop);
        if (!collision) continue;
        // Top collision
        if (thisProp.speedY > 0 && prop.y > thisProp.lastY + thisProp.height) {
          thisProp.speedY = 0.0;
          thisProp.y = prop.y - thisProp.height - 1;
          breakLoop = true;
          break;
        }
        // X-axis collisions
        if (thisProp.speedX > 0) { // thisProp is going forward
          thisProp.speedX *= -1;
          thisProp.x = prop.x - thisProp.width - 1;
          if (groundResult && !this.checkCollision(thisProp, groundResult.ground)) groundResult.valid = false;
          break;
        }
        else if (thisProp.speedX < 0) { // thisProp is going backward
          thisProp.speedX *= -1;
          thisProp.x = prop.x + prop.width + 1;
          if (groundResult && !this.checkCollision(thisProp, groundResult.ground)) groundResult.valid = false;
          break;
        }
      }
    }
    if (groundResult && groundResult.valid) {
      thisProp.speedY = groundResult.speedY;
      thisProp.grounded = groundResult.grounded;
      thisProp.ground = groundResult.ground;
      thisProp.y = groundResult.y;
    }
  }

  processInteractions() {
    const player = this.world.player;
    if (this.checkCollision({ x: player.x, y: player.y, width: player.width / 2, height: player.height }, this.calcHitbox(this.world.finish))) {
      this.levelFinished();
      return;
    }
    // Check for collisions with items
    for (let item of this.world.items) {
      if (item.remove || item.state === VALUES.itemStates.spawn) continue;
      if (this.checkPlayerCollision(item)) {
        if (this.world.player.state !== VALUES.playerStates[item.powerup]) {
          this.setPlayerState(VALUES.playerStates[item.powerup]);
        }
        else {
          this.world.points += VALUES.points.item;
          this.stats.setPoints(this.world.points);
        }
        item.remove = true;
      }
    }
    // Check for collisions with enemies
    if (player.invincible === 0) {
      for (let enemy of this.world.enemies) {
        if (enemy.remove) continue;
        if (this.checkPlayerCollision(enemy)) {
          this.playerDamage();
          if (!this.running) return;
        }
      }
    }
    // Check for collisions with coins
    for (let coin of this.world.coinProps) {
      if (this.checkPlayerCollision(this.calcHitbox(coin))) {
        coin.remove = true;
        this.addCoin();
      }
    }
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
      if (block.item) {
        let type;
        if (block.item === VALUES.itemDefault) {
          const player = this.world.player;
          type = player.state === VALUES.playerStates.normal ? 'mushroom' : 'flower';
        }
        else {
          type = block.item;
        }
        const item = VALUES.items[type];
        this.world.items.push(new Item(block.id + 'item', block.x, block.y, type, item.moving, item.powerup, block));
      }
      else if (block.hasCoin) {
        this.addCoin();
      }
      if (block.invisible) {
        block.invisible = false;
      }
      block.hit = true;
    }
  }

  addCoin() {
    this.world.coins++;
    this.stats.setCoins(this.world.coins);
    this.world.points += VALUES.points.coin;
    this.stats.setPoints(this.world.points);
  }

  playerDamage() {
    const player = this.world.player;
    if (player.state > VALUES.playerStates.super) {
      this.setPlayerState(VALUES.playerStates.super);
      player.invincible = VALUES.invincibleTime;
      player.speedX = 0.0;
      player.speedY = 0.0;
    }
    else if (player.state > VALUES.playerStates.normal) {
      this.setPlayerState(VALUES.playerStates.normal);
      player.invincible = VALUES.invincibleTime;
      player.speedX = 0.0;
      player.speedY = 0.0;
    }
    else {
      this.gameOver();
    }
  }

  setPlayerState(state) {
    const player = this.world.player;
    switch (state) {
      case VALUES.playerStates.normal: {
        player.state = state;
        player.height = VALUES.playerHeight;
        player.width = VALUES.playerWidth;
        break;
      }
      case VALUES.playerStates.super: {
        player.state = state;
        player.height = VALUES.playerHeightSuper;
        player.width = VALUES.playerWidthSuper;
        break;
      }
      case VALUES.playerStates.fire: {
        player.state = state;
        player.height = VALUES.playerHeightSuper;
        player.width = VALUES.playerWidthSuper;
        break;
      }
    }
  }

  garbageCollection() {
    for (let trashCan of VALUES.trashCans) {
      const props = this.world[trashCan];
      for (let i = props.length - 1; i >= 0; i--) {
        const prop = props[i];
        if (prop.remove) {
          props.splice(props.indexOf(prop), 1);
        }
      }
    }
  }

  render() {
    const graphics = this.graphics;
    graphics.clear();
    graphics.setView(this.world.view);
    graphics.drawBackground(this.world);
    graphics.drawProp(this.world.finish);
    for (let item of this.world.items) {
      if (item.state !== VALUES.itemStates.spawn) continue;
      graphics.drawProp(item);
    }
    for (let prop of this.world.props) {
      graphics.drawProp(prop);
    }
    for (let coin of this.world.coinProps) {
      graphics.drawProp(this.calcHitbox(coin));
    }
    for (let enemy of this.world.enemies) {
      graphics.drawMoving(enemy);
    }
    for (let item of this.world.items) {
      if (item.state === VALUES.itemStates.spawn) continue;
      graphics.drawProp(item);
    }
    for (let shot of this.world.shots) {
      graphics.drawProp(shot);
    }
    graphics.drawMoving(this.world.player);
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

  levelFinished() {
    this.stop();
    this.world.points += Math.ceil(this.world.time);
    this.stats.setPoints(this.world.points);
    // this.loadLevel(1);
  }

  loop() {
    if (this.world.time <= 0) this.gameOver();
    if (!this.running) return;
    this.newTime = window.performance.now();
    this.deltaTime = this.newTime - this.oldTime;
    this.oldTime = this.newTime;
    this.world.time -= this.deltaTime;
    this.processInput();
    this.processPlayerPhysics();
    if (!this.running) return;
    this.processPropActions();
    this.processInteractions();
    if (!this.running) return;
    this.garbageCollection();
    this.world.calcViewPosition();
    this.render();
    this.stats.setFps(this.deltaTime);
    this.stats.setTime(this.world.time);
    window.requestAnimationFrame(this.loop.bind(this));
  }

  initControls() {
    window.addEventListener('keydown', (e) => {
      const control = VALUES.controls[e.code];
      if (!this.running || !control || this.activeControls.has(control)) return;
      this.activeControls.add(control);
    });
    window.addEventListener('keyup', (e) => {
      const control = VALUES.controls[e.code];
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

  drawBackground(world) {
    const texture = this.getTexture('background'),
          tx = Math.ceil(this.view.x * VALUES.parallaxFactor) % this.view.width,
          ty = Math.ceil(this.view.height - this.view.y * texture.height / world.height);
    if (tx === 0) {
      this.context.drawImage(texture, 0, ty, this.view.width, this.view.height, 0, 0, this.view.width, this.view.height);
    }
    else {
      this.context.drawImage(texture, tx, ty, this.view.width - tx, this.view.height, 0, 0, this.view.width - tx, this.view.height);
      this.context.drawImage(texture, 0, ty, tx, this.view.height, this.view.width - tx, 0, tx, this.view.height);
    }
  }

  drawProp(prop) {
    if (prop.invisible) return;
    const {x, y} = this.transformToView(prop);
    if (prop.type === VALUES.propDefault) {
      this.context.fillStyle = VALUES.defaultColor;
      this.context.fillRect(x, y, prop.width, prop.height);
    }
    else {
      const texture = prop.hit ? this.getTexture(prop.type + 'hit') : this.getTexture(prop.type);
      for (let ix = 0; ix < prop.width; ix += texture.width) {
        for (let iy = 0; iy < prop.height; iy += texture.height) {
          const twidth = texture.getAttribute('data-width'),
                theight = texture.getAttribute('data-height'),
                tx = Math.min(twidth, prop.width - ix),
                ty = Math.min(theight, prop.height - iy);
          this.context.drawImage(texture, 0, 0, twidth, theight, x + ix, y + iy, texture.width - tx % texture.width, texture.height - ty % texture.height);
        }
      }
    }
    if (VALUES.devMode) {
      this.context.font = '16px Courier New';
      this.context.fillStyle = '#FFFFFF';
      this.context.fillText(prop.id, x, y + prop.height - 5);
    }
  }

  drawMoving(moving) {
    let {x, y} = this.transformToView(moving);
    x = Math.floor(x);
    y = Math.floor(y);
    let texture;
    if (moving instanceof Player) {
      let state;
      switch(moving.state) {
        case VALUES.playerStates.super: {
          state = 'super';
          break;
        }
        case VALUES.playerStates.fire: {
          state = 'fire';
          break;
        }
        default: {
          state = 'normal';
          break;
        }
      }
      texture = this.getTexture(moving.type + state);
      if (moving.invincible > 0) this.context.globalAlpha = VALUES.invincibleOpacity;
    }
    else {
      texture = this.getTexture(moving.type);
    }
    const twidth = texture.getAttribute('data-width'),
          theight = texture.getAttribute('data-height');
    if (moving.forward) {
      this.context.drawImage(texture, 0, 0, twidth, theight, x, y, moving.width, moving.height);
    }
    else {
      this.context.save();
      this.context.scale(-1, 1);
      this.context.drawImage(texture, 0, 0, twidth, theight, -x - moving.width, y, moving.width, moving.height);
      this.context.restore();
      this.context.scale(1, 1);
    }
    if (this.context.globalAlpha !== 1) this.context.globalAlpha = 1;
  }
}

class Stats {
  constructor() {
    this.fpsElement = document.getElementById('fps');
    this.levelElement = document.getElementById('level');
    this.coinElement = document.getElementById('coins');
    this.timeElement = document.getElementById('time');
    this.pointsElement = document.getElementById('points');
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

  setTime(time) {
    this.timeElement.innerText = Math.ceil(time / 1000);
  }

  setPoints(points) {
    this.pointsElement.innerText = points;
  }
}

window.game = new Game();