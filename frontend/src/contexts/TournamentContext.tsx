import { createContext, useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import axios 					from "axios";
import { useAccountContext } 	from "./AccountContext";
import { useNavigate } 			from "react-router-dom";
import { PlayerState, TournamentData, Result }			from '../types';
import { localStorageUpdateTournamentId } from "../tournament/utils";
const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

type TournamentContextType = {
	tournamentId: 		number | null;
	setTournamentId: 	Dispatch<SetStateAction<number>>;

	showTournamentWaitingRoom: 	boolean;
	setShowTournamentWaitingRoom: Dispatch<SetStateAction<boolean>>;

	players: 	any[];
	setPlayers: Dispatch<SetStateAction<any[]>>;

	tournamentData: 	TournamentData | null;
	setTournamentData:	Dispatch<SetStateAction<TournamentData | null>>;

	readyForNextRound: 	boolean;
	setReadyForNextRound: Dispatch<SetStateAction<boolean>>;

	socket: WebSocket | null;
};


const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: {children: ReactNode})
{
	const [ tournamentId, setTournamentId ] 							= useState<number>(-1);
	const [ showTournamentWaitingRoom, setShowTournamentWaitingRoom] 	= useState(false);
	const [players, setPlayers] 										= useState<any[]>([]);
	const [tournamentData, setTournamentData]							= useState<TournamentData | null>(null);
	const { loggedInAccounts, setIsPlaying, isPlaying } 				= useAccountContext();
	const navigate 														= useNavigate();
	const [readyForNextRound, setReadyForNextRound]	 					= useState(false);
	const socketRef = useRef<WebSocket | null>(null);


	async function startTournament() {
		try {
			console.log("FRONTEND - starting tournament", tournamentId);
			await axios.post(`${API_URL}/api/start-tournament`, { tournamentId, });
			setIsPlaying(PlayerState.playing);
			navigate('/pong-game');
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => { //on mount (for refresh) set TournamentID back
		const storedId = localStorage.getItem("tournamentId");
		if (storedId) {
			console.log(`setting tournament id to localstorage stored Id : ${storedId}`);
			setTournamentId(JSON.parse(storedId));

			(async () => {
				try {
					const response = await axios.get(`${API_URL}/api/tournament-data/${storedId}`);
					setTournamentData(response.data);
					setPlayers(response.data.players);
				} catch (error) {
					console.error("Failed to fetch tournament data:", error);
				}
			})();
		} else 
			setTournamentId(-1);
	async function startNextRound() {
		try {
			console.log("FRONTEND - tournament game finished checking to start next round", tournamentId);
			const response = await axios.post(`${API_URL}/api/start-next-round`, { tournamentId, });
			if (response.data.roundFinished)
			{
				setIsPlaying(PlayerState.playing);
				navigate('/pong-game');
			}
		} catch (error) {
			console.log(error);
		}
	}
	useEffect(() => {
		if (tournamentId !== null && isPlaying !== PlayerState.playing) {
			console.log("Game finished");
			navigate('/tournament/waiting-room');
			startNextRound();
		}
	}, []);
	

	useEffect(() => {
		const player = loggedInAccounts[0];
		if ( tournamentId === -1 || !player?.id || !player?.username ) return;

		localStorageUpdateTournamentId(tournamentId);

		if (socketRef.current) {
			socketRef.current.close();
		}
		
		const socket = new WebSocket(`${WS_URL}/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${tournamentId}`);
		socketRef.current = socket;
		socket.onopen = () => {
			console.log(`TournamentContext:WebsocketCreated:PlayerId:${player.id}:TournamentId:${tournamentId}`);
		};
	
		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "UPDATE")
				{
					setTournamentData(data.tournament);
					setPlayers(data.tournament.players);
				}
				if (data.type === "START_SIGNAL")
				{
					startTournament();
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
			// navigate('/');
			console.error(`TournamentContext:WebSocket:ERROR:`, err);
		};
	
		socket.onclose = () => {
			// navigate('/');
			// console.log("WebSocket tournament waiting room closed");
		};
	
		return () => {
			socket.close();
		};
	}, [tournamentId]);
	
	const value = useMemo(() => (
		{
			tournamentId, setTournamentId,
			showTournamentWaitingRoom, setShowTournamentWaitingRoom,
			players, setPlayers,
			tournamentData, setTournamentData,
			socket: socketRef.current,
			readyForNextRound, setReadyForNextRound
		}
	), [
		tournamentId, setTournamentId,
		showTournamentWaitingRoom, setShowTournamentWaitingRoom,
		players, setPlayers,
		tournamentData, setTournamentData,
		readyForNextRound, setReadyForNextRound
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
