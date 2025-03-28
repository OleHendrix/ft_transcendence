import { createContext, useState, useEffect, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { PlayerType } from "../types";
import axios from 'axios';

type AccountContextType = 
{
	accounts: PlayerType[];
	setAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	numberOfLoggedInAccounts: number;
	setNumberOfLoggedInAccounts: Dispatch<SetStateAction<number>>;
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	isPlaying: boolean;
	setIsPlaying: Dispatch<SetStateAction<boolean>>
};

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: {children: ReactNode})
{
	const [accounts, setAccounts] = useState<PlayerType[]>([]);
	const [numberOfLoggedInAccounts, setNumberOfLoggedInAccounts] = useState(0);
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
				else
					console.log("what is happening");
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		} fetchAccounts();
	}, [numberOfLoggedInAccounts])

	return (
		<AccountContext.Provider value={{ accounts, setAccounts, numberOfLoggedInAccounts, setNumberOfLoggedInAccounts, loggedInAccounts, setLoggedInAccounts, isPlaying, setIsPlaying }}>
			{ children }
		</AccountContext.Provider>
	);
}

export function useAccountContext()
{
	const context = useContext(AccountContext);
	if (!context)
		throw new Error("Error");
	return context;
}
