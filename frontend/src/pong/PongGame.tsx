import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { PlayerState, Result, PlayerData, Opponent, Vec2 } from '../types';
import { startQueue } from '../Hero';
import { useAccountContext } from '../contexts/AccountContext';
import { RiRobot2Line } from "react-icons/ri";
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, ParseResult } from './pongUtils';
import { usePongContext } from '../contexts/PongContext';
import { useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { IoArrowUndoOutline, IoChevronUp, IoChevronDown } from "react-icons/io5";
import { isMobile, isTablet } from "react-device-detect";

const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

function PongGame() 
{
	const { loggedInAccounts, setIsPlaying } 					= useAccountContext();
	const { pongState: pong, setPongState, match, setMatch }	= usePongContext();
	const navigate												= useNavigate();

	const socketRef         = useRef<WebSocket | null>(null);
	const isOnPC            = !(isMobile || isTablet)
	const keysPressed       = useRef<{ [key: string]: boolean }>({});
	const mobileKeysPressed = useRef<{ [key: string]: boolean }>({});

	function navigateBack()
	{
		if (match.tournamentId === -1) 
			navigate('/', { replace: true });
		else 
			navigate(-1);
	}

	useEffect(() => 
	{
		if (loggedInAccounts.length === 0)
		{
			navigateBack()
			return;
		}

		const socket = new WebSocket(`${WS_URL}/pong`);
		socketRef.current = socket;

		const handleKeyDown = (event: KeyboardEvent) => keysPressed.current[event.key] = true;
		const handleKeyUp   = (event: KeyboardEvent) => delete keysPressed.current[event.key];
		const handleUnload = () => {
			try {
				socket.close();
				navigateBack();
			} catch (error) {
				console.log(error);
			}
		};

		window.addEventListener("beforeunload", handleUnload);
		window.addEventListener("keydown",      handleKeyDown);
		window.addEventListener("keyup",        handleKeyUp);

		// get response from server and set pong/match state
		socket.addEventListener("message", (event) => {
			try {
				const receivedMatch = JSON.parse(event.data);
				setPongState(receivedMatch.state);
				setMatch(receivedMatch);
			} catch (error) {
				console.error("Invalid event.data:", event.data);
			}
		});

		// send user input to server 60x per second
		const sendInput = () => {
			if (socketRef.current?.readyState === WebSocket.OPEN) {
				socketRef.current.send(JSON.stringify({
					userID: loggedInAccounts[0].id,
					keysPressed: isOnPC ? keysPressed.current : mobileKeysPressed.current,
				}));
			}
		};
		const interval = setInterval(sendInput, 1000 / 60);

		return () => {
			window.removeEventListener("beforeunload", handleUnload);
			window.removeEventListener("keydown",      handleKeyDown);
			window.removeEventListener("keyup",        handleKeyUp);
			leaveMatch(loggedInAccounts[0].id);

			clearInterval(interval);
			leaveMatch(loggedInAccounts[0]?.id);
		};
	}, []);

	function leaveMatch(userID: number | undefined) {
		setIsPlaying(PlayerState.idle);
		if (userID)
		{
			axios.post(`${API_URL}/pong/delete`, { userID: userID }).catch((error) => {
				// not printing shit here because this always happens when refreshing :)
			});
		}
		socketRef.current?.close();
	}

	const [isP1Bouncing, setP1IsBouncing] = useState(false);
	const [isP2Bouncing, setP2IsBouncing] = useState(false);

	useEffect(() => {
		if (pong && pong.p1.lastBounce !== 0) {
			setP1IsBouncing(true);
			setTimeout(() => { setP1IsBouncing(false) }, 80);
		}
	}, [pong?.p1?.lastBounce]);

	useEffect(() => {
		if (pong && pong.p2.lastBounce !== 0) {
			setP2IsBouncing(true);
			setTimeout(() => { setP2IsBouncing(false) }, 80);
		}
	}, [pong?.p2?.lastBounce]);

	if (!pong || !match) {
		return (<div className='text-2xl italic'>loading...</div>);
	}

	function CreateButton(pos: Vec2, output: string, isUp: boolean) {
		function handlePointerDown() {
			mobileKeysPressed.current[output] = true;
	
			// Add global listener to catch pointer up anywhere
			const handleGlobalPointerUp = () => {
				mobileKeysPressed.current[output] = false;
				window.removeEventListener("pointerup", handleGlobalPointerUp);
				window.removeEventListener("pointercancel", handleGlobalPointerUp);
			};
	
			window.addEventListener("pointerup", handleGlobalPointerUp);
			window.addEventListener("pointercancel", handleGlobalPointerUp);
		}
	
		return (
			<button
				className="flex items-center justify-center rounded-lg bg-white/10 hover:cursor-pointer absolute -translate-x-1/2 -translate-y-1/2 shadow-xl text-5xl text-center text-gray-400 active:scale-95 transition-transform touch-none"
				style={{
					width: '15vh',
					height: '15vh',
					top: `${pos.y}vh`,
					left: `${pos.x}vw`,
				}}
				onPointerDown={handlePointerDown}
			>
				{isUp ? <IoChevronUp /> : <IoChevronDown />}
			</button>
		);
	}

	function RenderButtons() {
		if (isOnPC) {
			return (<></>);
		}
		const [topY, bottomY] = [60, 76];
		return (
			<>
				{match?.isLocalGame && match.p2.id !== -1 ? 
					<>
						{CreateButton({ x: 25, y: topY    }, 'w',         true)}
						{CreateButton({ x: 25, y: bottomY }, 's',         false)}
						{CreateButton({ x: 75, y: topY    }, 'ArrowUp',   true)}
						{CreateButton({ x: 75, y: bottomY }, 'ArrowDown', false)}
					</>
					:
					<>
						{CreateButton({ x: 50, y: topY    }, 'w', true)}
						{CreateButton({ x: 50, y: bottomY }, 's', false)}
					</>
				}
			</>
		)
	}

	const bounceStrength = -Math.min(1.2 * pong.ball.dir.x, 6.0);
	return (
		<>
			<div className='flex flex-col min-h-screen bg-zinc-850 w-screen h-screen flex flex-col'>
				<nav className="h-[80px] shrink-0 bg-zinc-850 text-white shadow-xl flex items-center z-10">
					<motion.button className="absolute left-[6vw] md:left-[4vw]" whileHover={{scale: 1.07}} whileTap={{scale: 0.93}} onClick={() => navigateBack()}>
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
					<div className='absolute right-[25%] text-2xl opacity-80'>
						{match?.p2.id === -1 ? <RiRobot2Line className="w-8 h-auto text-[#134588]" /> : match?.p2.username}
					</div>
				</nav>
				<main className={`flex-1 overflow-hidden relative ${pong.result === Result.PLAYING ? "" : "blur-sm"}`}>
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
						<RenderButtons />
					</div>
				</main>

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
										onClick={() => { navigateBack() }}>Back To Home
									</motion.button>
								</>
								}
								{match.tournamentId !== -1 &&
									<motion.button className="pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
										whileHover={{ scale: 1.03 }}
										whileTap={{ scale: 0.97 }}
										onClick={() => { navigateBack() }}>Back To Tournament
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