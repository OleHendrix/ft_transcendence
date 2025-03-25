// import { useState, useEffect } from "react";
// import { Vec2, Ball, AI, Statics, Paddle } from "./types"; 

// function PongGame()
// {
// 	const [p1, setP1] = useState<Paddle>
// 	({ 
// 		pos: { x: 3, y: 50},  size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#ff914d"
// 	});
// 	const [p2, setP2] = useState<Paddle>
// 	({ 
// 		pos: { x: 95, y: 50},  size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#134588"
// 	});

// 	const [ball, setBall] = useState<Ball>
// 	({
// 		pos:		{ x: 50,  y: 50  },
// 		prevPos:	{ x: 50,  y: 50  },
// 		size:		{ x: 2,   y: 2   },
// 		dir:		{ x: 0.5, y: 0.5 },
// 	});

// 	const [ai, setAI] = useState<AI>({
// 		enabled: false,
// 		lastActivation: 0,
// 		desiredY: 50
// 	});

// 	const [s] = useState<Statics>({
// 		BOUNCE:		{ x: -1.02, y: -0.9 },
// 		CARRYOVER:	0.5,
// 		VELOCITY:	0.3,
// 		FRICTION:	0.9,
// 	});

// 	const [p1Score, setP1Score] = useState(0);
// 	const [p2Score, setP2Score] = useState(0);

// 	function resetBall()
// 	{
// 		const goRight: boolean	= (p1Score + p2Score) % 2 === 0;
// 		const pos: number		= goRight ? 70 : 30;

// 		setBall
// 		({
// 			pos:		{ x: pos,				y: 50					},
// 			prevPos:	{ x: pos,				y: 50					},
// 			size:		{ x: 2,					y: 2					},
// 			dir:		{ x: 0.5 - +goRight,	y: Math.random() - 0.5	}
// 		});
// 	}

// 	function paddleColision(paddle: Paddle, setPaddle: React.Dispatch<React.SetStateAction<Paddle>>)
// 	{
// 		let reachY: number = paddle.size.y / 2 + ball.size.y;
// 		let collX:  number = paddle.pos.x;
// 		if (ball.dir.x < 0)
// 			collX += paddle.size.x + ball.size.x / 2;
// 		else
// 			collX -= ball.size.x / 2;

// 		if (((ball.pos.x < collX) !== (ball.prevPos.x < collX)) && ball.pos.y >= paddle.pos.y - reachY && ball.pos.y <= paddle.pos.y + reachY)
// 		{
// 			setBall(prev => ({ ...prev,
// 				prevPos:	{ ...prev.pos, x: collX },
// 				pos:		{ ...prev.pos, x: collX },
// 				dir:		{ x: prev.dir.x * s.BOUNCE.x, y: prev.dir.y + paddle.dir.y * s.CARRYOVER },
// 			}));
// 		}
// 	}

// 	function handleColision()
// 	{
// 		paddleColision(p1, setP1);
// 		paddleColision(p2, setP2);
// 		if (ball.pos.y < ball.size.y || ball.pos.y > 100 - ball.size.y)
// 		{
// 			setBall(prev => ({ ...prev,
// 				pos: { ...prev.pos, y: prev.pos.y <= 50 ? ball.size.y : 100 - ball.size.y },
// 				dir: { ...prev.dir, y: prev.dir.y * s.BOUNCE.y },
// 			}));
// 		}
// 		if (ball.pos.x <= 0)
// 		{
// 			setP2Score(prev => prev + 1);
// 			resetBall();
// 		}
// 		if (ball.pos.x >= 100)
// 		{
// 			setP1Score(prev => prev + 1);
// 			resetBall();
// 		}
// 	}

// 	function manageAI()
// 	{
// 		if (!ai.enabled)
// 			return;
// 		const timeSeconds = Math.floor(Date.now() / 1000);

// 		if (ai.lastActivation === timeSeconds)
// 			return;

// 		ai.lastActivation = timeSeconds;
// 		const ballCopy = structuredClone(ball);
// 		const p2collX = p2.pos.x - ballCopy.size.x / 2;

// 		while (ballCopy.pos.x < p2collX)
// 		{
// 			if (ballCopy.pos.y < ballCopy.size.y || ballCopy.pos.y > 100 - ballCopy.size.y)
// 			{
// 				ballCopy.pos.y = ballCopy.pos.y <= 50 ? ballCopy.size.y : 100 - ballCopy.size.y;
// 				ballCopy.dir.y *= s.BOUNCE.y
// 			}
// 			const p1collX: number = p1.pos.x + p1.size.x + ballCopy.size.x / 2;
// 			if (ballCopy.pos.x < p1collX)
// 			{
// 				ballCopy.pos.x = p1collX;
// 				ballCopy.dir.x *= s.BOUNCE.x;
// 			}
// 			ballCopy.pos.x += ballCopy.dir.x;
// 			ballCopy.pos.y += ballCopy.dir.y;
// 		}
// 		ai.desiredY = Math.max(p2.size.y / 2, Math.min(100 - p2.size.y / 2, ballCopy.pos.y));
// 	}

