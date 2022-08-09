export const EDITORVALUES = {
  controls: {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down'
  },
  levels: ['level1', 'dev'],
  moveSpeed: 1,
  propDefaults: {
    staticprop: {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      type: 'solidblock',
      solid: true,
      ground: true
    },
    movingprop: {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      type: 'orangeplatform',
      solid: false,
      ground: true,
      speedFactorX: 1.0,
      speedFactorY: 0,
      endX: 200,
      endY: 0
    },
    block: {
      x: 0,
      y: 0,
      type: 'brick',
      breakable: true,
      hasCoin: false,
      invisible: false,
      item: false
    },
    enemy: {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      hitx: 0,
      hity: 0,
      hitwidth: 50,
      hitheight: 50,
      invincible: false,
      jumpable: true,
      moving: true,
      initialForward: false,
      speedFactor: 1.0,
      stayOnGround: false,
      type: "bubble"
    },
    coin: {
      x: 0,
      y: 0
    }
  },
  propertyTypes: {
    id: 'text',
    x: 'number',
    y: 'number',
    width: 'number',
    height: 'number',
    width: 'number',
    name: 'text',
    time: 'number',
    type: 'text',
    solid: 'checkbox',
    grounded: 'checkbox',
    ground: 'checkbox',
    class: 'text',
    speedX: 'number',
    speedY: 'number',
    endX: 'number',
    endY: 'number',
    breakable: 'checkbox',
    hasCoin: 'checkbox',
    invisible: 'checkbox',
    item: 'text',
    hitx: 'number',
    hity: 'number',
    hitwidth: 'number',
    hitheight: 'number',
    invincible: 'checkbox',
    jumpable: 'checkbox',
    moving: 'checkbox',
    initialForward: 'checkbox',
    stayOnGround: 'checkbox',
    speedFactor: 'number',
    forward: 'checkbox'
  },
  skipProperties: ['hit', 'id', 'state', 'startX', 'startY'],
  worldDefaults: {
    world: {
      width: 5000,
      height: 4000
    },
    finish: {
      x: 4500,
      y: 100
    },
    player: {
      x: 100,
      y: 100
    },
    time: 180000
  }
}