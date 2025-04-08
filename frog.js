import { ANIM } from "./anim.js";
import { drawCollisionBox } from "./collision.js";
import { hurt } from "./hamster.js";
import { log } from "./log.js";
import { zzfx } from "https://esm.sh/zzfx";

const GROUND = 300;
const GRAVITY = 0.5;
const FROG_SPEED = 4;

export const frogs = [
  {
    x: 0,
    y: 300,
    dx: 0,
    dy: 0,
    direction: -1,
    collision: [25, -25, 50, 50],
  },
  {
    x: -200,
    y: 300,
    dx: 0,
    dy: 0,
    direction: -1,
    collision: [25, -25, 50, 50],
  },
  {
    x: -400,
    y: 300,
    dx: 0,
    dy: 0,
    direction: -1,
    collision: [25, -25, 50, 50],
  },
  {
    x: -600,
    y: 300,
    dx: 0,
    dy: 0,
    direction: -1,
    collision: [25, -25, 50, 50],
  },
  {
    x: -800,
    y: 300,
    dx: 0,
    dy: 0,
    direction: -1,
    collision: [25, -25, 50, 50],
  },
  {
    x: -1000,
    y: 300,
    dx: 0,
    dy: 0,
    direction: -1,
    collision: [25, -25, 50, 50],
  },
];

export function drawFrog(ctx, frog, shift, image) {
  drawCollisionBox(ctx, frog, shift);

  const direction = frog.direction > 0 ? "RIGHT" : "LEFT";
  const state = frog.ko ? "KO" : frog.grounded ? "IDLE" : "JUMP";

  const animation = ANIM.FROG[state][direction];
  const frame = Math.floor((Date.now() / 100) % animation.length);
  ctx.drawImage(
    image,
    animation[frame] * 512,
    0,
    512,
    512,
    frog.x + shift.x + 25,
    frog.y + shift.y - 25,
    50,
    50
  );
}

export function collideFrog(hamster, frog, push) {
  if (frog.ko) {
    return false;
  }
  if (Math.abs(push.yPush) < Math.abs(push.xPush)) {
    if (push.yPush < 0) {
      hamster.dy = -10;
      koFrog(frog);
      return false;
    }
  }

  log.push = push;
  return hurt(hamster);
}

function koFrog(frog) {
  frog.ko = true;
  koFrogSound();
}

export function handleFrog(frog) {
  const dx = frog.direction;
  if (frog.lastJump === undefined) {
    frog.lastJump = Date.now() + Math.random() * 10000;
  }

  if (Date.now() - frog.lastJump > 3000) {
    if (!frog.ko) {
      frog.lastJump = Date.now();
      frog.dy = -15;
      frog.grounded = false;
    }
  }

  if (!frog.grounded) {
    frog.dx = dx * FROG_SPEED;
    frog.x += frog.dx;
  }
  frog.y += frog.dy;
  frog.dy += GRAVITY;
  if (frog.y > GROUND) {
    frog.y = GROUND;
    frog.dy = 0;
    if (!frog.grounded) {
      frog.grounded = true;
      frog.direction = -frog.direction;
    }
  }
}

function koFrogSound() {
  zzfx(
    ...[
      3.6,
      ,
      338,
      0.01,
      0.03,
      0.15,
      ,
      2.3,
      -3,
      -39,
      ,
      ,
      ,
      ,
      34,
      ,
      0.03,
      0.63,
      0.04,
      ,
      364,
    ]
  ); // Pickup 978
}
