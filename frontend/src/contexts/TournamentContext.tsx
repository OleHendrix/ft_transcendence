import { createContext, useState, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";

type TournamentContextType = 
{
	showTournamentSetup: boolean;
	setShowTournamentSetup: Dispatch<SetStateAction<boolean>>;
	showTournamentLobbyList: boolean;
	setShowTournamentLobbyList: Dispatch<SetStateAction<boolean>>;
};

const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: {children: ReactNode})
{
	const [ showTournamentSetup, setShowTournamentSetup ]			= useState(false);
	const [ showTournamentLobbyList, setShowTournamentLobbyList ]	= useState(false);

	const value = useMemo(() => (
		{
			showTournamentSetup, setShowTournamentSetup,
			showTournamentLobbyList, setShowTournamentLobbyList,

		}), [ showTournamentSetup, showTournamentLobbyList ]);
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
