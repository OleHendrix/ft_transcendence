import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { PlayerState, Result, PlayerData, Opponent } from '../types';
import { startQueue } from '../Hero';
import { useAccountContext } from '../contexts/AccountContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, ParseResult } from './pongUtils';
import { usePongContext } from '../contexts/PongContext';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { IoArrowUndoOutline } from "react-icons/io5";
const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

function PongGame()
{
	const { loggedInAccounts, setIsPlaying } 					= useAccountContext();
	const { pongState: pong, setPongState, match, setMatch } 	= usePongContext();

	const navigate = useNavigate();
	const navigationType = useNavigationType();

	useEffect(() => {
		if (navigationType === "POP") {
			leaveMatch(loggedInAccounts[0].id)
		}
	}, [location, navigationType]);


	const socketRef = useRef<WebSocket | null>(null);
	const keysPressed = useRef<{ [key: string]: boolean }>({});

	useEffect(() =>
	{
		const socket = new WebSocket(`${WS_URL}/pong`);
		socketRef.current = socket;

		socket.addEventListener("message", (event) =>
		{
			try {
				const receivedMatch = JSON.parse(event.data);
				setPongState(receivedMatch.state);
				setMatch(receivedMatch);
			} catch (error) {
				console.error("Invalid event.data:", event.data);
			}
		});

		const handleUnload = () =>
		{
			try {
				axios.post(`${API_URL}/pong/end-game`, { 
					userID: loggedInAccounts[0].id 
				});
				socket.close();
			} catch (error) {
				console.log(error);
			}
		};
		window.addEventListener("beforeunload", handleUnload);

		return () => {
			window.removeEventListener("beforeunload", handleUnload);
		};
	}, []);

	// game loop / websocket out
	useEffect(() =>
	{
		const sendInput = () =>
		{
			if (socketRef.current?.readyState === WebSocket.OPEN)
			{
				socketRef.current.send(JSON.stringify
				({
					userID: loggedInAccounts[0].id,
					keysPressed: keysPressed.current,
				}));
			}
		};
		const interval = setInterval(sendInput, 1000 / 60);

		return () => 
		{
			clearInterval(interval);
		}
	}, []);

	// init player I/O
	useEffect(() =>
	{
		const handleKeyDown = (event: KeyboardEvent) => keysPressed.current[event.key] = true;
		const handleKeyUp   = (event: KeyboardEvent) => delete keysPressed.current[event.key];

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () =>
		{
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	function leaveMatch(userID: number)
	{
		navigate("/");
		setIsPlaying(PlayerState.idle);
		axios.post(`${API_URL}/pong/delete`, { userID: userID });
		navigate('/');
	}

	async function rematch(user1: PlayerData, user2: PlayerData)
	{
		const response = await axios.post(`${API_URL}/pong/is-local`, { userID: user1.id });
		const isLocal: boolean = response.data;

		if (isLocal === true && user2.id !== -1)
			await axios.post(`${API_URL}/pong/add`, { user1 , user2, isLocalGame: true, tournament: -1 });
		else
			startQueue({ player: user1, opponentID: user2.id }, setIsPlaying, navigate)
	}

	const [isP1Bouncing, setP1IsBouncing] = useState(false);
	const [isP2Bouncing, setP2IsBouncing] = useState(false);

	useEffect(() =>
	{
		if (pong && pong.p1.lastBounce !== 0)
		{
			setP1IsBouncing(true);
			setTimeout(() => { setP1IsBouncing(false) }, 80);
		}
	}, [pong?.p1?.lastBounce]);

	useEffect(() =>
	{
		if (pong && pong.p2.lastBounce !== 0)
		{
			setP2IsBouncing(true);
			setTimeout(() => { setP2IsBouncing(false) }, 80);
		}
	}, [pong?.p2?.lastBounce]);

	if (!pong || !match)
		return (<div className='text-2xl italic'>loading...</div>);

	async function toMenu()
	{
		setIsPlaying(PlayerState.idle)
		try
		{
			await axios.post(`${API_URL}/pong/end-game`, { userID: loggedInAccounts[0].id });
			await axios.post(`${API_URL}/pong/delete`, { userID: loggedInAccounts[0].id });
		}
		catch (error)
		{
			console.log(error);
		}
		navigate('/');
	}

	function getOpponent(): PlayerData
	{
		if (match.p1.id !== loggedInAccounts[0].id)
			return match.p1;
		else if (match.p2.id === -1)
			return { id: -1, username: "AI👾"};
		else
			return match.p2;
	}

	const bounceStrength = 1.2 * -pong.ball.dir.x; //TODO: cap max
	return (
		<>
			<div className='w-screen h-screen flex flex-col'>
			<nav className="sticky top-0 bg-[#222222] text-white h-[8vh] min-h-[80px] flex items-center shadow-xl text-lg font-medium z-10">
				<motion.button className="absolute left-[6vw] md:left-[4vw]" whileHover={{scale: 1.07}} whileTap={{scale: 0.93}} onClick={() => toMenu()}>
					<IoArrowUndoOutline className="h-8 w-auto hover:cursor-pointer opacity-30 hover:opacity-70" />
				</motion.button>
				<div className='absolute left-[25%] text-2xl opacity-50'>
					{match?.p1.username}
				</div>
				{pong.result === Result.PLAYING &&
				(
					<div className="absolute left-1/2 transform -translate-x-1/2 text-white text-2xl font-bold z-10 opacity-50">
						{formatTime(pong.timer)}
					</div>
				)}
				<div className='absolute right-[25%] text-2xl opacity-50'>
					{match?.p2.username}
				</div>
			</nav>

			<div className={`w-screen min-h-[calc(100vh-8vh)] box-border overflow-hidden relative m-0 ${pong.result === Result.PLAYING ? "" : "blur-sm"}`}>
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

					{pong.result === Result.PLAYING && <div className={`absolute rounded-full`} style=
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
						style=
						{{
							backgroundColor: pong.p1.colour,
							width: `${pong.p1.size.x}vw`,
							height: `${pong.p1.size.y}%`,
							left: `${pong.p1.pos.x}vw`,
							top: `${pong.p1.pos.y}%`,
							transform: 'translateY(-50%)',
							boxShadow: "0 0 15px rgba(255, 145, 77, 0.6)"
						}}
						animate={{ transform: isP1Bouncing ? `translateY(-50%) translateX(${bounceStrength}vw)` : 'translateY(-50%) translateX(0vw)' }}
						transition={{ type: "tween", duration: 0.08, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute rounded-sm"
						style=
						{{
							backgroundColor: pong.p2.colour,
							width: `${pong.p2.size.x}vw`,
							height: `${pong.p2.size.y}%`,
							left: `${pong.p2.pos.x}vw`,
							top: `${pong.p2.pos.y}%`,
							transform: 'translateY(-50%)',
							boxShadow: "0 0 15px rgba(19, 69, 136, 0.6)"
						}}
						animate={{ transform: isP2Bouncing ? `translateY(-50%) translateX(${bounceStrength}vw)` : 'translateY(-50%) translateX(0vw)' }}
						transition={{ type: "tween", duration: 0.08, ease: "easeInOut" }}
					/>
				</div>
			</div>
			{pong.result !== Result.PLAYING &&
			<AnimatePresence>
				<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-full max-w-sm relative shadow-xl flex-grow" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
						<ParseResult />
						<div className="flex flex-grow space-x-4">
							{match.tournamentId === -1 &&
							<>
								<motion.button className="pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.97 }}
									onClick={() => { leaveMatch(loggedInAccounts[0].id) }}>Back To Home
								</motion.button>
								{match.isLocalGame === false &&
									<motion.button className="pt-2 bg-[#134588] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#246bcb] hover:cursor-pointer"
										whileHover={{ scale: 1.03 }}
										whileTap={{ scale: 0.97 }}
										onClick={() => { leaveMatch(loggedInAccounts[0].id); startQueue({player: {id: loggedInAccounts[0].id, username: loggedInAccounts[0].username}, opponentID: Opponent.ANY}, setIsPlaying, navigate) }}>Find new match
									</motion.button>
								}
							</>
							}
							{match.tournamentId !== -1 &&
								<motion.button className="pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.97 }}
									onClick={() => { leaveMatch(loggedInAccounts[0].id) }}>Back To Tournament
								</motion.button>
							}
						</div>
					</motion.div>
				</motion.div>
			</AnimatePresence>}
			</div>
		</>
	)
}

export default PongGame