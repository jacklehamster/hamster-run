function elementsIntersect(element1, element2) {
  const r1 = getCollisionRect(element1);
  const r2 = getCollisionRect(element2);
  return rectanglesIntersect(r1, r2);
}

function rectanglesIntersect(r1, r2) {
  const left1 = r1[0];
  const right1 = r1[0] + r1[2];
  const top1 = r1[1];
  const bottom1 = r1[1] + r1[3];
  const left2 = r2[0];
  const right2 = r2[0] + r2[2];
  const top2 = r2[1];
  const bottom2 = r2[1] + r2[3];

  //  check intersection
  if (left1 > right2 || right1 < left2 || top1 > bottom2 || bottom1 < top2) {
    return null;
  }

  const leftPush = left2 - right1;
  const rightPush = right2 - left1;
  const topPush = top2 - bottom1;
  const bottomPush = bottom2 - top1;
  const xPush = Math.abs(leftPush) < Math.abs(rightPush) ? leftPush : rightPush;
  const yPush = Math.abs(topPush) < Math.abs(bottomPush) ? topPush : bottomPush;
  return { xPush, yPush };
}

function getCollisionRect(element) {
  const collisionRect = [
    element.x + element.collision[0],
    element.y + element.collision[1],
    element.collision[2],
    element.collision[3],
  ];
  return collisionRect;
}

export function drawCollisionBox(ctx, element, shift) {
  ctx.fillStyle = element.colliding
    ? "rgb(255, 0, 0, 0.3)"
    : "rgb(255, 255, 255, 0.3)";
  const collisionRect = [
    shift.x + element.x + element.collision[0],
    shift.y + element.y + element.collision[1],
    element.collision[2],
    element.collision[3],
  ];
  ctx.fillRect(...collisionRect);
}

export function checkCollision(hamster, trees, callback) {
  hamster.colliding = false;
  trees.forEach((tree) => {
    const push = elementsIntersect(hamster, tree);
    if (push) {
      callback(hamster, tree, push);
    }
  });
}
