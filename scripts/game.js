import { VALUES } from './values.js';
import { Enemy, Coin, Block, Item, Fire, World } from './classes.js';
import { Graphics } from './graphics.js';
import { Sounds } from './sounds.js';

export class Game {
  constructor() {
    this.graphics = new Graphics();
    this.sounds = new Sounds();
    this.stats = new Stats();
    this.countdownInterval = null;
    this.calcJumpParameters();
    this._keyDownListener = this.keyDownListener.bind(this);
    this._keyUpListener = this.keyUpListener.bind(this);
    this._touchListener = this.touchListener.bind(this);
    this._contextMenuListener = this.contextMenuListener.bind(this);
    this.initControls();
    this.initListeners();
    const storageLevel = window.ps.load('level');
    window.addEventListener('world:loaded', () => {
      window.dispatchEvent(new CustomEvent('progress:executed'));
    }, { once: true });
    if (storageLevel) {
      this.loadLevel(storageLevel);
    }
    else {
      this.loadLevel('level1');
    }
  }

  unload() {
    this.stop();
    window.removeEventListener('keydown', this._keyDownListener);
    window.removeEventListener('keyup', this._keyUpListener);
    window.removeEventListener('contextmenu', this._contextMenuListener);
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    window.ps.delete('levelData');
  }

  initControls() {
    window.addEventListener('contextmenu', this._contextMenuListener);
    window.addEventListener('keydown', this._keyDownListener);
    window.addEventListener('keyup', this._keyUpListener);
    const mobileControls = document.querySelector('#controls');
    mobileControls.addEventListener('touchmove', this._touchListener);
    mobileControls.addEventListener('touchstart', this._touchListener);
    mobileControls.addEventListener('touchend', this._touchListener);
  }

  contextMenuListener(e) {
    if (navigator.maxTouchPoints > 0) e.preventDefault();
  }

  touchListener(e) {
    const touchList = e.touches,
          activeTouches = [];
    if (!this.running) {
      this.activeControls.clear();
      return;
    }
    for (let i = 0; i < touchList.length; i++) {
      const currentTouch = touchList.item(i),
            element = document.elementFromPoint(currentTouch.clientX, currentTouch.clientY);
      if (element && element.hasAttribute('data-command')) {
        const control = VALUES.controls[element.getAttribute('data-command')];
        if (control) activeTouches.push(control);
      }
    }
    if (activeTouches.includes('left') || activeTouches.includes('right')) activeTouches.push('run');
    activeTouches.forEach((control) => {
      if (!this.activeControls.has(control)) this.activeControls.add(control);
    });
    this.activeControls.forEach((control) => {
      if (!activeTouches.includes(control)) this.activeControls.delete(control);
    });
  }

  keyDownListener(e) {
    const control = VALUES.controls[e.code];
    if (!control || this.activeControls.has(control) || e.repeat) return;
    this.activeControls.add(control);
  }

