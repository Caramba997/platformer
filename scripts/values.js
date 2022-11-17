export const VALUES = {
  blockSize: 50,
  bounceFactor: 0.6,
  bounceJumpFactor: 1.1,
  coinSize: 30,
  coinSpeed: 0.2,
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
    'Escape': 'pause',
    'Jump': 'jump',
    'Fire': 'fire',
    'Left': 'left',
    'Right': 'right'
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
  jumpTimeWater: 300.0,
  maxEnemySpeed: 0.07,
  maxEnemyWaterSpeed: 0.03,
  maxJumpHeight: 220.0,
  maxPlayerRunSpeed: 0.8,
  maxFallSpeed: -1.3,
  maxPlayerWalkSpeed: 0.5,
  maxWaterSinkSpeed: -0.2,
  maxWaterSpeedRunX: 0.4,
  maxWaterSpeedX: 0.2,
  maxWaterJumpHeight: 40,
  parallaxFactor: 0.5,
  playerHeight: 60,
  playerHeightSuper: 100,
  playerSpeedGrowth: 0.002,
  playerSpeedGrowthWater: 0.001,
  playerStates: {
    normal: "normal",
    super: "super",
    fire: "fire"
  },
  playerWaterLeaveSpeedFactor: 0.8,
  playerWidth: 30,
  playerWidthSuper: 50,
  points: {
    coin: 20,
    enemy: 200,
    item: 1000,
    time: 0.1
  },
  powerUpTime: 500,
  propDefault: 'default',
  propSpeed: 0.08,
  shotCooldown: 1000,
  spawnDistance: 3000,
  trashCans: ['props', 'items', 'shots', 'coinProps', 'enemies'],
  viewRatioX: 0.5,
  viewRatioY: 0.4,
  viewWidth: 1600,
  viewHeight: 900
};