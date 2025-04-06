import { PongState, Match, Statics, Paddle, Ball, PlayerData, Result } from "./types";
import { prisma } from '../server';

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
		paddle.lastBounce = Date.now();
	}
}

function handleColision(game: PongState, match: Match)
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
		if (game.p2Score >= game.maxPoints)
		{
			endGame(match, Result.P2WON);
		}
		game.ball = resetBall(game.p1Score, game.p2Score);
	}
	if (ball.pos.x >= 102)
	{
		game.p1Score++;
		if (game.p1Score >= game.maxPoints)
		{
			endGame(match, Result.P1WON);
		}
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
	if (game.ai.desiredY > game.p2.pos.y + game.p2.size.y / 2)
		game.p2Input = 1;
	else if (game.ai.desiredY < game.p2.pos.y - game.p2.size.y / 2)
		game.p2Input = -1;
	if (ticks % 2 === 0 && Math.abs(game.ai.desiredY - game.p2.pos.y) < game.p2.size.y)
		game.p2Input = 0;
}

function tick(match: Match, game: PongState, ticks: number): void
{
	if (match.p2.id === -1)
		manageAIInput(match, game, ticks);
	managePaddle(game.p1, game.p1Input);
	managePaddle(game.p2, game.p2Input);
	updateBall(game.ball);
	handleColision(game, match);
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

function updateInput(match: Match, userID: number, game: PongState, keysPressed: {[key: string]: boolean})
{
	if (match.isLocalGame === true)
	{
		game.p1Input = Number(keysPressed['s'] ?? false) - Number(keysPressed['w'] ?? false);
		if (match.p2.id !== -1)
		{
			game.p2Input = Number(keysPressed['ArrowDown'] ?? false) - Number(keysPressed['ArrowUp'] ?? false);
		}
	}
	else if (match.p1.id === userID)
	{
		game.p1Input = Number((keysPressed['s'] ?? false) || (keysPressed['ArrowDown'] ?? false)) - Number((keysPressed['w'] ?? false) || (keysPressed['ArrowUp'] ?? false));
	}
	else if (match.p2.id === userID)
	{
		game.p2Input = Number((keysPressed['s'] ?? false) || (keysPressed['ArrowDown'] ?? false)) - Number((keysPressed['w'] ?? false) || (keysPressed['ArrowUp'] ?? false));
	}	
}

function handleTimeOut(match: Match)
{
	if (match.state.p1Score > match.state.p2Score)
		endGame(match, Result.P1WON);
	else if (match.state.p1Score < match.state.p2Score)
		endGame(match, Result.P2WON);
	else
		endGame(match, Result.DRAW);
};

export function updateGame(match: Match, userID: number, keysPressed: {[key: string]: boolean}): void
{
	let game = match.state;
	const now = Math.floor(Date.now() / 10);

	if (game.lastUpdate === -1)
		game.lastUpdate = now;
	for (; game.lastUpdate < now && game.result === Result.PLAYING; game.lastUpdate++)
	{
		if (match.p2.id === -1 && game.ai.lastActivation + 100 <= game.lastUpdate)
		{
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

export function initGame(p1Data: PlayerData, p2Data: PlayerData): PongState
{
	return {
		p1: {
			pos:		{ x: 3, y: 50},
			size:		{ x: 2, y: 20 },
			dir:		{ x: 0, y: 0 },
			colour:		"#ff914d",
			lastBounce:	0
		},
		p2: {
			pos:		{ x: 95, y: 50},
			size:		{ x: 2, y: 20 },
			dir:		{ x: 0, y: 0 },
			colour:		"#134588",
			lastBounce:	0
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
		result: Result.PLAYING,
	};
}

export function mirrorGame(game: PongState): PongState
{
	let mirror = structuredClone(game);

	[mirror.p1.pos.y, mirror.p2.pos.y] = [mirror.p2.pos.y, mirror.p1.pos.y];
	[mirror.p1.lastBounce, mirror.p2.lastBounce] = [mirror.p2.lastBounce, mirror.p1.lastBounce];
	[mirror.p1Score, mirror.p2Score] = [mirror.p2Score, mirror.p1Score];
	mirror.ball.pos.x     = 100 - mirror.ball.pos.x;
	mirror.ball.prevPos.x = 100 - mirror.ball.prevPos.x;
	mirror.ball.dir.x     = -mirror.ball.dir.x;
	return mirror;
}

export function calculateNewElo(p1Elo: number, p2Elo: number, win: number)
{
	const expectedOutcome = 1 / (1 + Math.pow(10, (p2Elo - p1Elo) / 400));
	return(Math.round(p1Elo + 24 * (win - expectedOutcome)));
}

export async function endGame(match: Match, result: Result)
{
	match.state.result = result;
	if (match.p2.id === -1)
		return;
	let winner = match.p1.id;
	let loser  = match.p2.id;
	if (result === Result.P2WON)
	{
		[winner, loser] = [loser, winner];
	}

	const winnerUser = await prisma.account.findUnique({where: {id: winner}}) as any;
	const loserUser  = await prisma.account.findUnique({where: {id: loser}})  as any;

	const newWinnerElo = calculateNewElo(winnerUser.elo, loserUser.elo, result === Result.DRAW ? 0.5 : 1);
	const newLoserElo  = calculateNewElo(loserUser.elo, winnerUser.elo, result === Result.DRAW ? 0.5 : 0);

	if (result === Result.DRAW)
	{
		await prisma.account.update
		({
			where: { id: winner },
			data:  { draws: { increment: 1 }, elo: newWinnerElo }
		});

		await prisma.account.update
		({
			where: { id: loser },
			data:  { draws: { increment: 1 }, elo: newLoserElo }
		});
		return;
	}

	await prisma.account.update
	({
		where: { id: winner },
		data:  { wins: { increment: 1 }, elo: newWinnerElo }
	});

	await prisma.account.update
	({
		where: { id: loser },
		data:  { losses: { increment: 1 }, elo: newLoserElo }
	});
}