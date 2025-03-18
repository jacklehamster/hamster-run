const GROUND = 300;
const GRAVITY = 1;
const TREE_TOP = 170;
const HAMSTER_SPEED = 5;
const ANIM = {
  HAMSTER: {
    IDLE: {
      RIGHT: [0],
      LEFT: [3],
    },
    RUN: {
      RIGHT: [0, 1, 2],
      LEFT: [3, 4, 5],
    },
  },
  TREE: [6],
};

const image = document.createElement("img");
image.src = "hamster.png";

function jump(hamster) {
  hamster.dy = -20;
  hamster.grounded = false;
}

function handleKeyboardControl(keys, gameInfo, hamster, trees) {
  document.addEventListener("keydown", (e) => {
    e.preventDefault();
    if (!keys[e.code]) {
      keys[e.code] = true;
    }

    if (gameInfo.gameOver) {
      if (Date.now() - gameInfo.gameOver > 500) {
        gameInfo.gameOver = 0;
        gameInfo.score = 0;
        trees.forEach((tree, i) => {
          tree.x = 800 + i * 300;
          tree.passed = false;
        });
        hamster.y = 300;
        hamster.dy = 0;
      }
    } else if (e.code === "Space") {
      if (hamster.grounded) {
        jump(hamster);
      }
    }
  });
  document.addEventListener("keyup", (e) => {
    delete keys[e.code];
  });
}

function moveHamster(hamster, keys) {
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
}

function moveTree(tree, hamster, gameInfo, scoreDiv) {
  // tree.x -= 10;
  // if (tree.x < hamster.x && !tree.passed) {
  //   if (hamster.y < TREE_TOP) {
  //     gameInfo.score++;
  //     tree.passed = true;
  //     scoreDiv.textContent = `SCORE: ${gameInfo.score}`;
  //   } else if (!gameInfo.gameOver) {
  //     gameInfo.gameOver = Date.now();
  //   }
  // }
  // if (tree.x < -150) {
  //   tree.x = 800 + Math.random() * 3000;
  //   tree.passed = false;
  // }
}

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

function drawCollisionBox(ctx, element, shift) {
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

function drawHamster(ctx, hamster, gameInfo, shift) {
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

function drawTree(ctx, tree, shift) {
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

function checkCollision(hamster, trees) {
  hamster.colliding = false;
  trees.forEach((tree) => {
    const push = elementsIntersect(hamster, tree);
    if (push) {
      hamster.colliding = true;
      if (Math.abs(push.xPush) > Math.abs(push.yPush)) {
        hamster.y += push.yPush;
        hamster.dy = 0;
        if (push.yPush <= 0) {
          hamster.grounded = true;
        }
      } else {
        hamster.x += push.xPush;
      }
    }
  });
}

function moveCameraToHamster(hamster, shift) {
  const dx = -hamster.x + 200 - shift.x;
  const dy = -hamster.y + 300 - shift.y;
  shift.x += dx / 10;
  shift.y += dy / 10;
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  const shift = {
    x: 0,
    y: 0,
  };

  const gameInfo = {
    gameOver: 0,
    score: 0,
  };

  const hamster = {
    x: 200,
    y: 300,
    dx: 0,
    dy: 0,
    direction: 1,
    collision: [15, -10, 72, 33],
  };

  const trees = [
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

  const scoreDiv = document.querySelector("#score");

  const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
  skyGradient.addColorStop(0, "lightblue");
  skyGradient.addColorStop(1, "#88aaff");

  const keys = {};
  handleKeyboardControl(keys, gameInfo, hamster, trees);

  function loop() {
    //  Movement
    if (!gameInfo.gameOver) {
      moveHamster(hamster, keys);

      trees.forEach((tree) => {
        moveTree(tree, hamster, gameInfo, scoreDiv);
      });
    }
    checkCollision(hamster, trees);

    //  Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 20, canvas.width, canvas.height);

    ctx.fillStyle = "green";
    ctx.fillRect(0, 320 + shift.y, canvas.width, 120);

    drawHamster(ctx, hamster, gameInfo, shift);

    trees.forEach((tree) => {
      drawTree(ctx, tree, shift);
    });

    moveCameraToHamster(hamster, shift);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const globalData = {
    keys,
    gameInfo,
    hamster,
    trees,
  };

  const globalDataDiv = document.body.appendChild(
    document.createElement("div")
  );
  globalDataDiv.style.height = "500px";
  globalDataDiv.style.width = "100%";
  globalDataDiv.style.height = "100%";
  globalDataDiv.style.backgroundColor = "#ccc";
  globalDataDiv.style.whiteSpace = "pre-wrap";
  globalDataDiv.style.overflow = "auto";
  globalDataDiv.style.fontFamily = "monospace";

  function refreshGlobalData() {
    globalDataDiv.textContent = JSON.stringify(globalData, null, 2);
    requestAnimationFrame(refreshGlobalData);
  }
  refreshGlobalData();
});
