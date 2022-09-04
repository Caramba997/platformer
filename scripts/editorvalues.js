export const EDITORVALUES = {
  backgroundTypes: ['forest', 'desert', 'hills'],
  blockItemTypes: ['', 'default'],
  blockTypes: ['brick', 'brickhit', 'itemblock', 'itemblockhit', 'solidblock'],
  coinTypes: ['coin'],
  controls: {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down'
  },
  enemyTypes: ['spike', 'bubble', 'desertspike', 'desertbubble', 'wingman', 'toxicplant', 'rocket'],
  finishTypes: ['finishflag'],
  levels: ['level1', 'level2', 'level3', 'dev'],
  moveSpeed: 1,
  musicTypes: ['supermariomedley', 'mariobros', 'mariobrosdesert', 'mariobrosathletic', 'mariobrostower', 'mariobrosunderwater'],
  playerStates: ["normal", "super", "fire"],
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
    flyingenemy: {
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
      type: "wingman",
      speedFactorX: 0,
      speedFactorY: 1,
      endX: 0,
      endY: 0
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
    speedFactorX: 'number',
    speedFactorY: 'number',
    forward: 'checkbox',
    bounce: 'checkbox',
    bounceFactor: 'number',
    physics: 'checkbox',
    spawnRate: 'number',
    removeOnCollision: 'checkbox',
    background: 'select',
    music: 'select',
    state: 'select',
    flying: 'checkbox'
  },
  propTypes: ['grass', 'dirt', 'sand', 'sandground', 'cloud', 'brick', 'brickhit', 'orangeplatform', 'solidblock', 'solidblock2', 'finishground', 'pipe', 'pipetop', 'mushroomcap', 'mushroomcapblue', 'mushroomcapyellow', 'mushroomstem'],
  skipProperties: {
    Player: ['type', 'width', 'height', 'speedX', 'speedY', 'grounded', 'ground', 'forward', 'invincible'],
    Finish: ['width', 'height', 'hitbox'],
    Block: ['solid', 'ground', 'bounce', 'bounceFactor'],
    MovingProp: ['speedX', 'speedY', 'moving'],
    Enemy: ['speedX', 'speedY', 'grounded', 'ground', 'forward'],
    FlyingEnemy: ['speedX', 'speedY', 'grounded', 'ground', 'forward', 'speedFactor', 'startX', 'startY', 'stayOnGround', 'physics', 'removeOnCollision', 'flying'],
    Coin: ['width', 'height', 'hitbox'],
    default: ['hit', 'id', 'startX', 'startY', 'nextSpawn', 'spawner', 'shotCooldown', 'lastY']
  },
  spawnerTypes: ['rocketspawner'],
  worldDefaults: {
    world: {
      width: 5000,
      height: 4000,
      background: 'forest',
      music: 'mariobros'
    },
    finish: {
      x: 4500,
      y: 100
    },
    player: {
      x: 100,
      y: 100,
      state: 'super'
    },
    time: 180000
  }
}