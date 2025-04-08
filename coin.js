import { ANIM } from "./anim.js";
import { drawCollisionBox } from "./collision.js";
import { zzfx } from "https://esm.sh/zzfx";

export const coins = [
  {
    x: 400,
    y: 275,
    collision: [25, -25, 50, 50],
  },
  {
    x: 600,
    y: 75,
    collision: [25, -25, 50, 50],
  },
  {
    x: 100,
    y: 75,
    collision: [25, -25, 50, 50],
  },
];

export function drawCoin(ctx, coin, shift, image) {
  if (coin.collected) {
    return;
  }
  drawCollisionBox(ctx, coin, shift);

  const animation = ANIM.COIN;
  const frame = Math.floor((Date.now() / 100) % animation.length);
  ctx.drawImage(
    image,
    animation[frame] * 512,
    0,
    512,
    512,
    coin.x + shift.x + 25,
    coin.y + shift.y - 25,
    50,
    50
  );
}

export function collectCoin(coin) {
  if (coin.collected) {
    return false;
  }
  coin.collected = true;

  zzfx(
    ...[
      2,
      ,
      480,
      0.02,
      0.1,
      0.11,
      1,
      0.1,
      ,
      17,
      237,
      0.09,
      0.01,
      ,
      ,
      ,
      0.08,
      0.52,
      0.02,
    ]
  ); // Pickup 979
  return true;
}
