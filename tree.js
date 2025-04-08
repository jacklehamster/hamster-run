import { ANIM } from "./anim.js";
import { drawCollisionBox } from "./collision.js";
const TREE_TOP = 170;

export const trees = [
  {
    x: 500,
    y: 325,
    collision: [45, -145, 65, 150],
  },
  {
    x: 600,
    y: 325,
    collision: [45, -145, 65, 150],
  },
  {
    x: 300,
    y: 225,
    collision: [45, -145, 65, 150],
  },
];

export function drawTree(ctx, tree, shift, image) {
  drawCollisionBox(ctx, tree, shift);
  ctx.drawImage(
    image,
    ANIM.TREE[0] * 512,
    0,
    512,
    512,
    tree.x + shift.x,
    tree.y - TREE_TOP + shift.y,
    150,
    200
  );
}
