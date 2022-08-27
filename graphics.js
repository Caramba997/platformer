import {VALUES} from '/values.js';

export class Graphics {
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
    if (!world.background) return;
    const texture = this.getTexture(world.background),
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
    if (prop.invisible && prop.type !== VALUES.propDefault) return;
    const {x, y} = this.transformToView(prop);
    if (prop.type === VALUES.propDefault) {
      this.context.fillStyle = VALUES.defaultColor;
      this.context.fillRect(x, y, prop.width, prop.height);
    }
    else {
      const texture = prop.hit ? this.getTexture(prop.type + 'hit') : this.getTexture(prop.type);
      if (!texture) {
        console.warn('Unknown prop type: ' + prop.type);
        return;
      }
      for (let ix = 0; ix < prop.width; ix += texture.width) {
        for (let iy = 0; iy < prop.height; iy += texture.height) {
          const twidth = parseInt(texture.getAttribute('data-width')),
                theight = parseInt(texture.getAttribute('data-height')),
                tx = Math.min(twidth, prop.width - ix),
                ty = Math.min(theight, prop.height - iy);
          if (prop.forward !== false) {
            this.context.drawImage(texture, 0, 0, twidth, theight, x + ix, y + iy, texture.width - tx % texture.width, texture.height - ty % texture.height);
          }
          else {
            this.context.save();
            this.context.scale(-1, 1);
            this.context.drawImage(texture, 0, 0, twidth, theight, -x - texture.width - ix, y + iy, texture.width - tx % texture.width, texture.height - ty % texture.height);
            this.context.restore();
            this.context.scale(1, 1);
          }
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
    if (moving.state !== undefined) {
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
    if (!texture) {
      console.warn('Unknown prop type: ' + prop.type);
      return;
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