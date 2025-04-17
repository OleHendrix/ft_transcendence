import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Players from "./Players";
import { RiGamepadLine } from "react-icons/ri";
import { TbTournament } from "react-icons/tb";
import { RiRobot2Line } from "react-icons/ri";
import { BiRocket } from "react-icons/bi";
import { useAccountContext } from "./contexts/AccountContext";
import "./css/ponganimation.css";
import { PlayerState, PlayerData, QueueData, Opponent } from './types';
import { useState, useEffect } from 'react';

function SimplePong()
{
	return (
		<div className="pong-wrapper w-full">
			<div className="pong-game">
				<div className="paddle left-paddle"></div>
				<div className="ball"></div>
				<div className="paddle right-paddle"></div>
			</div>
		</div>
	)
}

let socket: WebSocket | null = null;
let queueStartTime = 0;

export function startQueue(user: QueueData, setIsPlaying: (state: PlayerState) => void, navigate: ReturnType<typeof useNavigate>)
{
	socket = new WebSocket(`ws://${window.location.hostname}:5001/matchmake`);

	navigate('/queue');
	if (socket === null)
		return;
	socket.addEventListener("open", () =>
	{
		console.log("Connected to matchmaking server");

		socket?.send(JSON.stringify(user));
	});

	socket.addEventListener("message", (event) =>
	{
		console.log("Message from server:", event.data);

		if (event.data === "Starting match")
		{
			console.log("Match found! Redirecting...");
			setIsPlaying(PlayerState.playing);
			navigate('/pong-game');
		}
	});
	queueStartTime = Date.now();
	setIsPlaying(PlayerState.queueing);
}

