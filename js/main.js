'use strict';

const MINE_IMG = '<img src="img/mine.png" />';
const MARK_IMG = '<img src="img/mark.png" />';
const EMOJI_IMG = '<img src="img/emoji.png" />';
const EMOJI_LOSE_IMG = '<img src="img/emoji-lose.png" />';
const EMOJI_WIN_IMG = '<img src="img/emoji-win.png" />';
const HINT_IMG = `<img src="img/hint.png" onclick="toggleHint(this)" />`;

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
var isHintOn = false;
var gTimerInterval;
var minesLocations = [];
var gameOver = false;
var lives = 3;
var hints = 3;
var elEmojiDiv = document.querySelector('.emoji');
var elLivesDiv = document.querySelector('.lives');
var elGameOverDiv = document.querySelector('.game-over');
var elRemainingSafeClicks = document.querySelector('h3')
var elManuallyDiv = document.querySelector('.manually-mines');
var elLastHint = null;
var safeClicks = 3;
var isManuallyLocate = false
var manuallyMinesCounter = gLevel.MINES;
var is7Boom = false;


function initGame() {
    resetValues();
    clearInterval(gTimerInterval)
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard, '.board-div');
    elEmojiDiv.innerHTML = EMOJI_IMG;
    elLivesDiv.innerText = '❤️ ❤️ ❤️';
    elRemainingSafeClicks.innerText = 'Remaining clicks: 3';
    renderHints();
}

function resetValues() {
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
    lives = 3;
    hints = 3;
    isHintOn = false;
    elLastHint = null
    safeClicks = 3
    isManuallyLocate = false
    manuallyMinesCounter = gLevel.MINES;
    is7Boom = false;
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
    var lastMineLocation = {
        i: null,
        j: null
    };
    for (var i = 0; i < amount; i++) {
        var x = getRandomIntInclusive(0, (board.length - 1));
        var y = getRandomIntInclusive(0, (board.length - 1));
        if (lastMineLocation.x === x && lastMineLocation.y === y) {
            x = getRandomIntInclusive(0, (board.length - 1));
            y = getRandomIntInclusive(0, (board.length - 1));
        }
        if (x === locationI && y === locationJ) {
            x = getRandomIntInclusive(0, (board.length - 1));
            y = getRandomIntInclusive(0, (board.length - 1));
        }
        board[x][y].isMine = true;
        lastMineLocation.i = x;
        lastMineLocation.j = y;
        var obj = {
            i: x,
            j: y
        }
        minesLocations.push(obj);
    }
}

