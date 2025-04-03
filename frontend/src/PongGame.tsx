import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { PlayerState, PongState } from './types';
import { useAccountContext } from './contexts/AccountContext';
import { useLoginContext } from './contexts/LoginContext';
import { motion, AnimatePresence } from 'framer-motion';

function PongGame()
{
	const { loggedInAccounts, setIsPlaying }  = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	// loggedInPlayers[indexPlayerStats].id 

	const userID = 1;
	const aiID = -1;
	const [pong, setPong] = useState<PongState>
	({
		p1: { pos: { x: 3, y: 50},  size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#ff914d", bounce: false },
		p2: { pos: { x: 95, y: 50}, size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#134588", bounce: false },
		p1Score: 0, p2Score: 0, p1Input: 0, p2Input: 0,
		ball: { pos: { x: 200, y: 200 }, prevPos: { x: 200, y: 200 }, size: { x: 2, y: 2 }, dir: { x: 1, y: 1 } },
		lastUpdate: -1,
		ai: { lastActivation: 0, desiredY: 0 },
		maxPoints: 3,
		p1Won: null,
		p1Data: { id: 0, username: ""},
		p2Data: { id: 0, username: ""},
	});

	let animationId: number = 0;

	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

	const handleKeyDown = (e: KeyboardEvent) =>
	{
		setKeysPressed(prev => ({ ...prev, [e.key]: true }));
	};

	const handleKeyUp = (e: KeyboardEvent) =>
	{
		setKeysPressed(prev => ({ ...prev, [e.key]: false }));
	};

	useEffect(() =>
	{
		function loop()
		{
			async function fetchGame()
			{
				try
				{
					const response = await axios.post(`http://${window.location.hostname}:5001/pong`, { userID: loggedInAccounts[0].id, keysPressed: keysPressed }); //TODO: change loggedInAccounts[0].id to variable
					if (response.data)
					{
						setPong(response.data);
					}
				}
				catch (error)
				{

				}
			}
			fetchGame();
		}
		animationId = requestAnimationFrame(loop);
	}, [pong]);

	useEffect(() =>
	{
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () =>
		{
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			// cancelAnimationFrame(animationId);
		};
	}, []);

	async function leaveMatch(userID: number)
	{
		setIsPlaying(PlayerState.idle);
		await axios.post(`http://${window.location.hostname}:5001/pong/delete`, { userID: userID});
	}

	const textSize: number = 1250 - Math.max(pong.p1Score.toString().length, pong.p2Score.toString().length, 1) * 250;

	function ParseResult()
	{
		if (pong.p1Won === null)
			return "";

		let winner = pong.p1Data;
		let loser  = pong.p2Data;
		if (pong.p1Won === false)
			[winner, loser] = [loser, winner];

		let message1: string = "";
		let message2: string = "";

		if (winner.id === loggedInAccounts[0].id)
			message1 = `Congrats, ${winner.username}!`
		else
			message1 = `Better luck next time, ${loser.username}`

		if (pong.p1Score < pong.maxPoints && pong.p2Score < pong.maxPoints)
			message2 = `${loser.username} forfeited`;
		else
		{
			const [s1, s2] = pong.p1Won ? [pong.p1Score, pong.p2Score] : [pong.p2Score, pong.p1Score];
			message2 = `${winner.username} won with ${s1}-${s2}!`;
		}

		return (
			<div>
				<h1 className="block text-4xl text-center font-medium mb-1">{message1}</h1>
				<h1 className="block text-2xl text-center font-small text-gray-500">{message2}</h1>
			</div>
		);
	}

	const [isP1Bouncing, setP1IsBouncing] = useState(false);
	const [isP2Bouncing, setP2IsBouncing] = useState(false);

	useEffect(() =>
		{
		if (pong.p1.bounce === true)
		{
			setP1IsBouncing(true);
			setTimeout(() =>
			{
				setP1IsBouncing(false);
			}, 80);
		}
	}, [pong.p1.bounce]);

	useEffect(() =>
		{
		if (pong.p2.bounce === true)
		{
			setP2IsBouncing(true);
			setTimeout(() =>
			{
				setP2IsBouncing(false);
			}, 80);
		}
	}, [pong.p2.bounce]);
	const bounceStrength = pong.ball.dir.x;

	return(
		<>
			<div className={`w-screen h-[calc(100vh-8vh)] box-border overflow-hidden relative m-0 ${pong.p1Won === null ? "" : "blur-sm"}`}>
				<div className="relative w-full h-full">
					<div className="absolute inset-0 text-[75%] flex justify-center items-center font-black">
						<div className="h-full w-1/2 flex justify-center items-center">
							<h1 className={`text-center leading-none opacity-5`} style=
							{{
								fontSize: "clamp(20vh, 45vw, 90vh)",
								transformOrigin: "center",
								color: pong.p1.colour,
							}}>{pong.p1Score}</h1>
						</div>
						<div className="h-full w-1/2 flex justify-center items-center">
						<h1 className={`text-center leading-none opacity-7`} style=
							{{
								fontSize: "clamp(20vh, 45vw, 90vh)",
								transformOrigin: "center",
								color: pong.p2.colour,
							}}>{pong.p2Score}</h1>
						</div>
					</div>

					{pong.p1Won === null && <div className={`absolute rounded-full`} style=
					{{
						backgroundColor: pong.ball.dir.x > 0 ? pong.p1.colour : pong.p2.colour,
						width: `${pong.ball.size.x}vw`,
						height: `${pong.ball.size.y}vw`,
						top: `${pong.ball.pos.y}%`,
						left: `${pong.ball.pos.x}vw`,
						transform: 'translateY(-50%) translateX(-50%)'
					}}></div>}
					<motion.div
						className="absolute rounded-sm"
						style={{
							backgroundColor: pong.p1.colour,
							width: `${pong.p1.size.x}vw`,
							height: `${pong.p1.size.y}%`,
							left: `${pong.p1.pos.x}vw`,
							top: `${pong.p1.pos.y}%`,
							transform: 'translateY(-50%)',
							boxShadow: "0 0 15px rgba(255, 145, 77, 0.6)"
						}}
						animate={{ transform: isP1Bouncing ? `translateY(-50%) translateX(${-bounceStrength}vw)` : 'translateY(-50%) translateX(0vw)' }}
						transition={{ type: "tween", duration: 0.08,  ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute rounded-sm"
						style={{
							backgroundColor: pong.p2.colour,
							width: `${pong.p2.size.x}vw`,
							height: `${pong.p2.size.y}%`,
							left: `${pong.p2.pos.x}vw`,
							top: `${pong.p2.pos.y}%`,
							transform: 'translateY(-50%)',
							boxShadow: "0 0 15px rgba(19, 69, 136, 0.6)"
						}}
						animate={{ transform: isP2Bouncing ? `translateY(-50%) translateX(${-bounceStrength}vw)` : 'translateY(-50%) translateX(0vw)' }}
						transition={{ type: "tween", duration: 0.08,  ease: "easeInOut" }}
					/>
				</div>
			</div>
			{pong.p1Won !== null &&
			<AnimatePresence>
				<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-auto relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
						<ParseResult />
						<motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							onClick={() => { leaveMatch(loggedInAccounts[0].id) }}>Back To Home
						</motion.button>
					</motion.div>
				</motion.div>
			</AnimatePresence>}
		</>
	)
}

export default PongGame