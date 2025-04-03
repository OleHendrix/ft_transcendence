import { createContext, useState, useEffect, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { LoggedInPlayerType, PlayerState, RemotePlayerType } from "../types";
import axios from 'axios';

type AccountContextType = 
{
	accounts: RemotePlayerType[];
	setAccounts: Dispatch<SetStateAction<RemotePlayerType[]>>;
	numberOfLoggedInAccounts: number;
	setNumberOfLoggedInAccounts: Dispatch<SetStateAction<number>>;
	loggedInAccounts: LoggedInPlayerType[];
	setLoggedInAccounts: Dispatch<SetStateAction<LoggedInPlayerType[]>>;
	triggerFetchAccounts: boolean;
	setTriggerFetchAccounts: Dispatch<SetStateAction<boolean>>;
	isPlaying: PlayerState;
	setIsPlaying: Dispatch<SetStateAction<PlayerState>>
};

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: {children: ReactNode})
{
	const [accounts, setAccounts] = useState<RemotePlayerType[]>([]);

	// const [accounts, setAccounts] = useState<PlayerType[]>([]);
	const [numberOfLoggedInAccounts, setNumberOfLoggedInAccounts] = useState(0);
	const [loggedInAccounts, setLoggedInAccounts] = useState<LoggedInPlayerType[]>([]);
	const [triggerFetchAccounts, setTriggerFetchAccounts] = useState(false);
	const [isPlaying, setIsPlaying] = useState(PlayerState.idle);

	useEffect(() =>
	{
		const savedLoggedInAccounts = localStorage.getItem('loggedInAccounts');
		if (savedLoggedInAccounts)
			setLoggedInAccounts(JSON.parse(savedLoggedInAccounts));

		async function fetchAccounts()
		{
			try
			{
				const response = await axios.post(`http://${window.location.hostname}:5001/api/get-accounts`, {getStats: false});
				if (response.data.success)
				{
					setAccounts(response.data.accounts);
				}
				else
					console.log("what is happening");
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		} fetchAccounts();
		setTriggerFetchAccounts(false);
	}, [numberOfLoggedInAccounts, accounts, triggerFetchAccounts])

	return (
		<AccountContext.Provider value={{ accounts, setAccounts, numberOfLoggedInAccounts, setNumberOfLoggedInAccounts, loggedInAccounts, setLoggedInAccounts, triggerFetchAccounts, setTriggerFetchAccounts, isPlaying, setIsPlaying }}>
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
