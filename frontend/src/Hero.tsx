import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import { RiGamepadLine } from "react-icons/ri";
import { TbTournament } from "react-icons/tb";
import { RiRobot2Line } from "react-icons/ri";
import { LuCable } from "react-icons/lu";
import { BsBroadcast } from "react-icons/bs";
import { BiRocket } from "react-icons/bi";
import { useAccountContext } from "./contexts/AccountContext";
import Players from "./Players";
import "./css/ponganimation.css";
import { PlayerState, PlayerData } from './types';
import { useState, useEffect } from 'react';

function SimplePong()
{
	return (
		<div className="pong-wrapper w-full max-w-[40vw] aspect-[4/3]">
			<div className="pong-game">
				<div className="paddle left-paddle"></div>
				<div className="ball"></div>
				<div className="paddle right-paddle"></div>
			</div>
		</div>
	)
}

let socket: WebSocket | null = null;
let queueStartTime = new Map<number, number>();

function startQueue(user: PlayerData, setIsPlaying: (state: PlayerState) => void)
{
	socket = new WebSocket(`ws://${window.location.hostname}:5001/matchmake`);

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
		}
	});
	queueStartTime.set(user.id, Date.now());
	setIsPlaying(PlayerState.queueing);
}

function getQueueTime(userID: number): number
{
	if (queueStartTime.has(userID) === false)
	{
		console.log("entry not found");
		return 0;
	}
	return Math.floor((Date.now() - (queueStartTime.get(userID) as number)) / 1000);
}

function endQueue(userID: number, setIsPlaying: (state: PlayerState) => void)
{
	if (socket !== null)
	{
		socket.close();
		console.log("Matchmaking cancelled");
		socket = null;
	}
	setIsPlaying(PlayerState.idle);
	queueStartTime.delete(userID);
}

function Buttons()
{
	const { loggedInAccounts, setIsPlaying } = useAccountContext();
	const hoverScale = 1.03;
	const tapScale = 0.97;

	async function AddGame(user1: PlayerData, user2: PlayerData, isLocalGame: boolean)
	{
		const response = await axios.post(`http://${window.location.hostname}:5001/pong/add`, { user1, user2, isLocalGame });
		if (response.status >= 400)
		{
			console.log("Failed to create match");
			return;
		}
		setIsPlaying(PlayerState.playing);
	}

	return(
		<div className="flex flex-col items-start space-y-1.5 font-bold text-lg">

			<p className="text-s text-lg font-medium">1 Player:</p>
			<div className="flex flex-row space-x-4 ml-2">
				<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-4 py-0 rounded-3xl w-auto
				${loggedInAccounts.length < 1 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`}
					whileHover={(loggedInAccounts.length >= 1 ? { scale: hoverScale } : {})}
					whileTap={(loggedInAccounts.length >= 1 ? { scale: tapScale } : {})}
					onClick={() => startQueue(loggedInAccounts[0], setIsPlaying)}>
					<p>Online Game</p>
					<BiRocket />
				</motion.button>

				<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-4 py-0 rounded-3xl w-auto
				${loggedInAccounts.length < 1 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`}
					whileHover={(loggedInAccounts.length >= 1 ? { scale: hoverScale } : {})}
					whileTap={(loggedInAccounts.length >= 1 ? { scale: tapScale } : {})}
					onClick={() => AddGame(loggedInAccounts[0], { id: -1, username: "AI" }, false)}>
					<p>Versus AI</p>
					<RiRobot2Line />
				</motion.button>
			</div>

			<p className="text-s text-lg font-medium">2 Players:</p>
				<div className="flex flex-row space-x-4 ml-2">
				<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-4 py-0 rounded-3xl w-auto
				${loggedInAccounts.length < 2 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`}
					whileHover={(loggedInAccounts.length >= 2 ? { scale: hoverScale } : {})}
					whileTap={(loggedInAccounts.length >= 2 ? { scale: tapScale } : {})}
					onClick={() => AddGame(loggedInAccounts[0], loggedInAccounts[1], true)}>
					<p>Local Game</p>
					<RiGamepadLine />
				</motion.button>
			</div>

			<p className="text-s text-lg font-medium">3+ Players:</p>
			<div className="flex flex-row space-x-4 ml-2">
				<motion.button className={`flex items-center h-10 space-x-2 bg-[#ff914d] text-white px-4 py-0 rounded-3xl w-auto
				${loggedInAccounts.length < 3 ? 'opacity-40' : 'hover:bg-[#ab5a28] hover:cursor-pointer'}`}
					whileHover={(loggedInAccounts.length > 2 ? { scale: hoverScale } : {})}
					whileTap={(loggedInAccounts.length > 2 ? { scale: tapScale } : {})}>
					<p>Tournament</p>
					<TbTournament />
				</motion.button>
			</div>

		</div>
	)
}

function Hero()
{
	const { loggedInAccounts, isPlaying, setIsPlaying } = useAccountContext();
	const [queueTime, setQueueTime] = useState(0);

	useEffect(() => 
	{
		const interval = setInterval(() =>
		{
			if (loggedInAccounts.length !== 0)
			{
				setQueueTime(getQueueTime(loggedInAccounts[0].id));
			}
		}, 250);
		return () => clearInterval(interval);
	}, [isPlaying, loggedInAccounts])

	return(
		<>
			<div className={`w-full flex justify-between items-start pt-[10vh] ${isPlaying === PlayerState.queueing ? "blur-sm" : ""}`}>
				<div className="w-1/2 flex h-[calc(100vh - 8vh)] justify-start flex-col p-24 pr-16 space-y-12 px-[6vw]">
					<h1 className="text-6xl  font-semibold text-brand-orange">Are you ready for a <span className="font-black italic text-[#ff914d]">transcending</span> game of Pong?</h1>
					<p className="text-2xl">Get ready for the ultimate Pong experience. Challenge your friends in fast-paced, competitive matches where every point matters. Are you ready to outplay, outlast, and outscore?</p>
					<Buttons />
					{/* <Players /> */}
				</div>
				<div className="w-1/2 h-[calc(100vh - 8vh)] flex justify-start flex-col p-24 pl-16 space-y-12 max-w-[50vw] px-[6vw]">
					<SimplePong />
				</div>
			</div>
			{isPlaying === PlayerState.queueing &&
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
							onClick={() =>{ endQueue(loggedInAccounts[0].id, setIsPlaying) }}>Cancel
						</motion.button>
					</motion.div>
				</motion.div>
			</AnimatePresence>}
		</>
	)
}

export default Hero