  keyUpListener(e) {
    const control = VALUES.controls[e.code];
    if (!this.activeControls.has(control)) return;
    this.activeControls.delete(control);
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
        this.closePopup(e.target.closest('.Popup').getAttribute('data-popup'), true);
      });
    });
    // Replay
    document.querySelectorAll('[data-action="replay"]').forEach((button) => {
      button.addEventListener('click', () => {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.sounds.stop(this.world.music);
        const popup = document.querySelector('.Popup[data-visible="true"]').getAttribute('data-popup');
        this.closePopup(popup, false);
        this.loadLevel(this.world.id);
        this.sounds.play('restart');
      });
    });
    // Back to menu
    document.querySelectorAll('[data-href="menu"]').forEach((link) => {
      link.addEventListener('click', () => {
        this.sounds.stop(this.world.music);
      });
    });
    // Toggle fullscreen
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
  }

  openPopup(name) {
    this.popupOpen = true;
    this.stop();
    const popup = document.querySelector('[data-popup="' + name + '"]'),
          overlay = document.querySelector('.PageOverlay');
    popup.setAttribute('data-visible', true);
    overlay.setAttribute('data-visible', true);
  }

  closePopup(name, doActions) {
    const popup = document.querySelector('[data-popup="' + name + '"]'),
          overlay = document.querySelector('.PageOverlay');
    popup.setAttribute('data-visible', false);
    overlay.setAttribute('data-visible', false);
    if (!document.querySelector('.Popup[data-visible="true"]')) this.popupOpen = false;
    if (doActions && name === 'start') this.start();
  }

  calcJumpParameters() {
    const gradient = 2 * VALUES.maxJumpHeight / (VALUES.jumpTime * VALUES.jumpTime);
    this.playerInitialJumpSpeed = gradient * VALUES.jumpTime;
    this.playerSpeedShrinkY = gradient;
    const waterGradient = 2 * VALUES.maxWaterJumpHeight / (VALUES.jumpTimeWater * VALUES.jumpTimeWater);
    this.playerInitialJumpSpeedWater = waterGradient * VALUES.jumpTimeWater;
    this.playerSpeedShrinkYWater = waterGradient;
  }

  loadLevel(level) {
    const onWorldLoaded = () => {
      this.stats.setLevel(this.world.name);
      this.stats.setCoins(this.world.coins);
      this.stats.setTime(this.world.time);
      this.stats.setPoints(this.world.points);
      if (window.ps.load('countdown') === 'true') {
        let counter = 3999,
            step = 4,
            oldTime = Date.now();
        const countdownContainer = document.querySelector('.Countdown'),
              countdownElement = countdownContainer.querySelector('.Countdown--Time'),
              countdownStep = () => {
                if (!this.countdownInterval) return;
                if (this.activeControls.has('pause')) {
                  this.openPopup('start');
                  this.activeControls.delete('pause');
                  return;
                }
                const newTime = Date.now();
                if (this.popupOpen) {
                  oldTime = newTime;
                  return;
                }
                const newStep = Math.floor(counter / 1000);
                if (newStep !== step) {
                  step = newStep;
                  if (step === 0) {
                    countdownElement.innerText = window.locales.getTranslation('gameStart');
                    this.start();
                  }
                  else {
                    countdownElement.innerText = step;
                  }
                }
                counter -= newTime - oldTime;
                oldTime = newTime;
                if (counter < 0) {
                  clearInterval(this.countdownInterval);
                  this.countdownInterval = null;
                  countdownContainer.classList.add('dn');
                }
              };
        this.render();
        countdownElement.innerText = '';
        countdownContainer.classList.remove('dn');
        this.countdownInterval = setInterval(countdownStep, 50);
      }
      else {
        this.start();
      }
    };
    if (level !== 'dev') {
      window.addEventListener('world:loaded', onWorldLoaded, { once: true });
    }
    this.activeControls = new Set();
    this.world = new World(level);
    if (level === 'dev') onWorldLoaded();
  }

  processInput() {
    const player = this.world.player;
    if (this.activeControls.has('pause')) {
      this.openPopup('start');
      this.activeControls.delete('pause');
      return;
    }
    player.inWater = this.checkInWater(player, true);
    if (player.inWater) {
      let maxSpeedX = this.activeControls.has('run') ? VALUES.maxWaterSpeedRunX : VALUES.maxWaterSpeedX;
      if (this.activeControls.has('right')) {
        if (player.speedX > maxSpeedX) maxSpeedX = player.speedX - this.deltaTime * VALUES.playerSpeedGrowthWater;
        player.speedX = Math.min(maxSpeedX, player.speedX + this.deltaTime * VALUES.playerSpeedGrowthWater);
      }
      else {
        if (player.speedX > 0) {
          player.speedX = Math.max(0.0, player.speedX - this.deltaTime * VALUES.playerSpeedGrowthWater);
        }
      }
      if (this.activeControls.has('left')) {
        if (player.speedX > maxSpeedX) maxSpeedX = player.speedX - this.deltaTime * VALUES.playerSpeedGrowthWater;
        player.speedX = Math.max(-maxSpeedX, player.speedX - this.deltaTime * VALUES.playerSpeedGrowthWater);
      }
      else {
        if (player.speedX < 0) {
          player.speedX = Math.min(0.0, player.speedX + this.deltaTime * VALUES.playerSpeedGrowthWater);
        }
      }
      if (this.activeControls.has('jump')) {
        if (!this.checkInWater({ x: player.x, y: player.y + player.height / 2, width: player.width, height: player.height / 2 }, false)) {
          player.speedY = this.playerInitialJumpSpeed * VALUES.playerWaterLeaveSpeedFactor;
        }
        else {
          player.speedY = this.playerInitialJumpSpeedWater;
          this.activeControls.delete('jump');
        }
        player.grounded = false;
        this.sounds.play('jump');
      }
    }
    else {
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
          if (player.ground.moving) player.ground.groundedProps.delete(player);
          this.sounds.play('jump');
        }
      }
    }
    if (player.state === VALUES.playerStates.fire && this.activeControls.has('shoot') && player.shotCooldown === 0) {
      this.world.shots.push(new Fire('fire' + Date.now(), player.x + VALUES.fireStart.x, player.y + VALUES.fireStart.y, player.forward));
      player.shotCooldown = VALUES.shotCooldown;
      this.sounds.play('shoot');
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
        if (prop.moving) prop.groundedProps.delete(player);
      }
    }
    let groundResult = null;
    // Check if a ground is reached in fall of player
    if (!player.grounded) {
      if (player.y + player.height < 0) {
        this.gameOver();
        return;
      }
      player.speedY = player.inWater ? Math.max(VALUES.maxWaterSinkSpeed, player.speedY - this.deltaTime * this.playerSpeedShrinkYWater) : Math.max(VALUES.maxFallSpeed, player.speedY - this.deltaTime * this.playerSpeedShrinkY);
      if (player.invincible === 0) {
        for (let enemy of this.world.enemies) {
          if (!this.checkInRangeX(enemy)) continue;
          const hitbox = this.calcHitbox(enemy);
          if (player.speedY < 0 && hitbox.y + hitbox.height <= player.lastY && hitbox.x <= player.x + player.width && hitbox.x + hitbox.width >= player.x && hitbox.y + hitbox.height >= player.y && hitbox.y <= player.y) {
            if (enemy.jumpable) {
              enemy.remove = true;
              player.y = enemy.y + enemy.height + 1;
              player.speedY = this.activeControls.has('jump') ? this.playerInitialJumpSpeed * VALUES.bounceJumpFactor : this.playerInitialJumpSpeed * VALUES.bounceFactor;
              this.world.points += VALUES.points.enemy;
              this.stats.setPoints(this.world.points);
              this.sounds.play('kill');
              this.sounds.play('jumpboost');
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
        if (!this.checkInRangeX(prop)) continue;
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
        if (!this.checkInRangeX(prop)) continue;
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
        if (player.speedX > 0 && this.checkCollision({ x: player.x + player.width - 1, y: player.y, width: 1, height: player.height}, prop)) { // Player is going forward
          player.speedX = 0.0;
          player.x = prop.x - player.width - 1;
          if (groundResult && !this.checkPlayerCollision(groundResult.ground)) groundResult.valid = false;
          breakLoop = true;
        }
        else if (player.speedX < 0 && this.checkCollision({ x: player.x, y: player.y, width: 1, height: player.height}, prop)) { // Player is going backward
          player.speedX = 0.0;
          player.x = prop.x + prop.width + 1;
          if (groundResult && !this.checkPlayerCollision(groundResult.ground)) groundResult.valid = false;
          breakLoop = true;
        }
        else if (player.speedX === 0 && player.ground && player.ground.moving) {
          if (player.ground.speedX > 0) {
            player.x = prop.x - player.width - 1;
          }
          else {
            player.x = prop.x + prop.width + 1;
          }
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
      const ground = groundResult.ground;
      if (ground.moving && (ground.startOnEnter || ground.moveOnPlayer) && ground.speedX === 0 && ground.speedY === 0) {
        ground.speedX = ground.speedFactorX * VALUES.propSpeed * (ground.forward ? 1 : -1);
        ground.speedY = ground.speedFactorY * VALUES.propSpeed * (ground.forward ? 1 : -1);
      }
      if (player.ground && player.ground.moveOnPlayer && ground !== player.ground) {
        player.ground.speedX = 0;
        player.ground.speedY = 0;
      }
      if (ground.bounce) {
        player.speedY = this.activeControls.has('jump') ? this.playerInitialJumpSpeed * VALUES.bounceJumpFactor * ground.bounceFactor : this.playerInitialJumpSpeed * VALUES.bounceFactor * ground.bounceFactor;
        player.grounded = false;
        this.sounds.play('jumpboost');
      }
      else {
        player.speedY = 0;
        player.grounded = groundResult.grounded;
        player.ground = ground;
        player.y = groundResult.y;
        if (player.ground.moving) player.ground.groundedProps.add(player);
      }
    }
  }

  processPropActions() {
    for (let item of this.world.items) {
      if (!this.checkInRangeX(item)) continue;
      if (item.state === VALUES.itemStates.spawn) {
        item.y += this.deltaTime * VALUES.itemSpeed;
        if (!this.checkCollision(item, item.block)) {
          item.state = VALUES.itemStates.move;
          item.y = item.block.y + item.block.height + 1;
          item.ground = item.block;
          item.grounded = true;
        }
      }
      else if (!item.moving) {
        continue;
      }
      else {
        this.processPropPhysics(item);
      }
    }
    for (let coin of this.world.coinProps) {
      if (!coin.fromBlock) continue;
      coin.y += this.deltaTime * VALUES.coinSpeed;
      if (!this.checkCollision(coin, coin.block)) coin.remove = true;
    }
    for (let shot of this.world.shots) {
      shot.x += this.deltaTime * shot.speedX;
      if (!this.checkInRangeX(shot, 500)) shot.remove = true;
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
        if (!this.checkInRangeX(enemy, 500)) continue;
        if (this.checkCollision(shotHitbox, enemy)) {
          shot.remove = true;
          if (!enemy.invincible) {
            enemy.remove = true;
            this.world.points += VALUES.points.enemy;
            this.stats.setPoints(this.world.points);
            this.sounds.play('kill');
          }
          break;
        }
      }
    }
    for (let enemy of this.world.enemies) {
      if (!enemy.moving || enemy.remove) continue;
      if (!this.checkInRangeX(enemy, 500)) continue;
      if (enemy.physics) {
        this.processPropPhysics(enemy);
      }
      else if (enemy.flying) {
        enemy.x += this.deltaTime * enemy.speedX;
        enemy.y += this.deltaTime * enemy.speedY;
        if (enemy.speedX > 0 && enemy.x >= enemy.endX) {
          enemy.speedX *= -1;
          enemy.x = enemy.endX;
          enemy.forward = false;
        }
        else if (enemy.speedX < 0 && enemy.x <= enemy.startX) {
          enemy.speedX *= -1;
          enemy.x = enemy.startX;
          enemy.forward = true;
        }
        if (enemy.speedY > 0 && enemy.y >= enemy.endY) {
          enemy.speedY *= -1;
          enemy.y = enemy.endY;
        }
        else if (enemy.speedY < 0 && enemy.y <= enemy.startY) {
          enemy.speedY *= -1;
          enemy.y = enemy.startY;
        }
      }
      else {
        enemy.lastY = enemy.y;
        enemy.x += enemy.speedX * this.deltaTime;
        // Check world boundaries
        if (enemy.x + enemy.width < 0 || enemy.x > this.world.width) {
          enemy.remove = true;
        }
        // Check for collisions with solid props
        for (let prop of this.world.props) {
          if (!prop.solid || prop.invisible || prop.constructor.name === 'Spawner') continue;
          const collision = this.checkCollision(enemy, prop);
          if (!collision) continue;
          // Top collision
          enemy.remove = true;
        }
      }
    }
    for (let prop of this.world.props) {
      if (!this.checkInRangeX(prop, 500)) continue;
      if (prop.constructor.name === 'Spawner' && Math.abs(prop.x - this.world.player.x) < VALUES.spawnDistance) {
        if (prop.nextSpawn === 0) {
          this.world.enemies.push(new Enemy('rocket' + Date.now(), prop.x, prop.y + 13, 50, 25, 0, 0, 50, 25, 'rocket', false, true, true, prop.forward, prop.speedFactor, false, false, true, prop));
          prop.nextSpawn = prop.spawnRate * 1000;
          this.sounds.play('spawner');
        }
        else {
          prop.nextSpawn = Math.max(prop.nextSpawn - this.deltaTime, 0);
        }
      }
      if (!prop.moving) continue;
      if (prop.stopOnPlayer && this.world.player.ground === prop) continue;
      prop.x += this.deltaTime * prop.speedX;
      prop.y += this.deltaTime * prop.speedY;
      let moveX = this.deltaTime * prop.speedX,
          moveY = this.deltaTime * prop.speedY;
      if (prop.speedX > 0 && prop.x >= prop.endX) {
        moveX = moveX - (prop.x - prop.endX);
        prop.speedX *= -1;
        prop.forward = false;
        prop.x = prop.endX;
      }
      else if (prop.speedX < 0 && prop.x <= prop.startX) {
        moveX = moveX + (prop.startX - prop.x);
        prop.speedX *= -1;
        prop.forward = true;
        prop.x = prop.startX;
      }
      if (prop.speedY > 0 && prop.y >= prop.endY) {
        moveY = moveY - (prop.y - prop.endY);
        prop.speedY *= -1;
        prop.forward = false;
        prop.y = prop.endY;
      }
      else if (prop.speedY < 0 && prop.y <= prop.startY) {
        moveY = moveY + (prop.startY - prop.y);
        prop.speedY *= -1;
        prop.forward = true;
        prop.y = prop.startY;
      }
      prop.groundedProps.forEach((groundedProp) => {
        groundedProp.y += moveY;
        groundedProp.x += moveX;
      });
    }
  }

  processPropPhysics(thisProp) {
    thisProp.lastY = thisProp.y;
    const inWater = this.checkInWater(thisProp, true);
    if (inWater !== thisProp.inWater) {
      if (inWater) {
        thisProp.speedX = thisProp.speedFactor * (thisProp.constructor.name === 'Item' ? VALUES.itemWaterSpeed : VALUES.maxEnemyWaterSpeed) * (thisProp.forward ? 1 : -1);
      }
      else {
        thisProp.speedX = thisProp.speedFactor * (thisProp.constructor.name === 'Item' ? VALUES.itemSpeed : VALUES.maxEnemySpeed) * (thisProp.forward ? 1 : -1);
      }
      thisProp.inWater = inWater;
    }
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
        if (prop.moving) prop.groundedProps.delete(thisProp);
      }
    }
    let groundResult = null;
    // Check if a ground is reached in fall of thisProp
    if (!thisProp.grounded) {
      if (thisProp.y + thisProp.height < 0) {
        thisProp.remove = true;
        return;
      }
      thisProp.speedY = thisProp.inWater ? Math.max(VALUES.maxWaterSinkSpeed, thisProp.speedY - this.deltaTime * this.playerSpeedShrinkYWater) : Math.max(VALUES.maxFallSpeed, thisProp.speedY - this.deltaTime * VALUES.gravity);
      const stayOnGroundOffset = thisProp.stayOnGround ? 1 : 0;
      for (let prop of this.world.props) {
        if (!prop.ground || prop.invisible) continue;
        if (thisProp.speedY < 0 && prop.y + prop.height <= thisProp.lastY && prop.x <= thisProp.x + thisProp.width && prop.x + prop.width >= thisProp.x && prop.y + prop.height >= thisProp.y - stayOnGroundOffset && prop.y <= thisProp.y) {
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
          if (enemy.remove || enemy.id === thisProp.id || !enemy.physics) continue;
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
        if (groundResult && groundResult.ground.y + groundResult.ground.height === prop.y + prop.height) continue;
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
      if (thisProp.ground.moving) thisProp.ground.groundedProps.add(thisProp);
    }
    else if (!thisProp.grounded && thisProp.stayOnGround) {
      thisProp.speedX *= -1;
      thisProp.speedY = 0;
      thisProp.grounded = true;
      const ground = thisProp.ground;
      thisProp.x = ground.x > thisProp.x + thisProp.width ? ground.x - thisProp.width : ground.x + ground.width;
      if (ground.moving) ground.groundedProps.add(thisProp);
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
          item.remove = true;
          this.garbageCollection();
          switch (item.powerup) {
            case 'fire': {
              this.sounds.play('powerup2');
              break;
            }
            default: {
              this.sounds.play('powerup1');
              break;
            }
          }
        }
        else {
          this.sounds.play('hit');
        }
        this.world.points += VALUES.points.item;
        this.stats.setPoints(this.world.points);
        item.remove = true;
      }
    }
    // Check for collisions with enemies
    if (player.invincible === 0) {
      for (let enemy of this.world.enemies) {
        if (enemy.remove) continue;
        if (!this.checkInRangeX(enemy)) continue;
        const enemyHitbox = this.calcHitbox(enemy);
        enemyHitbox.y--;
        if (this.checkPlayerCollision(enemyHitbox)) {
          this.playerDamage();
          if (!this.running) return;
        }
      }
    }
    // Check for collisions with coins
    for (let coin of this.world.coinProps) {
      if (!this.checkInRangeX(coin)) continue;
      if (!coin.fromBlock && this.checkPlayerCollision(this.calcHitbox(coin))) {
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

  checkInWater(prop, reduce) {
    const hitbox = reduce ? { x: prop.x + prop.width / 4, y: prop.y + prop.height / 4, width: prop.width / 2, height: prop.height / 2 } : prop;
    for (let water of this.world.water) {
      if (this.checkCollision(hitbox, water)) return true;
    }
  }

  checkInRange(prop, offset) {
    const view = this.world.view;
    if (!offset) return this.checkCollision(prop, view);
    const offsetView = {
      x: view.x - offset,
      y: view.y - offset,
      width: view.width + offset,
      height: view.height + offset
    }
    return this.checkCollision(prop, offsetView);
  }

  checkInRangeX(prop, offset) {
    const checkCollisionX = (p1, p2) => {
      return p1.x <= p2.x + p2.width && p1.x + p1.width >= p2.x;
    }
    const view = this.world.view;
    if (!offset) return checkCollisionX(prop, view);
    const offsetView = {
      x: view.x - offset,
      width: view.width + offset
    }
    return checkCollisionX(prop, offsetView);
  }

  handleBlockCollision(block) {
    if (block.breakable) {
      block.remove = true;
      this.sounds.play('destroy');
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
        this.sounds.play('itemspawn');
      }
      else if (block.hasCoin) {
        const coin = new Coin(block.id + 'coin', block.x, block.y);
        coin.fromBlock = true;
        coin.block = block;
        this.world.coinProps.push(coin);
        this.addCoin();
      }
      if (block.invisible) {
        block.invisible = false;
      }
      block.hit = true;
      this.sounds.play('hit');
    }
  }

  addCoin() {
    this.world.coins++;
    this.stats.setCoins(this.world.coins);
    this.world.points += VALUES.points.coin;
    this.stats.setPoints(this.world.points);
    this.sounds.play('coin');
  }

  playerDamage() {
    const player = this.world.player;
    if (player.state === VALUES.playerStates.fire) {
      this.setPlayerState(VALUES.playerStates.super);
      player.invincible = VALUES.invincibleTime;
      player.speedX = 0.0;
      player.speedY = 0.0;
      this.sounds.play('damage');
    }
    else if (player.state === VALUES.playerStates.super) {
      this.setPlayerState(VALUES.playerStates.normal);
      player.invincible = VALUES.invincibleTime;
      player.speedX = 0.0;
      player.speedY = 0.0;
      this.sounds.play('damage');
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
    const deferredRender = [];
    for (let item of this.world.items) {
      if (item.state !== VALUES.itemStates.spawn) continue;
      if (!this.checkInRange(item)) continue;
      item.block.defer = true;
      deferredRender.push(item.block);
    }
    for (let coin of this.world.coinProps) {
      if (!coin.fromBlock) continue;
      if (!this.checkInRange(coin)) continue;
      coin.block.defer = true;
      deferredRender.push(coin.block);
    }
    for (let enemy of this.world.enemies) {
      if (!enemy.spawner) continue;
      if (!this.checkInRange(enemy)) continue;
      enemy.spawner.defer = true;
      deferredRender.push(enemy.spawner);
    }
    for (let prop of this.world.props) {
      if (prop.defer) continue;
      if (!this.checkInRange(prop)) continue;
      graphics.drawProp(prop);
    }
    for (let coin of this.world.coinProps) {
      if (!this.checkInRange(coin)) continue;
      graphics.drawProp(this.calcHitbox(coin));
    }
    for (let enemy of this.world.enemies) {
      if (!this.checkInRange(enemy)) continue;
      graphics.drawMoving(enemy);
    }
    for (let item of this.world.items) {
      if (!this.checkInRange(item)) continue;
      graphics.drawProp(item);
    }
    for (let deferred of deferredRender) {
      graphics.drawProp(deferred);
      deferred.defer = false;
    }
    for (let shot of this.world.shots) {
      if (!this.checkInRange(shot)) continue;
      graphics.drawProp(shot);
    }
    graphics.drawMoving(this.world.player);
    for (let water of this.world.water) {
      if (!this.checkInRange(water)) continue;
      graphics.drawWater(water);
    }
  }

  start() {
    this.oldTime = window.performance.now();
    this.running = true;
    window.requestAnimationFrame(this.loop.bind(this));
    this.sounds.play(this.world.music);
  }

  stop() {
    this.running = false;
    this.sounds.pause(this.world.music);
  }

  gameOver() {
    this.render();
    document.querySelector('[data-hint="game-over"]').innerText = (this.world.time <= 0) ? window.locales.getTranslation('gameOverTime') : window.locales.getTranslation('gameOverDead');
    if (this.world.time <= 0) {

    }
    this.openPopup('game-over');
    this.sounds.stop(this.world.music);
    this.sounds.play('gameover');
  }

  levelFinished() {
    this.world.points += Math.ceil(this.world.time * VALUES.points.time);
    this.world.points += Math.ceil((this.world.player.y - this.world.finish.y) / this.world.finish.height * VALUES.points.finish);
    this.stats.setPoints(this.world.points);
    const completePopup = document.querySelector('[data-popup="level-complete"]'),
          timeElement = completePopup.querySelector('[data-result="time"]'),
          pointsElement = completePopup.querySelector('[data-result="points"]'),
          time = this.world.startTime - Math.floor(this.world.time),
          points = this.world.points;
    timeElement.innerText = window.formatter.formatTime(time);
    pointsElement.innerText = points;
    this.openPopup('level-complete');
    const userData = window.ps.load('user');
    if (userData) {
      window.api.post('highscore', { id: this.world.id, time: time, points: points }, (result) => {
        window.ps.save('user', JSON.stringify(result));
      }, (error) => {
        console.error(error);
      });
    }
    this.sounds.stop(this.world.music);
    this.sounds.play('completed');
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
}

class Stats {
  constructor() {
    this.fpsElement = document.getElementById('fps');
    this.levelElement = document.getElementById('level');
    this.coinElement = document.getElementById('coins');
    this.timeElement = document.getElementById('time');
    this.pointsElement = document.getElementById('points');
    this.fpsTime = 0;
  }

  setFps(deltaTime) {
    this.fpsTime -= deltaTime;
    if (this.fpsTime > 0) return;
    const fps = Math.round(1000.0 / deltaTime);
    this.fpsElement.innerText = fps;
    this.fpsTime = 500;
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