"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGame = updateGame;
exports.initGame = initGame;
exports.endGame = endGame;
const server_1 = require("./../server");
const s = ({
    BOUNCE: { x: -1.03, y: -0.85 },
    CARRYOVER: 0.4,
    VELOCITY: 0.2,
    FRICTION: 0.9,
});
function resetBall(p1Score, p2Score) {
    const goRight = (p1Score + p2Score) % 2 === 0;
    const pos = goRight ? 30 : 70;
    return ({
        pos: { x: pos, y: 50 },
        prevPos: { x: pos, y: 50 },
        size: { x: 2, y: 2 },
        dir: { x: 0.35 * (goRight ? 1 : -1), y: Math.random() - 0.5 }
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
function handleColision(game, match) {
    let ball = game.ball;
    paddleColision(game.p1, ball);
    paddleColision(game.p2, ball);
    if (ball.pos.y < ball.size.y || ball.pos.y > 100 - ball.size.y) {
        ball.pos.y = ball.pos.y <= 50 ? ball.size.y : 100 - ball.size.y;
        ball.dir.y *= s.BOUNCE.y;
    }
    if (ball.pos.x <= -2) {
        game.p2Score++;
        if (game.p2Score >= game.maxPoints) {
            endGame(match, false);
        }
        game.ball = resetBall(game.p1Score, game.p2Score);
    }
    if (ball.pos.x >= 102) {
        game.p1Score++;
        if (game.p1Score >= game.maxPoints) {
            endGame(match, true);
        }
        game.ball = resetBall(game.p1Score, game.p2Score);
    }
}
function updateBall(ball) {
    ball.prevPos.x = ball.pos.x;
    ball.prevPos.y = ball.pos.y;
    ball.pos.x += ball.dir.x;
    ball.pos.y += ball.dir.y;
}
function manageAIInput(match, game, ticks) {
    if (game.ai.desiredY > game.p2.pos.y + game.p2.size.y / 2)
        game.p2Input = 1;
    else if (game.ai.desiredY < game.p2.pos.y - game.p2.size.y / 2)
        game.p2Input = -1;
    if (ticks % 2 === 0 && Math.abs(game.ai.desiredY - game.p2.pos.y) < game.p2.size.y)
        game.p2Input = 0;
}
function tick(match, game, ticks) {
    if (match.p2 === -1)
        manageAIInput(match, game, ticks);
    managePaddle(game.p1, game.p1Input);
    managePaddle(game.p2, game.p2Input);
    updateBall(game.ball);
    handleColision(game, match);
}
function manageAI(game) {
    const ballCopy = structuredClone(game.ball);
    const p1collX = game.p1.pos.x + game.p1.size.x + ballCopy.size.x / 2;
    const p2collX = game.p2.pos.x - ballCopy.size.x / 2;
    while (ballCopy.pos.x < p2collX) {
        if (ballCopy.pos.y < ballCopy.size.y || ballCopy.pos.y > 100 - ballCopy.size.y) {
            ballCopy.pos.y = ballCopy.pos.y <= 50 ? ballCopy.size.y : 100 - ballCopy.size.y;
            ballCopy.dir.y *= s.BOUNCE.y;
        }
        if (ballCopy.pos.x < p1collX) {
            ballCopy.pos.x = p1collX;
            ballCopy.dir.x *= s.BOUNCE.x;
        }
        updateBall(ballCopy);
    }
    game.ai.desiredY = Math.max(game.p2.size.y / 2, Math.min(100 - game.p2.size.y / 2, ballCopy.pos.y));
}
function updateInput(match, userID, game, keysPressed) {
    var _a, _b, _c, _d;
    // console.log ("1:", match.p1, "2:", match.p2, "isLocal:", match.isLocalGame);
    if (match.p1 === userID || match.isLocalGame)
        game.p1Input = Number((_a = keysPressed['s']) !== null && _a !== void 0 ? _a : false) - Number((_b = keysPressed['w']) !== null && _b !== void 0 ? _b : false);
    if (match.p2 === userID || match.isLocalGame)
        game.p2Input = Number((_c = keysPressed['ArrowDown']) !== null && _c !== void 0 ? _c : false) - Number((_d = keysPressed['ArrowUp']) !== null && _d !== void 0 ? _d : false);
}
function updateGame(match, userID, keysPressed) {
    let game = match.state;
    const now = Math.floor(Date.now() / 10);
    if (game.lastUpdate === -1)
        game.lastUpdate = now;
    for (; game.lastUpdate < now && game.p1Won === null; game.lastUpdate++) {
        if (match.p2 === -1 && game.ai.lastActivation + 100 <= game.lastUpdate) {
            manageAI(game);
            game.ai.lastActivation = game.lastUpdate;
        }
        tick(match, game, game.lastUpdate);
    }
    updateInput(match, userID, game, keysPressed);
}
function initGame() {
    return {
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
        p1Input: 0,
        p2Input: 0,
        ball: resetBall(0, 0),
        lastUpdate: -1,
        ai: { lastActivation: 0, desiredY: 0 },
        maxPoints: 3,
        p1Won: null,
    };
}
function endGame(match, p1Wins) {
    return __awaiter(this, void 0, void 0, function* () {
        match.state.p1Won = p1Wins;
        let winner = match.p1;
        let loser = match.p2;
        if (p1Wins === false) {
            [winner, loser] = [loser, winner];
        }
        yield server_1.prisma.account.update({
            where: { id: winner },
            data: { wins: { increment: 1 } }
        });
        yield server_1.prisma.account.update({
            where: { id: loser },
            data: { loses: { increment: 1 } }
        });
    });
}
