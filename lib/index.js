var _this = this;

const animationFrame = window.requestAnimationFrame;
const canvasX = 450,
      canvasY = 550,
      bricksRow = 3,
      bricksNumber = 8,
      space = 3;

class Brick {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isRun = true;
  }

  draw(ctx) {
    if (!this.isRun) return;

    ctx.fillStyle = Brick.color;
    ctx.fillRect(this.x, this.y, Brick.width, Brick.height);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(this.x, this.y, Brick.width, Brick.height);
  }
}

Brick.color = '#35c03f';
Brick.width = canvasX / bricksNumber - 2 * space;
Brick.height = 25;

const getBricks = () => {
  const bricks = [];
  for (let i = 0; i < bricksRow; i++) {
    bricks[i] = [];
    for (let j = 0; j < bricksNumber; j++) {
      const x = (2 * j + 1) * space + j * Brick.width;
      const y = (2 * i + 1) * space + i * Brick.height;
      bricks[i][j] = new Brick(x, y);
    }
  }
  return bricks;
};

const drawBrick = (brick, ctx) => {
  for (let i = 0; i < bricksRow; i++) {
    for (let j = 0; j < bricksNumber; j++) {
      brick[i][j].draw(ctx);
    }
  }
};

class Shelf {
  constructor() {
    this.x = (canvasX - Shelf.width) / 2;
    this.y = canvasY - Shelf.height;
  }

  draw(ctx) {
    ctx.fillStyle = Shelf.color;
    ctx.fillRect(this.x, this.y, Shelf.width, Shelf.height);
  }

  movePlatformByEvent(e) {
    const modifier = 1;
    switch (e.keyCode) {
      case 37:
        {
          if (this.x > 0) {
            this.x -= Shelf.speed * modifier;
          }
          break;
        }
      case 39:
        {
          if (this.x < canvasX - Shelf.width) {
            this.x += Shelf.speed * modifier;
          }
          break;
        }
    }
  }
}

Shelf.width = 100;
Shelf.height = 10;
Shelf.color = '#ff0000';
Shelf.speed = 20;

class Ball {
  constructor() {
    this.x = canvasX / 2;
    this.y = canvasY - Ball.radius - Shelf.height;
    this.angle = -(Math.random() * (Math.PI / 2) + Math.PI / 4);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, Ball.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = Ball.color;
    ctx.fill();
  }
}

Ball.color = '#fff';
Ball.radius = 8;
Ball.speed = 4;

const core = arkanoid => {
  const { boll, platform, bricks } = arkanoid;

  if (boll.y <= Ball.radius) {
    Ball.speed = -Ball.speed;
    return;
  }

  if (boll.y >= canvasY - Shelf.height - Ball.radius) {
    if (boll.x + Ball.radius * 2 >= platform.x && boll.x - Ball.radius * 2 <= platform.x + Shelf.width) {
      const shift = (platform.x + Shelf.width / 2 - boll.x) / (Shelf.width / 2);
      const shiftCoef = shift / 2 + 0.5;
      boll.angle = -(shiftCoef * (Math.PI / 2) + Math.PI / 4);
      return;
    } else if (boll.y >= canvasY - Ball.radius) {
      arkanoid.status = 'finish';
      arkanoid.finish();
      return;
    }
  }

  if (boll.x <= Ball.radius || boll.x >= canvasX - Ball.radius) {
    boll.angle = Math.PI - boll.angle;
    return;
  }

  for (let tilesRow of bricks) {
    for (let tile of tilesRow) {
      if (!tile.isRun) continue;
      if (boll.x - Ball.radius <= tile.x + Brick.width && boll.x + Ball.radius >= tile.x && boll.y - Ball.radius <= tile.y + Brick.height && boll.y + Ball.radius >= tile.y) {
        tile.isRun = false;
        boll.angle *= -1;
        return;
      }
    }
  }
};

const render = (ctx, arkanoid) => {
  const { bricks, platform, boll } = arkanoid;

  boll.y += Ball.speed * Math.sin(boll.angle);
  boll.x += Ball.speed * Math.cos(boll.angle);

  ctx.clearRect(0, 0, canvasX, canvasY);
  drawBrick(bricks, ctx);
  platform.draw(ctx);
  boll.draw(ctx);

  core(arkanoid);

  if (arkanoid.status === 'play') {
    animationFrame(() => render(ctx, arkanoid));
  }
};

window.onload = () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const arkanoid = {
    bricks: getBricks(),
    platform: new Shelf(),
    boll: new Ball(),
    status: 'play',
    finish: () => {
      ctx.font = '50px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvasX / 2, canvasY / 2);
    },
    togglePause: () => {
      _this.gamePaused = !_this.gamePaused;
    }
  };

  let KeyCodes = {
    SPACE: 32
  };

  addEventListener('keydown', arkanoid.platform.movePlatformByEvent.bind(arkanoid.platform));
  render(ctx, arkanoid);

  document.onkeydown = function (event) {
    var keyCode;
    if (event == null) {
      keyCode = window.event.keyCode;
    } else {
      keyCode = event.keyCode;
    }
    switch (keyCode) {
      case KeyCodes.SPACE:
        arkanoid.togglePause();
        break;
      default:
        break;
    }
  };
};