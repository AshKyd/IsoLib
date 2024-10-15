function renderSprites({ ctx, translate = [0, 0], sprites = [] }) {
  sprites.forEach((sprite) => {
    ctx.drawImage(...sprite.coords, sprite.sprite);
  });
}
