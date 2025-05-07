import axios 																			from "axios";
import type { MutableRefObject } 														from 'react';
import { AuthenticatedAccount, PlayerData, PlayerState, PlayerType, Result, TournamentData, TournamentLobby } from "../types";
import { NavigateFunction } 															from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

interface CreateTournamentProps
{
	maxPlayers: 		number;
	loggedInAccounts: 	AuthenticatedAccount[];
	navigate:			NavigateFunction;
}

export async function createTournament({ maxPlayers, loggedInAccounts, navigate }: CreateTournamentProps)
{
	try
	{
		const host = { id: loggedInAccounts[0].id, username: loggedInAccounts[0].username };
		const response = await axios.post(`${API_URL}/api/create-tournament`,
		{
			hostId: host.id,
			hostUsername: host.username,
			maxPlayers,
		});	
		if (response.data.success)
			navigate(`/tournament/waiting-room/${response.data.tournamentId}`);
		else
			console.log("Failed to create tournament");
	}
	catch (error)
	{
		console.log(error);
	}
}

export async function useFetchLobbies(setLobbies: (lobbies: TournamentLobby[]) => void)
{
	try
	{
		const response = await axios.get(`${API_URL}/api/get-tournament-lobbies`);
		setLobbies(response.data);
	}
	catch (error)
	{
		console.log(error);
	}
}

interface useGetTournamentDataProps
{
	id: 				string;
	setTournamentData: (tournamentData: TournamentData) => void;
}

export async function useGetTournamentData({ id, setTournamentData }: useGetTournamentDataProps)
{
	try
	{
		const response = await axios.get(`${API_URL}/api/tournament-data/${id}`);
		if (response.data.success)
			setTournamentData(response.data.tournament);
	}
	catch (error)
	{
		console.log(error);
	}
}

interface socketOnMessageProps
{
	playerId: 			number;
	playerUsername: 	string;
	tournamentId: 		number;
	setTournamentData: 	(tournamentData: TournamentData) => void;
	setCountdown: 		(countdown: number) => void;
	setIsPlaying: 		(isPlaying: PlayerState) => void;
	isNavigatingToGame: React.MutableRefObject<boolean>;
	navigate: 			NavigateFunction;
	event: 				MessageEvent;
}

export function socketOnMessage({ playerId, playerUsername, tournamentId, setTournamentData, setCountdown, setIsPlaying, isNavigatingToGame, navigate, event }: socketOnMessageProps)
{
	try
	{
		const data = JSON.parse(event.data);
		if (data.type === "DATA")
			setTournamentData(data.tournament);
		if (data.type === "START_SIGNAL")	
		{
			const activeIds = data.data.activePlayerIds;
			if (!activeIds.includes(playerId))
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
					setIsPlaying(PlayerState.playing); // start game
					isNavigatingToGame.current = true;
					// navigate('./pong-game');
					navigate('/pong-game');
				}
			}, 1000);
		}
	}
	catch (err)
	{
		console.error("Failed to parse WebSocket message", err);
	}	
}

interface handleCloseProps
{
	isLeaving: 				boolean;
	setIsLeaving: 			(isLeaving: boolean) => void;
	loggedInAccountsRef:	React.MutableRefObject<AuthenticatedAccount[]>;
	tournamentDataRef: 		React.MutableRefObject<TournamentData | null>;
	isNavigatingToGame: 	React.MutableRefObject<boolean>;
	setIsLeavingRef: 		React.MutableRefObject<(isLeaving: boolean) => void>;
	id: 					string;
}

export async function handleClose({ isLeaving, setIsLeaving, loggedInAccountsRef, tournamentDataRef, isNavigatingToGame, setIsLeavingRef, id }: handleCloseProps)
{
	if (isLeaving) 						return; // protection agains double clicks
	if (!tournamentDataRef.current) 	return console.warn("TournamentWaitingRoom:handleClose:TournamentData_not_ready_yet"); //misschien onnodig?
	if (isNavigatingToGame.current)		return; 

	setIsLeavingRef.current(true);
	try
	{
		if (loggedInAccountsRef.current[0].id === tournamentDataRef.current?.hostId && tournamentDataRef.current.players.length > 1)
			await axios.post(`${API_URL}/api/rehost-tournament`, {id: Number(id)});
		await axios.post(`${API_URL}/api/leave-tournament`, { playerId: loggedInAccountsRef.current[0].id, id: Number(id)});
	}
	catch (error)
	{
		console.log(error);
	} 
	finally
	{
		setIsLeaving(false);
	}
}

export function handleCloseInstant({ isLeaving, setIsLeaving, loggedInAccountsRef, tournamentDataRef, isNavigatingToGame, setIsLeavingRef, id }: handleCloseProps)
{
	if (isLeaving) 						return; // protection agains double clicks
	if (!tournamentDataRef.current) 	return console.warn("TournamentWaitingRoom:handleClose:TournamentData_not_ready_yet"); //misschien onnodig?
	if (isNavigatingToGame.current)		return; 

	setIsLeavingRef.current(true);
	try
	{
		if (loggedInAccountsRef.current[0].id === tournamentDataRef.current?.hostId && tournamentDataRef.current.players.length > 1)
			axios.post(`${API_URL}/api/rehost-tournament`, {id: Number(id)});
		axios.post(`${API_URL}/api/leave-tournament`, { playerId: loggedInAccountsRef.current[0].id, id: Number(id)});
	}
	catch (error)
	{
		console.log(error);
	} 
	finally
	{
		setIsLeaving(false);
	}
}

interface generateBracketProps
{
	players: 	PlayerData[];
	maxPlayers: number;
	winners: 	PlayerData[][];
}

export function generateBracket({ players, maxPlayers, winners }: generateBracketProps)
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

interface runCountdownProps
{
	callback: 		() => Promise<void>;
	setCountdown: 	(countdown: number) => void;
}

export function runCountdown({ callback, setCountdown }: runCountdownProps)
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
				setCountdown(0);
				await callback();
			}, 1000);
		}
	};
	tick();
}

interface stillPlayingProps
{
	tournamentData: TournamentData | null;
}

export function stillPlaying({ tournamentData }: stillPlayingProps)
{
	const currentRound = tournamentData?.rounds?.[tournamentData.roundIdx] || [];
	const stillPlaying = currentRound.some(match => match.state.result === Result.PLAYING);
	return stillPlaying;
}

