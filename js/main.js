class Game {
  constructor() {
    this.player = null;
    this.obstaclesArr = [];
    this.isGameStarted = false;
    this.money = 100000;
    this.customers = 0;
    this.level = 1;
  }

  start() {
    if (!this.isGameStarted) {
      const popup = document.createElement("div");
      popup.className = "popup";
      popup.innerHTML = `
        <h2>Level 1: Pre-Seed</h2>
        <br>
        <p>You have just founded a company and developed a working MVP.</p>
        <p>In this level your goal is to prove Product-Market Fit by catching 5 customers before money runs out. Make sure to also collect some cash to be better equipped for Level 2.</p>
        <br>
        <ul>
          <li>     Use the left and right arrow keys to move the player</li>
          <li>     Collect coins to increase cash at hand</li>
          <li>     Collect 5 customers to proceed to Level 2 (Seed)</li>
        </ul>
        <br>
        <button class="okButton glow-on-hover">Start Game</button>
      `;

      document.body.appendChild(popup);

      const okButton = document.getElementsByClassName("okButton")[0];
      okButton.addEventListener("click", () => {
        popup.remove();
        this.isGameStarted = true;
        this.player = new Player();
        this.attachEventListeners();
        this.startGame();
      });
    }
  }

  startGame() {
    const boardElement = document.getElementById("board");
    boardElement.classList.add("animate-background");

    setInterval(() => {
      const newObstacle = new MoneyCoin();
      this.obstaclesArr.push(newObstacle);
    }, 3700);

    setInterval(() => {
      const newObstacle = new HappyCustomer();
      this.obstaclesArr.push(newObstacle);
    }, 8500);

    setInterval(() => {
      this.obstaclesArr.forEach((obstacleInstance) => {
        obstacleInstance.moveDown();
        this.detectCollision(obstacleInstance);
        this.removeObstacleIfOutside(obstacleInstance);
      });
    }, 60);

    setInterval(() => {
      this.updateMoney(-10000);
      if (this.money < 0) {
        this.showReplayAlert();
      }
    }, 3000);
  }

  stopGame() {
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals = [];

    if (this.player) {
      this.player.remove();
      this.player = null;
    }

    for (const obstacle of this.obstaclesArr) {
      obstacle.remove();
    }
    this.obstaclesArr = [];

    const boardElement = document.getElementById("board");
    boardElement.classList.remove("animate-background");
  }

  attachEventListeners() {
    let isSpacebarPressed = false;
    let isJumping = false;

    document.addEventListener("keydown", (event) => {
      if (event.code === "ArrowLeft") {
        this.player.moveLeft();
      } else if (event.code === "ArrowRight") {
        this.player.moveRight();
      } else if (event.code === "Space" && !isSpacebarPressed && !isJumping) {
        isSpacebarPressed = true;
        isJumping = true;
        this.player.jump();
      }
    });

    document.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        isSpacebarPressed = false;
        if (isJumping) {
          isJumping = false;
          this.player.returnToGround();
        }
      }
    });
  }

  detectCollision(obstacleInstance) {
    if (
      !obstacleInstance.collided &&
      obstacleInstance.positionX < this.player.positionX + this.player.width &&
      obstacleInstance.positionX + obstacleInstance.width >
        this.player.positionX &&
      obstacleInstance.positionY < this.player.positionY + this.player.height &&
      obstacleInstance.height + obstacleInstance.positionY >
        this.player.positionY
    ) {
      obstacleInstance.collided = true;

      if (obstacleInstance instanceof MoneyCoin) {
        this.updateMoney(10000);
      } else if (obstacleInstance instanceof HappyCustomer) {
        this.updateCustomers(1);
        if (this.customers === 5) {
          this.showLevel2Alert();
        }
      }

      obstacleInstance.domElement.remove();
      const index = this.obstaclesArr.indexOf(obstacleInstance);
      if (index > -1) {
        this.obstaclesArr.splice(index, 1);
      }
    }
  }

  updateMoney(amount) {
    this.money += amount;
    const moneyElement = document.getElementById("money");
    moneyElement.textContent =
      "Money: " + this.money.toLocaleString("en-US") + " EUR";
    if (this.money < 31000) {
      moneyElement.style.color = "red";
    } else {
      moneyElement.style.color = "black";
    }
  }

  updateCustomers(amount) {
    this.customers += amount;
    const customersElement = document.getElementById("customers");
    customersElement.textContent = "Customers: " + this.customers;
  }

  removeObstacleIfOutside(obstacleInstance) {
    if (obstacleInstance.positionY < 0 - obstacleInstance.height) {
      obstacleInstance.domElement.remove();
      const index = this.obstaclesArr.indexOf(obstacleInstance);
      if (index > -1) {
        this.obstaclesArr.splice(index, 1);
      }
    }
  }

  showLevel2Alert() {
    if (this.level === 1) {
      this.level = 2;
      const level2Popup = document.createElement("div");
      level2Popup.className = "popup";
      level2Popup.innerHTML = `
        <p>Level 2 will start soon!</p>
        <button class="level2Button glow-on-hover">Start Level 2</button>
      `;
      document.body.appendChild(level2Popup);
  
      const level2Button = level2Popup.getElementsByClassName("level2Button")[0];
      level2Button.addEventListener("click", () => {
        level2Popup.remove();
      });
    }
  }
  

  showReplayAlert() {
    if (this.level === 1) {
      const gameOverPopup = document.createElement("div");
      gameOverPopup.className = "popup";
      gameOverPopup.textContent = "Game Over! Your money ran out.";
      document.body.appendChild(gameOverPopup);
      setTimeout(() => {
        gameOverPopup.remove();
        location.reload();
      }, 3000);
    }
  }
}

