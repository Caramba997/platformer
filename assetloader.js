const textures = [
  {
    type: "background",
    src: "textures/Background.png",
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
];

(function() {
  const textureContainer = document.getElementById('textures'),
        textureHtml = '<img data-texture="{{type}}" src="{{src}}" data-width="{{imageWidth}}" data-height="{{imageHeight}}" width="{{width}}" height="{{height}}">'
  for (let texture of textures) {
    let html = textureHtml;
    for (let entry of Object.entries(texture)) {
      html = html.replace('{{' + entry[0] + '}}', entry[1]);
    }
    textureContainer.innerHTML += html;
  }
})();