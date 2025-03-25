"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGame = getGame;
exports.postGame = postGame;
exports.deleteGame = deleteGame;
exports.runGames = runGames;
let gameTable = {};
function getGame(matchID) {
    if ((matchID in gameTable) === false)
        throw "Invalid matchID";
    return gameTable[matchID];
}
function postGame() {
    let key = 0;
    while (key in gameTable)
        key++;
    const state = {
        p1: {
            pos: { x: 3, y: 50 },
            size: { x: 2, y: 20 },
            dir: { x: 0, y: 0 },
            colour: "#ff914d"
        },
        p2: {
            pos: { x: 95, y: 50 },
            size: { x: 2, y: 20 },
            dir: { x: 0, y: 0 },
            colour: "#134588"
        },
        p1Score: 0,
        p2Score: 0,
        ball: {
            pos: { x: 50, y: 50 },
            prevPos: { x: 50, y: 50 },
            size: { x: 2, y: 2 },
            dir: { x: 1, y: 1 }
        }
    };
    //initBall(state.ball);
    gameTable[key] = state;
    return key;
}
function deleteGame(matchID) {
    if ((matchID in gameTable) === false)
        throw "Invalid matchID";
    delete gameTable[matchID];
}
function runGames() {
    // loop through all games and update states
}
