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
};
