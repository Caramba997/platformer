import { VALUES } from './values.js';
import { EDITORVALUES } from './editorvalues.js';

export class Prop {
  constructor(id, x, y, width, height, type) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }
}

export class StaticProp extends Prop {
  constructor(id, x, y, width, height, type, solid, ground, bounce, bounceFactor) {
    super(id, x, y, width, height, type);
    this.solid = solid;
    this.ground = ground;
    this.bounce = bounce;
    this.bounceFactor = bounceFactor;
  }
}

export class InteractableProp extends Prop {
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

export class MovingProp extends StaticProp {
  constructor(id, x, y, width, height, type, solid, ground, bounce, bounceFactor, speedFactorX, speedFactorY, endX, endY) {
    super(id, x, y, width, height, type, solid, ground, bounce, bounceFactor);
    this.moving = true;
    this.speedFactorX = speedFactorX;
    this.speedFactorY = speedFactorY;
    this.speedX = speedFactorX * VALUES.propSpeed;
    this.speedY = speedFactorY * VALUES.propSpeed;
    this.startX = x;
    this.startY = y;
    this.endX = endX;
    this.endY = endY;
    this.groundedProps = new Set();
  }
}

export class Water extends Prop {
  constructor(id, x, y, width, height, type, isBottom) {
    super(id, x, y, width, height, type);
    this.isBottom = isBottom;
  }
}

export class Spawner extends StaticProp {
  constructor(id, x, y, width, height, type, solid, ground, speedFactor, forward, spawnRate) {
    super(id, x, y, width, height, type, solid, ground, false, 0);
    this.speedFactor = speedFactor;
    this.forward = forward;
    this.spawnRate = spawnRate;
    this.nextSpawn = spawnRate * 1000;
  }
}

export class Finish extends InteractableProp {
  constructor(x, y) {
    super('finish', x, y, VALUES.finishWidth, VALUES.finishHeight, ((VALUES.finishWidth - VALUES.finishHitboxWidth) / 2), 0, VALUES.finishHitboxWidth, VALUES.finishHeight, 'finishflag');
  }
}

export class Player extends Prop {
  constructor(x, y, state) {
    const width = state === VALUES.playerStates.normal ? VALUES.playerWidth : VALUES.playerWidthSuper;
    const height = state === VALUES.playerStates.normal ? VALUES.playerHeight : VALUES.playerHeightSuper;
    super('player', x, y, width, height, 'player');
    this.lastY = 0;
    this.speedX = 0.0;
    this.speedY = 0.0;
    this.grounded = false;
    this.ground = null;
    this.forward = true;
    this.state = state;
    this.invincible = 0;
    this.shotCooldown = 0;
  }
}

export class Enemy extends InteractableProp {
  constructor(id, x, y, width, height, hitx, hity, hitwidth, hitheight, type, invincible, jumpable, moving, initialForward, speedFactor, stayOnGround, physics, removeOnCollision, spawner) {
    super(id, x, y, width, height, hitx, hity, hitwidth, hitheight, type);
    this.invincible = invincible;
    this.jumpable = jumpable;
    this.moving = moving;
    this.initialForward = initialForward;
    this.speedFactor = speedFactor;
    this.lastY = y;
    this.speedX = initialForward ? Math.abs(speedFactor * VALUES.maxEnemySpeed) : -1 * Math.abs(speedFactor * VALUES.maxEnemySpeed);
    this.speedY = 0.0;
    this.grounded = false;
    this.ground = null;
    this.forward = initialForward;
    this.stayOnGround = stayOnGround;
    this.physics = physics;
    this.removeOnCollision = removeOnCollision;
    this.spawner = spawner;
  }
}

export class FlyingEnemy extends Enemy {
  constructor (id, x, y, width, height, hitx, hity, hitwidth, hitheight, type, invincible, jumpable, moving, initialForward, speedFactorX, speedFactorY, endX, endY) {
    super(id, x, y, width, height, hitx, hity, hitwidth, hitheight, type, invincible, jumpable, moving, initialForward, 1, false, false, false, null);
    this.speedFactorX = speedFactorX;
    this.speedFactorY = speedFactorY;
    this.endX = endX;
    this.endY = endY;
    this.speedX = speedFactorX * VALUES.propSpeed;
    this.speedY = speedFactorY * VALUES.propSpeed;
    this.startX = x;
    this.startY = y;
    this.flying = true;
  }
}

export class Coin extends InteractableProp {
  constructor(id, x, y) {
    super(id, x, y, VALUES.blockSize, VALUES.blockSize, (VALUES.blockSize - VALUES.coinSize) / 2, (VALUES.blockSize - VALUES.coinSize) / 2, VALUES.coinSize, VALUES.coinSize, 'coin');
  }
}

export class Block extends StaticProp {
  constructor(id, x, y, type, breakable, hasCoin, invisible, item) {
    super(id, x, y, VALUES.blockSize, VALUES.blockSize, type, true, true, false, 0);
    this.breakable = breakable;
    this.hit = false;
    this.hasCoin = hasCoin;
    this.invisible = invisible;
    this.item = item;
  }
}

export class Item extends InteractableProp {
  constructor(id, x, y, type, moving, powerup, block) {
    super(id, x, y, VALUES.itemSize, VALUES.itemSize, 0, 0, VALUES.itemSize, VALUES.itemSize, type);
    this.moving = moving;
    this.powerup = powerup;
    this.state = VALUES.itemStates.spawn;
    this.block = block;
    this.lastY = 0;
    this.speedX = VALUES.itemSpeed;
    this.speedY = 0.0;
    this.forward = true;
  }
}

export class Fire extends InteractableProp {
  constructor(id, x, y, forward) {
    super(id, x, y, VALUES.itemSize, VALUES.itemSize, (VALUES.blockSize - VALUES.fireSize) / 2, (VALUES.blockSize - VALUES.fireSize) / 2, VALUES.fireSize, VALUES.fireSize, 'fire');
    this.forward = forward;
    this.lastY = y;
    this.speedX = forward ? VALUES.fireSpeed : -VALUES.fireSpeed;
    this.speedY = 0.0;
  }
}

export class World {
  constructor(level) {
    if (!level) {
      const defaults = EDITORVALUES.worldDefaults;
      this.id = 'newlevel';
      this.name = 'New level';
      this.width = defaults.world.width;
      this.height = defaults.world.height;
      this.background = defaults.world.background;
      this.music = defaults.world.music;
      this.props = [];
      this.water = [];
      this.coinProps = [];
      this.enemies = [];
      this.finish = new Finish(defaults.finish.x, defaults.finish.y);
      this.props.push(new StaticProp('finishground', defaults.finish.x, defaults.finish.y, VALUES.finishWidth, VALUES.finishGroundHeight, 'finishground', true, true, false, 0));
      this.player = new Player(defaults.player.x, defaults.player.y, defaults.player.state);
      this.view = {
        width: VALUES.viewWidth,
        height: VALUES.viewHeight
      };
      this.items = [];
      this.shots = [];
      this.coins = 0;
      this.points = 0;
      this.calcViewPosition(this.player);
      this.time = defaults.time;
      this.startTime = this.time;
    }
    else {
      fetch('levels/' + level + '.json')
      .then(result => result.json())
      .then((data) => {
        const t = this;
        this.id = level;
        this.name = data.meta.name;
        this.width = data.meta.width;
        this.height = data.meta.height;
        this.background = data.meta.background;
        this.music = data.meta.music;
        this.props = [];
        for (let prop of data.staticProps) {
          const type = t.p(prop, 'type') || VALUES.propDefault;
          if (t.p(prop, 'class') === 'Block') {
            this.props.push(new Block(t.p(prop, 'id'), t.p(prop, 'x'), t.p(prop, 'y'), type, t.p(prop, 'breakable'), t.p(prop, 'hasCoin'), t.p(prop, 'invisible'), t.p(prop, 'item')));
          }
          else if (t.p(prop, 'class') === 'MovingProp') {
            this.props.push(new MovingProp(t.p(prop, 'id'), t.p(prop, 'x'), t.p(prop, 'y'), t.p(prop, 'width'), t.p(prop, 'height'), type, t.p(prop, 'solid'), t.p(prop, 'ground'), t.p(prop, 'bounce'), t.p(prop, 'bounceFactor'), t.p(prop, 'speedFactorX'), t.p(prop, 'speedFactorY'), t.p(prop, 'endX'), t.p(prop, 'endY')));
          }
          else if (t.p(prop, 'class') === 'Spawner') {
            this.props.push(new Spawner(t.p(prop, 'id'), t.p(prop, 'x'), t.p(prop, 'y'), t.p(prop, 'width'), t.p(prop, 'height'), type, t.p(prop, 'solid'), t.p(prop, 'ground'), t.p(prop, 'speedFactor'), t.p(prop, 'forward'), t.p(prop, 'spawnRate')));
          }
          else {
            this.props.push(new StaticProp(t.p(prop, 'id'), t.p(prop, 'x'), t.p(prop, 'y'), t.p(prop, 'width'), t.p(prop, 'height'), type, t.p(prop, 'solid'), t.p(prop, 'ground'), t.p(prop, 'bounce'), t.p(prop, 'bounceFactor')));
          }
        }
        this.water = [];
        for (let prop of data.waterProps) {
          const type = t.p(prop, 'type') || VALUES.propDefault;
          this.water.push(new Water(t.p(prop, 'id'), t.p(prop, 'x'), t.p(prop, 'y'), t.p(prop, 'width'), t.p(prop, 'height'), type, t.p(prop, 'isBottom')));
        }
        this.coinProps = [];
        for (let coin of data.coins) {
          this.coinProps.push(new Coin(t.p(coin, 'id'), t.p(coin, 'x'), t.p(coin, 'y')));
        }
        this.enemies = [];
        for (let enemy of data.enemies) {
          if (t.p(enemy, 'class') === 'FlyingEnemy') {
            this.enemies.push(new FlyingEnemy(t.p(enemy, 'id'), t.p(enemy, 'x'), t.p(enemy, 'y'), t.p(enemy, 'width'), t.p(enemy, 'height'), t.p(enemy.hitbox, 'x'), t.p(enemy.hitbox, 'y'), t.p(enemy.hitbox, 'width'), t.p(enemy.hitbox, 'height'), t.p(enemy, 'type'), t.p(enemy, 'invincible'), t.p(enemy, 'jumpable'), t.p(enemy, 'moving'), t.p(enemy, 'initialForward'), t.p(enemy, 'speedFactorX'), t.p(enemy, 'speedFactorY'), t.p(enemy, 'endX'), t.p(enemy, 'endY')));
          }
          else {
            this.enemies.push(new Enemy(t.p(enemy, 'id'), t.p(enemy, 'x'), t.p(enemy, 'y'), t.p(enemy, 'width'), t.p(enemy, 'height'), t.p(enemy.hitbox, 'x'), t.p(enemy.hitbox, 'y'), t.p(enemy.hitbox, 'width'), t.p(enemy.hitbox, 'height'), t.p(enemy, 'type'), t.p(enemy, 'invincible'), t.p(enemy, 'jumpable'), t.p(enemy, 'moving'), t.p(enemy, 'initialForward'), t.p(enemy, 'speedFactor'), t.p(enemy, 'stayOnGround'), t.p(enemy, 'physics'), t.p(enemy, 'removeOnCollision'), t.p(enemy, 'spawner')));
          }
        }
        this.finish = new Finish(data.finish.x, data.finish.y);
        this.player = new Player(data.player.x, data.player.y, data.player.state);
        this.view = {
          width: VALUES.viewWidth,
          height: VALUES.viewHeight
        };
        this.items = [];
        this.shots = [];
        this.coins = 0;
        this.points = 0;
        this.calcViewPosition(this.player);
        this.time = data.meta.time;
        this.startTime = this.time;
        window.dispatchEvent(new CustomEvent('world:loaded'));
      });
    }
  }

  p(prop, property) {
    let value = prop[property];
    if (value !== undefined) return value;
    const propertyType = EDITORVALUES.propertyTypes[property];
    switch (propertyType) {
      case 'number': return 0;
      case 'select': return EDITORVALUES.propTypes[0];
      case 'checkbox': return false;
      default: return '';
    }
  }

  calcViewPosition(prop) {
    this.view.x = Math.min(Math.max(0, Math.floor(prop.x) - VALUES.viewRatioX * VALUES.viewWidth), this.width - VALUES.viewWidth);
    this.view.y = Math.min(Math.max(0, Math.floor(prop.y) - VALUES.viewRatioY * VALUES.viewHeight), this.height - VALUES.viewHeight);
  }
}