function cellClicked(elCell, i, j) {
    if (gameOver === true) return;
    if (isManuallyLocate === true) {
        manuallyLocate(elCell, i, j)
        return;
    }
    if (gGame.isOn === false) {
        gGame.isOn = true;
        if (manuallyMinesCounter !== 0 && is7Boom === false) {
            locateMines(gBoard, gLevel.MINES, i, j);
        }
        setMinesNegsCount(gBoard);
        gTimerInterval = setInterval(timer, 100);
    }
    if (isHintOn) {
        revealHint(i, j);
        elLastHint.classList.remove('.hinted')
        elLastHint = null;
        isHintOn = false;
        hints--;
        renderHints()
        return;
    }
    var cell = gBoard[i][j];
    if (cell.isShown || cell.isMarked) return;
    if (cell.isMine && lives === 1) {
        elCell.classList.remove('hidden')
        elCell.innerHTML = MINE_IMG;
        revealMines();
        gGame.isOn = false;
        gameOver = true;
        clearInterval(gTimerInterval);
        elLivesDiv.innerText = '☠️';
        renderEmoji(false);
        toggleGameOverDiv(false);
        return;
    } else if (cell.isMine) {
        elCell.classList.remove('hidden')
        elCell.innerHTML = MINE_IMG;
        cell.isShown = true;
        gGame.markedCount++;
        lives--;
        elLivesDiv.innerText = (lives === 2) ? '❤️ ❤️' : '❤️';
        checkGameOver();
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
        if (manuallyMinesCounter !== 0 && is7Boom === false) {
            locateMines(gBoard, gLevel.MINES, i, j);
        }
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
            if (currCell.isMine === false && currCell.isShown === false && currCell.isMarked === false) {
                elCell.classList.remove('hidden');
                gGame.shownCount++;
                currCell.isShown = true;
                var negs = currCell.minesAroundCount;
                elCell.innerText = (negs === 0) ? '' : negs;
                if (negs === 0) {
                    revealNegs(x, y);
                }
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
        renderEmoji(true);
        toggleGameOverDiv(true);
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

function renderHints() {
    var elHintsDiv = document.querySelector('.hints');
    var strHTML = ''
    for (var i = 0; i < hints; i++) {
        strHTML += HINT_IMG + ' '
    }

    if (hints === 0) strHTML += 'You ran out of hints..'
    elHintsDiv.innerHTML = strHTML;
}

function revealHint(i, j) {
    for (var x = (i - 1); x <= (i + 1); x++) {
        for (var y = (j - 1); y <= (j + 1); y++) {
            if (x < 0 || x > (gBoard.length - 1) || y < 0 || y > (gBoard[0].length - 1)) continue;
            var currCell = gBoard[x][y];
            var elCell = document.querySelector(`.cell-${x}-${y}`);
            console.log('currCell', currCell);
            console.log('elCell', elCell);
            elCell.classList.remove('hidden');
            if (currCell.isMine) {
                elCell.innerHTML = MINE_IMG;
            } else if (currCell.minesAroundCount === 0) {
                elCell.innerText = '';
            } else elCell.innerText = currCell.minesAroundCount;
        }
    }
    setTimeout(hideHints, 1000, i, j);
}

function hideHints(i, j) {
    for (var x = (i - 1); x <= (i + 1); x++) {
        for (var y = (j - 1); y <= (j + 1); y++) {
            if (x < 0 || x > (gBoard.length - 1) || y < 0 || y > (gBoard[0].length - 1)) continue;
            var currCell = gBoard[x][y];
            var elCell = document.querySelector(`.cell-${x}-${y}`);
            if (currCell.isShown === true) continue;
            elCell.classList.add('hidden');
            elCell.innerHTML = '';
        }
    }
}

function toggleHint(elHint) {
    if (isHintOn && elLastHint === elHint) {
        elLastHint = null;
        isHintOn = false;
        elHint.classList.remove('hinted');
    } else if (elLastHint === null) {
        isHintOn = true;
        elHint.classList.add('hinted');
        elLastHint = elHint;
    }
}

function toggleGameOverDiv(isVictory) {
    elGameOverDiv.classList.remove('win');
    elGameOverDiv.classList.remove('lose');
    elGameOverDiv.classList.remove('animation-hide');
    elGameOverDiv.classList.remove('animation');
    if (isVictory) elGameOverDiv.classList.add('win');
    else elGameOverDiv.classList.add('lose');
    elGameOverDiv.classList.add('animation')
    setTimeout(hideGameOverDiv, 1000)
}

function hideGameOverDiv() {
    elGameOverDiv.classList.add('animation-hide');
    elGameOverDiv.classList.remove('animation');
}

function renderEmoji(isVictory) {
    elEmojiDiv.innerHTML = (isVictory) ? EMOJI_WIN_IMG : EMOJI_LOSE_IMG;
    setTimeout(renderDefEmoji, 3000);
}

function renderDefEmoji() {
    elEmojiDiv.innerHTML = EMOJI_IMG;
}

function safeClick() {
    if (safeClicks <= 0) return;
    var safeCells = getSafeCells();
    var safeCell = safeCells.pop();
    var elCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`);
    elCell.classList.add('safe');
    safeClicks--;
    elRemainingSafeClicks.innerText = `Remaining clicks: ${safeClicks}`;
    setTimeout(removeClassSafe, 3000, elCell);
}

function removeClassSafe(elCell) {
    elCell.classList.remove('safe');
}

function getSafeCells() {
    var safeCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var obj = {
                i: i,
                j: j
            }
            if (currCell.isMine === false && currCell.isShown === false) safeCells.push(obj);
        }
    }
    shuffle(safeCells);
    return safeCells;
}

function manuallyLocate(elCell, i, j) {
    gBoard[i][j].isMine = true;
    elCell.classList.add('safe');
    manuallyMinesCounter--;
    var obj = {
        i: i,
        j: j
    }
    minesLocations.push(obj)
    console.log('minesLocations', minesLocations);
    setTimeout(removeClassSafe, 3000, elCell);
    if (manuallyMinesCounter === 0) {
        isManuallyLocate = false;
        elManuallyDiv.classList.remove('locating');
    }
}

function manuallyLocator() {
    if (gGame.isOn) return;
    isManuallyLocate = true;
    elManuallyDiv.classList.add('locating');
}

function get7BoomMines() {
    if (gGame.isOn === true) return;
    var counter = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var obj = {
                i: i,
                j: j
            }
            if ((counter % 7) === 0 && counter > 0 || (counter % 10) === 7 && counter > 0) {
                currCell.isMine = true;
                minesLocations.push(obj);
            }
            counter++
        }
    }
    is7Boom = true;
}