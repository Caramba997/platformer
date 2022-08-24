import { VALUES } from '/values.js';
import { EDITORVALUES } from '/editorvalues.js';

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
  constructor(id, x, y, width, height, type, solid, ground) {
    super(id, x, y, width, height, type);
    this.id = id;
    this.solid = solid;
    this.ground = ground;
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
  constructor(id, x, y, width, height, type, solid, ground, speedFactorX, speedFactorY, endX, endY) {
    super(id, x, y, width, height, type, solid, ground);
    this.moving = true;
    this.speedFactorX = speedFactorX;
    this.speedFactorY = speedFactorY;
    this.speedX = speedFactorX * VALUES.propSpeed;
    this.speedY = speedFactorY * VALUES.propSpeed;
    this.startX = x;
    this.startY = y;
    this.endX = endX;
    this.endY = endY;
  }
}

export class Finish extends InteractableProp {
  constructor(x, y) {
    super('finish', x, y, VALUES.finishWidth, VALUES.finishHeight, ((VALUES.finishWidth - VALUES.finishHitboxWidth) / 2), 0, VALUES.finishHitboxWidth, VALUES.finishHeight, 'finishflag');
  }
}

export class Player extends Prop {
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

export class Enemy extends InteractableProp {
  constructor(id, x, y, width, height, hitx, hity, hitwidth, hitheight, type, invincible, jumpable, moving, initialForward, speedFactor, stayOnGround) {
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
  }
}

export class Coin extends InteractableProp {
  constructor(id, x, y) {
    super(id, x, y, VALUES.blockSize, VALUES.blockSize, (VALUES.blockSize - VALUES.coinSize) / 2, (VALUES.blockSize - VALUES.coinSize) / 2, VALUES.coinSize, VALUES.coinSize, 'coin');
  }
}

export class Block extends StaticProp {
  constructor(id, x, y, type, breakable, hasCoin, invisible, item) {
    super(id, x, y, VALUES.blockSize, VALUES.blockSize, type, true, true);
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
      this.props = [];
      this.coinProps = [];
      this.enemies = [];
      this.finish = new Finish(defaults.finish.x, defaults.finish.y);
      this.props.push(new StaticProp('finishground', defaults.finish.x, defaults.finish.y, VALUES.finishWidth, VALUES.finishGroundHeight, 'finishground', true, true));
      this.player = new Player(defaults.player.x, defaults.player.y);
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
        this.id = level;
        this.name = data.meta.name;
        this.width = data.world.width;
        this.height = data.world.height;
        this.props = [];
        for (let prop of data.staticProps) {
          const type = prop.type || VALUES.propDefault;
          if (prop.class === 'Block') {
            this.props.push(new Block(prop.id, prop.x, prop.y, type, prop.breakable, prop.hasCoin, prop.invisible, prop.item));
          }
          else if (prop.class === 'MovingProp') {
            this.props.push(new MovingProp(prop.id, prop.x, prop.y, prop.width, prop.height, type, prop.solid, prop.ground, prop.speedFactorX, prop.speedFactorY, prop.endX, prop.endY));
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
          this.enemies.push(new Enemy(enemy.id, enemy.x, enemy.y, enemy.width, enemy.height, enemy.hitbox.x, enemy.hitbox.y, enemy.hitbox.width, enemy.hitbox.height, enemy.type, enemy.invincible, enemy.jumpable, enemy.moving, enemy.initialForward, enemy.speedFactor, enemy.stayOnGround));
        }
        this.finish = new Finish(data.finish.x, data.finish.y);
        this.player = new Player(data.player.x, data.player.y);
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

  calcViewPosition(prop) {
    this.view.x = Math.min(Math.max(0, Math.floor(prop.x) - VALUES.viewRatioX * VALUES.viewWidth), this.width - VALUES.viewWidth);
    this.view.y = Math.min(Math.max(0, Math.floor(prop.y) - VALUES.viewRatioY * VALUES.viewHeight), this.height - VALUES.viewHeight);
  }
}