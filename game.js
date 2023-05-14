window.onload = function () {
// Query Selector Variables
const gameBoard = document.querySelector("#gameboard-container");
const battleshipContainer = document.querySelector(".battleship-container");
const flipButton = document.querySelector("#flip-button");
const startButton = document.querySelector("#start-button");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turn-display");

let angle = 0;
// Rotate ship 90 deg
function flip() {
    const shipOptions = Array.from(battleshipContainer.children);
    if (angle === 0) {
        angle = 90;
    } else {
        angle = 0;
    }
    shipOptions.forEach((shipOptions) => (shipOptions.style.transform = `rotate(${angle}deg)`));
}

const width = 10;
//Creating Board
function createBoard(color, player) {
    const gameBoardContainer = document.createElement("div");
    gameBoardContainer.classList.add("game-board");
    gameBoardContainer.style.backgroundColor = color;
    gameBoardContainer.id = player;

    for (let i = 0; i < width * width; i++) {
        const block = document.createElement("div");
        block.classList.add("block");
        block.id = i;
        gameBoardContainer.append(block);
    }
    gameBoard.append(gameBoardContainer);
}
// Create player board
createBoard("aquamarine", "player");
// Create computer board
createBoard("aqua", "computer");
flipButton.addEventListener("click", flip);

// Ship class
class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
    }
}
// Create each ship
const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 3);
const battleship = new Ship("battleship", 4);
const carrier = new Ship("carrier", 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;
// Valid location for ships
function handleValid(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = isHorizontal
        ? startIndex <= width * width - ship.length
            ? startIndex
            : width * width - ship.length
        : startIndex <= width * width - width * ship.length
            ? startIndex
            : startIndex - ship.length * width + width;

    let shipBlocks = [];
    // Checks if ship can be placed Horizontal or Vertical
    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width]);
        }
    }

    let valid;

    if (isHorizontal) {
        shipBlocks.every(
            (_shipBlock, index) =>
                (valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
        );
    } else {
        shipBlocks.every(
            (_shipBlock, index) => (valid = shipBlocks[0].id < 90 + (width * index + 1))
        );
    }

    const notTaken = shipBlocks.every((shipBlock) => !shipBlock.classList.contains("taken"));

    return { shipBlocks, valid, notTaken };
}

