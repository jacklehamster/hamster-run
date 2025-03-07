document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");
  const GROUND = 300;
  const GRAVITY = 1;
  const image = new Image();
  image.src = "hamster.png";

  const hamster = {
    x: 200,
    y: 300,
    dy: 0,
  };

  const trees = [0, 0, 0].map(() => ({
    x: 800,
    y: 325,
  }));

  function jump() {
    hamster.dy = -20;
  }

  document.addEventListener("keydown", () => {
    if (gameOver) {
      if (Date.now() - gameOver > 500) {
        location.reload();
      }
    } else {
      if (hamster.y >= GROUND) {
        jump();
      }
    }
  });

  let score = 0;
  const scoreDiv = document.querySelector("#score");
  let gameOver = 0;

  const TREE_TOP = 170;

  const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
  skyGradient.addColorStop(0, "lightblue");
  skyGradient.addColorStop(1, "#88aaff");

  function loop() {
    //  Movement
    if (!gameOver) {
      hamster.y += hamster.dy;
      hamster.dy += GRAVITY;
      if (hamster.y > GROUND) {
        hamster.y = GROUND;
        hamster.dy = 0;
      }

      trees.forEach((tree) => {
        tree.x -= 10;

        if (tree.x < hamster.x && !tree.passed) {
          if (hamster.y < TREE_TOP) {
            score++;
            tree.passed = true;
            scoreDiv.textContent = `SCORE: ${score}`;
          } else if (!gameOver) {
            gameOver = Date.now();
          }
        }

        if (tree.x < -150) {
          tree.x = 800 + Math.random() * 3000;
          tree.passed = false;
        }
      });
    }

    //  Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 20, canvas.width, 300);

    ctx.fillStyle = "green";
    ctx.fillRect(0, 320, canvas.width, 120);

    const frame = Math.floor((Date.now() / 100) % 3);
    const shake = gameOver ? 100 - 50 : 0;
    ctx.drawImage(
      image,
      0 + frame * 512,
      0,
      512,
      512,
      hamster.x + shake * Math.random(),
      hamster.y - 55 + shake * Math.random(),
      100,
      100
    );

    trees.forEach((tree) => {
      ctx.drawImage(
        image,
        7 * 512,
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
});
