import {VALUES} from './values.js';

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
          ty = world.verticalParallax ? Math.ceil(this.view.height - this.view.y * texture.height / world.height) : Math.ceil(this.view.height - this.view.y);
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
      const twidth = parseInt(texture.getAttribute('data-width')),
            theight = parseInt(texture.getAttribute('data-height'));
      for (let ix = 0; ix < prop.width; ix += texture.width) {
        for (let iy = 0; iy < prop.height; iy += texture.height) {
          const sWidth = Math.min((prop.width - ix) * twidth / texture.width, twidth),
                sHeight = Math.min((prop.height - iy) * theight / texture.height, theight),
                sx = sWidth < twidth ? twidth - sWidth : 0,
                sy = 0,
                dx = x + ix,
                dy = y + iy,
                dWidth = Math.min(prop.width - ix, texture.width),
                dHeight = Math.min(prop.height - iy, texture.height);
          if (prop.forward !== false) {
            this.context.drawImage(texture, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
          }
          else {
            this.context.save();
            this.context.scale(-1, 1);
            this.context.drawImage(texture, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
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
      console.warn('Unknown prop type: ' + moving.type);
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

  drawWater(prop) {
    const {x, y} = this.transformToView(prop);
    const texture = this.getTexture(prop.type);
    if (!texture) {
      console.warn('Unknown prop type: ' + prop.type);
      return;
    }
    if (prop.waterAnimationOffsetX === undefined) {
      prop.waterAnimationOffsetX = 0;
      prop.waterAnimationOffsetY = 4;
      prop.waterAnimationSpeedY = 0.05;
    }
    prop.waterAnimationOffsetX = (prop.waterAnimationOffsetX + 0.5) % texture.width;
    if (prop.waterAnimationOffsetY >= 5 || prop.waterAnimationOffsetY < 0) {
      prop.waterAnimationSpeedY *= -1
    }
    prop.waterAnimationOffsetY += prop.waterAnimationSpeedY;
    const twidth = parseInt(texture.getAttribute('data-width')),
          theight = parseInt(texture.getAttribute('data-height')),
          ox = prop.waterAnimationOffsetX,
          oy = prop.waterAnimationOffsetY,
          suby = !prop.isTop ? texture.height : 0;
    for (let ix = 0; ix - ox < prop.width; ix += texture.width) {
      for (let iy = 0; iy - suby < prop.height; iy += texture.height) {
        const sx = ix === 0 ? ox * twidth / texture.width : 0,
              sy = 0,
              /* min(<texture_size>, <prop_size>, <end_image_size/last_iteration>, first_iteration ? <remaining_texture>) */
              sWidth = Math.min(twidth, prop.width * twidth / texture.width, (prop.width - ix + ox) * twidth / texture.width, ix === 0 ? twidth - ox * twidth / texture.width : twidth),
              sHeight = Math.min(theight, prop.height * theight / texture.height, (prop.height + suby - iy - oy) * theight / texture.height, iy === 0 && !prop.isTop ? oy * theight / texture.height : theight),
              dx = ix === 0 ? x : x + ix - ox,
              dy = iy === 0 && !prop.isTop ? y : y + iy - suby + oy,
              dWidth = Math.min(texture.width, prop.width, prop.width - ix + ox, ix === 0 ? texture.width - ox : texture.width),
              dHeight = Math.min(texture.height, prop.height, prop.height + suby - iy - oy, iy === 0 && !prop.isTop ? oy : texture.height);
        this.context.drawImage(texture, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      }
    }
    if (VALUES.devMode) {
      this.context.font = '16px Courier New';
      this.context.fillStyle = '#FFFFFF';
      this.context.fillText(prop.id, x, y + prop.height - 5);
    }
  }
}