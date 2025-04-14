import { createContext, useState, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";

type TournamentContextType = 
{
	tournamentId: number | null;
	setTournamentId: Dispatch<SetStateAction<number | null>>;
	showTournamentSetup: boolean;
	setShowTournamentSetup: Dispatch<SetStateAction<boolean>>;
	showTournamentLobbyList: boolean;
	setShowTournamentLobbyList: Dispatch<SetStateAction<boolean>>;
	showTournamentWaitingRoom: boolean;
	setShowTournamentWaitingRoom: Dispatch<SetStateAction<boolean>>;
};

const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: {children: ReactNode})
{
	const [ tournamentId, setTournamentId ] = useState<number | null>(null);
	const [ showTournamentSetup, setShowTournamentSetup ]			= useState(false);
	const [ showTournamentLobbyList, setShowTournamentLobbyList ]	= useState(false);
	const [ showTournamentWaitingRoom, setShowTournamentWaitingRoom] = useState(false);

	const value = useMemo(() => (
		{
			tournamentId, setTournamentId,
			showTournamentSetup, setShowTournamentSetup,
			showTournamentLobbyList, setShowTournamentLobbyList,
			showTournamentWaitingRoom, setShowTournamentWaitingRoom,

		}), [ showTournamentSetup, showTournamentLobbyList, showTournamentWaitingRoom ]);
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
