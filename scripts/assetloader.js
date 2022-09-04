const textures = [
  {
    type: "forest",
    src: "textures/Background.png",
    imageWidth: "1600",
    imageHeight: "1800",
    width: "1600",
    height: "1800"
  },
  {
    type: "desert",
    src: "textures/DesertBackground.png",
    imageWidth: "1600",
    imageHeight: "1800",
    width: "1600",
    height: "1800"
  },
  {
    type: "hills",
    src: "textures/HillsBackground.png",
    imageWidth: "1600",
    imageHeight: "1800",
    width: "1600",
    height: "1800"
  },
  {
    type: "playernormal",
    src: "textures/PlayerNormal.png",
    imageWidth: "100",
    imageHeight: "200",
    width: "30",
    height: "60"
  },
  {
    type: "playersuper",
    src: "textures/PlayerSuper.png",
    imageWidth: "100",
    imageHeight: "200",
    width: "50",
    height: "100"
  },
  {
    type: "playerfire",
    src: "textures/PlayerFire.png",
    imageWidth: "100",
    imageHeight: "200",
    width: "50",
    height: "100"
  },
  {
    type: "spike",
    src: "textures/Spike.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "bubble",
    src: "textures/Bubble.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "desertspike",
    src: "textures/DesertSpike.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "desertbubble",
    src: "textures/DesertBubble.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "toxicplant",
    src: "textures/ToxicPlant.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "wingman",
    src: "textures/Wingman.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "grass",
    src: "textures/Grass.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "100",
    height: "100"
  },
  {
    type: "dirt",
    src: "textures/Dirt.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "100",
    height: "100"
  },
  {
    type: "sand",
    src: "textures/Sand.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "100",
    height: "100"
  },
  {
    type: "sandground",
    src: "textures/SandGround.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "100",
    height: "100"
  },
  {
    type: "cloud",
    src: "textures/Cloud.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "brick",
    src: "textures/Brick.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "brickhit",
    src: "textures/BrickHit.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "orangeplatform",
    src: "textures/OrangePlatform.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "coin",
    src: "textures/Coin.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "30",
    height: "30"
  },
  {
    type: "itemblock",
    src: "textures/ItemBlock.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "itemblockhit",
    src: "textures/ItemBlockHit.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "solidblock",
    src: "textures/SolidBlock.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "solidblock2",
    src: "textures/SolidBlock2.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "finishground",
    src: "textures/FinishGround.png",
    imageWidth: "100",
    imageHeight: "50",
    width: "100",
    height: "50"
  },
  {
    type: "finishflag",
    src: "textures/FinishFlag.png",
    imageWidth: "100",
    imageHeight: "400",
    width: "100",
    height: "400"
  },
  {
    type: "mushroom",
    src: "textures/Mushroom.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "flower",
    src: "textures/Flower.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "fire",
    src: "textures/Fire.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "pipe",
    src: "textures/Pipe.png",
    imageWidth: "200",
    imageHeight: "200",
    width: "100",
    height: "100"
  },
  {
    type: "pipetop",
    src: "textures/PipeTop.png",
    imageWidth: "200",
    imageHeight: "200",
    width: "100",
    height: "100"
  },
  {
    type: "mushroomcap",
    src: "textures/MushroomCap.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "mushroomcapblue",
    src: "textures/MushroomCapBlue.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "mushroomcapyellow",
    src: "textures/MushroomCapYellow.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "mushroomstem",
    src: "textures/MushroomStem.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "rocketspawner",
    src: "textures/RocketSpawner.png",
    imageWidth: "100",
    imageHeight: "100",
    width: "50",
    height: "50"
  },
  {
    type: "rocket",
    src: "textures/Rocket.png",
    imageWidth: "100",
    imageHeight: "50",
    width: "50",
    height: "25"
  }
];

