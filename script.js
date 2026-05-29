const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");

const restartBtn = document.getElementById("restartBtn");

const resultMessage =
    document.getElementById("resultMessage");


// AUDIO
const clickSound = new Audio("sounds/click.mp3");

const winSound = new Audio("sounds/win.mp3");

const drawSound = new Audio("sounds/draw.mp3");


// GAME VARIABLES
let currentPlayer = "X";

let gameActive = true;

let board = [
    "", "", "",
    "", "", "",
    "", "", ""
];

const winningCombinations = [

    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {

    const clickedCell = event.target;

    const clickedIndex = clickedCell.dataset.index;

    if (board[clickedIndex] !== "" || !gameActive) {
        return;
    }

    board[clickedIndex] = currentPlayer;

    clickedCell.textContent = currentPlayer;

    clickSound.currentTime = 0;

    clickSound.play();

    clickedCell.classList.add("active");

    setTimeout(() => {
        clickedCell.classList.remove("active");
    }, 200);

    checkWinner();
}

function checkWinner() {

    for (let combination of winningCombinations) {

        const [a, b, c] = combination;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            resultMessage.textContent =
                `🎉 ${currentPlayer} Wins!`;

            resultMessage.classList.add("show-result");

            gameActive = false;

            winSound.currentTime = 0;

            winSound.play();

            cells[a].classList.add("winner");
            cells[b].classList.add("winner");
            cells[c].classList.add("winner");

            return;
        }
    }

    if (!board.includes("")) {

        resultMessage.textContent =
            "🤝 Game Draw!";

        resultMessage.classList.add("show-result");

        gameActive = false;

        drawSound.currentTime = 0;

        drawSound.play();

        return;
    }

    currentPlayer =
        currentPlayer === "X" ? "O" : "X";

    statusText.textContent =
        `Player ${currentPlayer}'s Turn`;
}

function restartGame() {

    board = [
        "", "", "",
        "", "", "",
        "", "", ""
    ];

    currentPlayer = "X";

    gameActive = true;

    statusText.textContent =
        `Player ${currentPlayer}'s Turn`;

    resultMessage.textContent = "";

    resultMessage.classList.remove("show-result");

    cells.forEach(cell => {

        cell.textContent = "";

        cell.classList.remove("winner");
    });
}

cells.forEach(cell => {

    cell.addEventListener(
        "click",
        handleCellClick
    );
});

restartBtn.addEventListener(
    "click",
    restartGame
);