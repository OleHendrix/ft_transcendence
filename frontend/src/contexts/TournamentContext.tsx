import { createContext, useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import axios 					from "axios";
import { useAccountContext } 	from "./AccountContext";
import { useNavigate } 			from "react-router-dom";
import { PlayerState, TournamentData, Result }			from '../types';

type TournamentContextType = {
	tournamentId: 		number | null;
	setTournamentId: 	Dispatch<SetStateAction<number | null>>;

	showTournamentWaitingRoom: 	boolean;
	setShowTournamentWaitingRoom: Dispatch<SetStateAction<boolean>>;

	players: 	any[];
	setPlayers: Dispatch<SetStateAction<any[]>>;

	tournamentData: 	TournamentData | null;
	setTournamentData:	Dispatch<SetStateAction<TournamentData | null>>;

	socket: WebSocket | null;
};


const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: {children: ReactNode})
{
	const [ tournamentId, setTournamentId ] 							= useState<number | null>(null);
	const [ showTournamentWaitingRoom, setShowTournamentWaitingRoom] 	= useState(false);
	const [players, setPlayers] 										= useState<any[]>([]);
	const [tournamentData, setTournamentData]							= useState<TournamentData | null>(null);
	const { loggedInAccounts, setIsPlaying, isPlaying } 				= useAccountContext();
	const navigate 														= useNavigate();

	const socketRef = useRef<WebSocket | null>(null);


	async function startTournament() {
		try {
			setIsPlaying(PlayerState.playing);
			navigate('/pong-game');
		} catch (error) {
			console.log(error);
		}
	}

	async function startNextRound() {
		try {
			console.log("FRONTEND - tournament game finished checking to start next round", tournamentId);
			const response = await axios.post(`http://${window.location.hostname}:5001/api/start-next-round`, { tournamentId, });
			if (response.data.roundFinished)
			{
				setIsPlaying(PlayerState.playing);
				navigate('/pong-game');
			}
		} catch (error) {
			console.log(error);
		}
	}

	function allMatchesFinished()
	{
		if (!tournamentData) return;
		if (!tournamentData.rounds) return;
		const currentRound = tournamentData?.rounds[tournamentData.roundIdx];
		for (const match of currentRound)
		{
			if (match.state.result === Result.PLAYING)
				return false;
		}
		return true;
	}

	useEffect(() => {
		if (isPlaying !== PlayerState.playing && tournamentId !== null) {
			if (allMatchesFinished())
			{
				startNextRound();
			}
		}
	}, [isPlaying]);

	useEffect(() => {
		if (tournamentId === null || !loggedInAccounts.length)
			return;

		const player = loggedInAccounts[0];
		if (socketRef.current) {
			socketRef.current.close();
		}
		
		const socket = new WebSocket(`ws://${window.location.hostname}:5001/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${tournamentId}`);
		socketRef.current = socket;
		socket.onopen = () => {
			console.log("WebSocket connected");
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
			} catch (err) {
				console.error("Failed to parse WebSocket message", err);
			}
		};
	
		socket.onerror = (err) => {
			navigate('/');
			console.error("WebSocket error:", err);
		};
	
		socket.onclose = () => {
			navigate('/');
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
