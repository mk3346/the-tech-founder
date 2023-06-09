class Game {
  constructor() {
    this.player = null;
    this.obstaclesArr = [];
    this.isGameStarted = false;
    this.money = 100000;
    this.customers = 0;
    this.ventureCapitalists = 0;
    this.unicorns = 0;
    this.level = 1;
  }

  start() {
    if (!this.isGameStarted) {
      const popup = document.createElement("div");
      popup.className = "popup";
      popup.innerHTML = `
        <h3>Level 1: Product-Market Fit</h2>
        <br>
        <p>You have a <b>(bug-free) MVP</b> and 100k from friends & family.<br>Win 5 customers before you run out of cash - better be fast my friend! &#128516</p>
        <br>
        <ul>
          <li>       Use the left + right arrow keys to move</li>
          <li>       Collect cash to keep the company afloat</li>
          <li>       Catch 5 customers to proceed to Level 2</li>
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
      const newObstacle = new MoneyCoin(this.obstaclesArr);
      this.obstaclesArr.push(newObstacle);
    }, 3000);

    this.customerInterval = setInterval(() => {
      const newObstacle = new HappyCustomer(this.obstaclesArr);
      this.obstaclesArr.push(newObstacle);
    }, 8000);

    setInterval(() => {
      this.obstaclesArr.forEach((obstacleInstance) => {
        this.detectCollision(obstacleInstance);
      });
    }, 60);

    this.moneyDecreaseInterval = setInterval(() => {
      this.updateMoney(-10000);
      if (this.money <= 0) {
        this.showGameOverAlert();
        this.stopGame();
      }
    }, 2000);
  }

  startLevel2() {
    this.money = 1000000;
    const moneyElement = document.getElementById("money");
    moneyElement.textContent =
      "Money: " + this.money.toLocaleString("en-US") + " EUR";

    this.boardElement = document.getElementById("board");
    this.boardElement.style.backgroundImage = "url('images/background_2.jpg')";

    const customersElement = document.getElementById("customers");
    customersElement.remove();

    this.fundingStatus = document.createElement("div");
    this.fundingStatus.id = "funding-status";
    this.fundingStatus.innerText = "Funding: Seed";
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.fundingStatus);

    this.ventureCapitalistInterval = setInterval(() => {
      const newObstacle = new VentureCapitalist(this.obstaclesArr);
      this.obstaclesArr.push(newObstacle);
    }, 8000);

    setInterval(() => {
      this.obstaclesArr.forEach((obstacleInstance) => {
        this.detectCollision(obstacleInstance);
      });
    }, 60);

    this.moneyDecreaseInterval = setInterval(() => {
      this.updateMoney(-150000);
      if (this.money <= 0) {
        this.showGameOverAlert();
        this.stopGame();
      }
    }, 2000);
  }

  startLevel3() {
    this.boardElement = document.getElementById("board");
    this.boardElement.style.backgroundImage = "url('images/background_3.jpg')";

    this.unicornInterval = setInterval(() => {
      const newObstacle = new Unicorn(this.obstaclesArr);
      this.obstaclesArr.push(newObstacle);
    }, 9000);

    setInterval(() => {
      this.obstaclesArr.forEach((obstacleInstance) => {
        this.detectCollision(obstacleInstance);
      });
    }, 60);

    this.moneyDecreaseInterval = setInterval(() => {
      this.updateMoney(-250000);
      if (this.money <= 0) {
        this.showGameOverAlert();
        this.stopGame();
      }
    }, 2000);

    if (this.player && this.player instanceof Player) {
      this.player.jumpHeight += 20;
    }
  }

  stopGame() {
    clearInterval(this.moneyCoinInterval);
    clearInterval(this.customerInterval);
    clearInterval(this.moneyDecreaseInterval);
    clearInterval(this.ventureCapitalistInterval);

    this.obstaclesArr.forEach((obstacle) => {
      obstacle.remove();
    });
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
        if (this.customers >= 5) {
          this.showLevel2Alert();
          this.stopGame();
        }
      } else if (obstacleInstance instanceof VentureCapitalist) {
        this.updateVentureCapitalists(1);
        this.updateMoney(800000);
        if (this.ventureCapitalists >= 3) {
          this.showLevel3Alert();
          this.stopGame();
        }
      } else if (obstacleInstance instanceof Unicorn) {
        this.unicorns++;
        if (this.unicorns >= 1) {
          this.showLevelCompleteAlert();
          this.stopGame();
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
    if (this.money < 51000) {
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
        <h2>Level 2: Grow or Die</h2>
        <br>
        <p>Puuuuh that was close, but you made it!<br>Marketing is <b>very expensive</b> though - time to go fundraising &#129312</p>
        <br>
        <ul>
          <li>     New: Press the spacebar to <b>jump up</b></li>
          <li>     Get 3 venture capitalists on board before money runs out</li>
        </ul>
        <br>
        <button class="level2Button glow-on-hover">Start Level 2</button>
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
        <h2>Level 3: Moonshot Ideas</h2>
        <br>
        <p>Nice you did it again - only <b>1% of startups</b> go that far! &#128515<br>Will you make it to the very top and reach a valuation of <b>$1 billion?</b></p>
        <br>
        <ul>
          <li>     Press the spacebar to jump <b>even higher now</b></li>
          <li>     Catch a Unicorn before you lose it all</li>
        </ul>
        <br>
        <button class="level3Button glow-on-hover">Start Level 3</button>
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

  showLevelCompleteAlert() {
    const levelCompletePopup = document.createElement("div");
    levelCompletePopup.className = "popup";
    levelCompletePopup.innerHTML = `
      <h2>Booooom!</h2>
      <br>
      <p>You are now a Unicorn &#129412<br>Time to go for a drink with Elon, Jeff and Larry &#127870</p>
      <br>
      <iframe src="https://giphy.com/embed/CSbIZi52DvqnJPm1WA" width="250" height="250" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/unicorn-chubbicorns-chubbiverse-CSbIZi52DvqnJPm1WA">via GIPHY</a></p>
      <br>
      <button class="levelCompleteButton glow-on-hover">Play Again</button>
    `;
    document.body.appendChild(levelCompletePopup);

    const levelCompleteButton = levelCompletePopup.getElementsByClassName(
      "levelCompleteButton"
    )[0];
    levelCompleteButton.addEventListener("click", () => {
      location.reload();
      levelCompletePopup.remove();
    });
  }

  showGameOverAlert() {
    const levelGameOverPopup = document.createElement("div");
    levelGameOverPopup.className = "popup";
    levelGameOverPopup.innerHTML = `
      <p>Oh nooooo &#128553</p>
      <br>
      <iframe src="https://giphy.com/embed/eJ4j2VnYOZU8qJU3Py" width="250" height="150" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/universalafrica-back-to-you-matthewmole-matthew-mole-eJ4j2VnYOZU8qJU3Py">via GIPHY</a></p>
      <br>
      <button class="levelGameOverButton glow-on-hover">Play Again</button>
    `;
    document.body.appendChild(levelGameOverPopup);

    const levelGameOverButton = levelGameOverPopup.getElementsByClassName(
      "levelGameOverButton"
    )[0];
    levelGameOverButton.addEventListener("click", () => {
      location.reload();
      levelGameOverPopup.remove();
    });
  }
  
}

class Player {
  constructor() {
    this.width = 8;
    this.height = 25;
    this.positionX = 0;
    this.positionY = 0;
    this.speedMultiplier = 5;
    this.domElement = null;
    this.createDomElement();
    this.isJumping = false;
    this.jumpHeight = 30;
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
    const maxWidth = 100 - this.width - 22;
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
      this.positionY += 3;
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
      this.positionY -= 4;
      this.domElement.style.bottom = this.positionY + "vh";
      this.fallDown();
    });
  }
}

class Obstacle {
  constructor(width, height, positionY) {
    this.width = width;
    this.height = height;
    this.positionX = Math.floor(Math.random() * (80 - this.width + 1));
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
  constructor(obstaclesArr) {
    super(4, 10, 2);
    this.domElement.className = "money-coin";
    this.appearanceTime = 1500;
    this.appear(obstaclesArr);
  }

  appear(obstaclesArr) {
    const parentElm = document.getElementById("board");
    parentElm.appendChild(this.domElement);
    setTimeout(() => {
      this.domElement.remove();
      const index = obstaclesArr.indexOf(this);
      if (index > -1) {
        obstaclesArr.splice(index, 1);
      }
    }, this.appearanceTime);
  }
}

class HappyCustomer extends Obstacle {
  constructor(obstaclesArr) {
    super(3, 10, 20);
    this.domElement.className = "happy-customer";
    this.appearanceTime = 2000;
    this.appear(obstaclesArr);
  }

  appear(obstaclesArr) {
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
  constructor(obstaclesArr) {
    super(8, 15, 30);
    this.domElement.className = "venture-capitalist";
    this.appearanceTime = 1500;
    this.appear(obstaclesArr);
  }

  appear(obstaclesArr) {
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
  constructor(obstaclesArr) {
    super(8, 15, 60);
    this.domElement.className = "unicorn";
    this.appearanceTime = 1500;
    this.appear(obstaclesArr);
  }

  appear(obstaclesArr) {
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
