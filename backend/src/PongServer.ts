import { match } from "assert";
import { PongState, Match, Statics, Paddle, Ball } from "./types";

let gameTable = new Map<number, PongState>([]);

const s: Statics =
({
	BOUNCE:		{ x: -1.02, y: -0.9 },
	CARRYOVER:	0.5,
	VELOCITY:	0.3,
	FRICTION:	0.9,
});

function resetBall(p1Score: number, p2Score: number): Ball
{
	const goRight: boolean	= (p1Score + p2Score) % 2 === 0;
	const pos: number		= goRight ? 70 : 30;

	return ({
		pos:		{ x: pos,				y: 50					},
		prevPos:	{ x: pos,				y: 50					},
		size:		{ x: 2,					y: 2					},
		dir:		{ x: 0.5 - +goRight,	y: Math.random() - 0.5	}
	});
}

function managePaddle(paddle: Paddle, dirY: number)
{
	const halfSize = paddle.size.y / 2;
	dirY = s.FRICTION * paddle.dir.y + s.VELOCITY * dirY;

	if (paddle.pos.y + dirY < halfSize || paddle.pos.y + dirY > 100 - halfSize)
	{
		paddle.pos.y = paddle.pos.y < 50 ? halfSize : 100 - halfSize;
		paddle.dir.y = 0;
	}
	else
	{
		paddle.pos.y += paddle.dir.y;
		paddle.dir.y = dirY;
	}
}

function paddleColision(paddle: Paddle, ball: Ball)
{
	let reachY: number = paddle.size.y / 2 + ball.size.y;
	let collX:  number = paddle.pos.x;

	if (ball.dir.x < 0)
		collX += paddle.size.x + ball.size.x / 2;
	else
		collX -= ball.size.x / 2;

	if (((ball.pos.x < collX) !== (ball.prevPos.x < collX)) && ball.pos.y >= paddle.pos.y - reachY && ball.pos.y <= paddle.pos.y + reachY)
	{
		ball.prevPos.x = collX;
		ball.pos.x = collX;
		ball.dir.x *= s.BOUNCE.x;
		ball.dir.y += paddle.dir.y * s.CARRYOVER;
	}
}

function handleColision(game: PongState)
{
	let ball: Ball = game.ball;

	paddleColision(game.p1, ball);
	paddleColision(game.p2, ball);
	if (ball.pos.y < ball.size.y || ball.pos.y > 100 - ball.size.y)
	{
		ball.pos.y = ball.pos.y <= 50 ? ball.size.y : 100 - ball.size.y;
		ball.dir.y *= s.BOUNCE.y;
	}
	if (ball.pos.x <= 0)
	{
		game.p2Score++;
		game.ball = resetBall(game.p1Score, game.p2Score);
	}
	if (ball.pos.x >= 100)
	{
		game.p1Score++;
		game.ball = resetBall(game.p1Score, game.p2Score);
	}
}

function updateBall(ball: Ball)
{
	ball.prevPos.x = ball.pos.x;
	ball.prevPos.y = ball.pos.y;
	ball.pos.x += ball.dir.x;
	ball.pos.y += ball.dir.y;
}

function tick(game: PongState, match: Match, keysPressed: {[key: string]: boolean}): void
{
	const p1Dir = Number(keysPressed['s']         ?? false) - Number(keysPressed['w']       ?? false);
	const p2Dir = Number(keysPressed['ArrowDown'] ?? false) - Number(keysPressed['ArrowUp'] ?? false);

	managePaddle(game.p1, p1Dir);
	managePaddle(game.p2, p2Dir);
	updateBall(game.ball);
	// console.log("ball pos:", game.ball);
	handleColision(game);
}

function updateGame(match: Match, keysPressed: {[key: string]: boolean}): void
{
	let game = gameTable.get(match.ID);
	const ticks = Math.floor(Date.now() / 10);

	if (game === undefined)
		return;
	if (game.lastUpdate === -1)
		game.lastUpdate = ticks;
	for (; game.lastUpdate < ticks; game.lastUpdate++)
	{
		tick(game, match, keysPressed);
	}
	gameTable.set(match.ID, game);
}

export function getGame(match: Match, keysPressed: {[key: string]: boolean}): PongState
{
	if (gameTable.has(match.ID) === false)
	{
		//console.log(match.ID, ",", gameTable);
		throw "Invalid matchID in get";
	}
	updateGame(match, keysPressed);
	//console.log(gameTable.size);
	return gameTable.get(match.ID) as PongState;
}

export function postGame(): number
{
	let key = 0;
	while (key in gameTable)
		key++;

	const state: PongState = {
		p1: {
			pos: { x: 3, y: 50},
			size: { x: 2, y: 20 },
			dir: { x: 0, y: 0 },
			colour: "#ff914d"
		},
		p2: {
			pos: { x: 95, y: 50},
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

export function deleteGame(matchID: number): void
{
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