const sounds = [
  {
    type: "jump",
    src: "sounds/mixkit-quick-jump-arcade-game-239.wav"
  },
  {
    type: "coin",
    src: "sounds/mixkit-bonus-earned-in-video-game-2058.wav",
    volume: 0.7
  },
  {
    type: "kill",
    src: "sounds/mixkit-creature-cry-of-hurt-2208.wav"
  },
  {
    type: "jumpboost",
    src: "sounds/mixkit-explainer-video-game-alert-sweep-236.wav"
  },
  {
    type: "gameover",
    src: "sounds/mixkit-player-losing-or-failing-2042.wav"
  },
  {
    type: "powerup1",
    src: "sounds/mixkit-player-boost-recharging-2040.wav"
  },
  {
    type: "powerup2",
    src: "sounds/mixkit-player-recharging-in-video-game-2041.wav"
  },
  {
    type: "hit",
    src: "sounds/mixkit-video-game-retro-click-237.wav"
  },
  {
    type: "destroy",
    src: "sounds/mixkit-arcade-mechanical-bling-210.wav"
  },
  {
    type: "restart",
    src: "sounds/mixkit-unlock-game-notification-253.wav"
  },
  {
    type: "damage",
    src: "sounds/mixkit-boxer-getting-hit-2055.wav"
  },
  {
    type: "supermariomedley",
    src: "sounds/Super Mario Bros. Soundtrack.mp3",
    loop: true,
    volume: 0.5
  },
  {
    type: "mariobros",
    src: "sounds/New Super Mario Bros Music; Main Theme.mp3",
    loop: true,
    volume: 0.5
  },
  {
    type: "mariobrosdesert",
    src: "sounds/Desert Theme - New Super Mario Bros. Wii.mp3",
    loop: true,
    volume: 0.5
  },
  {
    type: "mariobrosathletic",
    src: "sounds/New Super Mario Bros. Soundtrack - Athletic.mp3",
    loop: true,
    volume: 0.5
  },
  {
    type: "mariobrostower",
    src: "sounds/New Super Mario Bros. Soundtrack - Tower.mp3",
    loop: true,
    volume: 0.5
  },
  {
    type: "mariobrosunderwater",
    src: "sounds/New Super Mario Bros. Soundtrack - Underwater.mp3",
    loop: true,
    volume: 0.5
  },
  {
    type: "completed",
    src: "sounds/mixkit-game-level-completed-2059.wav"
  },
  {
    type: "itemspawn",
    src: "sounds/mixkit-video-game-treasure-2066.wav"
  },
  {
    type: "shoot",
    src: "sounds/mixkit-small-hit-in-a-game-2072.wav"
  },
  {
    type: "spawner",
    src: "sounds/mixkit-neutral-bot-pinbal-tone-3137.wav"
  }
];

export class AssetLoader {
  loadTextures(textureContainer, progress) {
    progress.textures.steps = textures.length;
    for (let texture of textures) {
      const img = document.createElement('img');
      textureContainer.appendChild(img);
      img.addEventListener('load', () => {
        progress.textures.current += 1;
        window.dispatchEvent(new CustomEvent('progress:changed', { detail: progress }));
      });
      img.width = texture.width;
      img.height = texture.height;
      img.setAttribute('data-texture', texture.type);
      img.setAttribute('data-width', texture.imageWidth);
      img.setAttribute('data-height', texture.imageHeight);
      img.src = texture.src;
    }
    textureContainer.setAttribute('data-initialized', 'true');
  }

  loadSounds(soundContainer, progress) {
    window.sounds = {};
    progress.sounds.steps = sounds.length;
    for (let sound of sounds) {
      const audio = document.createElement('audio');
      soundContainer.appendChild(audio);
      audio.addEventListener('canplaythrough', () => {
        progress.sounds.current += 1;
        window.dispatchEvent(new CustomEvent('progress:changed', { detail: progress }));
      });
      audio.setAttribute('data-sound', sound.type);
      if (sound.loop) audio.loop = true;
      if (sound.volume) audio.volume = sound.volume;
      audio.src = sound.src;
      window.sounds[sound.type] = audio;
    }
    soundContainer.setAttribute('data-initialized', 'true');
  }
}