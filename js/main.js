'use strict';

const MINE_IMG = '<img src="img/mine.png" />';
const MARK_IMG = '<img src="img/mark.png" />';
const EMOJI_IMG = '<img src="img/emoji.png" />';
const EMOJI_LOSE_IMG = '<img src="img/emoji-lose.png" />'
const EMOJI_WIN_IMG = '<img src="img/emoji-win.png" />'

var gBoard = [];
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gTimerInterval;
var minesLocations = [];
var gameOver = false;
var elEmojiDiv = document.querySelector('.emoji');


function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    minesLocations = [];
    gameOver = false;
    milliSec = 0;
    sec = 0;
    minute = 0;
    clearInterval(gTimerInterval)
    elEmojiDiv.innerHTML = EMOJI_IMG;
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard, '.board-div')
}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            row.push(cell)
        }
        board.push(row)
    }
    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            for (var x = (i - 1); x <= (i + 1); x++) {
                for (var y = (j - 1); y <= (j + 1); y++) {
                    if (x < 0 || x > (board.length - 1) || y < 0 || y > (board[0].length - 1)) continue;
                    var negCell = board[x][y];
                    if (negCell === currCell) continue;
                    if (negCell.isMine === true) currCell.minesAroundCount++;
                }
            }
        }
    }
}

function locateMines(board, amount, locationI, locationJ) {
    var lastLocation = {
        i: null,
        j: null
    };
    for (var i = 0; i < amount; i++) {
        var x = getRandomIntInclusive(0, (board.length - 1));
        var y = getRandomIntInclusive(0, (board.length - 1));
        if (lastLocation.x === x && lastLocation.y === y) x = getRandomIntInclusive(0, (board.length - 1));
        if (x === locationI && y === locationJ) x = getRandomIntInclusive(0, (board.length - 1));
        board[x][y].isMine = true;
        lastLocation.i = x;
        lastLocation.j = y;
        var obj = {
            i: x,
            j: y
        }
        minesLocations.push(obj);
    }
}

function cellClicked(elCell, i, j) {
    if (gameOver === true) return;
    if (gGame.isOn === false) {
        gGame.isOn = true;
        locateMines(gBoard, gLevel.MINES, i, j);
        setMinesNegsCount(gBoard);
        gTimerInterval = setInterval(timer, 100);
    }
    checkGameOver();
    var cell = gBoard[i][j];
    if (cell.isShown === true || cell.isMarked === true) return;
    if (cell.isMine === true) {
        elCell.classList.remove('hidden')
        elCell.innerHTML = MINE_IMG;
        revealMines();
        gGame.isOn = false;
        gameOver = true;
        clearInterval(gTimerInterval);
        elEmojiDiv.innerHTML = EMOJI_LOSE_IMG;
        alert('You lost..')
        return;
    } else if (cell.minesAroundCount === 0) {
        revealNegs(i, j);
        checkGameOver();
        return;
    }
    var content = cell.minesAroundCount;
    cell.isShown = true;
    gGame.shownCount++;
    elCell.classList.remove('hidden')
    elCell.innerHTML = content;
    checkGameOver();
}

function cellMarked(elCell, i, j) {
    if (gameOver === true) return;
    if (gGame.isOn === false) {
        gGame.isOn = true;
        locateMines(gBoard, gLevel.MINES, i, j);
        setMinesNegsCount(gBoard);
        gTimerInterval = setInterval(timer, 100);
    }
    if (!elCell.classList.contains('hidden')) return;
    var cell = gBoard[i][j]
    if (cell.isMarked === false) {
        gGame.markedCount++;
        cell.isMarked = true;
        elCell.innerHTML = MARK_IMG;
    } else if (cell.isMarked === true) {
        gGame.markedCount--;
        cell.isMarked = false;
        elCell.innerHTML = '';
    }
    checkGameOver();
}

function revealMines() {
    for (var x = 0; x < minesLocations.length; x++) {
        var i = minesLocations[x].i
        var j = minesLocations[x].j
        var elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.innerHTML = MINE_IMG;
    }
}

function revealNegs(i, j) {
    for (var x = (i - 1); x <= (i + 1); x++) {
        for (var y = (j - 1); y <= (j + 1); y++) {
            if (x < 0 || x > (gBoard.length - 1) || y < 0 || y > (gBoard[0].length - 1)) continue;
            var currCell = gBoard[x][y];
            var elCell = document.querySelector(`.cell-${x}-${y}`);
            if (currCell.isMine === false && currCell.isShown === false) {
                elCell.classList.remove('hidden');
                gGame.shownCount++;
                currCell.isShown = true;
                var negs = currCell.minesAroundCount;
                elCell.innerText = (negs === 0) ? '' : negs;
            }
        }
    }
}

function checkGameOver() {
    var cellsCount = gLevel.SIZE ** 2;
    var noMines = cellsCount - gLevel.MINES;
    if (gGame.shownCount === noMines && gGame.markedCount === gLevel.MINES) {
        gGame.isOn = false;
        gameOver = true;
        clearInterval(gTimerInterval);
        elEmojiDiv.innerHTML = EMOJI_WIN_IMG;
        alert('Victory');
        return true;
    }
    return false;
}

function gameLevel(level) {
    switch (level) {
        case 1:
            gLevel = {
                SIZE: 4,
                MINES: 2
            };
            initGame();
            break;
        case 2:
            gLevel = {
                SIZE: 8,
                MINES: 12
            };
            initGame();
            break;
        case 3:
            gLevel = {
                SIZE: 12,
                MINES: 30
            };
            initGame();
            break;
    }
}