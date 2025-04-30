import { createContext, useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import axios 									from "axios";
import { useAccountContext } 					from "./AccountContext";
import { useNavigate } 							from "react-router-dom";
import { PlayerState, TournamentData }			from '../types';
import { localStorageUpdateTournamentId } 		from "../tournament/utils";

type TournamentContextType = {
	tournamentId: 			number | null;
	setTournamentId: 		Dispatch<SetStateAction<number>>;

	tournamentData: 		TournamentData | null;
	setTournamentData:		Dispatch<SetStateAction<TournamentData | null>>;

	readyForNextRound: 		boolean;
	setReadyForNextRound: 	Dispatch<SetStateAction<boolean>>;

	countdown:				number | null;
	setCountdown:			Dispatch<SetStateAction<number | null>>;

	socket:					WebSocket | null;
};


const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: {children: ReactNode})
{
	const [ tournamentId, 		setTournamentId ] 			= useState<number>(-1);
	const [ tournamentData, 	setTournamentData ]			= useState<TournamentData | null>(null);
	const { loggedInAccounts, 	setIsPlaying  } 			= useAccountContext();
	const [ readyForNextRound, 	setReadyForNextRound]		= useState(false);
	const [ countdown, 			setCountdown ]				= useState<number | null>(null);
	const navigate											= useNavigate();
	const socketRef											= useRef<WebSocket | null>(null);


	// TODO: decide what to do for the players who have no game
	// make the bs where globalchat can announce tournaments 
	// start next round button available too soon 

	useEffect(() => { //on mount (for refresh) set TournamentID back
		const storedId = localStorage.getItem("tournamentId");
		if (storedId) {
			console.log(`setting tournament id to localstorage stored Id : ${storedId}`);
			setTournamentId(JSON.parse(storedId));

			(async () => {
				try {
					const response = await axios.get(`http://${window.location.hostname}:5001/api/tournament-data/${storedId}`);
					setTournamentData(response.data);
				} catch (error) {
					console.error("Failed to fetch tournament data:", error);
				}
			})();
		} else {
			setTournamentId(-1);
		}
	}, []);
	

	useEffect(() => {
		const player = loggedInAccounts[0];
		if ( tournamentId === -1 || !player?.id || !player?.username ) return;

		localStorageUpdateTournamentId(tournamentId);

		if (socketRef.current) {
			socketRef.current.close();
		}
		
		const socket = new WebSocket(`ws://${window.location.hostname}:5001/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${tournamentId}`);
		socketRef.current = socket;
		socket.onopen = () => {
			console.log(`TournamentContext:WebsocketCreated:PlayerId:${player.id}:TournamentId:${tournamentId}`);
		};
	
		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "DATA")
				{
					setTournamentData(data.tournament);
				}
				if (data.type === "START_SIGNAL") {
					setCountdown(3); // trigger countdown
				
					let count = 3;
					const interval = setInterval(() => {
						count--;
						setCountdown(count);
				
						if (count < 0) {
							clearInterval(interval);
							setCountdown(null);
							setIsPlaying(PlayerState.playing); // start game
							navigate('/pong-game');
						}
					}, 1000);
				}
				
				if (data.type === "READY_FOR_NEXT_ROUND")
				{
					setReadyForNextRound(true);
				}
			} catch (err) {
				console.error("Failed to parse WebSocket message", err);
			}
		};
	
		socket.onerror = (err) => {
			console.error(`TournamentContext:WebSocket:ERROR:`, err);
		};
	
		// socket.onclose = () => {
		// 	// navigate('/');
		// 	// console.log("WebSocket tournament waiting room closed");
		// };
	
		return () => {
			socket.close();
		};
	}, [tournamentId]);
	
	const value = useMemo(() => (
		{
			tournamentId,		setTournamentId,
			tournamentData,		setTournamentData,
			readyForNextRound,	setReadyForNextRound,
			countdown, 			setCountdown,
			socket: 			socketRef.current,
		}
	), [
		tournamentId, 		setTournamentId,
		tournamentData, 	setTournamentData,
		readyForNextRound, 	setReadyForNextRound,
		countdown, 			setCountdown
	]);
	
	return (
		<TournamentContext.Provider value={value}>
			{ children }
		</TournamentContext.Provider>
	);
}

export function useTournamentContext()
{
	const context = useContext(TournamentContext);
	if (!context)
		throw new Error("Error");
	return context;
}
