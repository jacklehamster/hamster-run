import { ANIM } from "./anim.js";
import { drawCollisionBox } from "./collision.js";
import { zzfx } from "https://esm.sh/zzfx";

const GROUND = 300;
const GRAVITY = 1;
const HAMSTER_SPEED = 5;

export const hamster = {
  x: 200,
  y: 300,
  dx: 0,
  dy: 0,
  direction: 1,
  collision: [15, -10, 72, 33],
};

export function hurt(hamster) {
  if (hamster.invincible) {
    return false;
  }
  hamster.invincible = Date.now();

  hurtSound();
  return true;
}

export function drawHamster(ctx, hamster, gameInfo, shift, image) {
  if (hamster.invincible) {
    if (Math.random() < 0.5) {
      return;
    }
  }

  const state = hamster.dx ? "RUN" : "IDLE";
  const direction = hamster.direction > 0 ? "RIGHT" : "LEFT";

  const animation = ANIM.HAMSTER[state][direction];
  const frame = Math.floor((Date.now() / 100) % animation.length);
  const shake = gameInfo.gameOver ? 100 - 50 : 0;

  drawCollisionBox(ctx, hamster, shift);

  ctx.drawImage(
    image,
    0 + animation[frame] * 512,
    0,
    512,
    512,
    hamster.x + shake * Math.random() + shift.x,
    hamster.y - 55 + shake * Math.random() + shift.y,
    100,
    100
  );
}

export function handleHamster(hamster, keys) {
  let dx = 0;
  if (keys.ArrowLeft || keys.KeyA) {
    dx--;
  }
  if (keys.ArrowRight || keys.KeyD) {
    dx++;
  }
  if (dx) {
    hamster.direction = dx;
  }
  hamster.dx = dx * HAMSTER_SPEED;
  hamster.y += hamster.dy;
  hamster.x += hamster.dx;
  hamster.dy += GRAVITY;
  if (hamster.y > GROUND) {
    hamster.y = GROUND;
    hamster.dy = 0;
    hamster.grounded = true;
  }

  if (hamster.invincible) {
    if (Date.now() - hamster.invincible > 3000) {
      delete hamster.invincible;
    }
  }
}

export function jump(hamster) {
  hamster.dy = -20;
  hamster.grounded = false;
}

function hurtSound() {
  zzfx(
    ...[
      4.7,
      ,
      71,
      0.01,
      0.08,
      0.13,
      ,
      2.7,
      ,
      45,
      ,
      ,
      ,
      0.3,
      ,
      ,
      ,
      0.51,
      0.01,
      ,
      402,
    ]
  ); // Jump 985
}
