class Game {
  constructor() {
    this.player = null;
    this.obstaclesArr = [];
    this.isGameStarted = false;
    this.money = 100000;
    this.customers = 0;
    this.ventureCapitalists = 0;
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
        this.startLevel1();
      });
    }
  }

  startLevel1() {
    this.moneyCoinInterval = setInterval(() => {
      const newObstacle = new MoneyCoin();
      this.obstaclesArr.push(newObstacle);
    }, 3700);

    this.customerInterval = setInterval(() => {
      const newObstacle = new HappyCustomer();
      this.obstaclesArr.push(newObstacle);
    }, 8500);

    setInterval(() => {
      this.obstaclesArr.forEach((obstacleInstance) => {
        this.detectCollision(obstacleInstance);
      });
    }, 60);

    this.moneyDecreaseInterval = setInterval(() => {
      this.updateMoney(-10000);
      if (this.money < 0) {
        this.showReplayAlert();
      }
    }, 3000);
  }

  startLevel2() {
    this.boardElement = document.getElementById("board");
    this.boardElement.style.backgroundImage =
      "url('images/background_2.jpg')";

    const customersElement = document.getElementById("customers");
    customersElement.remove();

    this.fundingStatus = document.createElement("div");
    this.fundingStatus.id = "funding-status";
    this.fundingStatus.innerText = "Funding: Seed";
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.fundingStatus);

    this.ventureCapitalistInterval = setInterval(() => {
      const newObstacle = new VentureCapitalist();
      this.obstaclesArr.push(newObstacle);
    }, 6000);

    setInterval(() => {
      this.obstaclesArr.forEach((obstacleInstance) => {
        this.detectCollision(obstacleInstance);
      });
    }, 60);

    this.moneyDecreaseInterval = setInterval(() => {
      this.updateMoney(-10000);
      if (this.money < 0) {
        this.showReplayAlert();
      }
    }, 3000);
  }

  startLevel3() {
    this.boardElement = document.getElementById("board");
    this.boardElement.style.backgroundImage =
      "url('../images/background_3.jpg')";

    this.unicornInterval = setInterval(() => {
      const newObstacle = new Unicorn();
      this.obstaclesArr.push(newObstacle);
    }, 9000);

    setInterval(() => {
      this.obstaclesArr.forEach((obstacleInstance) => {
        this.detectCollision(obstacleInstance);
      });
    }, 60);

    this.moneyDecreaseInterval = setInterval(() => {
      this.updateMoney(-10000);
      if (this.money < 0) {
        this.showReplayAlert();
      }
    }, 3000);
  }

  stopGame() {
    clearInterval(this.moneyCoinInterval);
    clearInterval(this.customerInterval);
    clearInterval(this.moneyDecreaseInterval);
    clearInterval(this.ventureCapitalistInterval);

    for (const obstacle of this.obstaclesArr) {
      obstacle.remove();
    }
    this.obstaclesArr = [];
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
        if (this.customers >= 2) {
          this.showLevel2Alert();
          setTimeout(() => {
            this.stopGame();
          }, 2000);
        }
      } else if (obstacleInstance instanceof VentureCapitalist) {
        this.updateVentureCapitalists(1);
        if (this.ventureCapitalists >= 3) {
          this.showLevel3Alert();
          setTimeout(() => {
            this.stopGame();
          }, 2000);
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

  updateVentureCapitalists(amount) {
    this.ventureCapitalists += amount;

    if (this.ventureCapitalists === 1) {
      const fundingElement = document.getElementById("funding-status");
      fundingElement.textContent = "Funding: Series A";
    } else if (this.ventureCapitalists === 2) {
      const fundingElement = document.getElementById("funding-status");
      fundingElement.textContent = "Funding: Series B";
    } else if (this.ventureCapitalists === 3) {
      const fundingElement = document.getElementById("funding-status");
      fundingElement.textContent = "Funding: Series C";
    }
  }

  showLevel2Alert() {
    if (this.level === 1) {
      this.level = 2;
      const levelElement = document.getElementById("level");
      levelElement.textContent = "Level: " + this.level;

      const level2Popup = document.createElement("div");
      level2Popup.className = "popup";
      level2Popup.innerHTML = `
        <h2>Level 2: Seed to Series C</h2>
        <br>
        <p>Congrats! You have achieved Product-Market Fit and are now at Seed stage.</p>
        <p>In this level your goal is to scale your start-up by taking on VCs.</p>
        <br>
        <ul>
          <li>     Use the left and right arrow keys to move the player</li>
          <li>     NEW: Press the spacebar to jump up</li>
          <li>     Avoid angry customers that will harm your valuation</li>
          <li>     Get 3 venture capitalists on board</li>
          <li>     Catch 1 unicorn to push your valuation to +1bn EUR</li>
        </ul>
        <br>
        <button class="level2Button glow-on-hover">Start Game</button>
      `;
      document.body.appendChild(level2Popup);

      const level2Button =
        level2Popup.getElementsByClassName("level2Button")[0];
      level2Button.addEventListener("click", () => {
        this.startLevel2();
        level2Popup.remove();
      });
    }
  }

  showLevel3Alert() {
    if (this.level === 2) {
      this.level = 3;
      const levelElement = document.getElementById("level");
      levelElement.textContent = "Level: " + this.level;

      const level3Popup = document.createElement("div");
      level3Popup.className = "popup";
      level3Popup.innerHTML = `
        <h2>Level 3: Unicorn</h2>
        <br>
        <p>Congrats! You have successfully scaled your start-up</p>
        <p>In this level your goal is to become a unicorn.</p>
        <br>
        <ul>
          <li>     Use the left and right arrow keys to move the player</li>
          <li>     Press the spacebar to jump up</li>
          <li>     Catch a Unicorn</li>
        </ul>
        <br>
        <button class="level3Button glow-on-hover">Start Game</button>
      `;
      document.body.appendChild(level3Popup);

      const level3Button =
        level3Popup.getElementsByClassName("level3Button")[0];
      level3Button.addEventListener("click", () => {
        this.startLevel3();
        level3Popup.remove();
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
    this.speedMultiplier = 2;
    this.domElement = null;
    this.createDomElement();
    this.isJumping = false;
    this.jumpHeight = 50;
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
    const maxWidth = 100 - this.width - 20;
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
  constructor(width, height, positionY) {
    this.width = width;
    this.height = height;
    this.positionX = Math.floor(Math.random() * (60 - this.width + 1));
    this.positionY = positionY;
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
}

class MoneyCoin extends Obstacle {
  constructor() {
    super(4, 10, 2);
    this.domElement.className = "money-coin";
    this.appearanceTime = 2000;
    this.appear();
  }

  appear() {
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.domElement);
    setTimeout(() => {
      this.domElement.remove();
      const index = this.obstaclesArr.indexOf(this);
      if (index > -1) {
        this.obstaclesArr.splice(index, 1);
      }
    }, this.appearanceTime);
  }
}

class HappyCustomer extends Obstacle {
  constructor() {
    super(3, 10, 20);
    this.domElement.className = "happy-customer";
    this.appearanceTime = 2500;
    this.appear();
  }

  appear() {
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.domElement);
    setTimeout(() => {
      this.domElement.remove();
      const index = this.obstaclesArr.indexOf(this);
      if (index > -1) {
        this.obstaclesArr.splice(index, 1);
      }
    }, this.appearanceTime);
  }
}

class VentureCapitalist extends Obstacle {
  constructor() {
    super(8, 15, 30);
    this.domElement.className = "venture-capitalist";
    this.appearanceTime = 2500;
    this.appear();
  }

  appear() {
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.domElement);
    setTimeout(() => {
      this.domElement.remove();
      const index = this.obstaclesArr.indexOf(this);
      if (index > -1) {
        this.obstaclesArr.splice(index, 1);
      }
    }, this.appearanceTime);
  }
}

class Unicorn extends Obstacle {
  constructor() {
    super(8, 15, 60);
    this.domElement.className = "unicorn";
    this.appearanceTime = 2500;
    this.appear();
  }

  appear() {
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.domElement);
    setTimeout(() => {
      this.domElement.remove();
      const index = this.obstaclesArr.indexOf(this);
      if (index > -1) {
        this.obstaclesArr.splice(index, 1);
      }
    }, this.appearanceTime);
  }
}

const game = new Game();
const startButton = document.getElementById("startButton");

game.start();