function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`);
    let randomBoolean = Math.random() < 0.5;
    let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
    let randomIndex = Math.floor(Math.random() * width * width);

    let startIndex = startId ? startId : randomIndex;

    const { shipBlocks, valid, notTaken } = handleValid(
            allBoardBlocks,
            isHorizontal,
            startIndex,
            ship
        );

        if (valid && notTaken) {
            shipBlocks.forEach((shipBlock) => {
                shipBlock.classList.add(ship.name);
                shipBlock.classList.add("taken");
            });
        } else {
            if (user === "computer") {
                addShipPiece(user, ship, startId);
            }
            if (user === "player") {
                notDropped = true;
            }
        }
}
ships.forEach((ship) => addShipPiece("computer", ship));

//Drag player ships
let draggedShip;
const battleships = Array.from(battleshipContainer.children);
battleships.forEach((optionShip) => optionShip.addEventListener("dragstart", dragStart));

const allPlayerBlocks = document.querySelectorAll("#player div");
allPlayerBlocks.forEach((playerBlock) => {
    playerBlock.addEventListener("dragover", dragOver);
    playerBlock.addEventListener("drop", dropShip);
});

function dragStart(e) {
    notDropped = false;
    draggedShip = e.target;
}

function dragOver(e) {
    e.preventDefault();
    const ship = ships[draggedShip.id];
    highLightArea(e.target.id, ship);
}

function dropShip(e) {
    const startId = e.target.id;
    const ship = ships[draggedShip.id];
    addShipPiece("player", ship, startId);
    if (!notDropped) {
      draggedShip.remove();
    }
}

//Add Highlight
function highLightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll("#player div");
    let isHorizontal = angle === 0;

    const { shipBlocks, valid, notTaken } = handleValid(
      allBoardBlocks,
      isHorizontal,
      startIndex,
      ship
    );

    if (valid && notTaken) {
      shipBlocks.forEach((shipBlock) => {
        shipBlock.classList.add("hover");
        setTimeout(() => shipBlock.classList.remove("hover"), 200);
      });
    }
}

let gameOver = false;
let playerTurn;

//Start Game
function startGame() {
    if (playerTurn === undefined) {
      if (battleshipContainer.children.length != 0) {
        infoDisplay.textContent = "Please place all your pieces first!";
      } else {
        const allBoardBlocks = document.querySelectorAll("#computer div");
        allBoardBlocks.forEach((block) => block.addEventListener("click", handleClick));
        playerTurn = true;
        turnDisplay.textContent = "Your Turn";
        infoDisplay.textContent = "The game has started";
      }
    }
}

startButton.addEventListener("click", startGame);

let playerHits = [];
let computerHits = [];
const playerSunkShip = [];
const computerSunkShip = [];

function handleClick(e) {
    if (!gameOver) {
      if (e.target.classList.contains("taken")) {
        e.target.classList.add("boom");
        infoDisplay.textContent = "You hit the computers ship!";
        let classes = Array.from(e.target.classList);
        classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        playerHits.push(...classes);
        checkScore("player", playerHits, playerSunkShip);
      }
      if (!e.target.classList.contains("taken")) {
        infoDisplay.textContent = "Nothing Hit this time.";
        e.target.classList.add("empty");
      }
      playerTurn = false;

      const allBoardBlocks = document.querySelectorAll("#computer div");
      allBoardBlocks.forEach((block) => block.replaceWith(block.cloneNode(true)));
      setTimeout(computerGo, 2000);
    }
}

// Define the computers go
function computerGo() {
    if (!gameOver) {
      turnDisplay.textContent = "Computers turn!";
      infoDisplay.textContent = "The computer is thinking... very hard";

      setTimeout(() => {
        let randomGo = Math.floor(Math.random() * width * width);
        const allBoardBlocks = document.querySelectorAll("#player div");

        if (
          allBoardBlocks[randomGo].classList.contains("taken") &&
          allBoardBlocks[randomGo].classList.contains("boom")
        ) {
          computerGo();
          return;
        } else if (
          allBoardBlocks[randomGo].classList.contains("taken") &&
          !allBoardBlocks[randomGo].classList.contains("boom")
        ) {
          allBoardBlocks[randomGo].classList.add("boom");
          infoDisplay.textContent = "The computer has hit your ship!";
          let classes = Array.from(allBoardBlocks[randomGo].classList);
          classes = classes.filter((className) => className !== "block");
          classes = classes.filter((className) => className !== "boom");
          classes = classes.filter((className) => className !== "taken");
          computerHits.push(...classes);
          checkScore("computer", computerHits, computerSunkShip);
        } else {
          infoDisplay.textContent = "Nothing hit this time.";
          allBoardBlocks[randomGo].classList.add("empty");
        }
      }, 3000);

      setTimeout(() => {
        playerTurn = true;
        turnDisplay.textContent = "Your Turn!";
        infoDisplay.textContent = "Please take your turn.";
        const allBoardBlocks = document.querySelectorAll("#computer div");
        allBoardBlocks.forEach((block) => block.addEventListener("click", handleClick));
      }, 3000);
    }
}

function checkScore(user, userHits, userSunkShip) {
    function checkShip(shipName, shipLength) {
      if (userHits.filter((storedShipname) => storedShipname === shipName).length === shipLength) {
        if (user === "player") {
          infoDisplay.textContent = `You sunk the computer's ${shipName}`;
          playerHits = userHits.filter((storedShipname) => storedShipname !== shipName);
        }
        if (user === "computer") {
          infoDisplay.textContent = `The computer sunk your ${shipName}`;
          computerHits = userHits.filter((storedShipname) => storedShipname !== shipName);
        }
        userSunkShip.push(shipName);
      }
    }
    checkShip("destroyer", 2);
    checkShip("submarine", 3);
    checkShip("cruiser", 3);
    checkShip("battleship", 4);
    checkShip("carrier", 5);

    console.log("playerHits", playerHits);
    console.log("playerSunkShips", playerSunkShip);

    if (playerSunkShip.length === 5) {
      infoDisplay.textContent = "You sunk the enemies ships. YOU WON!";
      gameOver = true;
    } else if (computerSunkShip.length === 5) {
      infoDisplay.textContent = "The enemy has sunk all your ships. YOU LOST!";
      gameOver = true;
    }
  }
};