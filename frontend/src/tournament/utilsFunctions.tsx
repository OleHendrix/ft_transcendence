import axios 																			from "axios";
import { useEffect, type MutableRefObject } 														from 'react';
import { AuthenticatedAccount, PlayerData, PlayerState, PlayerType, Result, TournamentData, TournamentLobby } from "../types";
import { NavigateFunction } 															from "react-router-dom";
import { secureApiCall } 																from "../jwt/secureApiCall";
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

		const response = await secureApiCall(host.id, (accessToken) =>
			axios.post(`${API_URL}/api/create-tournament`,
				{
					hostId: host.id,
					hostUsername: host.username,
					maxPlayers,
				},
				{
					headers: 
					{
						Authorization: `Bearer ${accessToken}`
					}
				}
			)
		);
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


interface useGetTournamentDataProps
{
	id: 				string;
	setTournamentData: (tournamentData: TournamentData) => void;
}

export function useGetTournamentData({ id, setTournamentData }: useGetTournamentDataProps)
{
	useEffect(() =>
	{
		let isMounted = true;
		async function fetchData()
		{
			try
			{
				const response = await axios.get(`${API_URL}/api/tournament-data/${id}`);
				if (response.data.success && isMounted)
					setTournamentData(response.data.tournament);
			}
			catch (error)
			{
				console.log(error);
			}
		}
		if (id)
			fetchData();
		return () => { isMounted = false; };
	}, [id]);
}

interface socketOnMessageProps
{
	playerId: 			number;
	playerUsername: 	string;
	tournamentId: 		number;
	setTournamentDataRef: 	MutableRefObject<(tournamentData: TournamentData) => void>;
	setCountdown: 		(countdown: number) => void;
	setIsPlaying: 		(isPlaying: PlayerState) => void;
	navigate: 			NavigateFunction;
	event: 				MessageEvent;
}

export function socketOnMessage({ playerId, setTournamentDataRef, setCountdown, setIsPlaying, navigate, event }: socketOnMessageProps)
{
	try
	{
		const data = JSON.parse(event.data);
		if (data.type === "DATA")
			setTournamentDataRef.current(data.tournament);
		if (data.type === "START_SIGNAL")	
		{
			const activeIds = data.data.activePlayerIds;
			if (!activeIds.includes(playerId))
				return;
			localStorage.setItem('isNavigatingToGame', 'true');44
			setCountdown(3); // trigger countdown
		
			let count = 3;
			const interval = setInterval(() =>
			{
				count--;
				setCountdown(count);
		
				if (count < 0)
				{
					clearInterval(interval);
					setIsPlaying(PlayerState.playing);
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
	if (tournamentData?.winner)
		return false;
	const currentRound = tournamentData?.rounds?.[tournamentData.roundIdx] || [];
	const anyPlaying = currentRound.some(match => match.state.result === Result.PLAYING);

	return anyPlaying;
}

