import { match } from "assert";
import { PongState, Match, Statics, Paddle, Ball } from "./types";

let gameTable = new Map<number, PongState>([]);

const s: Statics =
({
	BOUNCE:		{ x: -1.03, y: -0.85 },
	CARRYOVER:	0.4,
	VELOCITY:	0.2,
	FRICTION:	0.9,
});

function resetBall(p1Score: number, p2Score: number): Ball
{
	const goRight: boolean	= (p1Score + p2Score) % 2 === 0;
	const pos: number		= goRight ? 30 : 70;

	return ({
		pos:		{ x: pos,						y: 50					},
		prevPos:	{ x: pos,						y: 50					},
		size:		{ x: 2,							y: 2					},
		dir:		{ x: 0.35 * (goRight ? 1 : -1),	y: Math.random() - 0.5	}
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
	if (ball.pos.x <= -2)
	{
		game.p2Score++;
		game.ball = resetBall(game.p1Score, game.p2Score);
	}
	if (ball.pos.x >= 102)
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

function manageAIInput(match: Match, game: PongState, ticks: number): void
{
	if (match.isPlayer1 && match.vsAI)
	{
		if (game.ai.desiredY > game.p2.pos.y + game.p2.size.y / 2)
			game.p2Input = 1;
		else if (game.ai.desiredY < game.p2.pos.y - game.p2.size.y / 2)
			game.p2Input = -1;
		if (ticks % 2 === 0 && Math.abs(game.ai.desiredY - game.p2.pos.y) < game.p2.size.y)
			game.p2Input = 0;
	}
}

function tick(match: Match, game: PongState, ticks: number): void
{
	manageAIInput(match, game, ticks);
	managePaddle(game.p1, game.p1Input);
	managePaddle(game.p2, game.p2Input);
	updateBall(game.ball);
	handleColision(game);
}

function updateInput(match: Match, game: PongState, keysPressed: {[key: string]: boolean})
{
	if (match.isPlayer1)
		game.p1Input = Number(keysPressed['s']         ?? false) - Number(keysPressed['w']       ?? false);
	else
		game.p2Input = Number(keysPressed['ArrowDown'] ?? false) - Number(keysPressed['ArrowUp'] ?? false);
}

function manageAI(game: PongState): void
{
	const ballCopy = structuredClone(game.ball);
	const p1collX = game.p1.pos.x + game.p1.size.x + ballCopy.size.x / 2;
	const p2collX = game.p2.pos.x - ballCopy.size.x / 2;

	while (ballCopy.pos.x < p2collX)
	{
		if (ballCopy.pos.y < ballCopy.size.y || ballCopy.pos.y > 100 - ballCopy.size.y)
		{
			ballCopy.pos.y = ballCopy.pos.y <= 50 ? ballCopy.size.y : 100 - ballCopy.size.y;
			ballCopy.dir.y *= s.BOUNCE.y
		}
		if (ballCopy.pos.x < p1collX)
		{
			ballCopy.pos.x = p1collX;
			ballCopy.dir.x *= s.BOUNCE.x;
		}
		updateBall(ballCopy);
	}
	game.ai.desiredY = Math.max(game.p2.size.y / 2, Math.min(100 - game.p2.size.y / 2, ballCopy.pos.y));
}

function updateGame(match: Match, keysPressed: {[key: string]: boolean}): void
{
	let game = gameTable.get(match.ID);
	const now = Math.floor(Date.now() / 10);

	if (game === undefined)
		return;
	if (game.lastUpdate === -1)
		game.lastUpdate = now;
	for (; game.lastUpdate < now; game.lastUpdate++)
	{
		if (match.vsAI && game.ai.lastActivation + 100 <= game.lastUpdate)
		{
			manageAI(game);
			game.ai.lastActivation = game.lastUpdate;
		}
		tick(match, game, game.lastUpdate);
	}
	updateInput(match, game, keysPressed);
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
		p1Input: 0,
		p2Input: 0,
		ball: resetBall(0, 0),
		lastUpdate: -1,
		ai: { lastActivation: 0, desiredY: 0 },
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
