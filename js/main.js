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
      const startButton = document.getElementById("startButton");
      startButton.disabled = true;

      const popup = document.createElement("div");
      popup.className = "popup";
      popup.innerHTML = `
        <h2>Instructions</h2>
        <p>Here are the instructions on how to play the game:</p>
        <ul>
          <li>Use the left and right arrow keys to move the player.</li>
          <li>Collect money coins to increase your money.</li>
          <li>Collect happy customers to increase your customer count.</li>
          <li>Avoid collisions with obstacles.</li>
        </ul>
        <button class="okButton glow-on-hover">OK</button>
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

  attachEventListeners() {
    document.addEventListener("keydown", (event) => {
      if (event.code === "ArrowLeft") {
        this.player.moveLeft();
      } else if (event.code === "ArrowRight") {
        this.player.moveRight();
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
        if (this.customers === 3) {
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
      level2Popup.textContent = "Level 2 will start soon!";
      document.body.appendChild(level2Popup);
      setTimeout(() => {
        level2Popup.remove();
      }, 3000);
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
    this.domElement = null;
    this.createDomElement();
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
      this.positionX--;
      this.domElement.style.left = this.positionX + "vw";
    }
  }

  moveRight() {
    const maxWidth = 100 - this.width - 40;
    if (this.positionX < maxWidth) {
      this.positionX++;
      this.domElement.style.left = this.positionX + "vw";
    }
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
    this.speed = 1;
  }

  moveDown() {
    this.positionY -= this.speed;
    this.domElement.style.bottom = this.positionY + "vh";
  }
}

const game = new Game();
const startButton = document.getElementById("startButton");

startButton.addEventListener("click", () => {
  game.start();
});
