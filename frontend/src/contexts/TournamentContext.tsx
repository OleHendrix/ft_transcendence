import { createContext, useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import axios 					from "axios";
import { useAccountContext } 	from "./AccountContext";
import { useNavigate } 			from "react-router-dom";
import { PlayerState, TournamentData, Result }			from '../types';
import { localStorageUpdateTournamentId } from "../tournament/utils";

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
			setIsPlaying(PlayerState.playing);
			navigate('/pong-game');
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => { //on mount (for refresh) set TournamentID back
		const storedId = localStorage.getItem("tournamentId");
		console.log("REFRESH/???");
		if (storedId) {
			console.log(`setting tournament id to localstorage stored Id : ${storedId}`);
			setTournamentId(JSON.parse(storedId));

			(async () => {
				try {
					const response = await axios.get(`http://${window.location.hostname}:5001/api/tournament-data/${storedId}`);
					console.log("setting TournamentData:", response.data);
					setTournamentData(response.data);
					setPlayers(response.data.players);
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
		if (
			tournamentId === -1 ||
			!player?.id || !player?.username
		) return;

		localStorageUpdateTournamentId(tournamentId);

		// const player = loggedInAccounts[0];
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