class Player {
  constructor() {
    this.width = 8;
    this.height = 25;
    this.positionX = 0;
    this.positionY = 0;
    this.speedMultiplier = 1.5;
    this.domElement = null;
    this.createDomElement();
    this.isJumping = false;
    this.jumpHeight = 20;
  }

  createDomElement() {
    this.domElement = document.createElement("div");
    this.domElement.id = "player";
    this.domElement.style.width = this.width + "vw";
    this.domElement.style.height = this.height + "vh";
    this.domElement.style.left = this.positionX + "vw";
    this.domElement.style.bottom = this.positionY + "vh";
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.domElement);
  }

  moveLeft() {
    if (this.positionX > 0) {
      this.positionX -= this.speedMultiplier;
      this.domElement.style.left = this.positionX + "vw";
    }
  }

  moveRight() {
    const maxWidth = 100 - this.width - 40;
    if (this.positionX < maxWidth) {
      this.positionX += this.speedMultiplier;
      this.domElement.style.left = this.positionX + "vw";
    }
  }
  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpUp();
    }
  }

  jumpUp() {
    const jumpInterval = requestAnimationFrame(() => {
      if (this.positionY >= this.jumpHeight) {
        cancelAnimationFrame(jumpInterval);
        this.fallDown();
        return;
      }
      this.positionY++;
      this.domElement.style.bottom = this.positionY + "vh";
      this.jumpUp();
    });
  }

  fallDown() {
    const fallInterval = requestAnimationFrame(() => {
      if (this.positionY <= 0) {
        cancelAnimationFrame(fallInterval);
        this.isJumping = false;
        return;
      }
      this.positionY--;
      this.domElement.style.bottom = this.positionY + "vh";
      this.fallDown();
    });
  }
}

class Obstacle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.positionX = Math.floor(Math.random() * (60 - this.width + 1));
    this.positionY = 100;

    this.domElement = null;

    this.createDomElement();
  }
  createDomElement() {
    this.domElement = document.createElement("div");
    this.domElement.className = "obstacle";
    this.domElement.style.width = this.width + "vw";
    this.domElement.style.height = this.height + "vh";
    this.domElement.style.left = this.positionX + "vw";
    this.domElement.style.bottom = this.positionY + "vh";
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.domElement);
  }
  moveDown() {
    this.positionY--;
    this.domElement.style.bottom = this.positionY + "vh";
  }
}

class MoneyCoin extends Obstacle {
  constructor() {
    super(4, 10);
    this.domElement.className = "money-coin";
    this.speed = 2;
  }

  moveDown() {
    this.positionY -= this.speed;
    this.domElement.style.bottom = this.positionY + "vh";
  }
}

class HappyCustomer extends Obstacle {
  constructor() {
    super(3, 10);
    this.domElement.className = "happy-customer";
    this.speed = 1.5;
  }

  moveDown() {
    this.positionY -= this.speed;
    this.domElement.style.bottom = this.positionY + "vh";
  }
}

const game = new Game();
const startButton = document.getElementById("startButton");

game.start();
