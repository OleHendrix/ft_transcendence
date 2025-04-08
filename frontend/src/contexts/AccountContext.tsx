import { createContext, useState, useEffect, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { PlayerType, PlayerState } from "../types";
import axios from 'axios';

type AccountContextType = 
{
	accounts: PlayerType[];
	setAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	numberOfLoggedInAccounts: number;
	setNumberOfLoggedInAccounts: Dispatch<SetStateAction<number>>;
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: Dispatch<SetStateAction<PlayerType[]>>;
	triggerFetchAccounts: boolean;
	setTriggerFetchAccounts: Dispatch<SetStateAction<boolean>>;
	isPlaying: PlayerState;
	setIsPlaying: Dispatch<SetStateAction<PlayerState>>;
	showLeaderboard: boolean;
	setShowLeaderboard: Dispatch<SetStateAction<boolean>>;
	showTournamentSetup: boolean;
	setShowTournamentSetup: Dispatch<SetStateAction<boolean>>;
};

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: {children: ReactNode})
{
	const [ accounts,                 setAccounts]                 = useState<PlayerType[]>([]);
	const [ numberOfLoggedInAccounts, setNumberOfLoggedInAccounts] = useState(0);
	const [ loggedInAccounts,         setLoggedInAccounts]         = useState<PlayerType[]>([]);
	const [ triggerFetchAccounts,     setTriggerFetchAccounts]     = useState(false);
	const [ isPlaying,                setIsPlaying]                = useState(PlayerState.idle);
	const [ showLeaderboard,          setShowLeaderboard ]         = useState(false);
	const [ showTournamentSetup,      setShowTournamentSetup ]     = useState(false);

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
	}, [ numberOfLoggedInAccounts, triggerFetchAccounts, showLeaderboard ])

	const value = useMemo(() => (
		{
			accounts, setAccounts,
			numberOfLoggedInAccounts, setNumberOfLoggedInAccounts,
			loggedInAccounts, setLoggedInAccounts,
			triggerFetchAccounts, setTriggerFetchAccounts,
			isPlaying, setIsPlaying,
			showLeaderboard, setShowLeaderboard,
			showTournamentSetup, setShowTournamentSetup

		}), [ accounts, numberOfLoggedInAccounts, loggedInAccounts, triggerFetchAccounts, isPlaying, showLeaderboard, showTournamentSetup ]);
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
