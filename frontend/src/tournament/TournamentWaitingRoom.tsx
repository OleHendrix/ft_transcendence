import { useMemo, useState, useEffect, useRef, Dispatch, SetStateAction } 				from 'react';
import axios 								from 'axios';
import { motion }							from 'framer-motion';
import { useNavigate, useParams, useNavigationType, NavigateFunction} 						from 'react-router-dom';
import { IoMdClose } 						from 'react-icons/io';
import { useTournamentContext } 			from '../contexts/TournamentContext';
import { PlayerData, PlayerState, PlayerType, TournamentData }						from '../types';
import { useAccountContext } 				from '../contexts/AccountContext';
import { localStorageUpdateTournamentId } 	from './utils';
import Chat 								from "../chat/Chat"
import { Match, PongState, Result } from "../types"
const WS_URL = import.meta.env.VITE_WS_URL;
const API_URL = import.meta.env.VITE_API_URL;

export default function TournamentWaitingRoom() 
{
	const { loggedInAccounts, setIsPlaying, isPlaying } 									= useAccountContext();
	const { tournamentData, setTournamentData } 											= useTournamentContext();
	const [ isLeaving, setIsLeaving ]														= useState(false);
	const { countdown, setCountdown }														= useTournamentContext();
	const navigate 																			= useNavigate();
	const { id }																			= useParams();
	let matchCounter = 1;
	const isLeavingRef = useRef(isLeaving);
	const tournamentDataRef = useRef(tournamentData);
	const setIsLeavingRef = useRef(setIsLeaving);
	const loggedInAccountsRef = useRef(loggedInAccounts);
	const navigateRef = useRef(navigate);
	const isNavigatingToGame = useRef(false);


	useEffect(() =>
	{
		isLeavingRef.current = isLeaving;
		tournamentDataRef.current = tournamentData;
		setIsLeavingRef.current = setIsLeaving;
		loggedInAccountsRef.current = loggedInAccounts;
		navigateRef.current = navigate;
	}, [isLeaving, tournamentData, setIsLeaving, loggedInAccounts, navigate]);

	useEffect(() =>
	{
		const player = loggedInAccounts[0];
		if (!id || !player?.id || !player?.username)
			return;

		const socket = new WebSocket(`${WS_URL}/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${id}`);
		socket.onopen = () => console.log("Tournament WS connected");

		socket.onmessage = (event) =>
		{
			try
			{
				const data = JSON.parse(event.data);
				if (data.type === "DATA")
					setTournamentData(data.tournament);
				if (data.type === "START_SIGNAL")
				{
					const activeIds = data.data.activePlayerIds;
					if (!activeIds.includes(player.id))
						return;
					setCountdown(3); // trigger countdown
				
					let count = 3;
					const interval = setInterval(() =>
					{
						count--;
						setCountdown(count);
				
						if (count < 0)
						{
							clearInterval(interval);
							setCountdown(null);
							setIsPlaying(PlayerState.playing); // start game
							isNavigatingToGame.current = true;
							navigate('/pong-game');
						}
					}, 1000);
				}
			}
			catch (err)
			{
				console.error("Failed to parse WebSocket message", err);
			}
		};
		socket.onerror = (err) => {console.error("Tournament WS error", err);};

		return () => {socket.close();};
	}, [loggedInAccounts]);

	useEffect(() =>
	{
		async function getTournamentFromParams()
		{
			try
			{
				const response = await axios.get(`${API_URL}/api/tournament-data/${id}`)
				setTournamentData(response.data)
			}
			catch (error)
			{
				console.error("failed to fetch tournament from params", error)
			}
		}; getTournamentFromParams();
	}, [id])

	// useEffect(() => 
	// {
	// 	const handleBeforeUnload = () => {isReloadingRef.current = true;};
	// 	window.addEventListener("beforeunload", handleBeforeUnload);

	// 	return () => {window.removeEventListener("beforeunload", handleBeforeUnload);};
	// }, []);

	useEffect(() =>
	{
		return () =>
		{
			// if (!isReloadingRef.current)
				handleClose();
		};
	}, []);

	const handleClose = async () =>
	{
		if (isLeavingRef.current) 			return; // protection agains double clicks
		if (!tournamentDataRef.current) 	return console.warn("TournamentWaitingRoom:handleClose:TournamentData_not_ready_yet"); //misschien onnodig?
		if (isNavigatingToGame.current)	return; // protection agains double clicks

		setIsLeavingRef.current(true);
		try
		{
			if (loggedInAccountsRef.current[0].id === tournamentDataRef.current?.hostId && tournamentDataRef.current.players.length > 1)
				await axios.post(`${API_URL}/api/rehost-tournament`, {id: Number(id)});
			await axios.post(`${API_URL}/api/leave-tournament`, { playerId: loggedInAccountsRef.current[0].id, id: Number(id)});
			// setTournamentId(-1);
			// localStorageUpdateTournamentId(-1);
			navigateRef.current('/');
		}
		catch (error)
		{
			console.log(error);
		} 
		finally
		{
			setIsLeaving(false);
		}
	};


	function generateBracket(players: PlayerData[], maxPlayers: number, winners: PlayerData[][])
	{
		const totalRounds = Math.log2(maxPlayers);
		const rounds: string[][] = [];
	
		// First round: use actual player usernames
		let currentRound: string[] = [];
		for (let i = 0; i < maxPlayers; i += 2)
		{
			const p1 = players[i]?.username || `TBD`;
			const p2 = players[i + 1]?.username || `TBD`;
			currentRound.push(`${p1} vs ${p2}`);
		}
		rounds.push(currentRound);
	
		// Following rounds: use winner names if available
		for (let r = 1; r < totalRounds; r++)
		{
			const matchesInRound = maxPlayers / Math.pow(2, r + 1);
			const nextRound: string[] = [];
	
			for (let i = 0; i < matchesInRound; i++)
			{
				const w1 = winners[r - 1]?.[i * 2]?.username;
				const w2 = winners[r - 1]?.[i * 2 + 1]?.username;
	
				if (w1 && w2)
					nextRound.push(`${w1} vs ${w2}`);
				else
					nextRound.push(`Winner ${i * 2 + 1} vs Winner ${i * 2 + 2}`);
			}
			rounds.push(nextRound);
		}
		return rounds;
	}



	const runCountdown = (callback: () => Promise<void>) =>
	{
		const sequence = [3, 2, 1, 0];
		let i = 0;
	
		const tick = () =>
		{
			setCountdown(sequence[i]);
			if (i < sequence.length - 1)
			{
				i++;
				setTimeout(tick, 1000);
			}
			else 
			{
				setTimeout(async () =>
				{
					setCountdown(null);
					await callback();
				}, 1000);
			}
		};
		tick();
	};

	const rounds = useMemo(() =>
	{
		if (!tournamentData) return [];
		return generateBracket(tournamentData.players, tournamentData.maxPlayers, tournamentData.winners);
	}, [tournamentData?.players, tournamentData?.winners]);

	function stillPlaying()
	{
		const currentRound = tournamentData?.rounds?.[tournamentData.roundIdx] || [];
		const stillPlaying = currentRound.some(match => match.state.result === Result.PLAYING);
		return stillPlaying;
	}

	return (
		<motion.div
			className="absolute h-screen min-h-screen w-screen backdrop-blur-md bg-black/60 flex items-center justify-center z-50"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}>
			<motion.div
				className="relative bg-[#1e1e1e]/90 text-white shadow-2xl p-10 h-screen min-h-screen w-screen overflow-hidden flex flex-col"
				initial={{ scale: 0.95, y: 20 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.95, y: 20 }}
				transition={{ type: "spring", stiffness: 300, damping: 25 }}>

				{/* Close Button */}
				<button
					className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
					onClick={handleClose}
					disabled={isLeaving}>
					<IoMdClose size={28} />
				</button>

				<div className='flex-col'>

				{/* Title */}
				<h1 className="text-3xl font-bold text-center tracking-wide">
					Tournament Waiting Room
				</h1>

				{/* Host Info */}
				{tournamentData &&
				(
					<div className="flex justify-center gap-10 mb-6 text-lg font-medium text-gray-300">
						<p>🎯 Host: <span className="text-white">{tournamentData.hostUsername}</span></p>
						<p>👥 Players: <span className="text-white">{tournamentData?.players.length}/{tournamentData.maxPlayers}</span></p>
					</div>
				)}

				</div>
				<div className='w-full h-full flex'>
					{/* Players List */}
					<div className="w-full lg:w-1/8 flex flex-col justify-start items-center space-y-12">
						<h2 className="text-m font-semibold mb-4">Players in Lobby</h2>
						<ul className="flex flex-col w-full gap-2">
							{(tournamentData?.players && tournamentData?.players.length > 0) ?
							(
								tournamentData?.players.map((player: PlayerData, index: number) =>
								(
									<li key={index} className="bg-gray-700/80 w-full rounded-xl p-3 text-center text-white font-medium shadow-md">
										👤 {player.username}
									</li>
								))
							) :
							(
								<li className="text-gray-400">No players yet...</li>
							)}
							</ul>
					</div>
				{stillPlaying() ?
				(
					<div className="w-full lg:w-6/8 flex flex-col justify-center items-center space-y-12">
						Matches are still playing...
					</div>
				) :
				tournamentData?.winner ?
				(
					<div className="w-full lg:w-6/8 flex flex-col justify-center items-center space-y-12">
						{`${tournamentData?.winner.username} won the tournament!`}
					</div>
				) :
				rounds.length > 0 ? 
				(
					<div className="w-full lg:w-6/8 flex flex-col justify-start space-y-12">
						<div className="flex flex-col items-center w-full">
							<div className='flex-col mb-6'>
							<h2 className="text-m font-semibold text-center">{`Round ${tournamentData!.matchRound}/${Math.log2(tournamentData!.maxPlayers)}`}</h2>
							<p>Matches to be played</p>
							</div>
							<div className="flex flex-col gap-6 justify-start items-center w-fit px-4">
								{rounds.map((round, roundIndex) =>
								(
									<div key={roundIndex} className="flex justify-center gap-6 min-w-[200px]">
										{round.map((match, matchIndex) => {
											const currentMatchNumber = matchCounter++;
											return (
												<div key={matchIndex} className={`bg-gray-800 text-white text-xs flex-col px-4 py-1 text-center font-bold shadow ${(roundIndex + 1 !== tournamentData?.matchRound || match.includes('TBD')) ? 'opacity-30' : ''}`}>
													<p className='text-[8px] font-light'>{`Match ${currentMatchNumber}`}</p>	
													{match}
												</div>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</div>
				) : null}
				</div>
					<div className='w-full lg:w-1/8'>
				</div>

				{/* Host Controls */}
				<div className="mt-6 flex justify-center gap-6 flex-wrap">
					{tournamentData &&
						loggedInAccounts[0]?.username === tournamentData.hostUsername &&
						tournamentData?.players.length === tournamentData.maxPlayers &&
						tournamentData?.matchRound === 1 &&
						(
							<button className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-semibold rounded-xl shadow-lg transition cursor-pointer"
								onClick={async () =>
								{
									try
									{
										await axios.post(`http://${window.location.hostname}:5001/api/start-tournament`, { id: Number(id) });
										await axios.post(`http://${window.location.hostname}:5001/api/send-message`,
										{
											content: `Tournament ${id} is starting!, ${tournamentData?.players.map(player => player.username).join(', ')}, get ready`,
											senderId: 1,
											receiverId: 1,
										})
									}
									catch (error)
									{
										console.error('tournamentWaitingRoom:ON_CLICK:start-tournament:ERROR:', error);
									}
								}}>
								Start Tournament
							</button>
						)}

						{tournamentData && loggedInAccounts[0]?.username === tournamentData.hostUsername && tournamentData?.readyForNextRound && !tournamentData?.winner &&
						(
							<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition"
								onClick={async () => 
								{
									try 
									{
										await axios.post(`http://${window.location.hostname}:5001/api/start-next-round`, { id: Number(id) });
										await axios.post(`http://${window.location.hostname}:5001/api/send-message`,
										{
											content: `The next round of tournament ${id} is starting!, ${tournamentData?.players.map(player => player.username).join(', ')}, get ready`,
											senderId: 1,
											receiverId: 1,
										})
									}
									catch (error) 
									{
										console.error('tournamentWaitingRoom:ON_CLICK:start-next-round:ERROR:', error);
									}
								}}>
								Start Next Round
							</button>
						)}
				</div>
			</motion.div>
			<Chat />
		</motion.div>
	);
}