// 	function managePaddle(paddle: Paddle, dirY: number, setPaddle: React.Dispatch<React.SetStateAction<Paddle>>)
// 	{
// 		const halfSize = paddle.size.y / 2;
// 		dirY = s.FRICTION * paddle.dir.y + s.VELOCITY * dirY;

// 		if (paddle.pos.y + dirY < halfSize || paddle.pos.y + dirY > 100 - halfSize)
// 		{
// 			setPaddle(prev => ({ ...prev,
// 				pos: { ...prev.pos, y: (prev.pos.y < 50) ? halfSize : 100 - halfSize },
// 				dir: { ...prev.dir, y: 0 },
// 			}));
// 		}
// 		else
// 		{
// 			setPaddle(prev => ({ ...prev,
// 				pos: { ...prev.pos, y: prev.pos.y + prev.dir.y },
// 				dir: { ...prev.dir, y: dirY },
// 			}));
// 		}
// 	}

// 	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

// 	useEffect(() =>
// 	{
// 		const handleKeyDown = (e: KeyboardEvent) =>
// 		{
// 			setKeysPressed(prev => ({ ...prev, [e.key]: true }));
// 			if (e.key === "t" || e.key === "T")
// 				setAI(prevAI => ({ ...prevAI, enabled: !prevAI.enabled }));
// 		};

// 		const handleKeyUp = (e: KeyboardEvent) =>
// 		{
// 			setKeysPressed(prev => ({ ...prev, [e.key]: false }));
// 		};

// 		window.addEventListener('keydown', handleKeyDown);
// 		window.addEventListener('keyup', handleKeyUp);

// 		resetBall();
	
// 		return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
// 	}, []);

// 	useEffect(() =>
// 	{
// 		const moveFrame = () =>
// 		{
// 			let P1DirY: number = 0;
// 			let P2DirY: number = 0;

// 			P1DirY = keysPressed['w'] && keysPressed['s'] ? 0 : (keysPressed['w'] ? -1 : 0) + (keysPressed['s'] ? 1 : 0);
// 			if (ai.enabled === false)
// 				P2DirY = keysPressed['ArrowUp'] && keysPressed['ArrowDown'] ? 0 : (keysPressed['ArrowUp'] ? -1 : 0) + (keysPressed['ArrowDown'] ? 1 : 0);
// 			else
// 				P2DirY = (p2.pos.y < ai.desiredY - p2.size.y / 2) ? 1 : (p2.pos.y > ai.desiredY + p2.size.y / 2) ? -1 : 0;
			
// 			managePaddle(p1, P1DirY, setP1);
// 			managePaddle(p2, P2DirY, setP2);

// 			setBall(prev => ({ ...prev,
// 				prevPos: { x: prev.pos.x,              y: prev.pos.y },
// 				pos:     { x: prev.pos.x + prev.dir.x, y: prev.pos.y + prev.dir.y },
// 			}));

// 			manageAI();
// 			handleColision();
// 			animationId = requestAnimationFrame(moveFrame);
// 		};
// 		let animationId = requestAnimationFrame(moveFrame);
// 		return () => { cancelAnimationFrame(animationId); };
// 	}, [keysPressed, ball.pos.x, ball.pos.y, ball.dir.x, ball.dir.y, p1.pos.y, p2.pos.y]);

// 	const textSize: number = 1250 - Math.max(p1Score.toString().length, p2Score.toString().length, 1) * 250;
// 	console.log(textSize);

// 	return(
// 		<div className="w-screen h-[calc(100vh-8vh)] box-border overflow-hidden relative m-0">
// 			<div className="relative w-full h-full">
// 				<div className="absolute inset-0 text-[75%] flex justify-center items-center font-black">
// 					<div className="h-full w-1/2 flex justify-center items-center">
// 						<h1 className={`opacity-5`} style=
// 						{{
// 							color: p1.colour,
// 							fontSize: textSize,
// 						}}>{p1Score}</h1>
// 					</div>
// 					<div className="h-full w-1/2 flex justify-center items-center">
// 					<h1 className={`opacity-7`} style=
// 						{{
// 							color: p2.colour,
// 							fontSize: textSize,
// 						}}>{p2Score}</h1>
// 					</div>
// 				</div>
	
// 				<div className={`absolute  rounded-full`} style=
// 				{{
// 					backgroundColor: ball.dir.x > 0 ? p1.colour : p2.colour,
// 					width: `${ball.size.x}vw`,
// 					height: `${ball.size.y}vw`,
// 					top: `${ball.pos.y}%`,
// 					left: `${ball.pos.x}vw`,
// 					transform: 'translateY(-50%) translateX(-50%)'
// 				}}></div>
// 				<div className="absolute rounded-sm" style={{
// 					backgroundColor: p1.colour,
// 					width: `${p1.size.x}vw`,
// 					height: `${p1.size.y}%`,
// 					left: `${p1.pos.x}vw`,
// 					top: `${p1.pos.y}%`,
// 					transform: 'translateY(-50%)',
// 					boxShadow: "0 0 15px rgba(255, 145, 77, 0.6)"
// 				}}></div>
// 				<div className="absolute rounded-sm" style={{
// 					backgroundColor: p2.colour,
// 					width: `${p2.size.x}vw`,
// 					height: `${p2.size.y}%`,
// 					left: `${p2.pos.x}vw`,
// 					top: `${p2.pos.y}%`,
// 					transform: 'translateY(-50%)',
// 					boxShadow: "0 0 15px rgba(19, 69, 136, 0.6)"
// 				}}></div>
// 			</div>
// 		</div>
// 	)
// }

