const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const themeSwitch = document.getElementById("themeSwitch");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const resultMessage = document.getElementById("resultMessage");
const xScoreDisplay = document.getElementById("xScore");
const oScoreDisplay = document.getElementById("oScore");
const drawScoreDisplay = document.getElementById("drawScore");
const gameModeSelect = document.getElementById("gameMode");
const difficultySelect = document.getElementById("difficulty");

const clickSound = new Audio("./sounds/click.mp3");
const winSound = new Audio("./sounds/win.mp3");
const drawSound = new Audio("./sounds/draw.mp3");

let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;
let drawScore = Number(localStorage.getItem("drawScore")) || 0;
let gameMode = localStorage.getItem("gameMode") || "twoPlayer";
let difficulty = localStorage.getItem("difficulty") || "medium";

let currentPlayer = "X";
let gameActive = true;
let aiThinking = false;
let board = ["", "", "", "", "", "", "", "", ""];

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

function safePlay(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function updateScoreBoard() {
    xScoreDisplay.textContent = xScore;
    oScoreDisplay.textContent = oScore;
    drawScoreDisplay.textContent = drawScore;

    localStorage.setItem("xScore", xScore);
    localStorage.setItem("oScore", oScore);
    localStorage.setItem("drawScore", drawScore);
}

function updateOptions() {
    gameMode = gameModeSelect.value;
    difficulty = difficultySelect.value;
    difficultySelect.disabled = gameMode !== "ai";

    localStorage.setItem("gameMode", gameMode);
    localStorage.setItem("difficulty", difficulty);
}

function getEmptyCells(currentBoard = board) {
    return currentBoard
        .map((value, index) => value === "" ? index : null)
        .filter(index => index !== null);
}

function getRoundResult(currentBoard = board) {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;

        if (
            currentBoard[a] &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[a] === currentBoard[c]
        ) {
            return {
                winner: currentBoard[a],
                combination
            };
        }
    }

    if (!currentBoard.includes("")) {
        return {
            winner: "draw",
            combination: []
        };
    }

    return null;
}

function updateStatus() {
    if (gameMode === "ai" && currentPlayer === "O") {
        statusText.textContent = "AI is thinking...";
        return;
    }

    statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function placeMark(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add("active");

    setTimeout(() => {
        cells[index].classList.remove("active");
    }, 200);
}

function finishRound(result) {
    if (!result) {
        return false;
    }

    gameActive = false;
    aiThinking = false;

    if (result.winner === "draw") {
        resultMessage.textContent = "Game Draw!";
        statusText.textContent = "Game Draw!";
        drawScore++;
        updateScoreBoard();
        safePlay(drawSound);
        resultMessage.classList.add("show-result");
        return true;
    }

    resultMessage.textContent = `${result.winner} Wins!`;
    statusText.textContent = `${result.winner} Wins!`;

    if (result.winner === "X") {
        xScore++;
    } else {
        oScore++;
    }

    updateScoreBoard();
    safePlay(winSound);
    resultMessage.classList.add("show-result");

    result.combination.forEach(index => {
        cells[index].classList.add("winner");
    });

    return true;
}

function continueGame() {
    const result = getRoundResult();

    if (finishRound(result)) {
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();

    if (gameMode === "ai" && currentPlayer === "O") {
        aiThinking = true;
        setTimeout(makeAiMove, 450);
    }
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedIndex = Number(clickedCell.dataset.index);

    if (
        board[clickedIndex] !== "" ||
        !gameActive ||
        aiThinking
    ) {
        return;
    }

    placeMark(clickedIndex, currentPlayer);
    safePlay(clickSound);
    continueGame();
}

function findWinningMove(player, currentBoard = board) {
    const emptyCells = getEmptyCells(currentBoard);

    for (const index of emptyCells) {
        const boardCopy = [...currentBoard];
        boardCopy[index] = player;

        const result = getRoundResult(boardCopy);

        if (result && result.winner === player) {
            return index;
        }
    }

    return null;
}

function getRandomMove() {
    const emptyCells = getEmptyCells();
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
}

function getMediumMove() {
    const winningMove = findWinningMove("O");

    if (winningMove !== null) {
        return winningMove;
    }

    const blockingMove = findWinningMove("X");

    if (blockingMove !== null) {
        return blockingMove;
    }

    if (board[4] === "") {
        return 4;
    }

    const openCorners = [0, 2, 6, 8].filter(index => board[index] === "");

    if (openCorners.length > 0) {
        return openCorners[Math.floor(Math.random() * openCorners.length)];
    }

    return getRandomMove();
}

function minimax(currentBoard, isAiTurn) {
    const result = getRoundResult(currentBoard);

    if (result) {
        if (result.winner === "O") {
            return 10;
        }

        if (result.winner === "X") {
            return -10;
        }

        return 0;
    }

    const emptyCells = getEmptyCells(currentBoard);

    if (isAiTurn) {
        let bestScore = -Infinity;

        for (const index of emptyCells) {
            const boardCopy = [...currentBoard];
            boardCopy[index] = "O";
            bestScore = Math.max(bestScore, minimax(boardCopy, false));
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for (const index of emptyCells) {
        const boardCopy = [...currentBoard];
        boardCopy[index] = "X";
        bestScore = Math.min(bestScore, minimax(boardCopy, true));
    }

    return bestScore;
}

function getHardMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (const index of getEmptyCells()) {
        const boardCopy = [...board];
        boardCopy[index] = "O";
        const score = minimax(boardCopy, false);

        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }

    return bestMove;
}

function getAiMove() {
    if (difficulty === "easy") {
        return getRandomMove();
    }

    if (difficulty === "hard") {
        return getHardMove();
    }

    return getMediumMove();
}

function makeAiMove() {
    if (!gameActive || currentPlayer !== "O") {
        return;
    }

    const move = getAiMove();

    if (move === null || move === undefined) {
        return;
    }

    placeMark(move, "O");
    safePlay(clickSound);
    aiThinking = false;
    continueGame();
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    aiThinking = false;

    resultMessage.textContent = "";
    resultMessage.classList.remove("show-result");

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winner");
    });

    updateStatus();
}

function resetScores() {
    xScore = 0;
    oScore = 0;
    drawScore = 0;
    updateScoreBoard();
}

cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

restartBtn.addEventListener("click", restartGame);
resetScoreBtn.addEventListener("click", resetScores);

gameModeSelect.value = gameMode;
difficultySelect.value = difficulty;
updateOptions();
updateScoreBoard();
updateStatus();

gameModeSelect.addEventListener("change", () => {
    updateOptions();
    restartGame();
});

difficultySelect.addEventListener("change", () => {
    updateOptions();
    restartGame();
});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeSwitch.checked = true;
}

themeSwitch.addEventListener("change", () => {
    document.body.classList.toggle("light-theme");

    if (document.body.classList.contains("light-theme")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
});
