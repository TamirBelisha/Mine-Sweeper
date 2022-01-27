'use strict';

//builds a matrix
function createMat(rows, cols) {
    var mat = []
    for (var i = 0; i < rows; i++) {
        var row = []
        for (var j = 0; j < cols; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

//Gets matrix and selector name to render the table in it.
function renderBoard(board, selector) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = `hidden cell-${i}-${j}`;
            strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

//Random number include the max num
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//gets an array and shuffles it
function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomIntInclusive(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

var milliSec = 0;
var sec = 0;
var minute = 0;

function timer() {
    milliSec++;
    if (milliSec === 10) {
        milliSec = 0;
        sec++;
        gGame.secsPassed++;
    }
    if (sec === 60) {
        sec = 0
        minute++
    }
    var str;
    if (sec < 10) {
        str = `0${minute}:0${sec}.${milliSec}`;
    } else str = `0${minute}:${sec}.${milliSec}`;
    var elTimerDiv = document.querySelector('.timer span');
    elTimerDiv.innerText = str;
}