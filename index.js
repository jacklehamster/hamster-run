const GROUND = 300;
const GRAVITY = 1;
const HAMSTER_SPEED = 5;
const TREE_TOP = 170;

const ANIM = {
  HAMSTER: {
    STILL: {
      LEFT: [3],
      RIGHT: [0],
    },
    RUN: {
      LEFT: [3, 4, 5],
      RIGHT: [0, 1, 2],
    },
  },
  TREE: [6],
};
const image = new Image();
image.src = "hamster.png";

function jump(hamster) {
  hamster.grounded = false;
  hamster.dy = -20;
}

function highlightFocusedWindow() {
  document.body.style.border = "5px solid white";
  window.addEventListener("focus", (e) => {
    document.body.style.border = "5px solid red";
  });
  window.addEventListener("blur", (e) => {
    document.body.style.border = "5px solid white";
  });
}

function handleControls(hamster, gameInfo, keys) {
  document.addEventListener("keydown", (e) => {
    e.preventDefault();
    if (!keys[e.code]) {
      keys[e.code] = Date.now();
    }
    if (e.code === "Space") {
      if (gameInfo.gameOver) {
        if (Date.now() - gameInfo.gameOver > 500) {
          gameInfo.gameOver = 0;
          gameInfo.score = 0;
          trees.forEach((tree) => {
            tree.x = 300;
          });
          return;
        }
      } else {
        if (hamster.grounded) {
          jump(hamster);
        }
      }
    }
  });
  document.addEventListener("keyup", (e) => {
    delete keys[e.code];
  });
}

function handleHamsterMove(hamster, keys) {
  let dx = 0;
  if (keys.ArrowLeft || keys.KeyA) {
    dx--;
  }
  if (keys.ArrowRight || keys.KeyD) {
    dx++;
  }
  if (dx !== 0) {
    hamster.direction = dx;
  }

  const speed = HAMSTER_SPEED * (hamster.grounded ? 1 : 1.2);

  hamster.dx = dx * speed;
  hamster.x += hamster.dx;
  hamster.y += hamster.dy;
  hamster.dy += GRAVITY;
  if (hamster.y > GROUND) {
    hamster.y = GROUND;
    hamster.dy = 0;
    hamster.grounded = true;
  }
}

function drawHamster(ctx, hamster, gameInfo, shift) {
  const globalFrame = Math.floor(Date.now() / 50);
  const direction = hamster.direction > 0 ? "RIGHT" : "LEFT";
  const state = hamster.dx ? "RUN" : "STILL";
  const animation = ANIM.HAMSTER[state][direction];
  const shake = gameInfo.gameOver ? 100 - 50 : 0;

  const area = collisionArea(hamster, shift);
  ctx.fillStyle = hamster.colliding
    ? "rgba(255, 0, 0, .3)"
    : "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(...area);

  ctx.drawImage(
    image,
    0 + animation[globalFrame % animation.length] * 512,
    0,
    512,
    512,
    shift.x + hamster.x + shake * Math.random(),
    shift.y + hamster.y - 55 + shake * Math.random(),
    100,
    100
  );
}

function drawTree(ctx, tree, shift) {
  const area = collisionArea(tree, shift);
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(...area);

  ctx.drawImage(
    image,
    6 * 512,
    0,
    512,
    512,
    shift.x + tree.x,
    shift.y + tree.y - TREE_TOP,
    150,
    200
  );
}

function collisionArea(elem, shift) {
  return [
    shift.x + elem.x + elem.collisionBox[0],
    shift.y + elem.y + elem.collisionBox[1],
    elem.collisionBox[2],
    elem.collisionBox[3],
  ];
}

function checkCollisionPush(elem1, elem2, shift) {
  const [left1, top1, w1, h1] = collisionArea(elem1, shift);
  const [left2, top2, w2, h2] = collisionArea(elem2, shift);
  const right1 = left1 + w1;
  const right2 = left2 + w2;
  const bottom1 = top1 + h1;
  const bottom2 = top2 + h2;

  const colliding =
    left1 < right2 && right1 > left2 && top1 < bottom2 && bottom1 > top2;
  if (!colliding) {
    return null;
  }
  const pushLeft = right1 - left2;
  const pushRight = right2 - left1;
  const pushTop = bottom1 - top2;
  const pushBottom = bottom2 - top1;
  return {
    xPush: pushLeft < pushRight ? -pushLeft : pushRight,
    yPush: pushTop < pushBottom ? -pushTop : pushBottom,
  };
}

function focusOnHamster(shift, hamster) {
  const dx = -hamster.x + 300 - shift.x;
  shift.x += dx * 0.1;
  // shift.y = -hamster.y + 200;
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  const gameInfo = {
    gameOver: 0,
  };

  const shift = {
    x: 0,
    y: 0,
  };

  const hamster = {
    x: 200,
    y: 300,
    dx: 0,
    dy: 0,
    direction: 1,
    collisionBox: [15, -10, 70, 35],
  };

  const trees = [
    {
      x: 300,
      y: 325,
      collisionBox: [45, -145, 60, 150],
    },
    {
      x: 500,
      y: 325 - 100,
      collisionBox: [45, -145, 60, 150],
    },
    {
      x: 800,
      y: 325,
      collisionBox: [45, -145, 60, 150],
    },
  ];

  const scoreDiv = document.querySelector("#score");
  scoreDiv.style.display = "none";

  const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
  skyGradient.addColorStop(0, "lightblue");
  skyGradient.addColorStop(1, "#88aaff");

  const keys = {};

  handleControls(hamster, gameInfo, keys);
  highlightFocusedWindow();

  function loop() {
    //  Movement
    if (!gameInfo.gameOver) {
      handleHamsterMove(hamster, keys);
    }

    //  Collision
    delete hamster.colliding;
    trees.forEach((tree) => {
      const collisionPush = checkCollisionPush(hamster, tree, shift);
      if (collisionPush) {
        hamster.colliding = true;
        console.log(collisionPush);
        if (Math.abs(collisionPush.xPush) < Math.abs(collisionPush.yPush)) {
          hamster.x += collisionPush.xPush;
          hamster.dx = 0;
        } else {
          hamster.y += collisionPush.yPush;
          hamster.dy = 0;
          hamster.grounded = true;
        }
      }
    });

    focusOnHamster(shift, hamster);

    //  Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 20, canvas.width, 300);

    ctx.fillStyle = "green";
    ctx.fillRect(0, 320, canvas.width, 120);

    drawHamster(ctx, hamster, gameInfo, shift);

    trees.forEach((tree) => {
      drawTree(ctx, tree, shift);
    });

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const globalData = {
    keys,
    shift,
    gameInfo,
    hamster,
    trees,
  };
  const infoDiv = document.body.appendChild(document.createElement("div"));
  infoDiv.style.whiteSpace = "pre";
  infoDiv.style.fontFamily = "monospace";
  function updateInfo() {
    infoDiv.textContent = JSON.stringify(globalData, null, 2);
    requestAnimationFrame(updateInfo);
  }
  requestAnimationFrame(updateInfo);
});
