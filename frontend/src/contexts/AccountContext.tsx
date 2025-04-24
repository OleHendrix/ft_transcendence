import { createContext, useState, useEffect, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { PlayerType, PlayerState } from "../types";
import axios from 'axios';

type AccountContextType = 
{
	accounts: PlayerType[];
	setAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	triggerFetchAccounts: boolean;
	setTriggerFetchAccounts: Dispatch<SetStateAction<boolean>>;
	isPlaying: PlayerState;
	setIsPlaying: Dispatch<SetStateAction<PlayerState>>;
};

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: {children: ReactNode})
{
	const [ accounts,                 setAccounts]                 = useState<PlayerType[]>([]);
	const [ loggedInAccounts,         setLoggedInAccounts]         = useState<PlayerType[]>([]);
	const [ triggerFetchAccounts,     setTriggerFetchAccounts]     = useState(false);
	const [ isPlaying,                setIsPlaying]                = useState(PlayerState.idle);
	
	useEffect(() =>
	{
		const savedLoggedInAccounts = localStorage.getItem('loggedInAccounts');
		if (savedLoggedInAccounts)
			setLoggedInAccounts(JSON.parse(savedLoggedInAccounts));

		async function fetchAccounts()
		{
			try
			{
				const response = await axios.get(`http://${window.location.hostname}:5001/api/get-accounts`);
				setAccounts(response.data.accounts);
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		} fetchAccounts();
		setTriggerFetchAccounts(false);
	}, [ triggerFetchAccounts ])

	const value = useMemo(() => (
		{
			accounts, setAccounts,
			loggedInAccounts, setLoggedInAccounts,
			triggerFetchAccounts, setTriggerFetchAccounts,
			isPlaying, setIsPlaying,
		}), [ accounts, loggedInAccounts, triggerFetchAccounts, isPlaying ]);
	return (
		<AccountContext.Provider value={value}>
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
