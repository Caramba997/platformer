export const EDITORVALUES = {
  backgroundTypes: ['forest', 'desert'],
  blockItemTypes: ['', 'default'],
  blockTypes: ['brick', 'brickhit', 'itemblock', 'itemblockhit', 'solidblock'],
  coinTypes: ['coin'],
  controls: {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down'
  },
  enemyTypes: ['spike', 'bubble', 'desertspike', 'desertbubble', 'toxicplant', 'rocket'],
  finishTypes: ['finishflag'],
  levels: ['level1', 'level2', 'dev'],
  moveSpeed: 1,
  playerTypes: ['playernormal'],
  propDefaults: {
    staticprop: {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      type: 'solidblock',
      solid: true,
      ground: true,
      bounce: false,
      bounceFactor: 1.0
    },
    movingprop: {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      type: 'orangeplatform',
      solid: false,
      ground: true,
      bounce: false,
      bounceFactor: 1.0,
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
      item: ''
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
      type: "bubble",
      physics: true,
      removeOnCollision: false,
      spawner: null
    },
    coin: {
      x: 0,
      y: 0
    },
    spawner: {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      type: 'rocketspawner',
      solid: true,
      ground: true,
      forward: false,
      speedFactor: 1,
      spawnRate: 4
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
    type: 'select',
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
    item: 'select',
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
    forward: 'checkbox',
    bounce: 'checkbox',
    bounceFactor: 'number',
    physics: 'checkbox',
    spawnRate: 'number',
    removeOnCollision: 'checkbox',
    background: 'select'
  },
  propTypes: ['grass', 'dirt', 'sand', 'sandground', 'cloud', 'brick', 'brickhit', 'orangeplatform', 'solidblock', 'finishground', 'pipe', 'pipetop', 'mushroomcap', 'mushroomstem', 'rocketspawner'],
  skipProperties: ['hit', 'id', 'state', 'startX', 'startY', 'nextSpawn', 'spawner'],
  worldDefaults: {
    world: {
      width: 5000,
      height: 4000,
      background: 'forest'
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