import { VALUES } from '/values.js';
import { Prop, StaticProp, InteractableProp, MovingProp, Finish, Player, Enemy, Coin, Block, Item, Fire, World } from '/classes.js';
import { Graphics } from '/graphics.js';

class Game {
  constructor() {
    this.graphics = new Graphics();
    this.stats = new Stats();
    this.calcJumpParameters();
    this.initControls();
    this.initListeners();
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('level')) {
        this.loadLevel(searchParams.get('level'));
        return;
      }
    }
    this.loadLevel('level1');
  }

  initListeners() {
    // Popup openers
    document.querySelectorAll('[data-action="open-popup"]').forEach((opener) => {
      opener.addEventListener('click', (e) => {
        this.openPopup(e.target.getAttribute('data-control'));
      });
    });
    // Popup closers
    document.querySelectorAll('[data-action="close-popup"]').forEach((opener) => {
      opener.addEventListener('click', (e) => {
        this.closePopup(e.target.closest('.Popup').getAttribute('data-popup'));
      });
    });
    // Replay
    document.querySelector('[data-action="replay"]').addEventListener('click', () => {
      this.closePopup('game-over');
      this.loadLevel(this.world.id);
    });
  }

  openPopup(name) {
    this.stop();
    const popup = document.querySelector('[data-popup="' + name + '"]'),
          overlay = document.querySelector('.PageOverlay');
    popup.setAttribute('data-visible', true);
    overlay.setAttribute('data-visible', true);
  }

  closePopup(name) {
    const popup = document.querySelector('[data-popup="' + name + '"]'),
          overlay = document.querySelector('.PageOverlay');
    popup.setAttribute('data-visible', false);
    overlay.setAttribute('data-visible', false);
    if (name === 'start') this.start();
  }

  calcJumpParameters() {
    const gradient = 2 * VALUES.maxJumpHeight / (VALUES.jumpTime * VALUES.jumpTime);
    this.playerInitialJumpSpeed = gradient * VALUES.jumpTime;
    this.playerSpeedShrinkY = gradient;
  }

  loadLevel(level) {
    this.world = new World(level);
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
    if (this.activeControls.has('pause')) {
      this.openPopup('start');
      this.activeControls.delete('pause');
      return;
    }
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
      else if (prop.moving) {
        player.x += prop.speedX * this.deltaTime;
        player.y += prop.speedY * this.deltaTime;
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
    for (let prop of this.world.props) {
      if (!prop.moving) continue;
      prop.x += this.deltaTime * prop.speedX;
      prop.y += this.deltaTime * prop.speedY;
      if (prop.speedX > 0 && prop.x >= prop.endX) {
        prop.speedX *= -1;
        prop.x = prop.endX;
      }
      else if (prop.speedX < 0 && prop.x <= prop.startX) {
        prop.speedX *= -1;
        prop.x = prop.startX;
      }
      if (prop.speedY > 0 && prop.y >= prop.endY) {
        prop.speedY *= -1;
        prop.y = prop.endY;
      }
      else if (prop.speedY < 0 && prop.y <= prop.startY) {
        prop.speedY *= -1;
        prop.y = prop.startY;
      }
    }
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
      else if (thisProp.ground.moving) {
        thisProp.x += thisProp.ground.speedX * this.deltaTime;
        thisProp.y += thisProp.ground.speedY * this.deltaTime;
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
    else if (!thisProp.grounded && thisProp.stayOnGround) {
      thisProp.speedX *= -1;
      thisProp.speedY = 0;
      thisProp.grounded = true;
      const ground = thisProp.ground;
      thisProp.x = ground.x > thisProp.x + thisProp.width ? ground.x - thisProp.width : ground.x + ground.width;
      if (ground.moving) thisProp.x += this.deltaTime * ground.speedX;
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
    this.openPopup('game-over');
  }

  levelFinished() {
    this.world.points += Math.ceil(this.world.time * VALUES.points.time);
    this.stats.setPoints(this.world.points);
    this.openPopup('level-complete');
    const storageProgress = localStorage.getItem('progress'),
          progress = storageProgress ? JSON.parse(storageProgress) : {},
          levelProgress = progress[this.world.id],
          newLevelProgress = {},
          time = Math.ceil((this.world.startTime - this.world.time) / 1000);
    if (levelProgress) {
      if (levelProgress.points < this.world.points) newLevelProgress.points = this.world.points;
      if (levelProgress.time > time) newLevelProgress.time = time;
    }
    else {
      newLevelProgress.points = this.world.points;
      newLevelProgress.time = time;
    }
    progress[this.world.id] = newLevelProgress;
    localStorage.setItem('progress', JSON.stringify(progress));
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
    this.world.calcViewPosition(this.world.player);
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