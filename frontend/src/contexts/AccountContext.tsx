import { createContext, useState, useEffect, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { PlayerType, PlayerState, AuthenticatedAccount } from "../types";
import { secureApiCall } from "../jwt/secureApiCall";
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

type AccountContextType = 
{
	accounts: PlayerType[];
	setAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	loggedInAccounts: AuthenticatedAccount[];
	setLoggedInAccounts: Dispatch<SetStateAction<AuthenticatedAccount[]>>;
	triggerFetchAccounts: boolean;
	setTriggerFetchAccounts: Dispatch<SetStateAction<boolean>>;
	isPlaying: PlayerState;
	setIsPlaying: Dispatch<SetStateAction<PlayerState>>;
};

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: {children: ReactNode})
{
	const [ accounts,                 setAccounts]                 = useState<PlayerType[]>([]);
	const [ loggedInAccounts,         setLoggedInAccounts]         = useState<AuthenticatedAccount[]>([]);
	const [ triggerFetchAccounts,     setTriggerFetchAccounts]     = useState(false);
	const [ isPlaying,                setIsPlaying]                = useState(PlayerState.idle);
	
	useEffect(() =>
	{
		let socket: WebSocket;
		let isRefreshing = false;

		window.addEventListener('beforeunload', () =>
		{
			isRefreshing = true;
		});
		async function checkLoggedInAccounts()
		{
			const savedLoggedInAccounts = localStorage.getItem('loggedInAccounts');
			if (savedLoggedInAccounts && savedLoggedInAccounts.length > 0)
			{
				try
				{
					const response = await axios.post(`${API_URL}/api/checkloggedinaccounts`, {savedLoggedInAccounts})
					if (response.data.success)
					{
						const parsed = JSON.parse(savedLoggedInAccounts);
						setLoggedInAccounts(parsed);
					}
					else
						localStorage.removeItem('loggedInAccounts');
				}
				catch (error: any)
				{
					console.error("error validating loggedinaccounts", error.response?.data || error.message);
				}
			}
		}; checkLoggedInAccounts()

		async function fetchAccounts()
		{
			try
			{
				const userId = loggedInAccounts[0]?.id;
				if (!userId)
					return;
				const response = await secureApiCall(userId, (accessToken) =>
					 axios.post(`${API_URL}/api/get-accounts`, {},
					{
						headers:
						{
							Authorization: `Bearer ${accessToken}`
						}
					})
				);
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
