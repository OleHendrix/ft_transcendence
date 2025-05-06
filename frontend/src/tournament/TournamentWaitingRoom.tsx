import { useMemo, useState, useEffect, useRef } 			from 'react';
import { motion }											from 'framer-motion';
import { useNavigate, useParams, useLocation } 				from 'react-router-dom';
import { PlayerData, TournamentData }						from '../types';
import { useAccountContext } 								from '../contexts/AccountContext';
import Chat 												from "../chat/Chat"
import Loader 												from '../utils/Loader';
import { MdAdminPanelSettings }								from "react-icons/md";
import { generateBracket, handleClose, socketOnMessage } 	from './utilsFunctions';
import { stillPlaying, useGetTournamentData, handleCloseInstant } 				from './utilsFunctions';
import CloseButton 											from '../utils/CloseButton';
import { WinnerMessage, Rounds, TournamentButton, startTournament, startNextRound, BackgroundImage } 	from './utilsComponents';
const WS_URL = import.meta.env.VITE_WS_URL;

export default function TournamentWaitingRoom() 
{
	const { loggedInAccounts, setIsPlaying } 												= useAccountContext();
	const [ tournamentData, setTournamentData ] 											= useState<TournamentData | null>(null);
	const [ isLeaving, setIsLeaving ]														= useState(false);
	const [ countdown, setCountdown ]														= useState(0);
	const navigate 																			= useNavigate();
	const { id }																			= useParams();						//Haalt tournamentId uit de params
	let matchCounter 																		= 1;								//Nodig voor bracketgame nummering, moet nog naar gekeken worden
	const isLeavingRef 																		= useRef(isLeaving);				//UseRefs belangrijk voor closefunction wanneer comoponent unmount, geen idee hoe het werkt 
	const tournamentDataRef 																= useRef(tournamentData);
	const setIsLeavingRef 																	= useRef(setIsLeaving);
	const loggedInAccountsRef 																= useRef(loggedInAccounts);
	const navigateRef 																		= useRef(navigate);
	const isNavigatingToGame 																= useRef(false);
	useGetTournamentData({ id: id!, setTournamentData });																		//Fetched het gevraagde tournament op basis van id uit de params


	//Wanneer component unmount wordt dit aangesproken. Dus bij een pijltjes navigate, refresh idk? 
	//Regelt het leaven van de game, in de backend etc.
	//In handleclose zit een protection (isNavigatingToGame) voor wanneer we naar ponggame gaan. Hier wordt er dus niet geleaved
	
	useEffect(() =>
	{
		return () => {handleClose({ isLeaving, setIsLeaving, loggedInAccountsRef, tournamentDataRef, isNavigatingToGame, setIsLeavingRef, id: id! });};
	}, []);	

	// useEffect(() =>
	// {
	// 	return () => {handleClose({ isLeaving, setIsLeaving, loggedInAccountsRef, tournamentDataRef, isNavigatingToGame, setIsLeavingRef, id: id! });};
	// }, [location.pathname])
	
	//Let hier niet op
	useEffect(() =>
	{
		isLeavingRef.current 		= isLeaving;
		tournamentDataRef.current 	= tournamentData;
		setIsLeavingRef.current 	= setIsLeaving;
		loggedInAccountsRef.current = loggedInAccounts;
		navigateRef.current 		= navigate;
	}, [isLeaving, tournamentData, setIsPlaying, loggedInAccounts, navigate]);
	
	//Bij binnenkomst (mount) wordt er gejoined met de socketconnectie, Zo kan er ook geprobeerd te joinen alleen op basis van url. Als je de game wilt delen.
	//Bij refresh blijft je in de game
	//Bij refresh closed de socket (maar niet de speler in het tournamet), in de backend zit een protection
	//als speler al in het tournament zit wordt alleen de socket weer hersteld, maar niks verwijderd.

	useEffect(() =>
	{
		const player = loggedInAccounts[0];
		if (!id || !player?.id || !player?.username)
			return;
		const socket = new WebSocket(`${WS_URL}/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${Number(id)}`);
		socket.onopen = () => console.log("Tournament WS connected");
		socket.onmessage = (event) => socketOnMessage({ playerId: player.id, playerUsername: player.username, tournamentId: Number(id), setTournamentData, setCountdown, setIsPlaying, isNavigatingToGame, navigate, event });
		return () => {socket.close();};
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
				<BackgroundImage />

				{/*Eerst handleclose afhandelen dan pas unmount.*/}
				<CloseButton onClick={() => navigate('/')} />
				<div className='flex-col mb-6'>
					<h1 className="text-3xl font-bold text-center tracking-wide">Tournament Waiting Room</h1>
					<p className='text-center text-[#ff914d] font-bold'>#{id}</p>
				</div>

				<div className='w-full h-full flex'>
					<div className="w-full lg:w-1/8 flex flex-col justify-start items-center space-y-12">

						<div className='flex flex-col mb-4 justify-center items-center gap-1'>
							<h2 className="text-m font-medium">
								Players: <span className={`text-white font-bold ${tournamentData?.players.length !== tournamentData?.maxPlayers ? 'opacity-50' : ''}`}>
								{tournamentData?.players.length}/{tournamentData?.maxPlayers}</span>
							</h2>
							{tournamentData?.players.length !== tournamentData?.maxPlayers &&<p className='text-gray-400 flex items-center gap-2 text-xs font-light'>Waiting for players to join...</p>}
						</div>

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
													  {/*Wanneer spelers nog in game zitten laat dan loader zien*/}
				{stillPlaying({ tournamentData }) 	? <Loader /> 
				: tournamentData?.winner 			? <WinnerMessage username={tournamentData?.winner.username} />
				: rounds.length > 0 				? <Rounds rounds={rounds} tournamentData={tournamentData} matchCounter={matchCounter} />
				: 									null}

				{/*Placeholder*/}
				</div>
					<div className='w-full lg:w-1/8'>
				</div>

				{/* Host Controls */}
				<div className="mt-6 flex justify-center gap-6 flex-wrap">

					{tournamentData && loggedInAccounts[0]?.username === tournamentData.hostUsername 
					&& tournamentData?.matchRound === 1 && 
						<TournamentButton 	tournamentData={tournamentData} variant={'start'} 
											onClick={() => startTournament({ id: id!, tournamentData })}
											disabled={tournamentData?.players.length !== tournamentData?.maxPlayers} />}   {/*Start Tournament*/}

					{tournamentData && loggedInAccounts[0]?.username === tournamentData.hostUsername 
					&& tournamentData?.readyForNextRound && !tournamentData?.winner &&
						<TournamentButton 	tournamentData={tournamentData} variant={'next'} 
											onClick={() => startNextRound({ id: id!, tournamentData })} 
											disabled={false}/>}   {/*Start Next Round*/}

				</div>
			</motion.div>
			<Chat />
		</motion.div>
	);
}
