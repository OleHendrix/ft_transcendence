import { createContext, useState, useEffect, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { PlayerType } from "./../types";
import axios from 'axios';

type PlayerContextType = 
{
	accounts: PlayerType[];
	setAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	numberOfLoggedInAccounts: number;
	setnumberOfLoggedInAccounts: Dispatch<SetStateAction<number>>;
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	isPlaying: boolean;
	setIsPlaying: Dispatch<SetStateAction<boolean>>
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: {children: ReactNode})
{
	const [accounts, setAccounts] = useState<PlayerType[]>([]);
	const [numberOfLoggedInAccounts, setnumberOfLoggedInAccounts] = useState(0);
	const [loggedInAccounts, setLoggedInAccounts] = useState<PlayerType[]>([]);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() =>
	{
		const savedLoggedInAccounts = localStorage.getItem('loggedInAccounts');
		if (savedLoggedInAccounts)
			setLoggedInAccounts(JSON.parse(savedLoggedInAccounts));

		async function fetchAccounts()
		{
			try
			{
				const response = await axios.get('http://localhost:5001/api/get-accounts');
				if (response.data.success)
					setAccounts(response.data.accounts);
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		} fetchAccounts();
	}, [numberOfLoggedInAccounts])

	return (
		<PlayerContext.Provider value={{ accounts, setAccounts, numberOfLoggedInAccounts, setnumberOfLoggedInAccounts, loggedInAccounts, setLoggedInAccounts, isPlaying, setIsPlaying }}>
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
