export const VALUES = {
  blockSize: 50,
  coinSize: 30,
  controls: {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'jump',
    'Space': 'jump',
    'KeyA': 'left',
    'KeyD': 'right',
    'KeyW': 'jump',
    'KeyF': 'shoot',
    'ShiftLeft': 'run',
    'ShiftRight': 'shoot',
    'Enter': 'shoot',
    'Escape': 'pause'
  },
  defaultColor: '#FF000088',
  devMode: false,
  finishGroundHeight: 50,
  finishHeight: 400,
  finishHitboxWidth: 10,
  finishWidth: 100,
  fireSize: 30,
  fireSpeed: 1.0,
  fireStart: {
    x: 20,
    y: 20
  },
  gravity: 0.001,
  invincibleOpacity: 0.5,
  invincibleTime: 1500,
  items: {
    mushroom: {
      powerup: 'super',
      moving: true
    },
    flower: {
      powerup: 'fire',
      moving: false
    }
  },
  itemDefault: 'default',
  itemSize: 50,
  itemSpeed: 0.1,
  itemStates: {
    spawn: 0,
    move: 1
  },
  jumpTime: 300.0,
  maxEnemySpeed: 0.07,
  maxJumpHeight: 220.0,
  maxPlayerRunSpeed: 0.8,
  maxFallSpeed: -1.3,
  maxPlayerWalkSpeed: 0.5,
  parallaxFactor: 0.5,
  playerHeight: 60,
  playerHeightSuper: 100,
  playerSpeedGrowth: 0.002,
  playerStates: {
    normal: 0,
    super: 1,
    fire: 2
  },
  playerWidth: 30,
  playerWidthSuper: 50,
  points: {
    coin: 20,
    enemy: 200,
    item: 1000,
    time: 0.2
  },
  propDefault: 'default',
  propSpeed: 0.08,
  shotCooldown: 1000,
  trashCans: ['props', 'items', 'shots', 'coinProps', 'enemies'],
  viewRatioX: 0.5,
  viewRatioY: 0.4,
  viewWidth: 1600,
  viewHeight: 900
};