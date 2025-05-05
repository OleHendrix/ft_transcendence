import { useMemo, useState, useEffect, useRef } from 'react';
import axios 								from 'axios';
import { motion }							from 'framer-motion';
import { useNavigate, useParams } 						from 'react-router-dom';
import { IoMdClose } 						from 'react-icons/io';
import { PlayerData, PlayerState, TournamentData }						from '../types';
import { useAccountContext } 				from '../contexts/AccountContext';
import Chat 								from "../chat/Chat"
import { MdAdminPanelSettings } from "react-icons/md";
import { TbTournament } from "react-icons/tb";
import { BiRocket } from "react-icons/bi";
import { Result } from "../types"
import { generateBracket, handleClose, socketOnMessage, stillPlaying, useGetTournamentData } from './utilsFunctions';
import CloseButton from '../utils/CloseButton';
const WS_URL = import.meta.env.VITE_WS_URL;
const API_URL = import.meta.env.VITE_API_URL;

export default function TournamentWaitingRoom() 
{
	const { loggedInAccounts, setIsPlaying } 												= useAccountContext();
	const [ tournamentData, setTournamentData ] 											= useState<TournamentData | null>(null);
	const [ isLeaving, setIsLeaving ]														= useState(false);
	const [ countdown, setCountdown ]														= useState(0);
	const navigate 																			= useNavigate();
	const { id }																			= useParams();
	let matchCounter = 1;
	const isLeavingRef = useRef(isLeaving);
	const tournamentDataRef = useRef(tournamentData);
	const setIsLeavingRef = useRef(setIsLeaving);
	const loggedInAccountsRef = useRef(loggedInAccounts);
	const navigateRef = useRef(navigate);
	const isNavigatingToGame = useRef(false);
	useGetTournamentData({ id: id!, setTournamentData });

	useEffect(() =>
	{
		return () => {handleClose({ isLeaving, setIsLeaving, loggedInAccountsRef, tournamentDataRef, isNavigatingToGame, setIsLeavingRef, id: id! });};
	}, []);														

	useEffect(() =>
	{
		isLeavingRef.current 		= isLeaving;
		tournamentDataRef.current 	= tournamentData;
		setIsLeavingRef.current 	= setIsLeaving;
		loggedInAccountsRef.current = loggedInAccounts;
		navigateRef.current 		= navigate;
	}, [isLeaving, tournamentData, setIsPlaying, loggedInAccounts, navigate]);
	

	useEffect(() =>
	{
		const player = loggedInAccounts[0];
		if (!id || !player?.id || !player?.username)
			return;
		const socket = new WebSocket(`${WS_URL}/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${Number(id)}`);
		socket.onopen = () => console.log("Tournament WS connected");
		socket.onmessage = (event) => socketOnMessage({ playerId: player.id, playerUsername: player.username, tournamentId: Number(id), setTournamentData, setCountdown, setIsPlaying, isNavigatingToGame, navigate, event });
		return () => {socket.close()};
	}, [loggedInAccounts]);

	const rounds = useMemo(() =>
	{
		if (!tournamentData) return [];
		return generateBracket({ players: tournamentData.players, maxPlayers: tournamentData.maxPlayers, winners: tournamentData.winners });
	}, [tournamentData?.players, tournamentData?.winners]);


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

				<CloseButton onClick={async () => {await handleClose({ isLeaving, setIsLeaving, loggedInAccountsRef, tournamentDataRef, isNavigatingToGame, setIsLeavingRef, id: id! }); navigate('/')}} />
				<div className='flex-col mb-6'>
					<h1 className="text-3xl font-bold text-center tracking-wide">Tournament Waiting Room</h1>
					<p className='text-center text-[#ff914d] font-bold'>#{id}</p>
				</div>

				<div className='w-full h-full flex'>
					<div className="w-full lg:w-1/8 flex flex-col justify-start items-center space-y-12">
						<h2 className="text-m font-medium mb-4">Players: <span className={`text-white font-bold ${tournamentData?.players.length !== tournamentData?.maxPlayers ? 'opacity-50' : ''}`}>{tournamentData?.players.length}/{tournamentData?.maxPlayers}</span></h2>
						<ul className="flex flex-col w-full gap-2">
							{(tournamentData?.players && tournamentData?.players.length > 0) ?
							(
								tournamentData?.players.map((player: PlayerData, index: number) =>
								(
									<li key={index} className={`bg-black/40 w-full flex justify-between items-center p-2 text-center text-white font-black ${tournamentData?.players.length !== tournamentData?.maxPlayers ? 'opacity-50' : ''}`}>
										{player.username}
										{player.id === tournamentData?.hostId && <MdAdminPanelSettings className='text-white' />}
									</li>
								))
							) :
							(
								<li className="text-gray-400">No players yet...</li>
							)}
							</ul>
					</div>
				{stillPlaying({ tournamentData }) ?
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
							<p className='flex items-center gap-2'>Matches to be played <TbTournament className='text-[#ff914d]' /></p>
							</div>
							<div className="flex flex-col gap-6 justify-start items-center w-fit px-4">
								{rounds.map((round, roundIndex) =>
								(
									<div key={roundIndex} className="flex justify-center gap-6 min-w-[200px]">
										{round.map((match, matchIndex) => {
											const currentMatchNumber = matchCounter++;
											return (
												<div key={matchIndex} className={`bg-[#134588] text-white text-xs flex-col px-4 py-1 text-center font-bold shadow-2xl ${(roundIndex + 1 !== tournamentData?.matchRound || match.includes('TBD')) ? 'opacity-30' : ''}`}>
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
						tournamentData?.matchRound === 1 &&
						(
							<button className={`px-3 flex items-center gap-2 py-0 h-10 bg-[#ff914d] text-white font-semibold rounded-3xl shadow-lg transition ${tournamentData?.players.length !== tournamentData?.maxPlayers ? 'opacity-30' : 'cursor-pointer'}`}
								disabled={tournamentData?.players.length !== tournamentData?.maxPlayers}
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
								Start Tournament <BiRocket className='text-white' />
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
