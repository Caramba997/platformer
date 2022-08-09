export const EDITORVALUES = {
  controls: {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down'
  },
  levels: ['level1', 'level2'],
  moveSpeed: 1,
  propDefaults: {
    prop: {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      type: 'solidblock',
      solid: true,
      ground: true
    },
    enemy: {

    },
    coin: {
      
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