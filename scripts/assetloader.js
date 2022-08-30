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
    type: "changingtab",
    src: "sounds/mixkit-arcade-retro-changing-tab-206.wav"
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
    const soundHtml = '<audio data-sound="{{type}}" src="{{src}}"></audio>';
    progress.sounds.steps = sounds.length;
    for (let sound of sounds) {
      const audio = document.createElement('audio');
      soundContainer.appendChild(audio);
      audio.addEventListener('canplaythrough', () => {
        progress.sounds.current += 1;
        window.dispatchEvent(new CustomEvent('progress:changed', { detail: progress }));
      });
      audio.setAttribute('data-sound', sound.type);
      audio.src = sound.src;
    }
    soundContainer.setAttribute('data-initialized', 'true');
  }
}