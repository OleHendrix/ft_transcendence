"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGame = getGame;
exports.postGame = postGame;
exports.deleteGame = deleteGame;
let gameTable = new Map([]);
const s = ({
    BOUNCE: { x: -1.02, y: -0.9 },
    CARRYOVER: 0.5,
    VELOCITY: 0.3,
    FRICTION: 0.9,
});
function resetBall(p1Score, p2Score) {
    const goRight = (p1Score + p2Score) % 2 === 0;
    const pos = goRight ? 70 : 30;
    return ({
        pos: { x: pos, y: 50 },
        prevPos: { x: pos, y: 50 },
        size: { x: 2, y: 2 },
        dir: { x: 0.5 - +goRight, y: Math.random() - 0.5 }
    });
}
function managePaddle(paddle, dirY) {
    const halfSize = paddle.size.y / 2;
    dirY = s.FRICTION * paddle.dir.y + s.VELOCITY * dirY;
    if (paddle.pos.y + dirY < halfSize || paddle.pos.y + dirY > 100 - halfSize) {
        paddle.pos.y = paddle.pos.y < 50 ? halfSize : 100 - halfSize;
        paddle.dir.y = 0;
    }
    else {
        paddle.pos.y += paddle.dir.y;
        paddle.dir.y = dirY;
    }
}
function paddleColision(paddle, ball) {
    let reachY = paddle.size.y / 2 + ball.size.y;
    let collX = paddle.pos.x;
    if (ball.dir.x < 0)
        collX += paddle.size.x + ball.size.x / 2;
    else
        collX -= ball.size.x / 2;
    if (((ball.pos.x < collX) !== (ball.prevPos.x < collX)) && ball.pos.y >= paddle.pos.y - reachY && ball.pos.y <= paddle.pos.y + reachY) {
        ball.prevPos.x = collX;
        ball.pos.x = collX;
        ball.dir.x *= s.BOUNCE.x;
        ball.dir.y += paddle.dir.y * s.CARRYOVER;
    }
}
function handleColision(game) {
    let ball = game.ball;
    paddleColision(game.p1, ball);
    paddleColision(game.p2, ball);
    if (ball.pos.y < ball.size.y || ball.pos.y > 100 - ball.size.y) {
        ball.pos.y = ball.pos.y <= 50 ? ball.size.y : 100 - ball.size.y;
        ball.dir.y *= s.BOUNCE.y;
    }
    if (ball.pos.x <= 0) {
        game.p2Score++;
        game.ball = resetBall(game.p1Score, game.p2Score);
    }
    if (ball.pos.x >= 100) {
        game.p1Score++;
        game.ball = resetBall(game.p1Score, game.p2Score);
    }
}
function updateBall(ball) {
    ball.prevPos.x = ball.pos.x;
    ball.prevPos.y = ball.pos.y;
    ball.pos.x += ball.dir.x;
    ball.pos.y += ball.dir.y;
}
function tick(game, match, keysPressed) {
    var _a, _b, _c, _d;
    const p1Dir = Number((_a = keysPressed['s']) !== null && _a !== void 0 ? _a : false) - Number((_b = keysPressed['w']) !== null && _b !== void 0 ? _b : false);
    const p2Dir = Number((_c = keysPressed['ArrowDown']) !== null && _c !== void 0 ? _c : false) - Number((_d = keysPressed['ArrowUp']) !== null && _d !== void 0 ? _d : false);
    managePaddle(game.p1, p1Dir);
    managePaddle(game.p2, p2Dir);
    updateBall(game.ball);
    // console.log("ball pos:", game.ball);
    handleColision(game);
}
function updateGame(match, keysPressed) {
    let game = gameTable.get(match.ID);
    const ticks = Math.floor(Date.now() / 10);
    if (game === undefined)
        return;
    if (game.lastUpdate === -1)
        game.lastUpdate = ticks;
    for (; game.lastUpdate < ticks; game.lastUpdate++) {
        tick(game, match, keysPressed);
    }
    gameTable.set(match.ID, game);
}
function getGame(match, keysPressed) {
    if (gameTable.has(match.ID) === false) {
        //console.log(match.ID, ",", gameTable);
        throw "Invalid matchID in get";
    }
    updateGame(match, keysPressed);
    //console.log(gameTable.size);
    return gameTable.get(match.ID);
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
        ball: resetBall(0, 0),
        lastUpdate: -1,
    };
    gameTable.set(key, state);
    return key;
}
function deleteGame(matchID) {
    if ((matchID in gameTable) === false)
        throw "Invalid matchID in delete";
    gameTable.delete(matchID);
}
// export function runGames(): void
// {
// 	console.log("updating...", gameTable.size);
// 	gameTable.forEach((game, key) =>
// 	{
// 		console.log("updating:", key);
// 		game.ball.pos.x += game.ball.dir.x;
// 		game.ball.pos.y += game.ball.dir.y;
// 	});
// 	setTimeout(runGames, 1000 / 60);
// }
