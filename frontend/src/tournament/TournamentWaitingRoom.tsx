import { useMemo, useState, useEffect, useRef } 			from 'react';
import { useNavigate, useParams } 							from 'react-router-dom';
import { PlayerData, TournamentData }						from '../types';
import { useAccountContext } 								from '../contexts/AccountContext';
import Chat 												from "../chat/Chat"
import Loader 												from '../utils/Loader';
import { MdAdminPanelSettings }								from "react-icons/md";
import { generateBracket, socketOnMessage } 				from './utilsFunctions';
import { stillPlaying, useGetTournamentData } 				from './utilsFunctions';
import CloseButton 											from '../utils/CloseButton';
import { WinnerMessage, Rounds, TournamentButton, startTournament, startNextRound, BackgroundImage } 	from './utilsComponents';				
const WS_URL = import.meta.env.VITE_WS_URL;

export default function TournamentWaitingRoom() 
{
	const { loggedInAccounts, setIsPlaying, Tsocket, setTsocket, inTournament, setInTournament, tournamentData, setTournamentData } 	= useAccountContext();
	const [ countdown, setCountdown ]														= useState(0);
	const navigate 																			= useNavigate();
	const { id }																			= useParams();						
	let matchCounter 																		= 1;				
	const isNavigatingToGame 																= useRef(false);				
	const socketRef																			= useRef<WebSocket | null>(null);
	useGetTournamentData({ id: id!, setTournamentData });
	const setTournamentDataRef = useRef(setTournamentData);
	setTournamentDataRef.current = setTournamentData;

	useEffect(() =>
	{
		const player = loggedInAccounts[0];
		if (!id || !player?.id || !player?.username)
		{
			console.log("returning from socketuseffect");
			return;
		}
		if (!inTournament)
		{
			socketRef.current = new WebSocket(`${WS_URL}/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${Number(id)}`);
			socketRef.current.onmessage = (event) => socketOnMessage({ playerId: player.id, playerUsername: player.username, tournamentId: Number(id), setTournamentDataRef, setCountdown, setIsPlaying, isNavigatingToGame, navigate, event });
			setTsocket(socketRef.current);
			setInTournament(true);
		}
		return () => 
		{
			if (!isNavigatingToGame.current)
			{
				if (Tsocket)
				{
					// console.log("UNMOUNT: cleaning socket connection");
					Tsocket.close();
					setTsocket(null);
				}
				if (socketRef.current)
				{
					// console.log("CLOSING ORIGINAL SOCKET");
					socketRef.current.close();
					socketRef.current = null;
				}
				setInTournament(false);
			}
		};
	}, [loggedInAccounts]);
	

	const rounds = useMemo(() =>
	{
		if (!tournamentData) return [];
		return generateBracket({ players: tournamentData.players, maxPlayers: tournamentData.maxPlayers, winners: tournamentData.winners });
	}, [tournamentData?.players, tournamentData?.winners]);


	return (
		<div className="absolute h-screen min-h-screen w-screen backdrop-blur-md bg-zinc-800 p-10 flex flex-col z-50">
				<BackgroundImage />

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
				{tournamentData && stillPlaying({ tournamentData }) 	? <Loader /> 
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
											onClick={() => startTournament({ userId: loggedInAccounts[0]?.id, id: id!, tournamentData })}
											disabled={tournamentData?.players.length !== tournamentData?.maxPlayers} />}   {/*Start Tournament*/}

					{tournamentData && loggedInAccounts[0]?.username === tournamentData.hostUsername 
					&& tournamentData?.readyForNextRound && !tournamentData?.winner &&
						<TournamentButton 	tournamentData={tournamentData} variant={'next'} 
											onClick={() => startNextRound({ userId: loggedInAccounts[0]?.id, id: id!, tournamentData })} 
											disabled={false}/>}   {/*Start Next Round*/}

				</div>
				{/* {countdown !== null && (
					<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
						<h1 className="text-white text-9xl font-extrabold animate-pulse">{countdown > 0 ? countdown : 'START!'}</h1>
					</div>
				)} */}

			<Chat />
		</div>
	);
}