import React, { useState, useEffect } from 'react';
import axios from "axios";
import { PongState } from './types';

function PongGame()
{
	const userID = 1;
	const aiID = -1;
	const [pong, setPong] = useState<PongState>
	({
		p1: {
			pos: { x: 3, y: 50},
			size: { x: 2, y: 10 },
			dir: { x: 0, y: 0 },
			colour: "#ff914d"
		},
		p2: {
			pos: { x: 95, y: 50},
			size: { x: 2, y: 10 },
			dir: { x: 0, y: 0 },
			colour: "#134588"
		},
		p1Score: 1,
		p2Score: 1,
		ball: {
			pos: { x: 20, y: 20 },
			prevPos: { x: 45, y: 50 },
			size: { x: 2, y: 2 },
			dir: { x: 1, y: 1 }
		}
	});
	const [loading, setLoading] = useState<Boolean> (false);

	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

	useEffect(() =>
	{
		// +------------------------------------------------------------------+
		// |                             > init <                             |
		// +------------------------------------------------------------------+

		const handleKeyDown = (e: KeyboardEvent) =>
		{
			setKeysPressed(prev => ({ ...prev, [e.key]: true }));
			// if (e.key === "t" || e.key === "T")
			// 	setAI(prevAI => ({ ...prevAI, enabled: !prevAI.enabled }));
		};

		const handleKeyUp = (e: KeyboardEvent) =>
		{
			setKeysPressed(prev => ({ ...prev, [e.key]: false }));
		};

		async function initGame()
		{
			
			const response = await axios.post("http://localhost:5001/pong/add", { userID1: 1, userID2: -1 });
			console.log("init status:", response.status);
		};
		initGame();
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	
		return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
	}, []);

	useEffect(() =>
	{
		// o------------------------------------------------------------------o
		// (                            > update <                            )
		// o------------------------------------------------------------------o

		async function fetchGame()
		{
			try
			{
				const response = await axios.post("http://localhost:5001/pong", { userID: userID, keysPressed: keysPressed });
				if (response.data)
				{
					setPong(response.data);
					setLoading(false);
				}
			}
			catch (error)
			{
				console.log("error while getting pong state");
			}
		}
		fetchGame();
	}, [keysPressed]);

	if (loading === true)
	{
		return <div>Loading...</div>;
	}

	const textSize: number = 1250 - Math.max(pong.p1Score.toString().length, pong.p2Score.toString().length, 1) * 250;

	return(
		<div className="w-screen h-[calc(100vh-8vh)] box-border overflow-hidden relative m-0">
			<div className="relative w-full h-full">
				<div className="absolute inset-0 text-[75%] flex justify-center items-center font-black">
					<div className="h-full w-1/2 flex justify-center items-center">
						<h1 className={`opacity-5`} style=
						{{
							color: pong.p1.colour,
							fontSize:textSize,
						}}>{pong.p1Score}</h1>
					</div>
					<div className="h-full w-1/2 flex justify-center items-center">
					<h1 className={`opacity-7`} style=
						{{
							color: pong.p2.colour,
							fontSize: textSize,
						}}>{pong.p2Score}</h1>
					</div>
				</div>
	
				<div className={`absolute  rounded-full`} style=
				{{
					backgroundColor: pong.ball.dir.x > 0 ? pong.p1.colour : pong.p2.colour,
					width: `${pong.ball.size.x}vw`,
					height: `${pong.ball.size.y}vw`,
					top: `${pong.ball.pos.y}%`,
					left: `${pong.ball.pos.x}vw`,
					transform: 'translateY(-50%) translateX(-50%)'
				}}></div>
				<div className="absolute rounded-sm" style={{
					backgroundColor: pong.p1.colour,
					width: `${pong.p1.size.x}vw`,
					height: `${pong.p1.size.y}%`,
					left: `${pong.p1.pos.x}vw`,
					top: `${pong.p1.pos.y}%`,
					transform: 'translateY(-50%)',
					boxShadow: "0 0 15px rgba(255, 145, 77, 0.6)"
				}}></div>
				<div className="absolute rounded-sm" style={{
					backgroundColor: pong.p2.colour,
					width: `${pong.p2.size.x}vw`,
					height: `${pong.p2.size.y}%`,
					left: `${pong.p2.pos.x}vw`,
					top: `${pong.p2.pos.y}%`,
					transform: 'translateY(-50%)',
					boxShadow: "0 0 15px rgba(19, 69, 136, 0.6)"
				}}></div>
			</div>
		</div>
	)
}

export default PongGame