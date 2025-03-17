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
      if (hamster.y >= GROUND) {
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

function drawCollisionBox(ctx, element) {
  ctx.fillStyle = "rgb(255, 255, 255, 0.3)";
  const collisionRect = [
    element.x + element.collision[0],
    element.y + element.collision[1],
    element.collision[2],
    element.collision[3],
  ];
  ctx.fillRect(...collisionRect);
}

function drawHamster(ctx, hamster, gameInfo) {
  const state = hamster.dx ? "RUN" : "IDLE";
  const direction = hamster.direction > 0 ? "RIGHT" : "LEFT";

  const animation = ANIM.HAMSTER[state][direction];
  const frame = Math.floor((Date.now() / 100) % animation.length);
  const shake = gameInfo.gameOver ? 100 - 50 : 0;

  drawCollisionBox(ctx, hamster);

  ctx.drawImage(
    image,
    0 + animation[frame] * 512,
    0,
    512,
    512,
    hamster.x + shake * Math.random(),
    hamster.y - 55 + shake * Math.random(),
    100,
    100
  );
}

function drawTree(ctx, tree) {
  drawCollisionBox(ctx, tree);
  ctx.drawImage(
    image,
    ANIM.TREE[0] * 512,
    0,
    512,
    512,
    tree.x,
    tree.y - TREE_TOP,
    150,
    200
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

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

  const trees = [0].map(() => ({
    x: 500,
    y: 325,
    collision: [45, -145, 65, 150],
  }));

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

    //  Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 20, canvas.width, 300);

    ctx.fillStyle = "green";
    ctx.fillRect(0, 320, canvas.width, 120);

    drawHamster(ctx, hamster, gameInfo);

    trees.forEach((tree) => {
      drawTree(ctx, tree);
    });

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