export function Queue()
{
	const navigate = useNavigate();
	const [queueTime, setQueueTime] = useState(0);
	const { loggedInAccounts, isPlaying, setIsPlaying } = useAccountContext();

	function endQueue(userID: number, setIsPlaying: (state: PlayerState) => void)
	{
		if (socket !== null)
		{
			socket.close();
			console.log("Matchmaking cancelled");
			socket = null;
		}
		navigate("/")
		setIsPlaying(PlayerState.idle);
	}

	useEffect(() => 
	{
		const interval = setInterval(() =>
		{
			if (loggedInAccounts.length !== 0)
			{
				setQueueTime(Math.floor((Date.now() - queueStartTime) / 1000));
			}
		}, 100);
		return () => clearInterval(interval);
	}, [])

	return (
		<AnimatePresence>
			<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
				<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-full max-w-md relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
					<div className="justify-center space-y-3">
						<h1 className="block text-4xl font-medium text-center">Looking for a match...</h1>
						<h1 className="block text-l font-medium text-gray-500 text-center">Queue time: {queueTime}s</h1>
					</div>
					<motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
						whileHover={ {scale: 1.03}}
						whileTap={ {scale: 0.97}}
						onClick={() =>
						{
							endQueue(loggedInAccounts[0].id, setIsPlaying)
							navigate("/")
						}}>Cancel
					</motion.button>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

function Buttons()
{
	const { loggedInAccounts, isPlaying, setIsPlaying } = useAccountContext();
	const navigate = useNavigate();
	const hoverScale = 1.03;
	const tapScale = 0.97;

	async function AddGame(user1: PlayerData, user2: PlayerData, isLocalGame: boolean)
	{
		const response = await axios.post(`http://${window.location.hostname}:5001/pong/add`, { user1, user2, isLocalGame, tournament: -1 });
		if (response.status >= 400)
		{
			console.log("Failed to create match");
			return;
		}
		setIsPlaying(PlayerState.playing);
		navigate('/pong-game');
	}

	return(
		<div className="flex flex-col font-bold text-m md:text-lg whitespace-nowrap space-y-4 w-full">
		<div className="flex flex-row justify-between md:flex-col w-full md:space-x-6 space-y-4">
			
			<div className="flex flex-col space-y-2">
			<p className="text-lg font-medium">1 Player:</p>
			<div className="flex flex-row space-x-3">
				<motion.button 
				className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-3 py-0 rounded-3xl
				${loggedInAccounts.length < 1 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`}
				whileHover={(loggedInAccounts.length >= 1 ? { scale: hoverScale } : {})}
				whileTap={(loggedInAccounts.length >= 1 ? { scale: tapScale } : {})}
				onClick={() => 
				{
					navigate("/queue");
					startQueue({ player: loggedInAccounts[0], opponentID: Opponent.ANY}, setIsPlaying, navigate);
				}}>
				<p>Online Game</p>
				<BiRocket />
				</motion.button>

				<motion.button 
				className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-3 py-0 rounded-3xl
				${loggedInAccounts.length < 1 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`}
				whileHover={(loggedInAccounts.length >= 1 ? { scale: hoverScale } : {})}
				whileTap={(loggedInAccounts.length >= 1 ? { scale: tapScale } : {})}
				onClick={() => 
				{
					navigate("/queue");
					startQueue( { player: { id: loggedInAccounts[0].id, username: loggedInAccounts[0].username }, opponentID: Opponent.AI }, setIsPlaying, navigate);
				}}>
				<p>Versus AI</p>
				<RiRobot2Line />
				</motion.button>
			</div>
			</div>

			<div className="flex flex-col space-y-2">
			<p className="text-lg md:text-lg font-medium">2 Players:</p>
			<div className="flex flex-row">
				<motion.button 
				className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-3 py-0 rounded-3xl
				${loggedInAccounts.length < 2 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`}
				whileHover={(loggedInAccounts.length >= 2 ? { scale: hoverScale } : {})}
				whileTap={(loggedInAccounts.length >= 2 ? { scale: tapScale } : {})}
				onClick={() => AddGame(loggedInAccounts[0], loggedInAccounts[1], true)}>
				<p>Local Game</p>
				<RiGamepadLine />
				</motion.button>
			</div>
			</div>
		</div>

		<div className="flex flex-col space-y-2">
			<p className="text-lg md:text-lg font-medium">3+ Players:</p>
			<div className="flex flex-row">
			<motion.button 
				className={`flex items-center h-10 space-x-2 bg-[#ff914d] text-white px-3 py-0 rounded-3xl
				${loggedInAccounts.length < 1 ? 'opacity-40' : 'hover:bg-[#ab5a28] hover:cursor-pointer'}`}
				whileHover={(loggedInAccounts.length > 2 ? { scale: hoverScale } : {})}
				whileTap={(loggedInAccounts.length > 2 ? { scale: tapScale } : {})}
					onClick={() =>  {if (isPlaying !== PlayerState.playing) navigate('/tournament/setup')}}>
				<p>Tournament</p>
				<TbTournament />
			</motion.button>
			</div>
		</div>
		</div>
	)
}

function Hero()
{
	const { loggedInAccounts, isPlaying, setIsPlaying } = useAccountContext();

	return(
		<>
			<div className={`w-full flex flex-col lg:flex-row min-h-[calc(100vh-8vh)] justify-between items-center ${isPlaying === PlayerState.queueing ? "blur-sm" : ""}`}>
				<div className="w-full lg:w-1/2 flex justify-center flex-col p-6 pl-[6vw] md:pl-[4vw] space-y-12">
					<h1 className="text-5xl md:text-6xl font-semibold text-center md:text-left text-brand-orange">Are you ready for a <span className="font-black italic text-[#ff914d]">transcending</span> game of Pong?</h1>
					<p className="text-2xl md:text-3xl text-center md:text-left">Get ready for the ultimate Pong experience. Challenge your friends in fast-paced, competitive matches where every point matters. Are you ready to outplay, outlast, and outscore?</p>
					<Buttons />
					<div className="md:hidden">
						<Players />
					</div>
				</div>
				<div className="w-full lg:w-1/2 flex justify-center flex-col p-6 pr-[6vw] md:pr-[4vw] space-y-12">
					<SimplePong />
				</div>
			</div>
		</>
	)
}

export default Hero