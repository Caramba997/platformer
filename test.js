processPhysics() {
  const player = this.world.player;
  player.lastY = player.y;
  player.x += player.speedX * this.deltaTime;
  player.y += player.speedY * this.deltaTime;
  if (player.forward && player.speedX < 0) {
    player.forward = false;
  }
  else if (!player.forward && player.speedX > 0) {
    player.forward = true;
  }
  // Check if player is still on the same ground
  if (player.grounded) {
    const prop = player.ground;
    if (prop.x > player.x + player.width || prop.x + prop.width < player.x) {
      player.grounded = false;
    }
  }
  // Check if a ground is reached in fall of player
  if (!player.grounded) {
    if (player.y + player.height < 0) {
      this.gameOver();
      return;
    }
    player.speedY = Math.max(Values.maxPlayerSpeedY, player.speedY - this.deltaTime * this.playerSpeedShrinkY);
    for (let prop of this.world.props) {
      if (!prop.ground) continue;
      if (player.speedY < 0 && prop.y + prop.height <= player.lastY && prop.x < player.x + player.width && prop.x + prop.width > player.x && prop.y + prop.height >= player.y && prop.y <= player.y) {
        player.speedY = 0.0;
        player.grounded = true;
        player.ground = prop;
        player.y = prop.y + prop.height + 1;
        break;
      }
    }
  }
  if (player.x < 0) {
    player.speedX = 0.0;
    player.x = 0;
  }
  else if (player.x + player.width > this.world.width) {
    player.speedX = 0.0;
    player.x = this.world.width - player.width;
  }
  else {
    for (let prop of this.world.props) {
      if (!prop.solid) continue;
      // Detect y-axis collisions
      if (player.speedY > 0 && prop.y > player.lastY) { // Player is going upward
        if (player.width <= prop.width) { // Player smaller or equally wide as prop
          const playerInPropY = prop.y <= player.y + player.height && prop.y + prop.height >= player.y + player.height,
                playerLeftInProp = prop.x <= player.x && prop.x + prop.width >= player.x,
                playerRightInProp = prop.x <= player.x + player.width && prop.x + prop.width >= player.x + player.width;
          if (playerInPropY && (playerLeftInProp || playerRightInProp)) {
            player.speedY = 0.0;
            player.y = prop.y - player.height - 1;
            break;
          }
        }
        else { // Player wider than prop
          const playerInPropY = prop.y <= player.y + player.height && prop.y + prop.height >= player.y + player.height,
                propLeftInPlayer = prop.x > player.x && prop.x < player.x + player.width,
                propRightInPlayer = prop.x + prop.width > player.x && prop.x + prop.width < player.x + player.width;
          if (playerInPropY && (propLeftInPlayer || propRightInPlayer)) {
            player.speedX = 0.0;
            player.y = prop.y - player.height - 1;
            break;
          }
        }
      }
      // Detect x-axis collisions
      if (player.speedX > 0) { // Player is going forward
        if (player.height <= prop.height) { // Player smaller or equally tall as prop
          const playerInPropX = prop.x <= player.x + player.width && prop.x + prop.width >= player.x + player.width,
                playerBottomInProp = prop.y <= player.y && prop.y + prop.height >= player.y,
                playerTopInProp = prop.y <= player.y + player.height && prop.y + prop.height >= player.y + player.height;
          if (playerInPropX && (playerBottomInProp || playerTopInProp)) {
            player.speedX = 0.0;
            player.x = prop.x - player.width - 1;
            break;
          }
        }
        else { // Player taller than prop
          const playerInPropX = prop.x <= player.x + player.width && prop.x + prop.width >= player.x + player.width,
                propBottomInPlayer = prop.y > player.y && prop.y < player.y + player.height,
                propTopInPlayer = prop.y + prop.height > player.y && prop.y + prop.height < player.y + player.height;
          if (playerInPropX && (propBottomInPlayer || propTopInPlayer)) {
            player.speedX = 0.0;
            player.x = prop.x - player.width - 1;
            break;
          }
        }
      }
      else if (player.speedX < 0) { // Player is going backward
        if (player.height <= prop.height) { // Player smaller or equally tall as prop
          const playerInPropX = prop.x <= player.x && prop.x + prop.width >= player.x,
                playerBottomInProp = prop.y <= player.y && prop.y + prop.height >= player.y,
                playerTopInProp = prop.y <= player.y + player.height && prop.y + prop.height >= player.y + player.height;
          if (playerInPropX && (playerBottomInProp || playerTopInProp)) {
            player.speedX = 0.0;
            player.x = prop.x + prop.width + 1;
            break;
          }
        }
        else { // Player taller than prop
          const playerInPropX = prop.x <= player.x && prop.x + prop.width >= player.x,
                propBottomInPlayer = prop.y > player.y && prop.y < player.y + player.height,
                propTopInPlayer = prop.y + prop.height > player.y && prop.y + prop.height < player.y + player.height;
          if (playerInPropX && (propBottomInPlayer || propTopInPlayer)) {
            player.speedX = 0.0;
            player.x = prop.x + prop.width  + 1;
            break;
          }
        }
      }
    }
  }
  console.log(this.world.player.x, this.world.player.y)
}