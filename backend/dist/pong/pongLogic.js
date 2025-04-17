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
exports.mirrorGame = mirrorGame;
exports.calculateNewElo = calculateNewElo;
exports.endGame = endGame;
const types_1 = require("./types");
const server_1 = require("../server");
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
        paddle.lastBounce = Date.now();
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
            endGame(match, types_1.Result.P2WON);
        }
        game.ball = resetBall(game.p1Score, game.p2Score);
    }
    if (ball.pos.x >= 102) {
        game.p1Score++;
        if (game.p1Score >= game.maxPoints) {
            endGame(match, types_1.Result.P1WON);
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
    if (match.p2.id === -1)
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    if (match.isLocalGame === true) {
        game.p1Input = Number((_a = keysPressed['s']) !== null && _a !== void 0 ? _a : false) - Number((_b = keysPressed['w']) !== null && _b !== void 0 ? _b : false);
        if (match.p2.id !== -1) {
            game.p2Input = Number((_c = keysPressed['ArrowDown']) !== null && _c !== void 0 ? _c : false) - Number((_d = keysPressed['ArrowUp']) !== null && _d !== void 0 ? _d : false);
        }
    }
    else if (match.p1.id === userID) {
        game.p1Input = Number(((_e = keysPressed['s']) !== null && _e !== void 0 ? _e : false) || ((_f = keysPressed['ArrowDown']) !== null && _f !== void 0 ? _f : false)) - Number(((_g = keysPressed['w']) !== null && _g !== void 0 ? _g : false) || ((_h = keysPressed['ArrowUp']) !== null && _h !== void 0 ? _h : false));
    }
    else if (match.p2.id === userID) {
        game.p2Input = Number(((_j = keysPressed['s']) !== null && _j !== void 0 ? _j : false) || ((_k = keysPressed['ArrowDown']) !== null && _k !== void 0 ? _k : false)) - Number(((_l = keysPressed['w']) !== null && _l !== void 0 ? _l : false) || ((_m = keysPressed['ArrowUp']) !== null && _m !== void 0 ? _m : false));
    }
}
function handleTimeOut(match) {
    if (match.state.p1Score > match.state.p2Score)
        endGame(match, types_1.Result.P1WON);
    else if (match.state.p1Score < match.state.p2Score)
        endGame(match, types_1.Result.P2WON);
    else
        endGame(match, types_1.Result.DRAW);
}
;
function updateGame(match, userID, keysPressed) {
    let game = match.state;
    const now = Math.floor(Date.now() / 10);
    if (game.lastUpdate === -1)
        game.lastUpdate = now;
    for (; game.lastUpdate < now && game.result === types_1.Result.PLAYING; game.lastUpdate++) {
        if (match.p2.id === -1 && game.ai.lastActivation + 100 <= game.lastUpdate) {
            manageAI(game);
            game.ai.lastActivation = game.lastUpdate;
        }
        tick(match, game, game.lastUpdate);
        game.timer -= 10;
        if (game.timer <= 0)
            handleTimeOut(match);
    }
    updateInput(match, userID, game, keysPressed);
}
function initGame(p1Data, p2Data) {
    return {
        p1: {
            pos: { x: 3, y: 50 },
            size: { x: 2, y: 20 },
            dir: { x: 0, y: 0 },
            colour: "#ff914d",
            lastBounce: 0
        },
        p2: {
            pos: { x: 95, y: 50 },
            size: { x: 2, y: 20 },
            dir: { x: 0, y: 0 },
            colour: "#134588",
            lastBounce: 0
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
        p1Data: p1Data,
        p2Data: p2Data,
        timer: 180 * 1000,
        result: types_1.Result.PLAYING,
    };
}
function mirrorGame(game) {
    let mirror = structuredClone(game);
    [mirror.p1.pos.y, mirror.p2.pos.y] = [mirror.p2.pos.y, mirror.p1.pos.y];
    [mirror.p1.lastBounce, mirror.p2.lastBounce] = [mirror.p2.lastBounce, mirror.p1.lastBounce];
    [mirror.p1Score, mirror.p2Score] = [mirror.p2Score, mirror.p1Score];
    mirror.ball.pos.x = 100 - mirror.ball.pos.x;
    mirror.ball.prevPos.x = 100 - mirror.ball.prevPos.x;
    mirror.ball.dir.x = -mirror.ball.dir.x;
    return mirror;
}
function calculateNewElo(p1Elo, p2Elo, win) {
    if (win === 0.5)
        return p1Elo; //wont lose elo on draws as stoping a local game will cause a draw
    const expectedOutcome = 1 / (1 + Math.pow(10, (p2Elo - p1Elo) / 400));
    return (Math.round(p1Elo + 24 * (win - expectedOutcome)));
}
function calcWinRate(wins, total) {
    if (total === 0)
        return null;
    return 100 * (wins / total);
}
function setMatchHistory(match, p1Elo, p2Elo, p1NewElo, p2NewElo) {
    return {
        winner: match.state.result === types_1.Result.DRAW ? "Draw" : (match.state.result === types_1.Result.P1WON ? match.p1.username : match.p2.username),
        p1: match.p1.username,
        p2: match.p2.username,
        p1score: match.state.p1Score,
        p2score: match.state.p2Score,
        p1Elo: p1Elo,
        p2Elo: p2Elo,
        p1Diff: p1NewElo - p1Elo,
        p2Diff: p2NewElo - p2Elo,
    };
}
// export async function fillDB(match: Match, result: Result, isP1: boolean)
// {
// 	const id = isP1 ? match.p1.id : match.p2.id;
// 	let player = await prisma.account.findUnique({ where: { id: id } }) as any;
// 	const newElo  = calculateNewElo(player1.elo,  player2.elo, result === Result.DRAW ? 0.5 : (result === Result.P1WON ? 1 : 0));
// }
function endGame(match, result) {
    return __awaiter(this, void 0, void 0, function* () {
        match.state.result = result;
        if (match.p2.id === -1)
            return;
        const p1 = match.p1.id;
        const p2 = match.p2.id;
        let player1 = yield server_1.prisma.account.findUnique({ where: { id: p1 } });
        let player2 = yield server_1.prisma.account.findUnique({ where: { id: p2 } });
        const newPlayer1Elo = calculateNewElo(player1.elo, player2.elo, result === types_1.Result.DRAW ? 0.5 : (result === types_1.Result.P1WON ? 1 : 0));
        const newPlayer2Elo = calculateNewElo(player2.elo, player1.elo, result === types_1.Result.DRAW ? 0.5 : (result === types_1.Result.P2WON ? 1 : 0));
        const MatchHistory = setMatchHistory(match, player1.elo, player2.elo, newPlayer1Elo, newPlayer2Elo);
        const matchResult = (result, isP1) => {
            if (result === types_1.Result.DRAW)
                return { draws: { increment: 1 } };
            if ((result === types_1.Result.P1WON) === isP1)
                return { wins: { increment: 1 } };
            else
                return { losses: { increment: 1 } };
        };
        let p1ResultField = matchResult(result, true);
        let p2ResultField = matchResult(result, false);
        yield server_1.prisma.account.update({
            where: { id: p1 },
            data: Object.assign(Object.assign({ matchesPlayed: { increment: 1 }, elo: newPlayer1Elo }, p1ResultField), { matches: { create: MatchHistory } })
        });
        yield server_1.prisma.account.update({
            where: { id: p2 },
            data: Object.assign(Object.assign({ matchesPlayed: { increment: 1 }, elo: newPlayer2Elo }, p2ResultField), { matches: { create: MatchHistory } })
        });
        player1 = (yield server_1.prisma.account.findUnique({ where: { id: p1 } }));
        yield server_1.prisma.account.update({
            where: { id: p1 },
            data: { winRate: calcWinRate(player1.wins, player1.matchesPlayed) }
        });
        player2 = (yield server_1.prisma.account.findUnique({ where: { id: p2 } }));
        yield server_1.prisma.account.update({
            where: { id: p2 },
            data: { winRate: calcWinRate(player2.wins, player2.matchesPlayed) }
        });
        if (match.tournament !== -1) {
        }
    });
}
