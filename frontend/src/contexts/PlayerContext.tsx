import { createContext, useState, useEffect, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { PlayerType } from "./types";
import axios from 'axios';

type PlayerContextType = 
{
	players: PlayerType[];
	setPlayers: Dispatch<SetStateAction<PlayerType[]>>;
	playerCount: number;
	setPlayerCount: Dispatch<SetStateAction<number>>;
	loggedInPlayers: PlayerType[];
	setLoggedInPlayers: Dispatch<SetStateAction<PlayerType[]>>;
	isPlaying: boolean;
	setIsPlaying: Dispatch<SetStateAction<boolean>>
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: {children: ReactNode})
{
	const [players, setPlayers] = useState<PlayerType[]>([]);
	const [playerCount, setPlayerCount] = useState(0);
	const [loggedInPlayers, setLoggedInPlayers] = useState<PlayerType[]>([]);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() =>
	{
		const savedLoggedInPlayers = localStorage.getItem('loggedInPlayers');
		if (savedLoggedInPlayers)
			setLoggedInPlayers(JSON.parse(savedLoggedInPlayers));

		async function fetchPlayers()
		{
			try
			{
				const response = await axios.get('http://localhost:5001/api/getplayers');
				if (response.data.success)
					setPlayers(response.data.players);
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		} fetchPlayers();
	}, [playerCount])

	return (
		<PlayerContext.Provider value={{ players, setPlayers, playerCount, setPlayerCount, loggedInPlayers, setLoggedInPlayers, isPlaying, setIsPlaying }}>
			{ children }
		</PlayerContext.Provider>
	);
}

export function usePlayerContext()
{
	const context = useContext(PlayerContext);
	if (!context)
		throw new Error("Error");
	return context;
}
