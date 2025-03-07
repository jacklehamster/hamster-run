const GROUND = 300;
const GRAVITY = 1;
const TREE_TOP = 170;
const HAMSTER_SPEED = 5;
const FRAMES = {
  HAMSTER: {
    LEFT: {
      STILL: [3],
      WALK: [3, 4, 5],
    },
    RIGHT: {
      STILL: [0],
      WALK: [0, 1, 2],
    },
  },
};

function calculateCollisionBox(elem) {
  return [
    elem.x + elem.collisionBox[0],
    elem.y + elem.collisionBox[1],
    elem.collisionBox[2],
    elem.collisionBox[3],
  ];
}

function jump(hamster) {
  hamster.dy = -20;
  hamster.grounded = false;
}

function handleHamsterControl(hamster, gameInfo, keys) {
  document.addEventListener("keydown", (e) => {
    e.preventDefault();
    if (!keys[e.code]) {
      keys[e.code] = Date.now();
      if (e.code === "Space") {
        if (gameInfo.gameOver) {
          if (Date.now() - gameInfo.gameOver > 500) {
            restartGame();
            return;
          }
        } else {
          if (hamster.grounded) {
            jump(hamster);
          }
        }
      }
    }
  });
  document.addEventListener("keyup", (e) => {
    delete keys[e.code];
  });
}

function handleHamsterMovement(hamster, keys) {
  let dx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    dx--;
  }
  if (keys["ArrowRight"] || keys["KeyD"]) {
    dx++;
  }

  if (dx) {
    hamster.direction = dx;
  }

  hamster.dx = dx * HAMSTER_SPEED;
  hamster.x += hamster.dx;
  hamster.y += hamster.dy;
  hamster.dy += GRAVITY;
  if (hamster.y > GROUND) {
    hamster.y = GROUND;
    hamster.dy = 0;
    hamster.grounded = true;
  }
}

function didCollide(elem1, elem2) {
  const [x1, y1, w1, h1] = calculateCollisionBox(elem1);
  const [x2, y2, w2, h2] = calculateCollisionBox(elem2);
  const right1 = x1 + w1;
  const right2 = x2 + w2;
  const bottom1 = y1 + h1;
  const bottom2 = y2 + h2;
  if (!(x1 < right2 && right1 > x2 && y1 < bottom2 && bottom1 > y2)) {
    elem1.xPush = 0;
    elem1.yPush = 0;
    return null;
  }
  const midX1 = x1 + w1 / 2;
  const midY1 = y1 + h1 / 2;
  const midX2 = x2 + w2 / 2;
  const midY2 = y2 + h2 / 2;
  elem1.xPush = midX1 > midX2 ? right2 - x1 : x2 - right1;
  elem1.yPush = midY1 > midY2 ? bottom2 - y1 : y2 - bottom1;
  return { xPush: elem1.xPush, yPush: elem1.yPush };
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");
  const image = new Image();
  image.src = "hamster.png";

  const hamster = {
    x: 200,
    y: 300,
    dx: 0,
    dy: 0,
    direction: 1,
    collisionBox: [15, -5, 70, 25],
  };

  const trees = [0].map(() => ({
    x: 300,
    y: 325,
    collisionBox: [50, -145, 60, 145],
  }));

  const gameInfo = {
    gameOver: 0,
  };

  function restartGame() {
    gameInfo.gameOver = 0;
    score = 0;
    trees.forEach((tree, i) => {
      tree.x = 800;
      tree.passed = false;
    });
  }

  const keys = {};
  handleHamsterControl(hamster, gameInfo, keys);

  const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
  skyGradient.addColorStop(0, "lightblue");
  skyGradient.addColorStop(1, "#88aaff");

  function loop() {
    //  Movement
    if (!gameInfo.gameOver) {
      handleHamsterMovement(hamster, keys);
    }

    //  Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 20, canvas.width, 300);

    ctx.fillStyle = "green";
    ctx.fillRect(0, 320, canvas.width, 120);

    const direction = hamster.direction < 0 ? "LEFT" : "RIGHT";
    const frameType = hamster.dx === 0 ? "STILL" : "WALK";
    const frames = FRAMES.HAMSTER[direction][frameType];

    const frameIndex = Math.floor(Date.now() / 50) % frames.length;
    const shake = gameInfo.gameOver ? 100 - 50 : 0;

    ctx.fillStyle = hamster.collided
      ? "rgb(255,0,0,.3)"
      : "rgb(255, 255, 255, 0.3)";
    const collisionRect = calculateCollisionBox(hamster);
    ctx.fillRect(...collisionRect);

    ctx.drawImage(
      image,
      frames[frameIndex] * 512,
      0,
      512,
      512,
      hamster.x + shake * Math.random(),
      hamster.y - 55 + shake * Math.random(),
      100,
      100
    );

    delete hamster.collided;
    trees.forEach((tree) => {
      ctx.fillStyle = "rgb(255, 255, 255, 0.3)";
      const collisionRect = calculateCollisionBox(tree);
      ctx.fillRect(...collisionRect);

      const push = didCollide(hamster, tree);
      if (push) {
        hamster.collided = Date.now();
        if (Math.abs(push.xPush) < Math.abs(push.yPush)) {
          hamster.x += push.xPush;
        } else {
          hamster.y += push.yPush;
          hamster.dy = 0;
          hamster.grounded = true;
        }
      }

      ctx.drawImage(
        image,
        6 * 512,
        0,
        512,
        512,
        tree.x,
        tree.y - TREE_TOP,
        150,
        200
      );
    });

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const globalData = {
    keys,
    hamster,
    trees,
    gameInfo,
  };

  const logDiv = document.body.appendChild(document.createElement("div"));
  logDiv.style.border = "1px solid black";
  logDiv.style.width = "100%";
  logDiv.style.whiteSpace = "pre-wrap";
  logDiv.style.fontFamily = "monospace";
  function showGlobalData() {
    logDiv.textContent = JSON.stringify(globalData, null, 2);
  }
  setInterval(showGlobalData, 10);
});
