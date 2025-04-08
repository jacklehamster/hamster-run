import { shift, moveCameraToHamster } from "./shift.js";
import { gameInfo } from "./game-info.js";
import { hamster, drawHamster, handleHamster, jump } from "./hamster.js";
import { trees, drawTree } from "./tree.js";
import { checkCollision } from "./collision.js";
import { coins, drawCoin, collectCoin } from "./coin.js";
import { frogs, drawFrog, collideFrog, handleFrog } from "./frog.js";
import { log } from "./log.js";

const image = document.createElement("img");
image.src = "hamster.png";

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

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  const scoreDiv = document.querySelector("#score");
  const livesDiv = document.querySelector("#lives");

  const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
  skyGradient.addColorStop(0, "lightblue");
  skyGradient.addColorStop(1, "#88aaff");

  const keys = {};
  handleKeyboardControl(keys, gameInfo, hamster, trees);

  function loop() {
    //  Movement
    if (!gameInfo.gameOver) {
      handleHamster(hamster, keys);
      frogs.forEach((frog) => {
        handleFrog(frog);
      });
    }
    checkCollision(hamster, trees, (hamster, tree, push) => {
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
    });

    checkCollision(hamster, coins, (hamster, coin, push) => {
      if (collectCoin(coin)) {
        gameInfo.score++;
        scoreDiv.textContent = `SCORE: ${gameInfo.score}`;
      }
    });

    checkCollision(hamster, frogs, (hamster, frog, push) => {
      if (collideFrog(hamster, frog, push)) {
        gameInfo.lives--;
        livesDiv.textContent = `LIVES: ${gameInfo.lives}`;
      }
    });

    //  Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 20, canvas.width, canvas.height);

    ctx.fillStyle = "green";
    ctx.fillRect(0, 320 + shift.y, canvas.width, 120);

    drawHamster(ctx, hamster, gameInfo, shift, image);

    trees.forEach((tree) => {
      drawTree(ctx, tree, shift, image);
    });
    coins.forEach((coin) => {
      drawCoin(ctx, coin, shift, image);
    });
    frogs.forEach((frog) => {
      drawFrog(ctx, frog, shift, image);
    });

    moveCameraToHamster(hamster, shift);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const globalData = {
    frogs,
    log,
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
