import { createContext, useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import axios 					from "axios";
import { useAccountContext } 	from "./AccountContext";
import { useNavigate } 			from "react-router-dom";
import { PlayerState }			from '../types';
const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

type TournamentContextType = {
	tournamentId: 		number | null;
	setTournamentId: 	Dispatch<SetStateAction<number | null>>;

	showTournamentWaitingRoom: 	boolean;
	setShowTournamentWaitingRoom: Dispatch<SetStateAction<boolean>>;

	players: 	any[];
	setPlayers: Dispatch<SetStateAction<any[]>>;

	tournamentData: 	any | null;
	setTournamentData:	Dispatch<SetStateAction<any | null>>;

	socket: WebSocket | null;
};


const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: {children: ReactNode})
{
	const [ tournamentId, setTournamentId ] 							= useState<number | null>(null);
	const [ showTournamentWaitingRoom, setShowTournamentWaitingRoom] 	= useState(false);
	const [players, setPlayers] 										= useState<any[]>([]);
	const [tournamentData, setTournamentData]							= useState<any | null>(null);
	const { loggedInAccounts, setIsPlaying, isPlaying } 				= useAccountContext();
	const navigate 														= useNavigate();

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
	}, [isPlaying]);

	useEffect(() => {
		if (tournamentId === null) return;
		if (!loggedInAccounts.length) return;

		const player = loggedInAccounts[0];
		if (socketRef.current) {
			socketRef.current.close();
		}
		
		const socket = new WebSocket(`${WS_URL}/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${tournamentId}`);
		socketRef.current = socket;
		socket.onopen = () => {
			console.log("WebSocket connected");
		};
	
		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "PLAYER_UPDATE") {
					setTournamentData(data.tournament);
					setPlayers(data.tournament.players);
				}
				if (data.type === "START_SIGNAL")
				{
					console.log("start signal received starting tournament ", tournamentId);
					startTournament();
				}
				if (data.type === "RESULT_UPDATE")
				{
					startNextRound();
				}
				if (data.type === "WINNER_WINNER_CHICKEN_DINNER")
				{
					console.log("WINNERWINNER", data.winner);
				}
			} catch (err) {
				console.error("Failed to parse WebSocket message", err);
			}
		};
	
		socket.onerror = (err) => {
			console.error("WebSocket error:", err);
		};
	
		socket.onclose = () => {
			console.log("WebSocket tournament waiting room closed");
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
			socket: socketRef.current
		}
	), [
		tournamentId, setTournamentId,
		showTournamentWaitingRoom, setShowTournamentWaitingRoom,
		players, setPlayers,
		tournamentData, setTournamentData,
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
